package re.phiphi.android.feature.settings

import androidx.compose.runtime.Immutable

sealed interface SettingsUiState {
    data object Loading : SettingsUiState

    @Immutable data class Error(val message: String) : SettingsUiState

    @Immutable
    data class Success(
        val availableLanguages: List<String>,
        val selectedLanguage: String,
        val saveOpenedPostsForOffline: Boolean,
        val syncOnUnmeteredOnly: Boolean,
    ) : SettingsUiState
}

sealed interface SettingsAction {
    data class SelectLanguage(val language: String) : SettingsAction

    data class SetSaveOpenedPostsForOffline(val enabled: Boolean) : SettingsAction

    data class SetSyncOnUnmeteredOnly(val enabled: Boolean) : SettingsAction
}
