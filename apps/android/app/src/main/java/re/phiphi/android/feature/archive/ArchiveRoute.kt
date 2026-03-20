package re.phiphi.android.feature.archive

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ArchiveRoute(onOpenPost: (String) -> Unit, modifier: Modifier = Modifier) {
    val viewModel: ArchiveViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    ArchiveScreen(
        uiState = uiState,
        onOpenPost = onOpenPost,
        onRetry = viewModel::refresh,
        modifier = modifier,
    )
}
