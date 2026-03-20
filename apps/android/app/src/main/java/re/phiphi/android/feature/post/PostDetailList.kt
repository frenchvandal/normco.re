package re.phiphi.android.feature.post

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R

@Composable
internal fun PostDetailList(
    model: PostDetailListModel,
    listState: LazyListState,
    onAction: (PostAction) -> Unit,
    onSelectHeading: (PostHeadingTarget) -> Unit,
) {
    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        postDetailItems(model = model, onAction = onAction, onSelectHeading = onSelectHeading)
    }
}

private fun LazyListScope.postDetailItems(
    model: PostDetailListModel,
    onAction: (PostAction) -> Unit,
    onSelectHeading: (PostHeadingTarget) -> Unit,
) {
    val post = model.uiState.post

    post.heroImage?.let { heroImage ->
        item {
            ImageBlockContent(
                src = heroImage.url,
                alt = heroImage.alt,
                width = heroImage.width,
                height = heroImage.height,
            )
        }
    }
    item {
        PostDetailHeader(
            post = post,
            publishedDate = model.publishedDate,
            isRefreshing = model.uiState.isRefreshing,
            isBookmarked = model.isBookmarked,
            onAction = onAction,
        )
    }
    if (model.headingTargets.isNotEmpty()) {
        item {
            PostTableOfContents(
                headingTargets = model.headingTargets,
                onSelectHeading = onSelectHeading,
            )
        }
    }
    model.uiState.refreshErrorMessage?.let {
        item {
            Text(
                text = stringResource(id = R.string.post_refresh_failed),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
            )
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

@Composable
private fun PostTableOfContents(
    headingTargets: List<PostHeadingTarget>,
    onSelectHeading: (PostHeadingTarget) -> Unit,
) {
    Card {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = stringResource(id = R.string.post_contents_title),
                style = MaterialTheme.typography.titleMedium,
            )
            headingTargets.forEach { headingTarget ->
                TextButton(onClick = { onSelectHeading(headingTarget) }) {
                    Text(text = headingTarget.label)
                }
            }
        }
    }
}
