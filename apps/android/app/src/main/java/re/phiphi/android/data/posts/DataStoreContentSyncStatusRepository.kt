package re.phiphi.android.data.posts

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val lastCheckedAtMillisKey = longPreferencesKey("content_last_checked_at_millis")
private val lastCheckSucceededKey = booleanPreferencesKey("content_last_check_succeeded")

@Singleton
class DataStoreContentSyncStatusRepository
@Inject
constructor(private val dataStore: DataStore<Preferences>) : ContentSyncStatusRepository {
    override val status: Flow<ContentSyncStatus> =
        dataStore.data.map { storedPreferences ->
            ContentSyncStatus(
                lastCheckedAtMillis = storedPreferences[lastCheckedAtMillisKey],
                lastCheckSucceeded = storedPreferences[lastCheckSucceededKey],
            )
        }

    override suspend fun recordCheckResult(atMillis: Long, succeeded: Boolean) {
        dataStore.edit { storedPreferences ->
            storedPreferences[lastCheckedAtMillisKey] = atMillis
            storedPreferences[lastCheckSucceededKey] = succeeded
        }
    }
}
