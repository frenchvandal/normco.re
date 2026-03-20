package re.phiphi.android.data.posts

import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex
import re.phiphi.android.data.posts.local.BootstrapPostsDao
import re.phiphi.android.data.posts.local.toModel
import re.phiphi.android.data.posts.local.toPostDetail
import re.phiphi.android.data.posts.local.toPostsIndex

@Singleton
class AssetPostsRepository
@Inject
constructor(
    private val bootstrapPostsDao: BootstrapPostsDao,
    private val bootstrapPostsSeeder: BootstrapPostsSeeder,
    private val json: Json,
) : PostsRepository {
    override suspend fun getAppManifest(): AppManifest =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()

            val manifest =
                checkNotNull(bootstrapPostsDao.getManifest()) {
                    "Missing app manifest in the local database"
                }

            manifest.toModel(json)
        }

    override suspend fun getPostsIndex(lang: String?): PostsIndex =
        withContext(Dispatchers.IO) {
            val manifest = getAppManifest()
            val resolvedLanguage = manifest.resolveLanguage(lang)
            val posts = bootstrapPostsDao.getPostsForLanguage(lang = resolvedLanguage)
            posts.toPostsIndex(lang = resolvedLanguage, version = manifest.version, json = json)
        }

    override suspend fun getPostDetail(slug: String, lang: String?): PostDetail =
        withContext(Dispatchers.IO) {
            val manifest = getAppManifest()
            val resolvedLanguage = manifest.resolveLanguage(lang)

            val post =
                bootstrapPostsDao.getPost(lang = resolvedLanguage, slug = slug)
                    ?: bootstrapPostsDao.getPost(lang = manifest.defaultLanguage, slug = slug)

            checkNotNull(post) { "Missing post detail for '$slug' in the local database" }
                .toPostDetail(json = json, version = manifest.version)
        }
}

private fun AppManifest.resolveLanguage(requestedLanguage: String?): String =
    requestedLanguage?.takeIf { candidate -> candidate in languages } ?: defaultLanguage
