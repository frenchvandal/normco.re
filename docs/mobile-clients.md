# Mobile Clients Roadmap

This document tracks the recommended path for native mobile clients of
normco.re.

Updated: 2026-03-20

Current implementation priority: iOS. Android and HarmonyOS remain follow-on
clients and should consume the same content contracts once the iOS path is
proven with real usage.

## Executive Summary

- Keep the current Deno + Lume repository as the editorial and web source of
  truth for now.
- Generate a static JSON app API from the existing site build. No dynamic
  backend is required for the first app version.
- Keep open the option of a separate shared contract tool for native clients,
  but do not move app JSON generation out of the current Deno build unless
  multi-client pressure proves the need.
- Treat `contracts/app-manifest.schema.json`,
  `contracts/posts-index.schema.json`, and `contracts/post-detail.schema.json`
  as the intended cross-platform boundary, but revise them before freezing v1.
- Do not ship an iOS app that is only a wrapped website. The first release needs
  clear native value to be a worthwhile product and to clear App Store review
  expectations around minimum functionality.
- Plan the iOS client around Apple’s current native stack and design guidance,
  not around visual reuse of the web UI.
- Plan the Android client around Google’s native stack and Material Design 3,
  not around visual reuse of the web UI.
- Plan the HarmonyOS client around Huawei’s native HarmonyOS NEXT stack and
  design guidance, not around visual reuse of the web UI.
- Defer a full `apps/web` monorepo reshuffle until a second native client or
  shared tooling pressure actually justifies the move.

## Goals

- Keep the blog source of truth in the existing web site.
- Expose a stable, versioned content surface for native clients.
- Avoid coupling mobile apps to Lume internals, feed quirks, or rendered HTML.
- Let each client use the native UI stack of its platform.
- Make the first iOS release useful even when the network is poor or absent.

## What Changed Since The First Draft

The earlier draft was directionally right, but too eager in two places.

First, it assumed a monorepo reshape to `apps/web` should happen immediately.
That would create churn before there is any iOS code to benefit from it. The
recommended near-term path is to leave the current web repository layout alone
and add `apps/ios` only when implementation starts.

Second, the repository now contains two generations of app-content thinking:

- the current target schemas: `contracts/app-manifest.schema.json`,
  `contracts/posts-index.schema.json`, `contracts/post-detail.schema.json`
- an older prototype: `contracts/post.schema.json`,
  `plugins/content-contract.ts`, and `contracts/validate.ts`

The older prototype is useful as an experiment, but it should not define the iOS
path. It emits a simpler post-only shape that no longer matches the newer study.

## Product Bar For The iOS v1

The iOS app should be a native reading client for the blog, not a website shell.

Recommended first-release value:

- native home and archive screens
- native post detail rendering from structured blocks plus inline rich text
- cached localized indexes
- cached opened posts plus explicit "Save for Offline" from post detail
- per-device bookmarks
- per-device reading progress
- language preference and alternate-language switching
- share sheet plus "Open in Safari"

Optional for later phases:

- local full-text search across cached content
- push notifications for new posts
- widgets or Live Activities

## Repository Strategy

### Near-Term Structure

Keep the current repository root as the web app and editorial pipeline:

```text
repo/
├── contracts/
├── docs/
├── plugins/
├── src/
└── apps/
    └── ios/
```

Why this is the right first step:

- avoids moving stable web code without a clear payoff
- keeps the current deployment pipeline intact
- lets the iOS app evolve against the real repository before committing to a
  larger monorepo abstraction

### When To Introduce `apps/web`

Move the existing web code into `apps/web` only when at least one of these is
true:

- Android or HarmonyOS implementation has started
- web and native build tooling now share CI pipelines that are awkward at the
  root
- multiple application packages need a common workspace policy

Until then, treat `apps/web` as a possible future shape, not a prerequisite.

## Recommended iOS Stack

Recommended stack for the first iOS client:

- SwiftUI
- NavigationStack
- Observation (`@Observable`)
- `URLSession` + `async/await` + `Codable`
- SwiftData only for local user state such as bookmarks, downloads, and reading
  progress
- XCTest and XCUITest

Implementation guidance:

- follow Apple’s Human Interface Guidelines and Apple design resources
- start with as few third-party dependencies as possible
- keep remote content as network-decoded immutable models
- keep local preferences and reading state separate from downloaded content
- avoid using `WKWebView` as the primary reading surface

The iOS app should not try to recreate the web site’s Carbon UI. It should feel
native to Apple platforms and follow Apple’s current design and interaction
patterns.

## Recommended Android Stack

Android remains a follow-on client, but the direction is now explicit:

- Kotlin
- Jetpack Compose
- Compose Material 3
- adaptive navigation and layouts from current Jetpack guidance
- ViewModel
- coroutines and Flow
- Room for offline cache and long-lived local content
- DataStore for lightweight preferences
- WorkManager for background sync and deferred work
- Hilt for dependency injection unless the app stays trivially small

