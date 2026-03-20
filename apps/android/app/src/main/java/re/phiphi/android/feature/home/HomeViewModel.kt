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
import re.phiphi.android.data.posts.ContentSyncStatus
import re.phiphi.android.data.posts.ContentSyncStatusRepository
import re.phiphi.android.data.posts.PostsRepository
import re.phiphi.android.data.settings.ReaderPreferencesRepository

private const val HOME_POST_LIMIT = 5
private const val HOME_RECENT_LIMIT = 3
private const val HOME_BOOKMARK_LIMIT = 3

@HiltViewModel
class HomeViewModel
@Inject
constructor(
    private val postsRepository: PostsRepository,
    private val contentSyncStatusRepository: ContentSyncStatusRepository,
    private val readerPreferencesRepository: ReaderPreferencesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    private var preferredLanguage: String? = null
    private var bookmarkedSlugs: Set<String> = emptySet()
    private var recentOpenedPostSlugs: List<String> = emptyList()
    private var syncStatus: ContentSyncStatus = ContentSyncStatus()

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

        viewModelScope.launch {
            readerPreferencesRepository.preferences
                .map { preferences -> preferences.recentOpenedPostSlugs }
                .distinctUntilChanged()
                .collectLatest { slugs ->
                    recentOpenedPostSlugs = slugs
                    loadPosts(showBlockingLoader = false)
                }
        }

        viewModelScope.launch {
            contentSyncStatusRepository.status.collectLatest { status ->
                syncStatus = status
                val currentState = _uiState.value
                if (currentState is HomeUiState.Success) {
                    _uiState.value =
                        currentState.copy(
                            lastCheckedAtMillis = status.lastCheckedAtMillis,
                            lastCheckSucceeded = status.lastCheckSucceeded,
                        )
                }
            }
        }
    }

    fun refresh() =
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is HomeUiState.Success) {
                _uiState.value = currentState.copy(isRefreshing = true)
            }
            runCatching { postsRepository.refreshContent() }
            loadPosts(showBlockingLoader = false)
        }

    private suspend fun loadPosts(showBlockingLoader: Boolean = true) {
        val previousSuccess = _uiState.value as? HomeUiState.Success
        if (showBlockingLoader || previousSuccess == null) {
            _uiState.value = HomeUiState.Loading
        }
        _uiState.value =
            runCatching { postsRepository.getPostsIndex(lang = preferredLanguage) }
                .fold(
                    onSuccess = { postsIndex ->
                        val postsBySlug = postsIndex.items.associateBy { post -> post.slug }
                        val recentItems =
                            recentOpenedPostSlugs
                                .mapNotNull(postsBySlug::get)
                                .take(HOME_RECENT_LIMIT)
                        val bookmarkedItems =
                            postsIndex.items
                                .filter { post ->
                                    post.slug in bookmarkedSlugs &&
                                        post.slug !in recentOpenedPostSlugs
                                }
                                .take(HOME_BOOKMARK_LIMIT)

                        HomeUiState.Success(
                            lang = postsIndex.lang,
                            recentItems = recentItems,
                            bookmarkedItems = bookmarkedItems,
                            items = postsIndex.items.take(HOME_POST_LIMIT),
                            bookmarkedSlugs = bookmarkedSlugs,
                            lastCheckedAtMillis = syncStatus.lastCheckedAtMillis,
                            lastCheckSucceeded = syncStatus.lastCheckSucceeded,
                            isRefreshing = false,
                        )
                    },
                    onFailure = { throwable ->
                        previousSuccess?.copy(
                            lastCheckedAtMillis = syncStatus.lastCheckedAtMillis,
                            lastCheckSucceeded = syncStatus.lastCheckSucceeded,
                            isRefreshing = false,
                        ) ?: HomeUiState.Error(message = throwable.message ?: "Unknown failure")
                    },
                )
    }
}
