package re.phiphi.android

import android.app.Application
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import re.phiphi.android.data.settings.AppLocaleManager
import re.phiphi.android.data.settings.ReaderPreferencesRepository

@HiltAndroidApp
class PhiphiApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        val entryPoint =
            EntryPointAccessors.fromApplication(this, LocaleBootstrapEntryPoint::class.java)

        runBlocking {
            entryPoint
                .appLocaleManager()
                .applyLanguage(
                    entryPoint.readerPreferencesRepository().preferences.first().preferredLanguage
                )
        }
    }
}

@EntryPoint
@InstallIn(SingletonComponent::class)
interface LocaleBootstrapEntryPoint {
    fun readerPreferencesRepository(): ReaderPreferencesRepository

    fun appLocaleManager(): AppLocaleManager
}
