package re.phiphi.android.feature.settings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun SettingsRoute(modifier: Modifier = Modifier) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    SettingsScreen(
        uiState = uiState,
        onRetry = viewModel::refresh,
        onAction = { action ->
            when (action) {
                is SettingsAction.SelectLanguage -> viewModel.setPreferredLanguage(action.language)
                is SettingsAction.SetSaveOpenedPostsForOffline ->
                    viewModel.setSaveOpenedPostsForOffline(action.enabled)
                is SettingsAction.SetSyncOnUnmeteredOnly ->
                    viewModel.setSyncOnUnmeteredOnly(action.enabled)
                SettingsAction.ClearReadingHistory -> viewModel.clearReadingHistory()
            }
        },
        modifier = modifier,
    )
}
