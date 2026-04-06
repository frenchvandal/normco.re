# Mobile Clients Roadmap

This document tracks the actual state and recommended direction for the native
mobile clients of normco.re.

Updated: 2026-03-29

Current implementation priority: Android. iOS and HarmonyOS remain follow-on
clients and should consume the same content contracts once the Android release
track is stable.

## Executive Summary

- Keep the current Deno + Lume repository as the editorial and web source of
  truth.
- Keep generating the static JSON app API from the existing site build. No
  dynamic backend is required for the first native clients.
- Treat `contracts/app-manifest.schema.json`,
  `contracts/posts-index.schema.json`, and `contracts/post-detail.schema.json`
  as the shared mobile boundary.
- Keep Android as the reference implementation for the first shipped native
  reader.
- Plan iOS and HarmonyOS as later native clients that reuse the same contract
  family and product shape rather than the Android UI itself.
- Do not try to recreate the site's web shell or Ant Design treatment in native
  apps. Share content and information architecture, not pixel-identical
  components.

## Current Snapshot

### Shared Content Surface

The site now emits the intended app-facing JSON family:

- `/api/app-manifest.json`
- localized `/api/posts/index.json`
- localized `/api/posts/<slug>.json`

The repository also provides:

- schema definitions in `contracts/`
- validation through `contracts/validate.ts`
- Android asset mirroring through `deno task android:sync-contract-assets`

### Android

Android is no longer a planning track. It is implemented in `apps/android`.

Current Android state:

- Home, Archive, Post detail, and Settings are implemented
- content is localized
- app chrome is localized
- Room is the local source of truth after bootstrap
- DataStore persists reader preferences, bookmarks, and reading state
- WorkManager schedules periodic content refresh
- Home surfaces recent reading and saved reading
- Archive supports local search, bookmarked-only filtering, and tag filters
- Post detail supports bookmark, share, `Open in Browser`, in-article language
  switching, table of contents, code copy, reading-position restore, and
  pull-to-refresh
- Home, Archive, and Post detail support pull-to-refresh
- canonical post URLs open the app through Android deep links

What remains before Android release hardening is mostly:

- final naming and identifier decisions
- accessibility pass
- broader test coverage
- performance verification
- signing / Play Console / release wiring

See `docs/android-roadmap.md` for the detailed Android execution state.

### iOS

iOS has not started implementation yet.

When it starts, it should reuse:

- the same app-manifest / posts-index / post-detail boundary
- the same product shape proven on Android
- native Apple design and architecture guidance rather than Android UI patterns

### HarmonyOS

HarmonyOS remains a later track.

Its baseline remains:

- HarmonyOS NEXT
- ArkTS
- ArkUI
- Stage model
- HarmonyOS Design

See `docs/harmonyos-roadmap.md` for the platform-specific direction.

## Repository Strategy

### Near-Term Structure

Keep the current repository root as the editorial and web source of truth:

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

Why this is still the right shape:

- the web build already owns the editorial source of truth
- the static app API already comes from the same build
- Android can evolve without forcing a larger monorepo reshuffle
- iOS and HarmonyOS can be added later once there is real multi-client pressure

### When To Introduce `apps/web` Or More Shared Workspace Structure

Revisit a broader application workspace only when at least one of these becomes
true:

- iOS starts in parallel
- HarmonyOS starts in parallel
- build logic becomes duplicated across multiple app projects
- CI or workspace policy becomes awkward at the repository root

Until then, treat `apps/web` as optional future cleanup, not a prerequisite.

## Shared Product Bar

The first shipped native apps should be native reading clients for the blog, not
browser shells.

Shared v1 product shape:

- native Home
- native Archive
- native Post detail
- native Settings
- localized content
- cached indexes
- cached opened posts
- per-device bookmarks
- per-device reading progress
- alternate-language switching
- share
- `Open in Browser`

Shared later-phase candidates:

- account sync
- push notifications
- widgets
- server-side search
- cross-device sync

## Shared Contract Strategy

Every native client should depend on:

- `contracts/app-manifest.schema.json`
- `contracts/posts-index.schema.json`
- `contracts/post-detail.schema.json`

No native client should depend directly on:

- RSS / Atom / JSON Feed as the app API
- rendered HTML pages
- Lume page-data internals
- TSX rendering logic

The repository still contains the earlier `contracts/post.schema.json` post-only
path, but that schema should not define the active mobile architecture.
`plugins/content-contract.ts` still exists for the legacy contract experiment,
but the shared block parser now lives in `src/utils/post-content-blocks.ts` and
is reused when generating the active `post-detail` payloads.

## Platform Directions

### Android

Android uses:

- Kotlin
- Jetpack Compose
- Material 3
- ViewModel
- coroutines and Flow
- Room
- DataStore
- WorkManager
- Hilt
- Coil

Implementation guidance:

- keep the UI layer in Compose
- keep the data layer repository-driven and offline-first
- keep deep links aligned with canonical post URLs
- continue using Android as the reference client for validating the shared
  contract and offline strategy

### iOS

iOS should use:

- SwiftUI
- NavigationStack
- Observation
- `URLSession` + `async/await` + `Codable`
- local persistence only where the product needs it

Implementation guidance:

- follow Apple Human Interface Guidelines
- feel native to iOS rather than mirroring Android
- reuse the Android-learned product behavior, not the Android component tree

### HarmonyOS

HarmonyOS should use:

- HarmonyOS NEXT
- ArkTS
- ArkUI
- Stage model
- HarmonyOS Design

Implementation guidance:

- keep the app contract-first
- render structured content natively
- start offline-first on phone before adding distributed features

## Shared Tooling Direction

Keep the site and app JSON generation in Deno.

A separate shared contract tool only becomes justified when multi-client reuse
actually appears. If that happens, Go remains the default recommendation for:

- compatibility checks
- reusable validation
- fixture generation
- optional code generation for clients

See `docs/mobile-contract-tooling.md`.

## What Is Deferred On Purpose

- richer inline contract modeling beyond the current mobile block usage
- storefront metadata beyond what runtime clients need
- a second toolchain for contract work before multi-client pressure exists
- Java toolchain upgrades beyond Java 17 during active Android delivery

## Recommended Sequence From Here

1. finish Android hardening and release prep
2. keep the shared contract family stable while Android is finalized
3. start iOS only once Android product behavior and content assumptions are
   settled enough to reuse
4. treat HarmonyOS as a later native client built on the same contract family

## External References

Android references:

- [Recommendations for Android architecture](https://developer.android.com/topic/architecture/recommendations)
- [Material Design 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)
- [Navigation with Compose](https://developer.android.com/develop/ui/compose/navigation)
- [Build an offline-first app](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [Now in Android](https://developer.android.com/series/now-in-android)

Apple references:

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI](https://developer.apple.com/swiftui/)
- [SwiftData](https://developer.apple.com/documentation/SwiftData)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

HarmonyOS references:

- [HarmonyOS Design](https://developer.huawei.com/consumer/en/design/)
- [ArkUI](https://developer.huawei.com/consumer/cn/arkui/)
- [ArkTS](https://developer.huawei.com/consumer/en/arkts/)
- [Stage model overview](https://developer.huawei.com/consumer/cn/arkui/arkui-stage/)
