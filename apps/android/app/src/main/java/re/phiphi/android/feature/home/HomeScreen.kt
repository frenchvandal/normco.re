package re.phiphi.android.feature.home

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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R
import re.phiphi.android.ui.components.PostSummaryCard

@Composable
fun HomeScreen(
    uiState: HomeUiState,
    onOpenPost: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        when (uiState) {
            HomeUiState.Loading -> {
                item { LoadingCard() }
            }

            is HomeUiState.Error -> {
                item { ErrorCard(message = uiState.message, onRetry = onRetry) }
            }

            is HomeUiState.Success -> {
                item { HomeFeedHeading() }

                if (uiState.items.isEmpty()) {
                    item {
                        Text(
                            text = stringResource(id = R.string.home_empty),
                            style = MaterialTheme.typography.bodyLarge,
                        )
                    }
                } else {
                    items(
                        items = uiState.items,
                        key = { post -> post.id },
                        contentType = { "post_summary" },
                    ) { post ->
                        PostSummaryCard(
                            post = post,
                            isBookmarked = post.slug in uiState.bookmarkedSlugs,
                            showHeroImage = true,
                            onOpenPost = onOpenPost,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HomeFeedHeading() {
    Card(modifier = Modifier.fillMaxWidth().padding(top = 24.dp)) {
        Text(
            text = stringResource(id = R.string.home_feed_title),
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(20.dp),
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
