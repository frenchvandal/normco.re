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
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val preferredLanguageKey = stringPreferencesKey("preferred_language")
private val saveOpenedPostsForOfflineKey = booleanPreferencesKey("save_opened_posts_for_offline")
private val syncOnUnmeteredOnlyKey = booleanPreferencesKey("sync_on_unmetered_only")
private val bookmarkedPostSlugsKey = stringSetPreferencesKey("bookmarked_post_slugs")
private val recentOpenedPostSlugsKey = stringPreferencesKey("recent_opened_post_slugs")
private val postReadingBlockIndexesKey = stringPreferencesKey("post_reading_block_indexes")
private const val RECENT_OPENED_POST_LIMIT = 8
private const val READING_PROGRESS_LIMIT = 20

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
                recentOpenedPostSlugs =
                    storedPreferences[recentOpenedPostSlugsKey]?.let(::decodeRecentOpenedPostSlugs)
                        ?: emptyList(),
                postReadingBlockIndexes =
                    storedPreferences[postReadingBlockIndexesKey]?.let(
                        ::decodePostReadingBlockIndexes
                    ) ?: emptyMap(),
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

    override suspend fun recordPostOpened(slug: String) {
        dataStore.edit { storedPreferences ->
            val current =
                storedPreferences[recentOpenedPostSlugsKey]?.let(::decodeRecentOpenedPostSlugs)
                    ?: emptyList()
            val updated =
                listOf(slug) +
                    current
                        .filterNot { existingSlug -> existingSlug == slug }
                        .take(RECENT_OPENED_POST_LIMIT - 1)
            storedPreferences[recentOpenedPostSlugsKey] = Json.encodeToString(updated)
        }
    }

    override suspend fun setPostReadingBlockIndex(slug: String, blockIndex: Int) {
        dataStore.edit { storedPreferences ->
            val current =
                storedPreferences[postReadingBlockIndexesKey]?.let(::decodePostReadingBlockIndexes)
                    ?: emptyMap()
            val updated = linkedMapOf(slug to blockIndex)
            current.forEach { (storedSlug, storedBlockIndex) ->
                if (storedSlug != slug) {
                    updated[storedSlug] = storedBlockIndex
                }
            }
            storedPreferences[postReadingBlockIndexesKey] =
                Json.encodeToString(
                    updated.entries.take(READING_PROGRESS_LIMIT).associate { entry ->
                        entry.toPair()
                    }
                )
        }
    }

    override suspend fun clearReadingHistory() {
        dataStore.edit { storedPreferences ->
            storedPreferences.remove(recentOpenedPostSlugsKey)
            storedPreferences.remove(postReadingBlockIndexesKey)
        }
    }
}

private fun decodeRecentOpenedPostSlugs(encoded: String): List<String> =
    runCatching { Json.decodeFromString<List<String>>(encoded) }.getOrDefault(emptyList())

private fun decodePostReadingBlockIndexes(encoded: String): Map<String, Int> =
    runCatching { Json.decodeFromString<Map<String, Int>>(encoded) }.getOrDefault(emptyMap())
