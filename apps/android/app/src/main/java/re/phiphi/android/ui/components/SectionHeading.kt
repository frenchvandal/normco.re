package re.phiphi.android.ui.components

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp

@Composable
fun SectionHeading(
    @StringRes titleRes: Int,
    @StringRes subtitleRes: Int,
    modifier: Modifier = Modifier,
    trailingContent: (@Composable RowScope.() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(id = titleRes),
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.weight(1f),
            )

            if (trailingContent != null) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    content = trailingContent,
                )
            }
        }
        Text(
            text = stringResource(id = subtitleRes),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
