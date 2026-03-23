package re.phiphi.android.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R
import re.phiphi.android.ui.components.ContentSyncStatusText
import re.phiphi.android.ui.components.ErrorStateCard
import re.phiphi.android.ui.components.LoadingStateCard
import re.phiphi.android.ui.components.PostSummaryCard
import re.phiphi.android.ui.components.PostSummaryCardActions
import re.phiphi.android.ui.components.SectionHeading

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(uiState: HomeUiState, actions: HomeScreenActions, modifier: Modifier = Modifier) {
    when (uiState) {
        HomeUiState.Loading -> {
            LazyColumn(
                modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item { LoadingStateCard(messageRes = R.string.home_loading) }
            }
        }

        is HomeUiState.Error -> {
            LazyColumn(
                modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    ErrorStateCard(
                        message = stringResource(id = R.string.home_error, uiState.message),
                        labelRes = R.string.home_retry,
                        onRetry = actions.onRetry,
                    )
                }
            }
        }

        is HomeUiState.Success -> {
            PullToRefreshBox(
                isRefreshing = uiState.isRefreshing,
                onRefresh = actions.onRefresh,
                modifier = modifier.fillMaxSize(),
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    homeSuccessItems(uiState = uiState, actions = actions)
                }
            }
        }
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.homeSuccessItems(
    uiState: HomeUiState.Success,
    actions: HomeScreenActions,
) {
    if (uiState.recentItems.isNotEmpty()) {
        recentReadingItems(uiState = uiState, actions = actions)
    }

    if (uiState.bookmarkedItems.isNotEmpty()) {
        bookmarkedItems(uiState = uiState, actions = actions)
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
            actions = actions.postSummaryActions(post.slug),
        )
    }
}

@Immutable
data class HomeScreenActions(
    val onOpenPost: (String) -> Unit,
    val onOpenSavedArchive: () -> Unit,
    val onToggleBookmark: (String, Boolean) -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
)

private fun androidx.compose.foundation.lazy.LazyListScope.recentReadingItems(
    uiState: HomeUiState.Success,
    actions: HomeScreenActions,
) {
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
            actions = actions.postSummaryActions(post.slug),
        )
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.bookmarkedItems(
    uiState: HomeUiState.Success,
    actions: HomeScreenActions,
) {
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
            actions = actions.postSummaryActions(post.slug),
        )
    }
}

private fun HomeScreenActions.postSummaryActions(slug: String): PostSummaryCardActions =
    PostSummaryCardActions(
        onOpenPost = onOpenPost,
        onToggleBookmark = { bookmarked -> onToggleBookmark(slug, bookmarked) },
    )

@Composable
private fun RecentReadingHeading() {
    SectionHeading(
        titleRes = R.string.home_recent_title,
        subtitleRes = R.string.home_recent_subtitle,
    )
}

@Composable
private fun HomeFeedHeading(
    lastCheckedAtMillis: Long?,
    lastCheckSucceeded: Boolean?,
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        SectionHeading(
            titleRes = R.string.home_feed_title,
            subtitleRes = R.string.home_feed_subtitle,
            trailingContent = {
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
            },
        )
        ContentSyncStatusText(
            lastCheckedAtMillis = lastCheckedAtMillis,
            lastCheckSucceeded = lastCheckSucceeded,
        )
    }
}

@Composable
private fun BookmarkedHeading(onOpenSavedArchive: () -> Unit) {
    SectionHeading(
        titleRes = R.string.home_bookmarked_title,
        subtitleRes = R.string.home_bookmarked_subtitle,
        trailingContent = {
            TextButton(onClick = onOpenSavedArchive) {
                Text(text = stringResource(id = R.string.home_bookmarked_view_all))
            }
        },
    )
}
