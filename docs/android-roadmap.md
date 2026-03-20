# Android App Roadmap

This document is the execution roadmap for the Android app track.

Updated: 2026-03-20

This roadmap supersedes the earlier iOS-first implementation order for active
delivery. The shared contract-first direction from the mobile docs remains in
force.

## Current Status

- Phase 0 bootstrap is complete.
- `apps/android` imports cleanly in Android Studio.
- The Gradle wrapper is committed and the debug build passes with Java 17.
- The provisional app name is `phiphi`.
- The local quality gate is installed:
  - Spotless + ktfmt
  - Detekt
  - Android lint
- The first contract-backed slice is now the Home feed:
  - `app-manifest` fixture in app assets
  - `posts-index` fixture in app assets
  - repository-driven loading
  - Hilt-backed app wiring
  - `ViewModel` + `StateFlow`
  - `kotlinx.serialization` contract parsing
  - Compose rendering of real post summaries and hero images through Coil
- The site build now generates:
  - `/api/app-manifest.json`
  - localized `/api/posts/index.json`
- Android fallback bootstrap assets can be refreshed from generated site output
  through `deno task android:sync-contract-assets`
- The next contract milestone is replacing bundled fixtures with JSON generated
  by the Deno site build.

## Executive Summary

- Start the native app program with Android, not with a web wrapper.
- Keep the current repository root as the editorial and web source of truth.
- Add `apps/android` as a standalone Gradle project inside the existing repo.
- Follow Google's recommended Android stack and native guidance:
  - Kotlin
  - Jetpack Compose
  - Material 3
  - Hilt
  - ViewModel
  - coroutines and Flow
  - repository-driven data layer
  - `kotlinx.serialization` for JSON contracts
  - Coil for remote images
  - offline-first local source of truth
  - Room, Paging 3, DataStore, and WorkManager when the data layer lands
- Keep mobile clients bound to the JSON contracts in `contracts/`, not to HTML
  pages, feeds, or Lume internals.

## Locked Decisions

### Product

- Android is the first implementation target.
- The first release must be a native reading client, not a browser shell.
- v1 scope:
  - home feed from localized `posts-index`
  - archive from localized `posts-index`
  - post detail from `post-detail`
  - settings
  - language preference
  - offline cache for indexes and opened posts
  - explicit "Save for Offline"
  - per-device bookmarks
  - per-device reading progress
  - share sheet
  - "Open in Browser"
- v1 excludes:
  - comments
  - account sync
  - push notifications
  - widgets
  - server-side search

### Repository

- Do not move the current web app into `apps/web` yet.
- Keep app JSON generation in the current Deno build pipeline.
- Add only one native client folder for now:

```text
repo/
├── apps/
│   └── android/
├── contracts/
├── docs/
├── plugins/
├── scripts/
└── src/
```

- Revisit a broader monorepo split only if:
  - iOS starts in parallel
  - build logic becomes duplicated across multiple app projects
  - CI/workspace policy becomes awkward at the repo root

### Android Stack

- `applicationId` for bootstrap: `re.phiphi.android`
- `namespace`: `re.phiphi.android`
- `compileSdk`: `36`
- `targetSdk`: `36`
- `minSdk`: `28`
- `AGP`: `9.1.0`
- `Gradle wrapper target`: `9.4.1`
- `Kotlin`: `2.3.20`
- `KSP`: `2.3.4`
- `Compose BOM`: `2026.03.00`
- `Material 3`: latest stable through the Compose BOM
- `Activity Compose`: `1.13.0`
- `Core KTX`: `1.18.0`
- `Hilt`: `2.59.2`
- `AndroidX Hilt Compose`: `1.3.0`
- `Lifecycle`: `2.10.0`
- `Navigation Compose`: `2.9.7`
- `kotlinx.serialization-json`: `1.10.0`
- `Coil 3`: `3.4.0`
- `Room`: `2.8.4`
- `Paging 3`: reserved for the first persistent feed slice
- `DataStore`: `1.2.1`
- `WorkManager`: `2.11.1`
- `Spotless`: `8.4.0`
- `Detekt`: `1.23.8`

Rationale:

- use Google's current stable Android toolchain
- use Material 3 as the native design system
- keep the UI layer in Compose
- keep the data layer repository-driven and offline-first
- keep deep links aligned with canonical site URLs from day one

## Architecture Direction

Google's architecture guidance is the baseline for this app:

- clearly separated UI and data layers
- repositories as the app-facing data boundary
- unidirectional data flow
- ViewModels exposing `StateFlow` UI state
- Hilt managing app wiring and `ViewModel` construction
- JSON contract parsing through `kotlinx.serialization`
- Coil loading post hero images in Compose
- local storage as the source of truth for offline-first features
- network writes and sync orchestrated through repositories and WorkManager

Near-term project shape inside `:app`:

```text
app/src/main/java/re/phiphi/android/
├── MainActivity.kt
├── feature/
│   ├── archive/
│   ├── home/
│   ├── post/
│   └── settings/
└── ui/
    ├── navigation/
    └── theme/
```

Near-term package policy:

- keep one Gradle module for bootstrap speed
- organize code by responsibility and feature from the start
- split into multiple Gradle modules only after real pressure appears

