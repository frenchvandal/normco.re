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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R
import re.phiphi.android.ui.components.PostSummaryCard

@Composable
fun ArchiveScreen(
    uiState: ArchiveUiState,
    onOpenPost: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item { ArchiveIntroSection() }

        when (uiState) {
            ArchiveUiState.Loading -> {
                item { ArchiveLoadingCard() }
            }

            is ArchiveUiState.Error -> {
                item { ArchiveErrorCard(message = uiState.message, onRetry = onRetry) }
            }

            is ArchiveUiState.Success -> {
                item { ArchiveFeedHeading(lang = uiState.lang, count = uiState.items.size) }

                if (uiState.items.isEmpty()) {
                    item {
                        Text(
                            text = stringResource(id = R.string.archive_empty),
                            style = MaterialTheme.typography.bodyLarge,
                        )
                    }
                } else {
                    items(
                        items = uiState.items,
                        key = { post -> post.id },
                        contentType = { "post_summary" },
                    ) { post ->
                        PostSummaryCard(post = post, onOpenPost = onOpenPost)
                    }
                }
            }
        }
    }
}

@Composable
private fun ArchiveIntroSection() {
    Column(
        modifier = Modifier.padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = stringResource(id = R.string.archive_title),
            style = MaterialTheme.typography.headlineMedium,
        )
        Text(
            text = stringResource(id = R.string.archive_body),
            style = MaterialTheme.typography.bodyLarge,
        )
        Text(
            text = stringResource(id = R.string.archive_source),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ArchiveFeedHeading(lang: String, count: Int) {
    Text(
        text = pluralStringResource(id = R.plurals.archive_feed_title, count, lang, count),
        style = MaterialTheme.typography.titleLarge,
    )
}

@Composable
private fun ArchiveLoadingCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
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
private fun ArchiveErrorCard(message: String, onRetry: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
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
