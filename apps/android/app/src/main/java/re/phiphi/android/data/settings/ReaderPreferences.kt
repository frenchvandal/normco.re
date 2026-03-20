package re.phiphi.android.data.settings

import androidx.compose.runtime.Immutable

@Immutable
data class ReaderPreferences(
    val preferredLanguage: String?,
    val saveOpenedPostsForOffline: Boolean,
    val syncOnUnmeteredOnly: Boolean,
    val bookmarkedPostSlugs: Set<String>,
)
