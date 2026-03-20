package re.phiphi.android.core.model

data class AppManifest(
    val version: String,
    val generatedAt: String,
    val defaultLanguage: String,
    val languages: List<String>,
    val postsIndex: List<PostsIndexPointer>,
)

data class PostsIndexPointer(val lang: String, val apiUrl: String)
