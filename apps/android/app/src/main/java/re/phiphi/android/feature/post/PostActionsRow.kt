package re.phiphi.android.feature.post

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R

@Composable
fun PostActionsRow(onOpenInBrowser: () -> Unit, onSharePost: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedButton(onClick = onOpenInBrowser, modifier = Modifier.weight(1f)) {
            Text(text = stringResource(id = R.string.post_open_in_browser))
        }
        OutlinedButton(onClick = onSharePost, modifier = Modifier.weight(1f)) {
            Text(text = stringResource(id = R.string.post_share))
        }
    }
}
