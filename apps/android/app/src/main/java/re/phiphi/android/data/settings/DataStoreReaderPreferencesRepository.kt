package re.phiphi.android.data.settings

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val preferredLanguageKey = stringPreferencesKey("preferred_language")
private val saveOpenedPostsForOfflineKey = booleanPreferencesKey("save_opened_posts_for_offline")
private val syncOnUnmeteredOnlyKey = booleanPreferencesKey("sync_on_unmetered_only")
private val bookmarkedPostSlugsKey = stringSetPreferencesKey("bookmarked_post_slugs")

@Singleton
class DataStoreReaderPreferencesRepository
@Inject
constructor(private val dataStore: DataStore<Preferences>) : ReaderPreferencesRepository {
    override val preferences: Flow<ReaderPreferences> =
        dataStore.data.map { storedPreferences ->
            ReaderPreferences(
                preferredLanguage = storedPreferences[preferredLanguageKey],
                saveOpenedPostsForOffline = storedPreferences[saveOpenedPostsForOfflineKey] ?: true,
                syncOnUnmeteredOnly = storedPreferences[syncOnUnmeteredOnlyKey] ?: true,
                bookmarkedPostSlugs = storedPreferences[bookmarkedPostSlugsKey] ?: emptySet(),
            )
        }

    override suspend fun setPreferredLanguage(language: String) {
        dataStore.edit { storedPreferences -> storedPreferences[preferredLanguageKey] = language }
    }

    override suspend fun setSaveOpenedPostsForOffline(enabled: Boolean) {
        dataStore.edit { storedPreferences ->
            storedPreferences[saveOpenedPostsForOfflineKey] = enabled
        }
    }

    override suspend fun setSyncOnUnmeteredOnly(enabled: Boolean) {
        dataStore.edit { storedPreferences -> storedPreferences[syncOnUnmeteredOnlyKey] = enabled }
    }

    override suspend fun setPostBookmarked(slug: String, bookmarked: Boolean) {
        dataStore.edit { storedPreferences ->
            val current = storedPreferences[bookmarkedPostSlugsKey].orEmpty()
            storedPreferences[bookmarkedPostSlugsKey] =
                if (bookmarked) {
                    current + slug
                } else {
                    current - slug
                }
        }
    }
}
