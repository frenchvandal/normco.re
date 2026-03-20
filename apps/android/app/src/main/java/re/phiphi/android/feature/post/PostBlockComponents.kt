package re.phiphi.android.feature.post

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import re.phiphi.android.R
import re.phiphi.android.core.model.PostDetailBlock

@Composable
internal fun PostBlockContent(block: PostDetailBlock) {
    when (block.type) {
        "paragraph",
        "heading" -> TextBlockContent(type = block.type, text = block.text, level = block.level)
        "code" -> CodeBlockContent(content = block.content, language = block.language)
        "image" ->
            ImageBlockContent(
                src = block.src,
                alt = block.alt,
                width = block.width,
                height = block.height,
            )
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
private fun CodeBlockContent(content: String?, language: String?) {
    content?.let { value ->
        val context = LocalContext.current

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier =
                    Modifier.fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceContainerHighest)
                        .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    language?.takeIf(String::isNotBlank)?.let { codeLanguage ->
                        Text(
                            text = codeLanguage.uppercase(),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    TextButton(onClick = { copyCodeToClipboard(context = context, text = value) }) {
                        Text(text = stringResource(id = R.string.post_copy_code))
                    }
                }
                SelectionContainer {
                    Text(
                        text = value,
                        style =
                            MaterialTheme.typography.bodyMedium.copy(
                                fontFamily = FontFamily.Monospace
                            ),
                        softWrap = false,
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                    )
                }
            }
        }
    }
}

@Composable
internal fun ImageBlockContent(
    src: String?,
    alt: String?,
    width: Int? = null,
    height: Int? = null,
) {
    if (src.isNullOrBlank()) {
        return
    }

    val imageHeight = calculateImageHeight(width = width, height = height)

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AsyncImage(
            model = src,
            contentDescription = alt?.ifBlank { null },
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().height(imageHeight).clip(RoundedCornerShape(20.dp)),
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

private fun copyCodeToClipboard(context: Context, text: String) {
    val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboardManager.setPrimaryClip(ClipData.newPlainText("post_code_block", text))
}

private fun calculateImageHeight(width: Int?, height: Int?): Dp {
    return when {
        width == null || height == null -> 220.dp
        width <= 0 || height <= 0 -> 220.dp
        else -> 320.dp * height.toFloat() / width.toFloat()
    }
}
