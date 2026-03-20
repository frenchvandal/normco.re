package re.phiphi.android.feature.post

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import re.phiphi.android.data.posts.PostsRepository
import re.phiphi.android.data.settings.ReaderPreferencesRepository

@HiltViewModel
class PostViewModel
@Inject
constructor(
    private val postsRepository: PostsRepository,
    private val readerPreferencesRepository: ReaderPreferencesRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {
    private val slug = checkNotNull(savedStateHandle.get<String>("slug"))

    private val _uiState = MutableStateFlow<PostUiState>(PostUiState.Loading)
    val uiState: StateFlow<PostUiState> = _uiState.asStateFlow()
    private val _isBookmarked = MutableStateFlow(false)
    val isBookmarked: StateFlow<Boolean> = _isBookmarked.asStateFlow()
    private var preferredLanguage: String? = null

    init {
        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> preferences.preferredLanguage }
                .distinctUntilChanged()
                .collectLatest { selectedLanguage ->
                    preferredLanguage = selectedLanguage
                    loadPost()
                }
        }

        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> slug in preferences.bookmarkedPostSlugs }
                .distinctUntilChanged()
                .collectLatest { bookmarked -> _isBookmarked.value = bookmarked }
        }
    }

    fun refresh() = viewModelScope.launch { loadPost() }

    fun setBookmarked(bookmarked: Boolean) =
        viewModelScope.launch { readerPreferencesRepository.setPostBookmarked(slug, bookmarked) }

    private suspend fun loadPost() {
        _uiState.value = PostUiState.Loading
        _uiState.value =
            runCatching { postsRepository.getPostDetail(slug = slug, lang = preferredLanguage) }
                .fold(
                    onSuccess = { post -> PostUiState.Success(post = post) },
                    onFailure = { throwable ->
                        PostUiState.Error(message = throwable.message ?: "Unknown failure")
                    },
                )
    }
}
