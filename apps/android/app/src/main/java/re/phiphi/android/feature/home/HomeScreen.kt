package re.phiphi.android.feature.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import re.phiphi.android.R
import re.phiphi.android.core.model.PostSummary

@Composable
fun HomeScreen(
    uiState: HomeUiState,
    onOpenArchive: () -> Unit,
    onOpenPost: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item { HomeIntroSection(onOpenArchive = onOpenArchive) }

        when (uiState) {
            HomeUiState.Loading -> {
                item { LoadingCard() }
            }

            is HomeUiState.Error -> {
                item { ErrorCard(message = uiState.message, onRetry = onRetry) }
            }

            is HomeUiState.Success -> {
                item { HomeFeedHeading(lang = uiState.lang) }

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
                        PostSummaryCard(post = post, onOpenPost = onOpenPost)
                    }
                }
            }
        }
    }
}

@Composable
private fun HomeIntroSection(onOpenArchive: () -> Unit) {
    Column(
        modifier = Modifier.padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = stringResource(id = R.string.home_title),
            style = MaterialTheme.typography.headlineMedium,
        )
        Text(
            text = stringResource(id = R.string.home_body),
            style = MaterialTheme.typography.bodyLarge,
        )
        Text(
            text = stringResource(id = R.string.home_source),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        OutlinedButton(onClick = onOpenArchive) {
            Text(text = stringResource(id = R.string.action_open_archive))
        }
    }
}

@Composable
private fun HomeFeedHeading(lang: String) {
    Text(
        text = stringResource(id = R.string.home_feed_title, lang),
        style = MaterialTheme.typography.titleLarge,
    )
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

@Composable
private fun PostSummaryCard(post: PostSummary, onOpenPost: (String) -> Unit) {
    val publishedDate =
        remember(post.publishedAt) { formatPublishedDate(dateTime = post.publishedAt) }

    Card(modifier = Modifier.fillMaxWidth().clickable { onOpenPost(post.slug) }) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            post.heroImage?.let { heroImage ->
                AsyncImage(
                    model = heroImage.url,
                    contentDescription = heroImage.alt.ifBlank { null },
                    contentScale = ContentScale.Crop,
                    modifier =
                        Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(16.dp)),
                )
            }
            Text(text = post.title, style = MaterialTheme.typography.titleLarge)
            Text(
                text = publishedDate,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            post.readingTimeMinutes?.let { readingTimeMinutes ->
                Text(
                    text = stringResource(id = R.string.home_reading_time, readingTimeMinutes),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(text = post.summary, style = MaterialTheme.typography.bodyLarge)
            if (post.tags.isNotEmpty()) {
                Text(
                    text = stringResource(id = R.string.home_tags, post.tags.joinToString()),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

private fun formatPublishedDate(dateTime: String): String =
    runCatching {
            OffsetDateTime.parse(dateTime)
                .format(
                    DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                        .withLocale(Locale.getDefault())
                )
        }
        .getOrElse { dateTime }
