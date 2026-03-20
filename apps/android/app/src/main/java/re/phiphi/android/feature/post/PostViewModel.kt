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
import kotlinx.coroutines.flow.combine
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
    private val selectedLanguageOverride = MutableStateFlow(savedStateHandle.get<String>("lang"))

    private val _uiState = MutableStateFlow<PostUiState>(PostUiState.Loading)
    val uiState: StateFlow<PostUiState> = _uiState.asStateFlow()
    private val _isBookmarked = MutableStateFlow(false)
    val isBookmarked: StateFlow<Boolean> = _isBookmarked.asStateFlow()
    private val stateHandle = savedStateHandle
    private var currentLanguage: String? = null
    private var savedReadingBlockIndex: Int? = null

    init {
        viewModelScope.launch {
            combine(
                    readerPreferencesRepository.preferences
                        .map { preferences -> preferences.preferredLanguage }
                        .distinctUntilChanged(),
                    selectedLanguageOverride,
                ) { preferredLanguage, languageOverride ->
                    languageOverride ?: preferredLanguage
                }
                .distinctUntilChanged()
                .collectLatest { language ->
                    currentLanguage = language
                    loadPost(
                        language = language,
                        showBlockingLoader = _uiState.value !is PostUiState.Success,
                    )
                }
        }

        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> slug in preferences.bookmarkedPostSlugs }
                .distinctUntilChanged()
                .collectLatest { bookmarked -> _isBookmarked.value = bookmarked }
        }

        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> preferences.postReadingBlockIndexes[slug] }
                .distinctUntilChanged()
                .collectLatest { blockIndex ->
                    savedReadingBlockIndex = blockIndex
                    val currentState = _uiState.value
                    if (currentState is PostUiState.Success) {
                        _uiState.value = currentState.copy(savedReadingBlockIndex = blockIndex)
                    }
                }
        }
    }

    fun refresh() =
        viewModelScope.launch { loadPost(language = currentLanguage, showBlockingLoader = false) }

    fun setBookmarked(bookmarked: Boolean) =
        viewModelScope.launch { readerPreferencesRepository.setPostBookmarked(slug, bookmarked) }

    fun setReadingBlockIndex(blockIndex: Int) =
        viewModelScope.launch {
            readerPreferencesRepository.setPostReadingBlockIndex(
                slug = slug,
                blockIndex = blockIndex,
            )
        }

    fun selectLanguage(language: String) {
        stateHandle["lang"] = language
        selectedLanguageOverride.value = language
    }

    private suspend fun loadPost(language: String?, showBlockingLoader: Boolean) {
        val previousSuccess = _uiState.value as? PostUiState.Success
        if (showBlockingLoader || previousSuccess == null) {
            _uiState.value = PostUiState.Loading
        } else {
            _uiState.value = previousSuccess.copy(isRefreshing = true, refreshErrorMessage = null)
        }
        _uiState.value =
            runCatching { postsRepository.getPostDetail(slug = slug, lang = language) }
                .fold(
                    onSuccess = { post ->
                        readerPreferencesRepository.recordPostOpened(slug = post.slug)
                        PostUiState.Success(
                            post = post,
                            isRefreshing = false,
                            refreshErrorMessage = null,
                            savedReadingBlockIndex = savedReadingBlockIndex,
                        )
                    },
                    onFailure = { throwable ->
                        previousSuccess?.copy(
                            isRefreshing = false,
                            refreshErrorMessage = throwable.message ?: "Unknown failure",
                        ) ?: PostUiState.Error(message = throwable.message ?: "Unknown failure")
                    },
                )
    }
}
