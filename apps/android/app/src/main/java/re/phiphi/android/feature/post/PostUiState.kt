package re.phiphi.android.feature.post

import androidx.compose.runtime.Immutable
import re.phiphi.android.core.model.PostDetail

sealed interface PostUiState {
    data object Loading : PostUiState

    @Immutable data class Error(val message: String) : PostUiState

    @Immutable
    data class Success(
        val post: PostDetail,
        val isRefreshing: Boolean,
        val refreshErrorMessage: String?,
        val savedReadingBlockIndex: Int?,
    ) : PostUiState
}

sealed interface PostAction {
    data class ToggleBookmark(val bookmarked: Boolean) : PostAction

    data class SelectLanguage(val language: String) : PostAction

    data class UpdateReadingBlockIndex(val blockIndex: Int) : PostAction

    data object OpenInBrowser : PostAction

    data object Share : PostAction
}
