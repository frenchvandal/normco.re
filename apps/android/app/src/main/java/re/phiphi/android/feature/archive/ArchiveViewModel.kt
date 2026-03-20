package re.phiphi.android.feature.archive

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import re.phiphi.android.data.posts.PostsRepository

@HiltViewModel
class ArchiveViewModel @Inject constructor(private val postsRepository: PostsRepository) :
    ViewModel() {
    private val _uiState = MutableStateFlow<ArchiveUiState>(ArchiveUiState.Loading)
    val uiState: StateFlow<ArchiveUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = ArchiveUiState.Loading
            _uiState.value =
                runCatching { postsRepository.getDefaultPostsIndex() }
                    .fold(
                        onSuccess = { postsIndex ->
                            ArchiveUiState.Success(lang = postsIndex.lang, items = postsIndex.items)
                        },
                        onFailure = { throwable ->
                            ArchiveUiState.Error(message = throwable.message ?: "Unknown failure")
                        },
                    )
        }
    }
}
