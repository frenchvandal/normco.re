package re.phiphi.android.feature.home

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

private const val HOME_POST_LIMIT = 5

@HiltViewModel
class HomeViewModel
@Inject
constructor(
    private val postsRepository: PostsRepository,
    private val readerPreferencesRepository: ReaderPreferencesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    private var preferredLanguage: String? = null
    private var bookmarkedSlugs: Set<String> = emptySet()

    init {
        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> preferences.preferredLanguage }
                .distinctUntilChanged()
                .collectLatest { selectedLanguage ->
                    preferredLanguage = selectedLanguage
                    loadPosts()
                }
        }

        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> preferences.bookmarkedPostSlugs }
                .distinctUntilChanged()
                .collectLatest { slugs ->
                    bookmarkedSlugs = slugs
                    val currentState = _uiState.value
                    if (currentState is HomeUiState.Success) {
                        _uiState.value = currentState.copy(bookmarkedSlugs = slugs)
                    }
                }
        }
    }

    fun refresh() = viewModelScope.launch { loadPosts() }

    private suspend fun loadPosts() {
        _uiState.value = HomeUiState.Loading
        _uiState.value =
            runCatching { postsRepository.getPostsIndex(lang = preferredLanguage) }
                .fold(
                    onSuccess = { postsIndex ->
                        HomeUiState.Success(
                            lang = postsIndex.lang,
                            items = postsIndex.items.take(HOME_POST_LIMIT),
                            bookmarkedSlugs = bookmarkedSlugs,
                        )
                    },
                    onFailure = { throwable ->
                        HomeUiState.Error(message = throwable.message ?: "Unknown failure")
                    },
                )
    }
}
