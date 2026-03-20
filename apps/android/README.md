# phiphi Android

This directory contains the Android app bootstrap for phiphi.

Current status:

- native Android track initialized
- Gradle Kotlin DSL project files in place
- Compose + Material 3 shell in place
- dependency catalog aligned with current Google guidance
- provisional app name set to `phiphi`
- Gradle wrapper committed
- first Home slice wired to bundled `app-manifest` and `posts-index` contracts
- archive slice wired to bundled generated `posts-index` contracts
- post detail slice wired to bundled generated `post-detail` contracts
- Android bootstrap assets can now be refreshed from the generated site
  contracts
- Room now persists the bootstrap manifest and posts locally
- the repository seeds from assets, then reads Home, Archive, and Post from Room
- Hilt installed for app wiring and `ViewModel` injection
- `kotlinx.serialization` installed for contract parsing
- Coil installed for Compose image loading
- Spotless + ktfmt, Detekt, and Android lint wired as the local quality gate
- shared `PostSummaryCard` UI is now reused between Home and Archive

## Repository Role

- the repo root remains the editorial and web source of truth
- `apps/android` is the native client project
- app content should consume generated JSON contracts, not web HTML
- generated bootstrap assets currently live under:
  - `app/src/main/assets/bootstrap/app-manifest.json`
  - `app/src/main/assets/bootstrap/posts-index-<lang>.json`
  - `app/src/main/assets/bootstrap/post-details/<lang>/<slug>.json`

## Tech Baseline

- Kotlin
- Jetpack Compose
- Material 3
- Hilt
- ViewModel + StateFlow
- Navigation Compose
- kotlinx.serialization
- Coil
- Room
- Paging 3, DataStore, and WorkManager reserved in the version catalog for the
  next data-layer phase

## What To Install On The MacBook

Install these before trying to sync or build the Android app locally:

1. Android Studio stable
2. JDK 17
3. Android SDK Platform 36
4. Android SDK Build-Tools 36.0.0
5. Android SDK Platform-Tools
6. Android SDK Command-line Tools
7. Android Emulator
8. One API 36 phone system image

Optional but useful during bootstrap:

- Gradle 9.4.x as a temporary local install, only if the wrapper ever needs to
  be regenerated from scratch

Recommended environment values:

- `JAVA_HOME` -> JDK 17
- `ANDROID_SDK_ROOT=$HOME/Library/Android/sdk`

## Run The App

Once JDK 17 is installed:

1. enter `apps/android`
2. open the project in Android Studio
3. let Gradle sync
4. create an API 36 emulator and run the app

## Quality Commands

Use the Gradle wrapper from `apps/android`:

```sh
./gradlew spotlessApply
./gradlew spotlessCheck
./gradlew detekt
./gradlew lintDebug
./gradlew quality
./gradlew assembleDebug
```

Refresh the bundled fallback assets from the generated site contracts:

```sh
deno task android:sync-contract-assets
```

This mirrors:

- `app-manifest`
- localized `posts-index`
- localized `post-detail`

## Structure

```text
apps/android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
├── config/
│   └── detekt/
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
├── gradle.properties
└── settings.gradle.kts
```
