package re.phiphi.android.core.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Immutable
@Serializable
data class PostsIndex(val version: String, val lang: String, val items: List<PostSummary>)

@Immutable
@Serializable
data class PostSummary(
    val id: String,
    val slug: String,
    val title: String,
    val summary: String,
    val publishedAt: String,
    val updatedAt: String? = null,
    @SerialName("readingTime") val readingTimeMinutes: Int? = null,
    val tags: List<String> = emptyList(),
    val heroImage: RemoteImage? = null,
    val detailApiUrl: String,
    val webUrl: String,
)

@Immutable
@Serializable
data class RemoteImage(
    val url: String,
    val alt: String = "",
    val width: Int? = null,
    val height: Int? = null,
)
