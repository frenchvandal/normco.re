package re.phiphi.android.feature.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import re.phiphi.android.R

@Composable
fun SettingsScreen(
    uiState: SettingsUiState,
    onRetry: () -> Unit,
    onAction: (SettingsAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item { SettingsIntroSection() }

        when (uiState) {
            SettingsUiState.Loading -> item { SettingsLoadingCard() }
            is SettingsUiState.Error ->
                item { SettingsErrorCard(message = uiState.message, onRetry = onRetry) }

            is SettingsUiState.Success -> {
                item {
                    LanguageSection(
                        availableLanguages = uiState.availableLanguages,
                        selectedLanguage = uiState.selectedLanguage,
                        onSelectLanguage = { language ->
                            onAction(SettingsAction.SelectLanguage(language))
                        },
                    )
                }
                item {
                    OfflinePreferencesSection(
                        saveOpenedPostsForOffline = uiState.saveOpenedPostsForOffline,
                        onSetSaveOpenedPostsForOffline = { enabled ->
                            onAction(SettingsAction.SetSaveOpenedPostsForOffline(enabled))
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsIntroSection() {
    Column(
        modifier = Modifier.padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = stringResource(id = R.string.settings_title),
            style = MaterialTheme.typography.headlineMedium,
        )
        Text(
            text = stringResource(id = R.string.settings_intro),
            style = MaterialTheme.typography.bodyLarge,
        )
    }
}

@Composable
private fun SettingsLoadingCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            CircularProgressIndicator()
            Text(
                text = stringResource(id = R.string.settings_loading),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
    }
}

@Composable
private fun SettingsErrorCard(message: String, onRetry: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = stringResource(id = R.string.settings_error, message),
                style = MaterialTheme.typography.bodyLarge,
            )
            Button(onClick = onRetry) { Text(text = stringResource(id = R.string.settings_retry)) }
        }
    }
}

@Composable
private fun LanguageSection(
    availableLanguages: List<String>,
    selectedLanguage: String,
    onSelectLanguage: (String) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = stringResource(id = R.string.settings_language_title),
                style = MaterialTheme.typography.titleLarge,
            )
            Text(
                text = stringResource(id = R.string.settings_language_body),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            availableLanguages.forEach { language ->
                LanguageRow(
                    language = language,
                    selected = language == selectedLanguage,
                    onSelectLanguage = onSelectLanguage,
                )
            }
        }
    }
}

@Composable
private fun LanguageRow(language: String, selected: Boolean, onSelectLanguage: (String) -> Unit) {
    Row(
        modifier =
            Modifier.fillMaxWidth()
                .clickable { onSelectLanguage(language) }
                .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(selected = selected, onClick = { onSelectLanguage(language) })
        Text(
            text = languageDisplayName(language = language),
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun OfflinePreferencesSection(
    saveOpenedPostsForOffline: Boolean,
    onSetSaveOpenedPostsForOffline: (Boolean) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            Text(
                text = stringResource(id = R.string.settings_offline_title),
                style = MaterialTheme.typography.titleLarge,
            )
            TogglePreferenceRow(
                title = stringResource(id = R.string.settings_save_opened_posts_title),
                summary = stringResource(id = R.string.settings_save_opened_posts_body),
                checked = saveOpenedPostsForOffline,
                onCheckedChange = onSetSaveOpenedPostsForOffline,
            )
        }
    }
}

@Composable
private fun TogglePreferenceRow(
    title: String,
    summary: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier =
            Modifier.fillMaxWidth()
                .clickable { onCheckedChange(!checked) }
                .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = title, style = MaterialTheme.typography.bodyLarge)
            Text(
                text = summary,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun languageDisplayName(language: String): String =
    when (language) {
        "en" -> stringResource(id = R.string.language_en)
        "fr" -> stringResource(id = R.string.language_fr)
        "zh-hans" -> stringResource(id = R.string.language_zh_hans)
        "zh-hant" -> stringResource(id = R.string.language_zh_hant)
        else -> language
    }
