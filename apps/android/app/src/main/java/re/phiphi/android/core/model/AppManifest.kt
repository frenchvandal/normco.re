package re.phiphi.android.core.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.Serializable

@Immutable
@Serializable
data class AppManifest(
    val version: String,
    val generatedAt: String,
    val defaultLanguage: String,
    val languages: List<String>,
    val postsIndex: List<PostsIndexPointer>,
)

@Immutable @Serializable data class PostsIndexPointer(val lang: String, val apiUrl: String)
