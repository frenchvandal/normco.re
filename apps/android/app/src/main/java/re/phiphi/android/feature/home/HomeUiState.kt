package re.phiphi.android.feature.home

import re.phiphi.android.core.model.PostSummary

sealed interface HomeUiState {
    data object Loading : HomeUiState

    data class Error(val message: String) : HomeUiState

    data class Success(val lang: String, val items: List<PostSummary>) : HomeUiState
}
