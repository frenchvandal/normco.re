package re.phiphi.android.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import re.phiphi.android.data.posts.ContentSyncScheduler
import re.phiphi.android.data.posts.ContentSyncStatusRepository
import re.phiphi.android.data.posts.PostsRepository
import re.phiphi.android.data.settings.AppLocaleManager
import re.phiphi.android.data.settings.ReaderPreferencesRepository

private const val SETTINGS_SUBSCRIPTION_TIMEOUT_MILLIS = 5_000L

@OptIn(ExperimentalCoroutinesApi::class)
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
    private val refreshRequests = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val uiState: StateFlow<SettingsUiState> =
        refreshRequests
            .onStart { emit(Unit) }
            .flatMapLatest {
                flow {
                    emit(SettingsUiState.Loading)

                    val manifest =
                        runCatching { postsRepository.getAppManifest() }
                            .getOrElse { throwable ->
                                emit(
                                    SettingsUiState.Error(
                                        message = throwable.message ?: "Unknown failure"
                                    )
                                )
                                return@flow
                            }

                    emitAll(
                        combine(
                            readerPreferencesRepository.preferences,
                            contentSyncStatusRepository.status,
                        ) { preferences, syncStatus ->
                            val selectedLanguage =
                                preferences.preferredLanguage?.takeIf { candidate ->
                                    candidate in manifest.languages
                                } ?: manifest.defaultLanguage

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
                    )
                }
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(SETTINGS_SUBSCRIPTION_TIMEOUT_MILLIS),
                initialValue = SettingsUiState.Loading,
            )

    init {
        refresh()
    }

    fun refresh() {
        refreshRequests.tryEmit(Unit)
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
