package re.phiphi.android.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R
import re.phiphi.android.ui.components.ContentSyncStatusText
import re.phiphi.android.ui.components.PostSummaryCard

@Composable
fun HomeScreen(uiState: HomeUiState, actions: HomeScreenActions, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        when (uiState) {
            HomeUiState.Loading -> {
                item { LoadingCard() }
            }

            is HomeUiState.Error -> {
                item { ErrorCard(message = uiState.message, onRetry = actions.onRetry) }
            }

            is HomeUiState.Success -> {
                homeSuccessItems(uiState = uiState, actions = actions)
            }
        }
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.homeSuccessItems(
    uiState: HomeUiState.Success,
    actions: HomeScreenActions,
) {
    if (uiState.recentItems.isNotEmpty()) {
        item { RecentReadingHeading() }
        items(
            items = uiState.recentItems,
            key = { post -> "recent:${post.id}" },
            contentType = { "recent_post_summary" },
        ) { post ->
            PostSummaryCard(
                post = post,
                isBookmarked = post.slug in uiState.bookmarkedSlugs,
                showHeroImage = false,
                onOpenPost = actions.onOpenPost,
            )
        }
    }

    if (uiState.bookmarkedItems.isNotEmpty()) {
        item { BookmarkedHeading(onOpenSavedArchive = actions.onOpenSavedArchive) }
        items(
            items = uiState.bookmarkedItems,
            key = { post -> "bookmark:${post.id}" },
            contentType = { "bookmarked_post_summary" },
        ) { post ->
            PostSummaryCard(
                post = post,
                isBookmarked = true,
                showHeroImage = false,
                onOpenPost = actions.onOpenPost,
            )
        }
    }

    item {
        HomeFeedHeading(
            lastCheckedAtMillis = uiState.lastCheckedAtMillis,
            lastCheckSucceeded = uiState.lastCheckSucceeded,
            isRefreshing = uiState.isRefreshing,
            onRefresh = actions.onRefresh,
        )
    }

    if (uiState.items.isEmpty()) {
        item {
            Text(
                text = stringResource(id = R.string.home_empty),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
        return
    }

    items(items = uiState.items, key = { post -> post.id }, contentType = { "post_summary" }) { post
        ->
        PostSummaryCard(
            post = post,
            isBookmarked = post.slug in uiState.bookmarkedSlugs,
            showHeroImage = true,
            onOpenPost = actions.onOpenPost,
        )
    }
}

@Immutable
data class HomeScreenActions(
    val onOpenPost: (String) -> Unit,
    val onOpenSavedArchive: () -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
)

@Composable
private fun RecentReadingHeading() {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            text = stringResource(id = R.string.home_recent_title),
            style = MaterialTheme.typography.headlineSmall,
        )
        Text(
            text = stringResource(id = R.string.home_recent_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun HomeFeedHeading(
    lastCheckedAtMillis: Long?,
    lastCheckSucceeded: Boolean?,
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(id = R.string.home_feed_title),
                style = MaterialTheme.typography.headlineSmall,
            )
            if (isRefreshing) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                IconButton(onClick = onRefresh) {
                    Icon(
                        imageVector = Icons.Outlined.Refresh,
                        contentDescription = stringResource(id = R.string.feed_refresh),
                    )
                }
            }
        }
        Text(
            text = stringResource(id = R.string.home_feed_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        ContentSyncStatusText(
            lastCheckedAtMillis = lastCheckedAtMillis,
            lastCheckSucceeded = lastCheckSucceeded,
        )
    }
}

@Composable
private fun BookmarkedHeading(onOpenSavedArchive: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(id = R.string.home_bookmarked_title),
                style = MaterialTheme.typography.headlineSmall,
            )
            TextButton(onClick = onOpenSavedArchive) {
                Text(text = stringResource(id = R.string.home_bookmarked_view_all))
            }
        }
        Text(
            text = stringResource(id = R.string.home_bookmarked_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun LoadingCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            CircularProgressIndicator()
            Text(
                text = stringResource(id = R.string.home_loading),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
    }
}

@Composable
private fun ErrorCard(message: String, onRetry: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = stringResource(id = R.string.home_error, message),
                style = MaterialTheme.typography.bodyLarge,
            )
            Button(onClick = onRetry) { Text(text = stringResource(id = R.string.home_retry)) }
        }
    }
}
