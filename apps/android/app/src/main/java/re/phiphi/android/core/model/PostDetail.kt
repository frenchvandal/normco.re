package re.phiphi.android.core.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Immutable
@Serializable
data class PostDetail(
    val version: String,
    val id: String,
    val slug: String,
    val lang: String,
    val title: String,
    val summary: String,
    val publishedAt: String,
    val updatedAt: String? = null,
    @SerialName("readingTime") val readingTimeMinutes: Int? = null,
    val tags: List<String> = emptyList(),
    val alternates: List<PostDetailAlternate> = emptyList(),
    val heroImage: RemoteImage? = null,
    val webUrl: String,
    val blocks: List<PostDetailBlock> = emptyList(),
)

@Immutable
@Serializable
data class PostDetailAlternate(val lang: String, val apiUrl: String, val webUrl: String)

@Immutable
@Serializable
data class PostDetailBlock(
    val type: String,
    val text: String? = null,
    val level: Int? = null,
    val language: String? = null,
    val content: String? = null,
    val src: String? = null,
    val alt: String? = null,
    val width: Int? = null,
    val height: Int? = null,
    val attribution: String? = null,
    val ordered: Boolean? = null,
    val items: List<String> = emptyList(),
)
