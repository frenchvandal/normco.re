package re.phiphi.android.feature.post

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun PostRoute(modifier: Modifier = Modifier) {
    val viewModel: PostViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    PostScreen(uiState = uiState, onRetry = viewModel::refresh, modifier = modifier)
}
