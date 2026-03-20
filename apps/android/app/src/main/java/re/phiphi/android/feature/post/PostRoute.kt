package re.phiphi.android.feature.post

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.core.net.toUri
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import re.phiphi.android.R

@Composable
fun PostRoute(modifier: Modifier = Modifier) {
    val viewModel: PostViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isBookmarked by viewModel.isBookmarked.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val shareChooserTitle = stringResource(id = R.string.post_share_chooser_title)

    PostScreen(
        uiState = uiState,
        isBookmarked = isBookmarked,
        onRetry = viewModel::refresh,
        onAction = { action ->
            when (action) {
                is PostAction.ToggleBookmark -> viewModel.setBookmarked(action.bookmarked)
                is PostAction.SelectLanguage -> viewModel.selectLanguage(action.language)
                is PostAction.UpdateReadingBlockIndex ->
                    viewModel.setReadingBlockIndex(action.blockIndex)

                PostAction.OpenInBrowser ->
                    (uiState as? PostUiState.Success)?.post?.let { post ->
                        context.startExternalActivity(
                            Intent(Intent.ACTION_VIEW, post.webUrl.toUri())
                        )
                    }

                PostAction.Share ->
                    (uiState as? PostUiState.Success)?.post?.let { post ->
                        context.startExternalActivity(
                            Intent.createChooser(
                                Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_SUBJECT, post.title)
                                    putExtra(Intent.EXTRA_TEXT, "${post.title}\n${post.webUrl}")
                                },
                                shareChooserTitle,
                            )
                        )
                    }
            }
        },
        modifier = modifier,
    )
}

private fun Context.startExternalActivity(intent: Intent) {
    if (this !is Activity) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    startActivity(intent)
}
