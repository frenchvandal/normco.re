package re.phiphi.android.data.settings

import kotlinx.coroutines.flow.Flow

interface ReaderPreferencesRepository {
    val preferences: Flow<ReaderPreferences>

    suspend fun setPreferredLanguage(language: String)

    suspend fun setSaveOpenedPostsForOffline(enabled: Boolean)

    suspend fun setSyncOnUnmeteredOnly(enabled: Boolean)

    suspend fun setPostBookmarked(slug: String, bookmarked: Boolean)
}
