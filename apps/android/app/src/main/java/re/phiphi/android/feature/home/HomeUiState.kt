package re.phiphi.android.feature.home

import androidx.compose.runtime.Immutable
import re.phiphi.android.core.model.PostSummary

sealed interface HomeUiState {
    data object Loading : HomeUiState

    @Immutable data class Error(val message: String) : HomeUiState

    @Immutable
    data class Success(
        val lang: String,
        val items: List<PostSummary>,
        val bookmarkedSlugs: Set<String>,
        val lastCheckedAtMillis: Long?,
        val lastCheckSucceeded: Boolean?,
        val isRefreshing: Boolean,
    ) : HomeUiState
}
