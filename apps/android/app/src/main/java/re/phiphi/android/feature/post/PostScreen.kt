package re.phiphi.android.feature.post

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import re.phiphi.android.R
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostDetailBlock

@Immutable
internal data class PostDetailListModel(
    val uiState: PostUiState.Success,
    val isBookmarked: Boolean,
    val publishedDate: String,
    val headingTargets: List<PostHeadingTarget>,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostScreen(
    uiState: PostUiState,
    isBookmarked: Boolean,
    onRetry: () -> Unit,
    onAction: (PostAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    when (uiState) {
        PostUiState.Loading -> LoadingState(modifier = modifier)
        is PostUiState.Error ->
            ErrorState(message = uiState.message, onRetry = onRetry, modifier = modifier)

        is PostUiState.Success ->
            PostDetailContent(
                uiState = uiState,
                isBookmarked = isBookmarked,
                onRetry = onRetry,
                onAction = onAction,
                modifier = modifier,
            )
    }
}

@Composable
private fun LoadingState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        CircularProgressIndicator()
        Text(
            text = stringResource(id = R.string.post_loading),
            style = MaterialTheme.typography.bodyLarge,
        )
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = stringResource(id = R.string.post_error, message),
            style = MaterialTheme.typography.bodyLarge,
        )
        Button(onClick = onRetry) { Text(text = stringResource(id = R.string.post_retry)) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PostDetailContent(
    uiState: PostUiState.Success,
    isBookmarked: Boolean,
    onRetry: () -> Unit,
    onAction: (PostAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val post = uiState.post
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val headerItemCount =
        remember(post, uiState.refreshErrorMessage) {
            buildPostHeaderItemCount(
                post = post,
                hasRefreshError = uiState.refreshErrorMessage != null,
            )
        }
    val publishedDate = remember(post.publishedAt) { formatPostDate(post.publishedAt) }
    val headingTargets =
        remember(post, uiState.refreshErrorMessage) {
            buildHeadingTargets(post = post, headerItemCount = headerItemCount)
        }
    var hasRestoredReadingPosition by remember(post.slug, post.lang) { mutableStateOf(false) }
    LaunchedEffect(post.slug, post.lang, headerItemCount, uiState.savedReadingBlockIndex) {
        if (hasRestoredReadingPosition) {
            return@LaunchedEffect
        }
        val savedBlockIndex = uiState.savedReadingBlockIndex ?: 0
        if (savedBlockIndex > 0) {
            listState.scrollToItem(index = headerItemCount + savedBlockIndex)
        }
        hasRestoredReadingPosition = true
    }
    TrackReadingProgressEffect(
        post = post,
        headerItemCount = headerItemCount,
        hasRestoredReadingPosition = hasRestoredReadingPosition,
        listState = listState,
        onAction = onAction,
    )
    PullToRefreshBox(
        isRefreshing = uiState.isRefreshing,
        onRefresh = onRetry,
        modifier = modifier.fillMaxSize(),
    ) {
        PostDetailList(
            model =
                PostDetailListModel(
                    uiState = uiState,
                    isBookmarked = isBookmarked,
                    publishedDate = publishedDate,
                    headingTargets = headingTargets,
                ),
            listState = listState,
            onAction = onAction,
            onSelectHeading = { headingTarget ->
                coroutineScope.launch {
                    listState.animateScrollToItem(index = headingTarget.itemIndex)
                }
            },
        )
    }
}

@Composable
private fun TrackReadingProgressEffect(
    post: PostDetail,
    headerItemCount: Int,
    hasRestoredReadingPosition: Boolean,
    listState: androidx.compose.foundation.lazy.LazyListState,
    onAction: (PostAction) -> Unit,
) {
    LaunchedEffect(post.slug, post.lang, headerItemCount, hasRestoredReadingPosition) {
        if (!hasRestoredReadingPosition) {
            return@LaunchedEffect
        }
        snapshotFlow { listState.firstVisibleItemIndex }
            .map { itemIndex -> (itemIndex - headerItemCount).coerceAtLeast(0) }
            .distinctUntilChanged()
            .filter { blockIndex -> blockIndex < post.blocks.size }
            .collect { blockIndex ->
                onAction(PostAction.UpdateReadingBlockIndex(blockIndex = blockIndex))
            }
    }
}

internal fun buildHeadingTargets(post: PostDetail, headerItemCount: Int): List<PostHeadingTarget> {
    return post.blocks.mapIndexedNotNull { index, block ->
        block.asHeadingTargetOrNull(itemIndex = headerItemCount + index)
    }
}

private fun buildPostHeaderItemCount(post: PostDetail, hasRefreshError: Boolean): Int =
    (if (post.heroImage != null) 1 else 0) + 1 + 1 + if (hasRefreshError) 1 else 0

internal data class PostHeadingTarget(val label: String, val itemIndex: Int)

private fun PostDetailBlock.asHeadingTargetOrNull(itemIndex: Int): PostHeadingTarget? {
    return text
        ?.trim()
        ?.takeIf { type == "heading" && it.isNotBlank() }
        ?.let { label -> PostHeadingTarget(label = label, itemIndex = itemIndex) }
}

private fun formatPostDate(raw: String): String =
    runCatching {
            OffsetDateTime.parse(raw)
                .format(
                    DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                        .withLocale(Locale.getDefault())
                )
        }
        .getOrElse { raw }
