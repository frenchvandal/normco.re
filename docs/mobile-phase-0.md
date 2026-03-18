# Mobile Phase 0

This document turns the roadmap into an execution-ready Phase 0 tracker.

Updated: 2026-03-18

Phase 0 is about locking product and contract decisions before implementation
starts. It is intentionally pre-code for the native clients themselves.

## Purpose

Use this document to:

- keep one shared checklist for the preparation work
- record the working defaults we can already use
- separate decided defaults from still-open decisions
- define the exit criteria for moving into implementation

## Working Defaults

Unless a later decision explicitly overrides them, use these defaults.

### Product Scope Defaults

- iOS v1 is the first shipping target
- start implementation with iOS, not Android
- Android and HarmonyOS remain planned follow-on clients
- iOS v1 includes: home, archive, post detail, settings, cached indexes, cached
  opened posts, explicit "Save for Offline" on post detail, bookmarks, reading
  progress, language switching, share, and "Open in Browser"
- iOS v1 excludes: push notifications, widgets, account sync, comments,
  server-side search, local search in the first release, analytics-specific
  product features, and social/community features
- bookmarks and reading progress are per-device only in v1

### Contract Defaults

- `contracts/app-manifest.schema.json`, `contracts/posts-index.schema.json`, and
  `contracts/post-detail.schema.json` remain the target app-contract family
- `contracts/post.schema.json` is legacy and should not define the future app
  pipeline
- `updatedAt` is optional in v1
- when `updatedAt` is absent, generators must omit it rather than copy
  `publishedAt`
- `heroImage` should stay optional in v1
- app-facing media URLs should be emitted as absolute HTTPS URLs
- post body content should stay block-based and gain explicit inline rich-text
  support instead of falling back to raw HTML
- `paragraph`, `heading`, and `quote` blocks should use `content` as the
  canonical rich-text field in v1
- list items should be rich-text capable too and should no longer be plain
  strings in the target v1 shape

### Platform Defaults

- iOS follows Apple stack and design guidance
- Android follows Google stack and Material 3 guidance
- HarmonyOS follows Huawei stack and HarmonyOS NEXT guidance
- none of the native apps should try to reproduce the web site's Carbon layer
- shared behavior lives in content contracts and information architecture, not a
  shared visual component system

### Repository Defaults

- keep the current repository root as the web/editorial source of truth
- do not move the site into `apps/web` during Phase 0
- keep JSON generation inside the current web build for the first app version
- do not extract a dedicated `content-api` package during Phase 0

## Locked Decisions

These decisions are now considered chosen for Phase 0 unless a new explicit
decision reopens them.

### 1. iOS v1 Product Scope

The first app implementation starts on iOS.

Locked v1 scope:

- home screen from localized `posts-index`
- archive screen from localized `posts-index`
- native post detail from structured `post-detail`
- settings screen with language preference and data controls
- opportunistic offline cache for the last successful localized indexes
- opportunistic cache for opened post details
- explicit "Save for Offline" action on post detail
- per-device bookmarks
- per-device reading progress
- share sheet
- "Open in Browser"

Explicitly out of scope for iOS v1:

- local search
- remote search
- account sync
- push notifications
- widgets
- comments or community features

### 2. `updatedAt`

`updatedAt` is optional in v1.

Rules:

- emit `publishedAt` for every item and detail payload
- emit `updatedAt` only when the editorial source has a true update timestamp
- do not synthesize `updatedAt` by copying `publishedAt`
- clients should treat missing `updatedAt` as "no separate update date"

### 3. Rich Text For `post-detail`

The target v1 direction is block-based content with explicit inline nodes.

Locked rules:

- `paragraph`, `heading`, and `quote` blocks use `content`
- list items are objects with their own `content`
- canonical inline node families in v1: `text`, `link`, `lineBreak`
- `text` can carry `marks`
- canonical v1 marks: `emphasis`, `strong`, `code`

This model is intentionally small. It covers the inline features already present
in the repository's Markdown without forcing the apps to parse raw HTML.

## Preparation Backlog

### 1. Product Decisions

- [x] Confirm the iOS v1 feature floor
- [x] Confirm what "offline reading" means operationally: cached indexes and
      opened posts, plus explicit saved posts from post detail
- [x] Decide whether local on-device search is in iOS v1 or later
- [x] Decide whether bookmarks remain per-device only in v1
- [ ] Decide whether HarmonyOS stays a later exploration track or a planned
      near-term track after Android

### 2. Contract Decisions

- [x] Finalize the inline rich-text model for `post-detail`
- [x] Decide whether heading blocks use `text` or `content` as the canonical
      field once rich text is added
- [x] Make `updatedAt` optional or add true editorial support for it
- [ ] Decide whether `app-manifest` needs `contentOrigin`
- [ ] Decide whether `contentHash` is needed in v1 or deferred
- [ ] Decide whether future editorial features need placeholders now: tables,
      footnotes, callouts, embeds

### 3. Build And Validation Prep

- [ ] Replace the legacy post-only content-contract path with one generator path
      for manifest, index, and detail outputs
- [ ] Update `deno task validate-contracts` to validate the target app-contract
      family instead of the legacy post-only schema
- [ ] Add language coverage fixtures for the target contracts
- [ ] Add at least one consumer-oriented decoding smoke test for generated app
      payloads
- [ ] Decide whether app JSON output is generated from rendered HTML, Markdown
      AST, or shared page data before implementation starts

### 4. Distribution And Linking Prep

- [ ] Confirm the canonical public host for deep links: `https://normco.re`
- [ ] Reserve the Apple bundle identifier
- [ ] Reserve the Android application ID
- [ ] Reserve the HarmonyOS application identifier / namespace
- [ ] Create the App Store Connect record when the iOS implementation track
      starts
- [ ] Plan Universal Links, Android App Links, and HarmonyOS link handling from
      the same canonical post URLs
- [ ] Prepare the values needed for `apple-app-site-association` once the Apple
      team and bundle identifier are known

### 5. Editorial Model Prep

- [ ] Confirm that every post should expose a summary in app contracts
- [ ] Confirm whether reading time stays derived rather than editorially
      authored
- [ ] Decide whether hero images are part of v1 or simply optional and mostly
      absent at launch
- [ ] Record any future editorial block types that should stay out of v1

## Open Questions

These items remain intentionally open because the repository cannot resolve them
alone.

- What is the final Apple bundle identifier?
- What is the final Android application ID?
- What is the final HarmonyOS application identifier?

## Exit Criteria

Phase 0 is complete when all of the following are true:

- the iOS v1 product scope is explicit
- the target app-contract family is explicit
- the rich-text direction for `post-detail` is chosen
- the rule for `updatedAt` is chosen
- the repository path for generating and validating app JSON is chosen
- the canonical deep-link host is confirmed
- the identifiers needed to start Apple / Android / HarmonyOS app setup are
  known or explicitly deferred by decision

## Next Step After Phase 0

When the exit criteria are met, start Phase 1:

- generate `app-manifest`
- generate localized `posts-index`
- generate localized `post-detail`
- validate examples and generated payloads in CI
- keep generation inside the current web build