Expected later split, only when justified:

- `:app`
- `:core:model`
- `:core:database`
- `:core:datastore`
- `:core:network`
- `:core:ui`
- `:feature:home`
- `:feature:archive`
- `:feature:post`
- `:feature:settings`
- `:sync`

### Shared Contract Tooling

- When the shared contract utility is introduced, build it in Go.
- Use the latest stable Go release available at the moment the utility work
  starts.
- Do not pin the tooling plan to an old Go major version in advance.

## Delivery Phases

### Phase 0: Bootstrap

Goal:

- make the repository Android-ready without destabilizing the Deno site

Status:

- complete

Deliverables:

- `apps/android`
- Gradle Kotlin DSL project files
- version catalog with the chosen stack
- Compose + Material 3 bootstrap
- minimal navigation shell
- repo ignores and docs updates

Exit criteria:

- Android Studio can import `apps/android`
- the dependency surface is explicit
- the repo layout is documented

### Phase 1: Contract Pipeline

Goal:

- make the app consume real content contracts instead of placeholders

Status:

- in progress
- current bridge step: bundled contract assets in app assets are mirrored from
  the generated site contracts and power the Home feed through Hilt-injected
  repository code while post detail is still being wired

Deliverables:

- one generator path for:
  - `/api/app-manifest.json`
  - localized `/api/posts/index.json`
  - localized `/api/posts/<slug>.json`
- updated `deno task validate-contracts`
- fixtures for each language
- generated payload smoke tests

Exit criteria:

- app JSON is generated from the site build
- schemas and examples agree
- Android can target stable URLs

### Phase 2: Data Layer And Offline-First Core

Goal:

- establish the reading app backbone

Deliverables:

- repository interfaces for manifest, index, and detail payloads
- local persistence with Room
- list paging with Paging 3 where the feed size justifies it
- preferences with DataStore
- sync scheduling with WorkManager
- cache policy for manifest, indexes, and detail payloads
- explicit content mapping between network, local, and UI models

Exit criteria:

- the app can read cached content without network
- repositories read from local storage first
- network refresh updates local storage and then the UI

### Phase 3: Feature Vertical Slices

Goal:

- ship the first useful user flows

Deliverables:

- home screen
- archive screen
- post detail screen
- settings screen
- bookmarks
- reading progress
- explicit "Save for Offline"
- language switching

Exit criteria:

- the app is usable as a real reader
- the app supports the core post journey end-to-end

### Phase 4: Hardening

Goal:

- make the app robust enough for testers

Deliverables:

- Android App Links
- accessibility pass
- screenshot coverage for critical Compose surfaces
- navigation tests
- repository and ViewModel tests
- baseline profile and startup/scroll performance verification
- error handling and retry policy
- startup, scroll, and rendering performance checks

Exit criteria:

- external links to `https://normco.re/...` resolve correctly
- offline and flaky-network behavior is acceptable
- critical user journeys are test-covered

### Phase 5: Release Readiness

Goal:

- prepare Play distribution

Deliverables:

- final application ID confirmation
- Play Console app record
- app icon and store assets
- privacy and support links
- release signing setup

Exit criteria:

- internal testing track build is shippable

## Immediate Backlog

- replace placeholder screens with contract-backed screens
- decide whether `re.phiphi.android` remains the final Android application ID
- generate and mirror localized `post-detail` payloads from the Deno build
- add App Links for canonical post URLs
- introduce Room/Paging 3/DataStore/WorkManager once remote and persistent data
  flows land
- wire post detail to the generated `post-detail` contract family

## Risks And Constraints

- Local Android builds depend on Java 17 and a full Android SDK install on each
  MacBook that works on the repo.
- The repository still documents an older content-contract prototype; Phase 1
  must replace that drift with the manifest/index/detail path.
- The exact editorial source for `updatedAt`, future block types, and some app
  metadata still need to be finalized before the contract family is frozen.

## Mac Setup Checklist

Before the Android project can be built locally on a MacBook, install:

- Android Studio stable
- JDK 17
- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- Android SDK Platform-Tools
- Android SDK Command-line Tools
- Android Emulator
- at least one API 36 system image for a phone emulator

Recommended environment values for CLI work:

- `JAVA_HOME` pointing to JDK 17
- `ANDROID_SDK_ROOT=$HOME/Library/Android/sdk`

## References

- Android architecture recommendations:
  <https://developer.android.com/topic/architecture/recommendations>
- Offline-first guidance:
  <https://developer.android.com/topic/architecture/data-layer/offline-first>
- Hilt and Jetpack integrations:
  <https://developer.android.com/training/dependency-injection/hilt-jetpack>
- Navigation Compose:
  <https://developer.android.com/develop/ui/compose/navigation>
- Material 3 in Compose:
  <https://developer.android.com/develop/ui/compose/designsystems/material3>
- Compose stability and performance:
  <https://developer.android.com/develop/ui/compose/performance/stability>
- Baseline profiles:
  <https://developer.android.com/topic/performance/baselineprofiles/overview>
- AGP 9.1.0 release notes:
  <https://developer.android.com/build/releases/agp-9-1-0-release-notes>
- AndroidX stable channel:
  <https://developer.android.com/jetpack/androidx/versions/stable-channel>
