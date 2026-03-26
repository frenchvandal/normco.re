# Mobile Phase 0

This document records the Phase 0 decisions that are now considered locked for
the mobile program.

Updated: 2026-03-21

Phase 0 is complete. Android is now the active native implementation track, and
this file should be read as the shared decision record that remains in force
while delivery continues in `docs/android-roadmap.md`.

## Purpose

Use this document to:

- keep the cross-platform product and contract decisions in one place
- separate what is already locked from what remains intentionally deferred
- make resuming mobile work possible without reconstructing the early planning
  history from git log

## Locked Shared Decisions

### Product

- The first shipped native client is Android.
- iOS and HarmonyOS remain planned follow-on clients.
- The first release must be a native reading client, not a wrapped website.
- v1 includes:
  - Home
  - Archive
  - Post detail
  - Settings
  - localized content
  - cached indexes
  - cached opened posts
  - per-device bookmarks
  - per-device reading progress
  - language switching
  - share
  - `Open in Browser`
- v1 excludes:
  - account sync
  - comments
  - push notifications
  - widgets
  - server-side search
  - a dedicated bookmarks tab as a top-level destination

### Contracts

- `contracts/app-manifest.schema.json`, `contracts/posts-index.schema.json`, and
  `contracts/post-detail.schema.json` are the shared app-contract family.
- `contracts/post.schema.json` is legacy and must not drive current client
  architecture.
- `updatedAt` remains optional.
- when `updatedAt` is absent, generators omit it rather than copying
  `publishedAt`
- `heroImage` remains optional
- app-facing media URLs are absolute HTTPS URLs
- the content model remains block-based and native-renderable
- current mobile clients still decode the existing block shape; richer inline
  content remains a later contract evolution, not a blocker for the current
  Android app

### Platform Direction

- Android uses Kotlin, Jetpack Compose, Material 3, Hilt, Room, DataStore, and
  WorkManager.
- iOS should follow Apple’s native stack and design guidance when work starts.
- HarmonyOS should follow ArkTS, ArkUI, Stage model, and HarmonyOS Design when
  work starts.
- Native apps must share contracts and information architecture, not a shared
  visual component library.

### Repository

- Keep the current repository root as the editorial and web source of truth.
- Keep app JSON generation inside the current Deno build pipeline.
- Keep Android in `apps/android`.
- Do not move the site into `apps/web` during active Android delivery.

## Phase 0 Outcome Snapshot

The Phase 0 plan is no longer theoretical. As of 2026-03-21:

- Android has a working native reader in `apps/android`
- the site generates the app-manifest / posts-index / post-detail JSON outputs
- Android mirrors those generated contracts into bootstrap assets
- Android seeds Room from those assets and refreshes from the remote contract
  endpoints
- Android localizes both content and app chrome
- Android supports bookmarks, reading continuity, archive filtering, deep links,
  background sync, and pull-to-refresh

The active delivery tracker for that work is:

- `docs/android-roadmap.md`

## Deferred Decisions

These items are explicitly deferred rather than unresolved by accident.

- immutable post identity
  - keep one shared explicit `id` in `src/posts/<slug>/_data.yml`
  - backfill missing shared ids with `deno task posts:fix-ids`
  - do not generate UUIDs independently in localized Markdown files
- future contract expansion for richer inline content
- whether `app-manifest` eventually needs fields such as `contentOrigin` or
  `contentHash`
- future editorial block families such as tables, footnotes, callouts, and
  embeds
- Java toolchain upgrade beyond Java 17
  - keep Java 17 during active Android delivery
  - evaluate a newer supported LTS only near the end of the project once app
    behavior, signing, and release wiring are stable

## Open Questions Still Outside Phase 0

- Does `re.phiphi.android` remain the final Android application ID?
- Does `phiphi` remain the final Android app name?
- What is the final Apple bundle identifier when iOS starts?
- What is the final HarmonyOS identifier / namespace when that track starts?

## Exit Criteria

Phase 0 is closed because the following are true:

- the first native client is chosen
- the shared app-contract family is chosen
- the repository path for generating app JSON is chosen
- the Android implementation track is active and uses those decisions in real
  code

## Next Step After Phase 0

The active next step is no longer generic prep. It is Android hardening:

- full screen review
- accessibility pass
- test coverage
- performance verification
- release signing and distribution setup

After Android is stable enough, reuse the same contract boundary and product
lessons for iOS and HarmonyOS.
