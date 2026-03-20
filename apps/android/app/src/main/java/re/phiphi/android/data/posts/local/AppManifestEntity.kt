package re.phiphi.android.data.posts.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_manifest")
data class AppManifestEntity(
    @PrimaryKey val singletonId: Int = 0,
    val version: String,
    val generatedAt: String,
    val defaultLanguage: String,
    val languagesJson: String,
    val postsIndexJson: String,
)
