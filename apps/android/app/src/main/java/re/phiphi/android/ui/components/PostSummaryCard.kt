package re.phiphi.android.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
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
fun PostSummaryCard(
    post: PostSummary,
    isBookmarked: Boolean,
    showHeroImage: Boolean,
    actions: PostSummaryCardActions,
    modifier: Modifier = Modifier,
) {
    val publishedDate =
        remember(post.publishedAt) { formatPublishedDate(dateTime = post.publishedAt) }

    Card(modifier = modifier.fillMaxWidth().clickable { actions.onOpenPost(post.slug) }) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (showHeroImage) {
                post.heroImage?.let { heroImage ->
                    AsyncImage(
                        model = heroImage.url,
                        contentDescription = heroImage.alt.ifBlank { null },
                        contentScale = ContentScale.Crop,
                        modifier =
                            Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(16.dp)),
                    )
                }
            }
            PostSummaryTitleRow(
                title = post.title,
                isBookmarked = isBookmarked,
                onToggleBookmark = { actions.onToggleBookmark(!isBookmarked) },
            )
            PostSummaryDetails(
                publishedDate = publishedDate,
                isBookmarked = isBookmarked,
                readingTimeMinutes = post.readingTimeMinutes,
                summary = post.summary,
                tags = post.tags,
            )
        }
    }
}

@Immutable
data class PostSummaryCardActions(
    val onOpenPost: (String) -> Unit,
    val onToggleBookmark: (Boolean) -> Unit,
)

@Composable
private fun PostSummaryTitleRow(
    title: String,
    isBookmarked: Boolean,
    onToggleBookmark: () -> Unit,
) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.weight(1f),
        )
        IconButton(onClick = onToggleBookmark) {
            Icon(
                imageVector =
                    if (isBookmarked) {
                        Icons.Filled.Bookmark
                    } else {
                        Icons.Outlined.BookmarkBorder
                    },
                contentDescription =
                    stringResource(
                        id =
                            if (isBookmarked) {
                                R.string.post_remove_bookmark
                            } else {
                                R.string.post_save_bookmark
                            }
                    ),
            )
        }
    }
}

@Composable
private fun PostSummaryDetails(
    publishedDate: String,
    isBookmarked: Boolean,
    readingTimeMinutes: Int?,
    summary: String,
    tags: List<String>,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = publishedDate,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
        )
        if (isBookmarked) {
            Surface(
                color = MaterialTheme.colorScheme.secondaryContainer,
                shape = RoundedCornerShape(999.dp),
            ) {
                Text(
                    text = stringResource(id = R.string.post_bookmarked_label),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                )
            }
        }
    }
    readingTimeMinutes?.let { minutes ->
        Text(
            text = stringResource(id = R.string.home_reading_time, minutes),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
    Text(text = summary, style = MaterialTheme.typography.bodyLarge)
    if (tags.isNotEmpty()) {
        Text(
            text = stringResource(id = R.string.home_tags, tags.joinToString()),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
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
