package re.phiphi.android.data.posts.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface BootstrapPostsDao {
    @Query("SELECT * FROM app_manifest WHERE singletonId = 0")
    suspend fun getManifest(): AppManifestEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertManifest(manifest: AppManifestEntity)

    @Query("SELECT * FROM posts WHERE lang = :lang ORDER BY publishedAt DESC")
    suspend fun getPostsForLanguage(lang: String): List<PostEntity>

    @Query("SELECT COUNT(*) FROM posts WHERE lang = :lang")
    suspend fun countPostsForLanguage(lang: String): Int

    @Query("SELECT * FROM posts WHERE lang = :lang AND slug = :slug LIMIT 1")
    suspend fun getPost(lang: String, slug: String): PostEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertPosts(posts: List<PostEntity>)

    @Query("DELETE FROM app_manifest") suspend fun clearManifest()

    @Query("DELETE FROM posts") suspend fun clearPosts()
}
