package re.phiphi.android.data.posts

import android.content.Context
import androidx.room.withTransaction
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex
import re.phiphi.android.data.posts.local.BootstrapPostsDao
import re.phiphi.android.data.posts.local.PhiphiDatabase
import re.phiphi.android.data.posts.local.PostEntity
import re.phiphi.android.data.posts.local.toEntity

@Singleton
class BootstrapPostsSeeder
@Inject
constructor(
    @param:ApplicationContext private val context: Context,
    private val database: PhiphiDatabase,
    private val bootstrapPostsDao: BootstrapPostsDao,
    private val json: Json,
) {
    private val seedMutex = Mutex()

    suspend fun seedIfNeeded() {
        seedMutex.withLock {
            withContext(Dispatchers.IO) {
                val manifest = readDocument<AppManifest>(path = APP_MANIFEST_ASSET_PATH)
                val storedManifest = bootstrapPostsDao.getManifest()
                val hasSeededDefaultPosts =
                    bootstrapPostsDao.countPostsForLanguage(lang = manifest.defaultLanguage) > 0

                if (storedManifest?.generatedAt == manifest.generatedAt && hasSeededDefaultPosts) {
                    return@withContext
                }

                val posts = buildPosts(manifest = manifest)

                database.withTransaction {
                    bootstrapPostsDao.clearPosts()
                    bootstrapPostsDao.clearManifest()
                    bootstrapPostsDao.upsertManifest(manifest.toEntity(json))
                    bootstrapPostsDao.upsertPosts(posts)
                }
            }
        }
    }

    private fun buildPosts(manifest: AppManifest): List<PostEntity> =
        manifest.languages.flatMap { language ->
            val postsIndex = readDocument<PostsIndex>(path = postsIndexAssetPath(lang = language))

            postsIndex.items.map { summary ->
                val detail =
                    runCatching {
                            readDocument<PostDetail>(
                                path = postDetailAssetPath(lang = language, slug = summary.slug)
                            )
                        }
                        .getOrNull()

                PostEntity(
                    lang = language,
                    slug = summary.slug,
                    id = summary.id,
                    title = detail?.title ?: summary.title,
                    summary = detail?.summary ?: summary.summary,
                    publishedAt = detail?.publishedAt ?: summary.publishedAt,
                    updatedAt = detail?.updatedAt ?: summary.updatedAt,
                    readingTimeMinutes = detail?.readingTimeMinutes ?: summary.readingTimeMinutes,
                    tagsJson = json.encodeToString(detail?.tags ?: summary.tags),
                    detailApiUrl = summary.detailApiUrl,
                    webUrl = detail?.webUrl ?: summary.webUrl,
                    heroImageJson =
                        detail?.heroImage?.let { heroImage -> json.encodeToString(heroImage) }
                            ?: summary.heroImage?.let { heroImage ->
                                json.encodeToString(heroImage)
                            },
                    alternatesJson =
                        detail?.alternates?.let { alternates -> json.encodeToString(alternates) },
                    blocksJson = detail?.blocks?.let { blocks -> json.encodeToString(blocks) },
                )
            }
        }

    private fun readAsset(path: String): String =
        context.assets.open(path).bufferedReader().use { reader -> reader.readText() }

    private inline fun <reified T> readDocument(path: String): T =
        json.decodeFromString(readAsset(path))
}
