package re.phiphi.android.data.posts

import kotlinx.coroutines.flow.Flow

interface ContentSyncStatusRepository {
    val status: Flow<ContentSyncStatus>

    suspend fun recordCheckResult(atMillis: Long, succeeded: Boolean)
}
