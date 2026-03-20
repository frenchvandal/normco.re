package re.phiphi.android.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import re.phiphi.android.R

@Composable
fun languageDisplayName(language: String): String =
    when (language) {
        "en" -> stringResource(id = R.string.language_en)
        "fr" -> stringResource(id = R.string.language_fr)
        "zh-hans" -> stringResource(id = R.string.language_zh_hans)
        "zh-hant" -> stringResource(id = R.string.language_zh_hant)
        else -> language
    }
