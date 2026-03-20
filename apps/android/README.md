# normco.re Android

This directory contains the Android app bootstrap for normco.re.

Current status:

- native Android track initialized
- Gradle Kotlin DSL project files in place
- Compose + Material 3 shell in place
- dependency catalog aligned with current Google guidance
- content contracts not wired yet
- Gradle wrapper not generated yet because this machine does not currently have
  a JDK installed

## Repository Role

- the repo root remains the editorial and web source of truth
- `apps/android` is the native client project
- app content should consume generated JSON contracts, not web HTML

## Tech Baseline

- Kotlin
- Jetpack Compose
- Material 3
- ViewModel
- Navigation Compose
- Room, DataStore, and WorkManager reserved in the version catalog for the next
  data-layer phase

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

- Gradle 9.3.x as a temporary local install, only until the project wrapper is
  generated and committed

Recommended environment values:

- `JAVA_HOME` -> JDK 17
- `ANDROID_SDK_ROOT=$HOME/Library/Android/sdk`

## Next Bootstrap Step

Once JDK 17 is installed:

1. enter `apps/android`
2. generate the wrapper with `gradle wrapper --gradle-version 9.3.1`
3. open the project in Android Studio
4. let Gradle sync
5. create an API 36 emulator and run the app

## Structure

```text
apps/android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
├── gradle.properties
└── settings.gradle.kts
```
