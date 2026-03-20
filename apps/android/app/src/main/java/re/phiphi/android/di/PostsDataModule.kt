package re.phiphi.android.di

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import kotlinx.serialization.json.Json
import re.phiphi.android.data.posts.AssetPostsRepository
import re.phiphi.android.data.posts.PostsRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class PostsDataModule {
    @Binds
    @Singleton
    abstract fun bindPostsRepository(repository: AssetPostsRepository): PostsRepository

    companion object {
        @Provides @Singleton fun provideJson(): Json = Json { ignoreUnknownKeys = true }
    }
}