Implementation guidance:

- use Material 3 as the Android design system
- follow Google’s recommended Android architecture with UI, data, and optional
  domain layers
- follow an offline-first data strategy for reading content
- support deep links to post URLs from the start
- treat the Now in Android sample as the primary implementation reference for
  app structure and quality bar

The Android app should not try to recreate the web site’s Carbon UI. The shared
surface across platforms is content and information architecture, not a
pixel-identical component library.

## Recommended HarmonyOS Stack

HarmonyOS remains a later client, but the direction should also be explicit:

- HarmonyOS NEXT 5.x baseline when implementation starts
- ArkTS
- ArkUI declarative UI
- Stage model application structure
- `entry` HAP with a single `UIAbility` first
- one or two HSP utility modules only when shared-code pressure appears
- prefer HSP over HAR for app-internal shared runtime code once modularization
  starts
- `Navigation` for the real app rather than a legacy router-first design
- `List` + `LazyForEach` + `Refresh` for feed surfaces
- `relationalStore` for offline content cache
- Preferences / lightweight KV storage for settings and small local state
- distributed KV, Cloud DB, Cloud Storage, and Push Kit only after the core
  reader is stable and product-justified

Implementation guidance:

- use HarmonyOS Design as the platform design system and primary UI reference
- follow Huawei’s primary application model: ArkTS + ArkUI + Stage model
- treat ArkTS as a strict application language and model contract types
  explicitly rather than relying on dynamic TypeScript-style patterns
- keep the content and data model aligned with the same shared contracts used by
  iOS and Android
- keep the content pipeline contract-first: `app-manifest`, localized
  `posts-index`, localized `post-detail`
- prefer native rendering of structured article content rather than a
  WebView-first detail screen
- start with RDB + preferences for offline-first local state before introducing
  distributed or cloud sync
- favor native navigation and native components rather than a visual port of the
  web UI
- treat Super Device continuity as a later product layer on top of a strong
  phone reader, not as a Phase 0 prerequisite

The HarmonyOS app should not try to reproduce the site’s Carbon layer either. It
should feel native to HarmonyOS.

See `docs/harmonyos-roadmap.md` for the HarmonyOS-specific execution plan.

## Shared Strategy Across Platforms

The shared mobile architecture should remain contract-first.

Every native client should depend on:

- `contracts/app-manifest.schema.json`
- `contracts/posts-index.schema.json`
- `contracts/post-detail.schema.json`

No native client should depend directly on:

- RSS / Atom / JSON Feed as the app API
- rendered HTML pages
- Lume page-data internals
- TSX rendering logic

Platform UI guidance:

- iOS should feel native to iOS
- Android should feel native to Android and use Material 3
- HarmonyOS should feel native to HarmonyOS and follow Huawei’s design guidance
- web remains free to use Carbon as its own design system

## Shared Contract Tooling

Another language can make sense for the mobile program, but only in a narrow
place: shared contract tooling around the JSON boundary.

That means tasks such as:

- consumer-facing contract validation
- compatibility checks between payload revisions
- fixture generation for native client tests
- optional client model generation once more than one native client exists

That does not mean moving site generation or app JSON generation out of Deno.
The current repository should remain the canonical generator because it already
owns the editorial source of truth.

Default recommendation:

- keep generation in Deno
- consider a separate Go tool later if iOS and at least one more native client
  both need the same contract tooling
- treat Rust as a later option only if a lower-level shared parser or FFI-style
  core becomes useful
- do not plan around Ruby or R for this problem

See `docs/mobile-contract-tooling.md` for the detailed reasoning.

## Current Gaps To Close Before Implementation

### 1. The Current Detail Contract Is Not Rich Enough

The current `post-detail` study models block structure, but text-bearing blocks
still collapse inline meaning down to plain strings. That is not enough for a
native reading app because the existing Markdown already uses:

- inline links
- inline code
- emphasis / strong emphasis

Before freezing v1, text-bearing blocks should support inline children or a
similarly explicit rich-text representation.

### 2. `updatedAt` Is Not Yet Backed By Editorial Data

The web content model currently tracks `date`, but does not yet expose a
distinct editorial `updatedAt` field in shared post metadata. For the iOS
contracts, choose one of these approaches explicitly:

- make `updatedAt` optional in v1, or
- add real update tracking to post metadata before the app contract is frozen

Duplicating `publishedAt` into `updatedAt` is acceptable as a temporary
migration aid, but it should not become a hidden long-term rule.

### 3. The Build Pipeline Still Targets The Older Prototype

The repository already documents the newer app-manifest / index / detail model,
but the retained content-contract prototype still generates the older single
post schema. The first implementation pass should replace that drift with one
build path that emits the real app contracts.

### 4. App Distribution Metadata Is Not Prepared Yet

