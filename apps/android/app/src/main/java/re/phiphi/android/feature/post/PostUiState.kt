package re.phiphi.android.feature.post

import androidx.compose.runtime.Immutable
import re.phiphi.android.core.model.PostDetail

sealed interface PostUiState {
    data object Loading : PostUiState

    @Immutable data class Error(val message: String) : PostUiState

    @Immutable data class Success(val post: PostDetail) : PostUiState
}
