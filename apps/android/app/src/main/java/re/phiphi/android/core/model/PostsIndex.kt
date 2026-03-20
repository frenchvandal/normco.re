package re.phiphi.android.core.model

data class PostsIndex(val version: String, val lang: String, val items: List<PostSummary>)

data class PostSummary(
    val id: String,
    val slug: String,
    val title: String,
    val summary: String,
    val publishedAt: String,
    val updatedAt: String?,
    val readingTimeMinutes: Int?,
    val tags: List<String>,
    val heroImage: RemoteImage?,
    val detailApiUrl: String,
    val webUrl: String,
)

data class RemoteImage(val url: String, val alt: String, val width: Int?, val height: Int?)
