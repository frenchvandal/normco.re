package re.phiphi.android.feature.post

import androidx.lifecycle.SavedStateHandle
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
class PostViewModel
@Inject
constructor(private val postsRepository: PostsRepository, savedStateHandle: SavedStateHandle) :
    ViewModel() {
    private val slug = checkNotNull(savedStateHandle.get<String>("slug"))

    private val _uiState = MutableStateFlow<PostUiState>(PostUiState.Loading)
    val uiState: StateFlow<PostUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = PostUiState.Loading
            _uiState.value =
                runCatching { postsRepository.getDefaultPostDetail(slug = slug) }
                    .fold(
                        onSuccess = { post -> PostUiState.Success(post = post) },
                        onFailure = { throwable ->
                            PostUiState.Error(message = throwable.message ?: "Unknown failure")
                        },
                    )
        }
    }
}
