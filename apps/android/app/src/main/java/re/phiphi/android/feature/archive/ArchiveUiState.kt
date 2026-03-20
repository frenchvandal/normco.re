package re.phiphi.android.feature.archive

import androidx.compose.runtime.Immutable
import re.phiphi.android.core.model.PostSummary

sealed interface ArchiveUiState {
    data object Loading : ArchiveUiState

    @Immutable data class Error(val message: String) : ArchiveUiState

    @Immutable
    data class Success(
        val lang: String,
        val items: List<PostSummary>,
        val bookmarkedSlugs: Set<String>,
        val lastCheckedAtMillis: Long?,
        val lastCheckSucceeded: Boolean?,
    ) : ArchiveUiState
}
