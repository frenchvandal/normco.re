package re.phiphi.android.data.posts

import re.phiphi.android.core.model.AppManifest
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex

interface PostsRepository {
    suspend fun getAppManifest(): AppManifest

    suspend fun getPostsIndex(lang: String? = null): PostsIndex

    suspend fun getPostDetail(slug: String, lang: String? = null): PostDetail

    suspend fun refreshContent()
}
