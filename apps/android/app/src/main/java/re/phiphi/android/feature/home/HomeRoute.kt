package re.phiphi.android.feature.home

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun HomeRoute(
    onOpenPost: (String) -> Unit,
    onOpenSavedArchive: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: HomeViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    HomeScreen(
        uiState = uiState,
        actions =
            HomeScreenActions(
                onOpenPost = onOpenPost,
                onOpenSavedArchive = onOpenSavedArchive,
                onToggleBookmark = viewModel::setBookmarked,
                onRetry = viewModel::refresh,
                onRefresh = viewModel::refresh,
            ),
        modifier = modifier,
    )
}
