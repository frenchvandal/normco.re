package re.phiphi.android.feature.archive

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

@HiltViewModel
class ArchiveViewModel
@Inject
constructor(
    private val postsRepository: PostsRepository,
    private val contentSyncStatusRepository: ContentSyncStatusRepository,
    private val readerPreferencesRepository: ReaderPreferencesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<ArchiveUiState>(ArchiveUiState.Loading)
    val uiState: StateFlow<ArchiveUiState> = _uiState.asStateFlow()
    private var preferredLanguage: String? = null
    private var bookmarkedSlugs: Set<String> = emptySet()
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
                    if (currentState is ArchiveUiState.Success) {
                        _uiState.value = currentState.copy(bookmarkedSlugs = slugs)
                    }
                }
        }

        viewModelScope.launch {
            contentSyncStatusRepository.status.collectLatest { status ->
                syncStatus = status
                val currentState = _uiState.value
                if (currentState is ArchiveUiState.Success) {
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
            postsRepository.refreshContent()
            loadPosts()
        }

    private suspend fun loadPosts() {
        _uiState.value = ArchiveUiState.Loading
        _uiState.value =
            runCatching { postsRepository.getPostsIndex(lang = preferredLanguage) }
                .fold(
                    onSuccess = { postsIndex ->
                        ArchiveUiState.Success(
                            lang = postsIndex.lang,
                            items = postsIndex.items,
                            bookmarkedSlugs = bookmarkedSlugs,
                            lastCheckedAtMillis = syncStatus.lastCheckedAtMillis,
                            lastCheckSucceeded = syncStatus.lastCheckSucceeded,
                        )
                    },
                    onFailure = { throwable ->
                        ArchiveUiState.Error(message = throwable.message ?: "Unknown failure")
                    },
                )
    }
}
