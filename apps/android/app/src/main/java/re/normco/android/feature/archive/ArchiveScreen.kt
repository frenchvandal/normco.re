package re.normco.android.feature.archive

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.normco.android.R

@Composable
fun ArchiveScreen(
  onOpenPost: () -> Unit,
  modifier: Modifier = Modifier,
) {
  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    Text(
      text = stringResource(id = R.string.archive_title),
      style = MaterialTheme.typography.headlineMedium,
    )
    Text(
      text = stringResource(id = R.string.archive_body),
      style = MaterialTheme.typography.bodyLarge,
    )
    Button(onClick = onOpenPost) {
      Text(text = stringResource(id = R.string.action_open_sample_post))
    }
  }
}
