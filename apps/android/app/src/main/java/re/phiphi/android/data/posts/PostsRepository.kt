package re.phiphi.android.data.posts

import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostsIndex

interface PostsRepository {
    suspend fun getDefaultPostsIndex(): PostsIndex

    suspend fun getDefaultPostDetail(slug: String): PostDetail
}
