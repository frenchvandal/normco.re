package re.phiphi.android.feature.archive

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R
import re.phiphi.android.core.model.PostSummary
import re.phiphi.android.ui.components.ContentSyncStatusText
import re.phiphi.android.ui.components.PostSummaryCard
import re.phiphi.android.ui.components.PostSummaryCardActions

@Composable
fun ArchiveScreen(
    uiState: ArchiveUiState,
    initialBookmarkedOnly: Boolean,
    actions: ArchiveScreenActions,
    modifier: Modifier = Modifier,
) {
    when (uiState) {
        ArchiveUiState.Loading -> ArchiveLoadingCard(modifier = modifier)
        is ArchiveUiState.Error ->
            ArchiveErrorCard(
                message = uiState.message,
                onRetry = actions.onRetry,
                modifier = modifier,
            )
        is ArchiveUiState.Success ->
            ArchiveSuccessScreen(
                uiState = uiState,
                initialBookmarkedOnly = initialBookmarkedOnly,
                actions = actions,
                modifier = modifier,
            )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ArchiveSuccessScreen(
    uiState: ArchiveUiState.Success,
    initialBookmarkedOnly: Boolean,
    actions: ArchiveScreenActions,
    modifier: Modifier = Modifier,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var bookmarkedOnly by
        rememberSaveable(initialBookmarkedOnly) { mutableStateOf(initialBookmarkedOnly) }
    var selectedTag by rememberSaveable { mutableStateOf<String?>(null) }
    val filters =
        ArchiveFiltersModel(
            query = query,
            bookmarkedOnly = bookmarkedOnly,
            availableTags = rememberArchiveTags(items = uiState.items),
            selectedTag = selectedTag,
        )
    val visibleItems =
        rememberArchiveVisibleItems(
            items = uiState.items,
            bookmarkedSlugs = uiState.bookmarkedSlugs,
            filters = filters,
        )

    PullToRefreshBox(
        isRefreshing = uiState.isRefreshing,
        onRefresh = actions.onRefresh,
        modifier = modifier.fillMaxSize(),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ArchiveFeedHeading(
                    count = visibleItems.size,
                    lastCheckedAtMillis = uiState.lastCheckedAtMillis,
                    lastCheckSucceeded = uiState.lastCheckSucceeded,
                    isRefreshing = uiState.isRefreshing,
                    onRefresh = actions.onRefresh,
                )
            }
            item {
                ArchiveFilters(
                    filters = filters,
                    onQueryChange = { value -> query = value },
                    onToggleBookmarkedOnly = { bookmarkedOnly = !bookmarkedOnly },
                    onSelectTag = { tag -> selectedTag = tag },
                )
            }
            archiveContentItems(
                visibleItems = visibleItems,
                bookmarkedSlugs = uiState.bookmarkedSlugs,
                showDefaultEmptyState = query.isBlank() && !bookmarkedOnly,
                actions = actions,
            )
        }
    }
}

@Immutable
data class ArchiveScreenActions(
    val onOpenPost: (String) -> Unit,
    val onToggleBookmark: (String, Boolean) -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
)

@Composable
private fun rememberArchiveTags(items: List<PostSummary>): List<String> =
    remember(items) { items.flatMap { post -> post.tags }.distinct().sorted() }

@Composable
private fun rememberArchiveVisibleItems(
    items: List<PostSummary>,
    bookmarkedSlugs: Set<String>,
    filters: ArchiveFiltersModel,
): List<PostSummary> =
    remember(items, bookmarkedSlugs, filters) {
        items.filter { post ->
            val matchesBookmark = !filters.bookmarkedOnly || post.slug in bookmarkedSlugs
            val matchesQuery =
                filters.query.isBlank() || post.matchesArchiveQuery(query = filters.query)
            val matchesTag = filters.selectedTag == null || filters.selectedTag in post.tags
            matchesBookmark && matchesQuery && matchesTag
        }
    }

private fun androidx.compose.foundation.lazy.LazyListScope.archiveContentItems(
    visibleItems: List<PostSummary>,
    bookmarkedSlugs: Set<String>,
    showDefaultEmptyState: Boolean,
    actions: ArchiveScreenActions,
) {
    if (visibleItems.isEmpty()) {
        item {
            Text(
                text =
                    stringResource(
                        id =
                            if (showDefaultEmptyState) {
                                R.string.archive_empty
                            } else {
                                R.string.archive_empty_filtered
                            }
                    ),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
        return
    }

    items(items = visibleItems, key = { post -> post.id }, contentType = { "post_summary" }) { post
        ->
        PostSummaryCard(
            post = post,
            isBookmarked = post.slug in bookmarkedSlugs,
            showHeroImage = false,
            actions =
                PostSummaryCardActions(
                    onOpenPost = actions.onOpenPost,
                    onToggleBookmark = { bookmarked ->
                        actions.onToggleBookmark(post.slug, bookmarked)
                    },
                ),
        )
    }
}

@Composable
private fun ArchiveFeedHeading(
    count: Int,
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
                text = pluralStringResource(id = R.plurals.archive_feed_title, count, count),
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
            text = stringResource(id = R.string.archive_feed_subtitle),
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
private fun ArchiveFilters(
    filters: ArchiveFiltersModel,
    onQueryChange: (String) -> Unit,
    onToggleBookmarkedOnly: () -> Unit,
    onSelectTag: (String?) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
            value = filters.query,
            onValueChange = onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text(text = stringResource(id = R.string.archive_search_label)) },
            placeholder = { Text(text = stringResource(id = R.string.archive_search_placeholder)) },
        )
        FilterChip(
            selected = filters.bookmarkedOnly,
            onClick = onToggleBookmarkedOnly,
            label = { Text(text = stringResource(id = R.string.archive_filter_bookmarked)) },
        )
        if (filters.availableTags.isNotEmpty()) {
            Text(
                text = stringResource(id = R.string.archive_filter_topics),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = filters.selectedTag == null,
                    onClick = { onSelectTag(null) },
                    label = { Text(text = stringResource(id = R.string.archive_filter_all_topics)) },
                )
                filters.availableTags.forEach { tag ->
                    FilterChip(
                        selected = filters.selectedTag == tag,
                        onClick = { onSelectTag(if (filters.selectedTag == tag) null else tag) },
                        label = { Text(text = tag) },
                    )
                }
            }
        }
    }
}

private data class ArchiveFiltersModel(
    val query: String,
    val bookmarkedOnly: Boolean,
    val availableTags: List<String>,
    val selectedTag: String?,
)

@Composable
private fun ArchiveLoadingCard(modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            CircularProgressIndicator()
            Text(
                text = stringResource(id = R.string.archive_loading),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
    }
}

@Composable
private fun ArchiveErrorCard(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = stringResource(id = R.string.archive_error, message),
                style = MaterialTheme.typography.bodyLarge,
            )
            Button(onClick = onRetry) { Text(text = stringResource(id = R.string.archive_retry)) }
        }
    }
}
