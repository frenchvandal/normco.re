package re.phiphi.android.feature.post

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import kotlinx.coroutines.launch
import re.phiphi.android.R
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostDetailBlock

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

@Composable
private fun PostDetailContent(
    uiState: PostUiState.Success,
    isBookmarked: Boolean,
    onAction: (PostAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val post = uiState.post
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val headingTargets =
        remember(post, uiState.refreshErrorMessage) {
            buildHeadingTargets(post = post, hasRefreshError = uiState.refreshErrorMessage != null)
        }

    LazyColumn(
        state = listState,
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        postDetailItems(
            uiState = uiState,
            isBookmarked = isBookmarked,
            headingTargets = headingTargets,
            onAction = onAction,
            onSelectHeading = { headingTarget ->
                coroutineScope.launch {
                    listState.animateScrollToItem(index = headingTarget.itemIndex)
                }
            },
        )
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.postDetailItems(
    uiState: PostUiState.Success,
    isBookmarked: Boolean,
    headingTargets: List<PostHeadingTarget>,
    onAction: (PostAction) -> Unit,
    onSelectHeading: (PostHeadingTarget) -> Unit,
) {
    val post = uiState.post
    val publishedDate = formatPostDate(post.publishedAt)

    post.heroImage?.let { heroImage ->
        item {
            ImageBlockContent(
                src = heroImage.url,
                alt = heroImage.alt,
                width = heroImage.width,
                height = heroImage.height,
            )
        }
    }
    item {
        PostDetailHeader(
            post = post,
            publishedDate = publishedDate,
            isRefreshing = uiState.isRefreshing,
            isBookmarked = isBookmarked,
            onAction = onAction,
        )
    }
    if (headingTargets.isNotEmpty()) {
        item {
            PostTableOfContents(headingTargets = headingTargets, onSelectHeading = onSelectHeading)
        }
    }
    uiState.refreshErrorMessage?.let {
        item {
            Text(
                text = stringResource(id = R.string.post_refresh_failed),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
            )
        }
    }

    items(
        items = post.blocks,
        key = { block ->
            listOfNotNull(block.type, block.text, block.content, block.src).joinToString("|")
        },
        contentType = { block -> block.type },
    ) { block ->
        PostBlockContent(block = block)
    }
}

@Composable
private fun PostTableOfContents(
    headingTargets: List<PostHeadingTarget>,
    onSelectHeading: (PostHeadingTarget) -> Unit,
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = stringResource(id = R.string.post_contents_title),
                style = MaterialTheme.typography.titleMedium,
            )
            headingTargets.forEach { headingTarget ->
                TextButton(onClick = { onSelectHeading(headingTarget) }) {
                    Text(text = headingTarget.label)
                }
            }
        }
    }
}

private data class PostHeadingTarget(val label: String, val itemIndex: Int)

private fun buildHeadingTargets(
    post: PostDetail,
    hasRefreshError: Boolean,
): List<PostHeadingTarget> {
    val headerItemCount =
        (if (post.heroImage != null) 1 else 0) + 1 + 1 + if (hasRefreshError) 1 else 0
    return post.blocks.mapIndexedNotNull { index, block ->
        block.asHeadingTargetOrNull(itemIndex = headerItemCount + index)
    }
}

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