The repo is technically ready to host a future iOS client, but the Apple-side
distribution setup is still missing:

- bundle identifier
- Apple Developer team setup
- App Store Connect app record
- app icon and store artwork
- Universal Links / Associated Domains configuration

## Phased Rollout

### Phase 0: Preparation In The Current Repo

- finalize the iOS v1 product scope
- revise the content contracts before treating them as stable
- decide how native clients will represent rich inline content
- decide whether `updatedAt` is optional or editorially authored
- prepare Apple distribution identifiers and domain ownership details

Execution tracker for this phase:

- `docs/mobile-phase-0.md`

### Phase 1: Static App API Generation

- generate `/api/app-manifest.json`
- generate localized `/api/posts/index.json`
- generate localized `/api/posts/<slug>.json`
- validate examples and generated payloads in CI
- keep JSON generation inside the current web build

### Phase 2: iOS App Skeleton

- create `apps/ios`
- add app bootstrap, navigation, and decoding
- implement home, archive, post detail, and settings
- add local persistence for bookmarks, downloads, and reading progress

### Phase 3: Product Hardening

- offline caching policy
- language switching flow
- universal links
- accessibility pass
- TestFlight internal builds

### Phase 4: Release Readiness

- App Store metadata
- screenshots and review notes
- analytics / crash reporting if desired
- public TestFlight or App Store launch

## Work We Can Prepare Right Now

### Product Decisions

- confirm the iOS v1 feature floor: offline reading, bookmarks, reading
  progress, language switching, share/open in browser
- decide whether search is in v1 or a follow-up
- decide whether favorites are per-device only or eventually synced

### Content Contract Work

- replace the old post-only prototype path with the newer manifest / index /
  detail contract family
- extend text-bearing blocks with inline rich-text support
- decide the canonical shape for code blocks, lists, images, and quotes
- make an explicit rule for `updatedAt`
- define how relative asset URLs become app-safe absolute URLs

### Build And Validation Work

- add one generator path for all app JSON outputs
- update `deno task validate-contracts` so it validates the real app contracts
- add fixtures for each language
- add one minimal consumer smoke test that decodes the generated payloads

### Apple / Distribution Prep

- reserve the bundle identifier
- create the App Store Connect record
- choose the Associated Domains entitlement value for Universal Links
- plan the `apple-app-site-association` file to be hosted from the site
- prepare a first-pass app icon set derived from the current site branding

### Android Prep

- reserve the Android application ID
- create the Play Console app record when the Android track starts
- decide the app theme strategy with Material 3 and dynamic color
- plan Android App Links for post URLs
- define the offline cache and sync policy around Room and WorkManager

### HarmonyOS Prep

- reserve the HarmonyOS application identifier and project namespace
- prepare the AppGallery Connect / Huawei distribution setup when the HarmonyOS
  track starts
- define the HarmonyOS deep-linking and routing strategy for post URLs
- decide the native HarmonyOS theme direction from Huawei’s design guidance
- confirm the minimal local persistence approach for bookmarks and reading state

### Editorial Model Prep

- decide whether every post should expose a summary and reading time
- decide whether hero images are part of the app v1 contract or deferred
- decide how future editorial features should evolve: pull quotes, callouts,
  embeds, tables, footnotes

## Recommendation

Do not start by building an iOS shell around the website and do not start by
restructuring the repository into `apps/web`.

The most pragmatic path is:

1. lock the product scope and app contracts
2. generate stable static JSON from the existing site build
3. create `apps/ios`
4. build a native reader with offline value

That sequence reduces risk, avoids premature repo churn, and keeps the first iOS
release aligned with the editorial strengths of the site.

## External Notes

Two Apple references matter for planning:

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Upcoming requirements notice](https://developer.apple.com/news/upcoming-requirements/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI](https://developer.apple.com/swiftui/)
- [SwiftData](https://developer.apple.com/documentation/SwiftData)

As of 2026-03-18, Apple states that apps uploaded on or after 2026-04-28 must be
built with Xcode 26 and the iOS 26 SDK. Recheck this operational requirement
when implementation starts, but plan with current toolchains rather than older
Xcode baselines.

For Android, current Google references that should anchor the implementation
are:

- [Recommendations for Android architecture](https://developer.android.com/topic/architecture/recommendations)
- [Material Design 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)
- [Navigation with Compose](https://developer.android.com/develop/ui/compose/navigation)
- [Build an offline-first app](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [Now in Android](https://developer.android.com/series/now-in-android)

For HarmonyOS, current Huawei references that should anchor the implementation
are:

- [HarmonyOS Design](https://developer.huawei.com/consumer/en/design/)
- [ArkUI](https://developer.huawei.com/consumer/cn/arkui/)
- [ArkTS](https://developer.huawei.com/consumer/en/arkts/)
- [Stage model overview](https://developer.huawei.com/consumer/cn/arkui/arkui-stage/)
