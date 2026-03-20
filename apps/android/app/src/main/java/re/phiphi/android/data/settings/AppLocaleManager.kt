package re.phiphi.android.data.settings

import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppLocaleManager @Inject constructor() {
    fun applyLanguage(language: String?) {
        val languageTag = language.toAndroidLanguageTag()
        AppCompatDelegate.setApplicationLocales(
            LocaleListCompat.forLanguageTags(languageTag.orEmpty())
        )
    }
}

private fun String?.toAndroidLanguageTag(): String? =
    when (this) {
        null -> null
        "zh-hans" -> "zh-Hans"
        "zh-hant" -> "zh-Hant"
        else -> this
    }
