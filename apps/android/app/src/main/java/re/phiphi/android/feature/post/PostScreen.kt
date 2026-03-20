package re.phiphi.android.feature.post

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import re.phiphi.android.R

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
    val publishedDate = remember(post.publishedAt) { formatPostDate(post.publishedAt) }

    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
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
