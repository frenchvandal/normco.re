package re.phiphi.android.feature.archive

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ArchiveRoute(
    onOpenPost: (String) -> Unit,
    initialBookmarkedOnly: Boolean,
    modifier: Modifier = Modifier,
) {
    val viewModel: ArchiveViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    ArchiveScreen(
        uiState = uiState,
        initialBookmarkedOnly = initialBookmarkedOnly,
        actions =
            ArchiveScreenActions(
                onOpenPost = onOpenPost,
                onToggleBookmark = viewModel::setBookmarked,
                onRetry = viewModel::refresh,
                onRefresh = viewModel::refresh,
            ),
        modifier = modifier,
    )
}
