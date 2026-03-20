package re.phiphi.android.feature.post

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import re.phiphi.android.R
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.core.model.PostDetailBlock

@Composable
fun PostScreen(uiState: PostUiState, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    when (uiState) {
        PostUiState.Loading -> LoadingState(modifier = modifier)
        is PostUiState.Error ->
            ErrorState(message = uiState.message, onRetry = onRetry, modifier = modifier)

        is PostUiState.Success -> PostDetailContent(post = uiState.post, modifier = modifier)
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
private fun PostDetailContent(post: PostDetail, modifier: Modifier = Modifier) {
    val publishedDate =
        remember(post.publishedAt) {
            runCatching {
                    OffsetDateTime.parse(post.publishedAt)
                        .format(
                            DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                                .withLocale(Locale.getDefault())
                        )
                }
                .getOrElse { post.publishedAt }
        }

    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column(
                modifier = Modifier.padding(top = 24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(text = post.title, style = MaterialTheme.typography.headlineMedium)
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

@Composable
private fun PostBlockContent(block: PostDetailBlock) {
    when (block.type) {
        "paragraph",
        "heading" -> TextBlockContent(type = block.type, text = block.text, level = block.level)
        "code" -> CodeBlockContent(content = block.content)
        "image" -> ImageBlockContent(src = block.src, alt = block.alt)
        "quote" -> QuoteBlockContent(text = block.text, attribution = block.attribution)
        "list" -> ListBlockContent(items = block.items, ordered = block.ordered == true)
        else -> Unit
    }
}

@Composable
private fun TextBlockContent(type: String, text: String?, level: Int?) {
    text?.takeIf(String::isNotBlank)?.let { value ->
        Text(
            text = value,
            style =
                if (type == "paragraph") {
                    MaterialTheme.typography.bodyLarge
                } else {
                    when (level) {
                        1 -> MaterialTheme.typography.headlineLarge
                        2 -> MaterialTheme.typography.headlineSmall
                        3 -> MaterialTheme.typography.titleLarge
                        else -> MaterialTheme.typography.titleMedium
                    }
                },
        )
    }
}

@Composable
private fun CodeBlockContent(content: String?) {
    content?.let { value ->
        Card(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace),
                modifier =
                    Modifier.fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceContainerHighest)
                        .padding(16.dp),
            )
        }
    }
}

@Composable
private fun ImageBlockContent(src: String?, alt: String?) {
    if (src.isNullOrBlank()) {
        return
    }

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AsyncImage(
            model = src,
            contentDescription = alt?.ifBlank { null },
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().height(220.dp).clip(RoundedCornerShape(20.dp)),
        )
        alt?.takeIf(String::isNotBlank)?.let { value ->
            Text(
                text = value,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun QuoteBlockContent(text: String?, attribution: String?) {
    text?.takeIf(String::isNotBlank)?.let { value ->
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(text = value, style = MaterialTheme.typography.bodyLarge)
                attribution?.takeIf(String::isNotBlank)?.let { source ->
                    Text(
                        text = source,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun ListBlockContent(items: List<String>, ordered: Boolean) {
    if (items.isEmpty()) {
        return
    }

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items.forEachIndexed { index, item ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = if (ordered) "${index + 1}." else "\u2022",
                    style = MaterialTheme.typography.bodyLarge,
                )
                Text(
                    text = item,
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}
