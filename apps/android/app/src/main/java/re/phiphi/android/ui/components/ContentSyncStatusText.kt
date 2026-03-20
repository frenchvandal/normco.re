package re.phiphi.android.ui.components

import android.text.format.DateUtils
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import re.phiphi.android.R

@Composable
fun ContentSyncStatusText(
    lastCheckedAtMillis: Long?,
    lastCheckSucceeded: Boolean?,
    modifier: Modifier = Modifier,
) {
    val text =
        when {
            lastCheckedAtMillis == null -> stringResource(id = R.string.feed_status_bundled)
            lastCheckSucceeded == false ->
                stringResource(
                    id = R.string.feed_status_check_failed,
                    DateUtils.getRelativeTimeSpanString(lastCheckedAtMillis),
                )
            else ->
                stringResource(
                    id = R.string.feed_status_checked,
                    DateUtils.getRelativeTimeSpanString(lastCheckedAtMillis),
                )
        }

    Text(
        text = text,
        modifier = modifier,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}
