package re.phiphi.android.di

import android.content.Context
import androidx.room.Room
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import kotlinx.serialization.json.Json
import re.phiphi.android.data.posts.AssetPostsRepository
import re.phiphi.android.data.posts.PostsRepository
import re.phiphi.android.data.posts.local.BootstrapPostsDao
import re.phiphi.android.data.posts.local.PhiphiDatabase

@Module
@InstallIn(SingletonComponent::class)
abstract class PostsDataModule {
    @Binds
    @Singleton
    abstract fun bindPostsRepository(repository: AssetPostsRepository): PostsRepository

    companion object {
        @Provides @Singleton fun provideJson(): Json = Json { ignoreUnknownKeys = true }

        @Provides
        @Singleton
        fun providePhiphiDatabase(@ApplicationContext context: Context): PhiphiDatabase =
            Room.databaseBuilder(context, PhiphiDatabase::class.java, "phiphi.db").build()

        @Provides
        fun provideBootstrapPostsDao(database: PhiphiDatabase): BootstrapPostsDao =
            database.bootstrapPostsDao()
    }
}
