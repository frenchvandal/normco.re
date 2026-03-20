package re.phiphi.android.data.posts

import re.phiphi.android.core.model.PostsIndex

interface PostsRepository {
    suspend fun getDefaultPostsIndex(): PostsIndex
}
