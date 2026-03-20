package re.phiphi.android.data.posts

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

private const val CONTENT_SYNC_WORK_NAME = "content-sync"
private const val CONTENT_SYNC_INTERVAL_HOURS = 6L

@Singleton
class ContentSyncScheduler
@Inject
constructor(@param:ApplicationContext private val context: Context) {
    fun schedule(syncOnUnmeteredOnly: Boolean) {
        val constraints =
            Constraints.Builder()
                .setRequiredNetworkType(
                    if (syncOnUnmeteredOnly) {
                        NetworkType.UNMETERED
                    } else {
                        NetworkType.CONNECTED
                    }
                )
                .build()

        val request =
            PeriodicWorkRequestBuilder<ContentSyncWorker>(
                    CONTENT_SYNC_INTERVAL_HOURS,
                    TimeUnit.HOURS,
                )
                .setConstraints(constraints)
                .build()

        WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                CONTENT_SYNC_WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                request,
            )
    }
}
