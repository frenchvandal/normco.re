package re.phiphi.android.data.posts.local

import androidx.room.Entity
import androidx.room.Index

@Entity(
    tableName = "posts",
    primaryKeys = ["lang", "slug"],
    indices = [Index(value = ["lang", "publishedAt"])],
)
data class PostEntity(
    val lang: String,
    val slug: String,
    val id: String,
    val title: String,
    val summary: String,
    val publishedAt: String,
    val updatedAt: String?,
    val readingTimeMinutes: Int?,
    val tagsJson: String,
    val detailApiUrl: String,
    val webUrl: String,
    val heroImageJson: String?,
    val alternatesJson: String?,
    val blocksJson: String?,
)
