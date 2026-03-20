package re.phiphi.android.data.posts.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [AppManifestEntity::class, PostEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class PhiphiDatabase : RoomDatabase() {
    abstract fun bootstrapPostsDao(): BootstrapPostsDao
}
