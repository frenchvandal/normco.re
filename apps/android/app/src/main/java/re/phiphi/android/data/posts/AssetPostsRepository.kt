package re.phiphi.android.data.posts

import androidx.room.withTransaction
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex
import re.phiphi.android.data.posts.local.BootstrapPostsDao
import re.phiphi.android.data.posts.local.PhiphiDatabase
import re.phiphi.android.data.posts.local.merge
import re.phiphi.android.data.posts.local.toEntity
import re.phiphi.android.data.posts.local.toModel
import re.phiphi.android.data.posts.local.toPostDetail
import re.phiphi.android.data.posts.local.toPostsIndex

private const val REMOTE_REFRESH_INTERVAL_MILLIS = 5 * 60 * 1000L

@Singleton
class AssetPostsRepository
@Inject
constructor(
    private val database: PhiphiDatabase,
    private val bootstrapPostsDao: BootstrapPostsDao,
    private val bootstrapPostsSeeder: BootstrapPostsSeeder,
    private val remoteContractsClient: RemoteContractsClient,
    private val contentSyncStatusRepository: ContentSyncStatusRepository,
    private val json: Json,
) : PostsRepository {
    private val remoteRefreshMutex = Mutex()
    private var lastRemoteRefreshAtMillis: Long = 0L

    override suspend fun getAppManifest(): AppManifest =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()
            refreshRemoteContentIfStale()

            requireLocalManifest().toModel(json)
        }

    override suspend fun getPostsIndex(lang: String?): PostsIndex =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()
            refreshRemoteContentIfStale()

            val manifest = requireLocalManifest().toModel(json)
            val resolvedLanguage = manifest.resolveLanguage(lang)
            val posts = bootstrapPostsDao.getPostsForLanguage(lang = resolvedLanguage)
            posts.toPostsIndex(lang = resolvedLanguage, version = manifest.version, json = json)
        }

    override suspend fun getPostDetail(slug: String, lang: String?): PostDetail =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()
            refreshRemoteContentIfStale()

            val manifest = requireLocalManifest().toModel(json)
            val resolvedLanguage = manifest.resolveLanguage(lang)
            val localPost =
                requireLocalPost(manifest = manifest, language = resolvedLanguage, slug = slug)

            val refreshedPost =
                runCatching {
                        val remoteDetail =
                            remoteContractsClient.fetchPostDetail(apiUrl = localPost.detailApiUrl)
                        val mergedPost = localPost.merge(detail = remoteDetail, json = json)
                        bootstrapPostsDao.upsertPosts(posts = listOf(mergedPost))
                        mergedPost
                    }
                    .getOrElse { localPost }

            refreshedPost.toPostDetail(json = json, version = manifest.version)
        }

    override suspend fun refreshContent() =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()
            val now = System.currentTimeMillis()

            runCatching { refreshRemoteContent(force = true) }
                .onSuccess {
                    lastRemoteRefreshAtMillis = now
                    contentSyncStatusRepository.recordCheckResult(atMillis = now, succeeded = true)
                }
                .onFailure {
                    contentSyncStatusRepository.recordCheckResult(atMillis = now, succeeded = false)
                }
                .getOrThrow()
        }

    private suspend fun refreshRemoteContentIfStale() {
        remoteRefreshMutex.withLock {
            val now = System.currentTimeMillis()
            if (now - lastRemoteRefreshAtMillis < REMOTE_REFRESH_INTERVAL_MILLIS) {
                return
            }

            runCatching { refreshRemoteContent(force = false) }
                .onSuccess {
                    lastRemoteRefreshAtMillis = now
                    contentSyncStatusRepository.recordCheckResult(atMillis = now, succeeded = true)
                }
                .onFailure {
                    contentSyncStatusRepository.recordCheckResult(atMillis = now, succeeded = false)
                }
        }
    }

    private suspend fun refreshRemoteContent(force: Boolean) {
        val localManifest = bootstrapPostsDao.getManifest()
        val remoteManifest = remoteContractsClient.fetchAppManifest()

        if (!force && localManifest?.generatedAt == remoteManifest.generatedAt) {
            return
        }

        val remoteIndexes =
            remoteManifest.postsIndex.associate { pointer ->
                pointer.lang to remoteContractsClient.fetchPostsIndex(apiUrl = pointer.apiUrl)
            }

        database.withTransaction {
            bootstrapPostsDao.upsertManifest(remoteManifest.toEntity(json))

            remoteIndexes.forEach { (language, postsIndex) ->
                val existingPosts =
                    bootstrapPostsDao.getPostsForLanguage(lang = language).associateBy { post ->
                        post.slug
                    }
                val mergedPosts =
                    postsIndex.items.map { summary ->
                        summary.toEntity(
                            lang = language,
                            json = json,
                            existing = existingPosts[summary.slug],
                        )
                    }

                bootstrapPostsDao.deletePostsForLanguage(lang = language)
                bootstrapPostsDao.upsertPosts(posts = mergedPosts)
            }
        }
    }

    private suspend fun requireLocalManifest() =
        checkNotNull(bootstrapPostsDao.getManifest()) {
            "Missing app manifest in the local database"
        }

    private suspend fun requireLocalPost(manifest: AppManifest, language: String, slug: String) =
        checkNotNull(
            bootstrapPostsDao.getPost(lang = language, slug = slug)
                ?: bootstrapPostsDao.getPost(lang = manifest.defaultLanguage, slug = slug)
        ) {
            "Missing post detail for '$slug' in the local database"
        }
}

private fun AppManifest.resolveLanguage(requestedLanguage: String?): String =
    requestedLanguage?.takeIf { candidate -> candidate in languages } ?: defaultLanguage
