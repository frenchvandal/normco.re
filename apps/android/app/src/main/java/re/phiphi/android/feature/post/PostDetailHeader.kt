package re.phiphi.android.feature.post

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import re.phiphi.android.R
import re.phiphi.android.core.model.PostDetail
import re.phiphi.android.ui.components.languageDisplayName

@Composable
fun PostDetailHeader(
    post: PostDetail,
    publishedDate: String,
    isRefreshing: Boolean,
    isBookmarked: Boolean,
    onAction: (PostAction) -> Unit,
) {
    val updatedDate =
        post.updatedAt?.let { raw ->
            runCatching {
                    OffsetDateTime.parse(raw)
                        .format(
                            DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                                .withLocale(Locale.getDefault())
                        )
                }
                .getOrElse { raw }
        }

    Column(
        modifier = Modifier.padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(text = post.title, style = MaterialTheme.typography.headlineMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = publishedDate,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
            if (isRefreshing) {
                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
            }
        }
        updatedDate
            ?.takeIf { it != publishedDate }
            ?.let { value ->
                Text(
                    text = stringResource(id = R.string.post_updated_at, value),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        PostLanguageAlternates(post = post, onAction = onAction)
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
        PostActionsRow(isBookmarked = isBookmarked, onAction = onAction)
    }
}

@Composable
private fun PostLanguageAlternates(post: PostDetail, onAction: (PostAction) -> Unit) {
    if (post.alternates.isEmpty()) {
        return
    }

    Text(
        text = stringResource(id = R.string.post_languages_title),
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        FilterChip(
            selected = true,
            onClick = {},
            label = { Text(text = languageDisplayName(post.lang)) },
        )
        post.alternates.forEach { alternate ->
            FilterChip(
                selected = false,
                onClick = { onAction(PostAction.SelectLanguage(language = alternate.lang)) },
                label = { Text(text = languageDisplayName(alternate.lang)) },
            )
        }
    }
}
