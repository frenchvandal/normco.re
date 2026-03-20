package re.phiphi.android.data.posts

import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
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
    override suspend fun getDefaultPostsIndex(): PostsIndex =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()

            val manifest =
                checkNotNull(bootstrapPostsDao.getManifest()) {
                    "Missing app manifest in the local database"
                }

            val manifestModel = manifest.toModel(json)
            val posts = bootstrapPostsDao.getPostsForLanguage(lang = manifest.defaultLanguage)
            posts.toPostsIndex(
                lang = manifest.defaultLanguage,
                version = manifestModel.version,
                json = json,
            )
        }

    override suspend fun getDefaultPostDetail(slug: String): PostDetail =
        withContext(Dispatchers.IO) {
            bootstrapPostsSeeder.seedIfNeeded()

            val manifest =
                checkNotNull(bootstrapPostsDao.getManifest()) {
                    "Missing app manifest in the local database"
                }
            val manifestModel = manifest.toModel(json)

            val post =
                checkNotNull(
                    bootstrapPostsDao.getPost(lang = manifest.defaultLanguage, slug = slug)
                ) {
                    "Missing post detail for '$slug' in the local database"
                }

            post.toPostDetail(json = json, version = manifestModel.version)
        }
}
