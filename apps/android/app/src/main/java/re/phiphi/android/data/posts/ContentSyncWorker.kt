package re.phiphi.android.data.posts

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent

class ContentSyncWorker(appContext: Context, workerParameters: WorkerParameters) :
    CoroutineWorker(appContext, workerParameters) {
    override suspend fun doWork(): Result =
        runCatching { entryPoint().postsRepository().refreshContent() }
            .fold(onSuccess = { Result.success() }, onFailure = { Result.retry() })

    private fun entryPoint() =
        EntryPointAccessors.fromApplication(
            applicationContext,
            ContentSyncWorkerEntryPoint::class.java,
        )
}

@EntryPoint
@InstallIn(SingletonComponent::class)
interface ContentSyncWorkerEntryPoint {
    fun postsRepository(): PostsRepository
}
