# Mobile Clients Roadmap

This document describes the recommended monorepo structure and client stacks for
the future native apps of normco.re.

The current implementation priority is iOS. Android and HarmonyOS are planned
follow-on clients and should consume the same content contracts.

## Goals

- Keep the blog source of truth in the existing Deno + Lume site.
- Expose a stable, versioned content surface for native clients.
- Avoid coupling mobile apps to Lume internals, feed quirks, or rendered HTML.
- Let each client use the native UI stack of its platform.

## Monorepo Shape

Recommended target structure:

```text
repo/
├── apps/
│   ├── web/
│   ├── ios/
│   ├── android/
│   └── harmony/
├── contracts/
└── docs/
```

### `apps/web`

Contains the current Lume site and remains the editorial source of truth:

- TSX pages, layouts, and components
- Markdown post bodies
- shared post metadata
- static asset generation
- JSON content generation for native clients

### `apps/ios`

First native client. Recommended stack:

- SwiftUI
- NavigationStack
- Observation (`@Observable`)
- `URLSession` + `async/await` + `Codable`
- Swift Package Manager for dependencies
- SwiftData only for local user state such as favorites or reading progress

Suggested internal structure:

```text
apps/ios/
├── Normcore.xcodeproj
├── Normcore/
│   ├── App/
│   ├── Core/
│   │   ├── Networking/
│   │   ├── Models/
│   │   ├── Content/
│   │   ├── Persistence/
│   │   └── UI/
│   ├── Features/
│   │   ├── Home/
│   │   ├── Archive/
│   │   ├── PostDetail/
│   │   └── Settings/
│   └── Resources/
├── NormcoreTests/
└── NormcoreUITests/
```

### `apps/android`

Second native client. Recommended stack:

- Kotlin
- Jetpack Compose
- Navigation Compose
- Android `ViewModel`
- Kotlin coroutines + Flow
- `Room` only for local user state and lightweight caching
- Gradle with Kotlin DSL

Suggested internal structure:

```text
apps/android/
├── app/
│   └── src/
│       ├── main/
│       ├── test/
│       └── androidTest/
├── core/
│   ├── network/
│   ├── model/
│   ├── content/
│   ├── database/
│   └── ui/
└── feature/
    ├── home/
    ├── archive/
    ├── postdetail/
    └── settings/
```

### `apps/harmony`

Third native client. Recommended stack for HarmonyOS NEXT:

- ArkTS
- ArkUI declarative UI
- Stage model application structure
- DevEco Studio
- local preferences / lightweight persistence only for user state

Suggested internal structure:

```text
apps/harmony/
├── AppScope/
├── entry/
│   └── src/
│       ├── main/
│       │   ├── ets/
│       │   │   ├── entryability/
│       │   │   ├── pages/
│       │   │   ├── features/
│       │   │   ├── core/
│       │   │   └── models/
│       │   └── resources/
│       └── test/
└── hvigor/
```

## Shared Strategy Across Platforms

The shared mobile architecture should be contract-first.

Every native client should depend on:

- `contracts/app-manifest.schema.json`
- `contracts/posts-index.schema.json`
- `contracts/post-detail.schema.json`

No native client should depend directly on:

- RSS / Atom feeds
- HTML archives
- Lume page data internals
- TSX rendering logic

## What Lives In `contracts/`

`contracts/` is the stable cross-platform boundary:

- JSON Schema definitions
- example payloads
- versioning notes
- validation tests

The goal is to let iOS, Android, and HarmonyOS implement different UI layers
while decoding the same payload model.

## Why Not Share UI Code

The project should share content contracts, not UI code.

Reasons:

- SwiftUI, Jetpack Compose, and ArkUI are all declarative, but not compatible.
- native navigation, image loading, caching, and accessibility differ by
  platform
- the blog is editorial, so fidelity and platform conventions matter more than
  code reuse metrics

## Phased Rollout

### Phase 1

- move the existing site to `apps/web`
- add `contracts/`
- generate app-oriented JSON from the web build
- create `apps/ios`

### Phase 2

- stabilize the JSON contracts with real app usage
- add platform-neutral examples and fixture validation
- create `apps/android`

### Phase 3

- reuse the same contracts and examples
- create `apps/harmony`
- add HarmonyOS-specific packaging and release workflow

## Recommendation

Do not extract a standalone `content-api` package immediately.

For the first iOS version, let `apps/web` generate the JSON output directly.
Extract a separate `content-api` package only when multiple native clients are
actively consuming the same generation pipeline and the web app no longer owns
that concern cleanly.
