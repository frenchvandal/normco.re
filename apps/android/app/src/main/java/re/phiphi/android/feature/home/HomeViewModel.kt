package re.phiphi.android.feature.home

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
class HomeViewModel @Inject constructor(private val postsRepository: PostsRepository) :
    ViewModel() {
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            _uiState.value =
                runCatching { postsRepository.getDefaultPostsIndex() }
                    .fold(
                        onSuccess = { postsIndex ->
                            HomeUiState.Success(lang = postsIndex.lang, items = postsIndex.items)
                        },
                        onFailure = { throwable ->
                            HomeUiState.Error(message = throwable.message ?: "Unknown failure")
                        },
                    )
        }
    }
}
