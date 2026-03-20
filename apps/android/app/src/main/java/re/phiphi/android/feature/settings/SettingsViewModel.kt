package re.phiphi.android.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import re.phiphi.android.data.posts.ContentSyncScheduler
import re.phiphi.android.data.posts.ContentSyncStatusRepository
import re.phiphi.android.data.posts.PostsRepository
import re.phiphi.android.data.settings.AppLocaleManager
import re.phiphi.android.data.settings.ReaderPreferencesRepository

@HiltViewModel
class SettingsViewModel
@Inject
constructor(
    private val postsRepository: PostsRepository,
    private val readerPreferencesRepository: ReaderPreferencesRepository,
    private val appLocaleManager: AppLocaleManager,
    private val contentSyncScheduler: ContentSyncScheduler,
    private val contentSyncStatusRepository: ContentSyncStatusRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<SettingsUiState>(SettingsUiState.Loading)
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    private var observePreferencesJob: Job? = null

    init {
        refresh()
    }

    fun refresh() {
        observePreferencesJob?.cancel()
        observePreferencesJob =
            viewModelScope.launch {
                _uiState.value = SettingsUiState.Loading

                val manifest =
                    runCatching { postsRepository.getAppManifest() }
                        .getOrElse { throwable ->
                            _uiState.value =
                                SettingsUiState.Error(
                                    message = throwable.message ?: "Unknown failure"
                                )
                            return@launch
                        }

                combine(
                        readerPreferencesRepository.preferences,
                        contentSyncStatusRepository.status,
                    ) { preferences, syncStatus ->
                        preferences to syncStatus
                    }
                    .collectLatest { (preferences, syncStatus) ->
                        val selectedLanguage =
                            preferences.preferredLanguage?.takeIf { candidate ->
                                candidate in manifest.languages
                            } ?: manifest.defaultLanguage

                        _uiState.value =
                            SettingsUiState.Success(
                                availableLanguages = manifest.languages,
                                selectedLanguage = selectedLanguage,
                                saveOpenedPostsForOffline = preferences.saveOpenedPostsForOffline,
                                syncOnUnmeteredOnly = preferences.syncOnUnmeteredOnly,
                                hasReadingHistory =
                                    preferences.recentOpenedPostSlugs.isNotEmpty() ||
                                        preferences.postReadingBlockIndexes.isNotEmpty(),
                                lastCheckedAtMillis = syncStatus.lastCheckedAtMillis,
                                lastCheckSucceeded = syncStatus.lastCheckSucceeded,
                            )
                    }
            }
    }

    fun setPreferredLanguage(language: String) {
        viewModelScope.launch {
            readerPreferencesRepository.setPreferredLanguage(language)
            appLocaleManager.applyLanguage(language)
        }
    }

    fun setSaveOpenedPostsForOffline(enabled: Boolean) {
        viewModelScope.launch { readerPreferencesRepository.setSaveOpenedPostsForOffline(enabled) }
    }

    fun setSyncOnUnmeteredOnly(enabled: Boolean) {
        viewModelScope.launch {
            readerPreferencesRepository.setSyncOnUnmeteredOnly(enabled)
            contentSyncScheduler.schedule(enabled)
        }
    }

    fun clearReadingHistory() {
        viewModelScope.launch { readerPreferencesRepository.clearReadingHistory() }
    }
}
