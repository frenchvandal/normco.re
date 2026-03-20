package re.phiphi.android.feature.archive

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import java.text.Normalizer
import java.util.Locale
import re.phiphi.android.R
import re.phiphi.android.ui.components.PostSummaryCard

@Composable
fun ArchiveScreen(
    uiState: ArchiveUiState,
    onOpenPost: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when (uiState) {
        ArchiveUiState.Loading -> ArchiveLoadingCard(modifier = modifier)
        is ArchiveUiState.Error ->
            ArchiveErrorCard(message = uiState.message, onRetry = onRetry, modifier = modifier)
        is ArchiveUiState.Success ->
            ArchiveSuccessScreen(uiState = uiState, onOpenPost = onOpenPost, modifier = modifier)
    }
}

@Composable
private fun ArchiveSuccessScreen(
    uiState: ArchiveUiState.Success,
    onOpenPost: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var bookmarkedOnly by rememberSaveable { mutableStateOf(false) }

    val visibleItems =
        remember(uiState.items, uiState.bookmarkedSlugs, query, bookmarkedOnly) {
            uiState.items.filter { post ->
                val matchesBookmark = !bookmarkedOnly || post.slug in uiState.bookmarkedSlugs
                val matchesQuery = query.isBlank() || post.matchesArchiveQuery(query = query)
                matchesBookmark && matchesQuery
            }
        }

    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item { ArchiveFeedHeading(count = visibleItems.size) }
        item {
            ArchiveFilters(
                query = query,
                onQueryChange = { value -> query = value },
                bookmarkedOnly = bookmarkedOnly,
                onToggleBookmarkedOnly = { bookmarkedOnly = !bookmarkedOnly },
            )
        }

        if (visibleItems.isEmpty()) {
            item {
                Text(
                    text =
                        stringResource(
                            id =
                                if (query.isBlank() && !bookmarkedOnly) {
                                    R.string.archive_empty
                                } else {
                                    R.string.archive_empty_filtered
                                }
                        ),
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
        } else {
            items(
                items = visibleItems,
                key = { post -> post.id },
                contentType = { "post_summary" },
            ) { post ->
                PostSummaryCard(
                    post = post,
                    isBookmarked = post.slug in uiState.bookmarkedSlugs,
                    showHeroImage = false,
                    onOpenPost = onOpenPost,
                )
            }
        }
    }
}

@Composable
private fun ArchiveFeedHeading(count: Int) {
    Card(modifier = Modifier.fillMaxWidth().padding(top = 24.dp)) {
        Text(
            text = pluralStringResource(id = R.plurals.archive_feed_title, count, count),
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(20.dp),
        )
    }
}

@Composable
private fun ArchiveFilters(
    query: String,
    onQueryChange: (String) -> Unit,
    bookmarkedOnly: Boolean,
    onToggleBookmarkedOnly: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text(text = stringResource(id = R.string.archive_search_label)) },
                placeholder = {
                    Text(text = stringResource(id = R.string.archive_search_placeholder))
                },
            )
            FilterChip(
                selected = bookmarkedOnly,
                onClick = onToggleBookmarkedOnly,
                label = { Text(text = stringResource(id = R.string.archive_filter_bookmarked)) },
            )
        }
    }
}

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

private fun re.phiphi.android.core.model.PostSummary.matchesArchiveQuery(query: String): Boolean {
    val normalizedQuery = query.normalizeArchiveSearch()
    if (normalizedQuery.isBlank()) {
        return true
    }

    val haystack =
        listOf(title, summary, tags.joinToString(separator = " "))
            .joinToString(separator = " ")
            .normalizeArchiveSearch()

    return normalizedQuery in haystack
}

private fun String.normalizeArchiveSearch(): String =
    Normalizer.normalize(this, Normalizer.Form.NFD)
        .replace("\\p{Mn}+".toRegex(), "")
        .lowercase(Locale.getDefault())
