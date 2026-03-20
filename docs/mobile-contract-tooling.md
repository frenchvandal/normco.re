# Mobile Contract Tooling

This document records where introducing another language can make sense for the
mobile-app side of normco.re without complicating the web build unnecessarily.

Updated: 2026-03-21

## Summary

- Keep Deno + Lume as the source of truth for generating the site and the static
  JSON app API.
- Do not introduce another language just to reimplement the current web build or
  post-build steps.
- Keep open the option of a second language for shared mobile contract tooling:
  validation, compatibility checks, fixture generation, and optional client
  model code generation.
- If a second language is introduced for that tooling, Go is the default
  recommendation.

## Boundary

There are two different problems here and they should not be mixed.

The first problem is web-site generation. That remains a Deno + Lume concern.
The current repository already builds the static site and can emit a static JSON
API from the same editorial source.

The second problem is cross-client contract tooling. That includes the tasks
around the app-facing JSON boundary once native clients exist:

- validating generated payloads as consumer-facing contracts
- checking for breaking schema or payload changes across revisions
- generating fixtures and decoding smoke-test inputs for native clients
- optionally generating client models or type declarations from the frozen
  contract family

This second problem is the only place where another language may simplify the
overall system rather than add churn.

## Good Reasons To Add Another Language

Introduce a separate shared contract tool only if at least one of these becomes
true:

- a second native client starts and the same validation/codegen logic is now
  needed in more than one place
- contract drift becomes a recurring problem between generated JSON and native
  decoders
- the repository needs explicit compatibility checks between contract versions
- contract fixtures or generated client models are being maintained manually in
  multiple codebases
- app-contract validation needs to run outside this repository in a stable,
  reusable form

## Bad Reasons To Add Another Language

Do not add another language for these reasons:

- rewriting the current site build pipeline for aesthetic consistency
- replacing Deno utilities that are already simple and fast enough here
- moving contract generation away from the editorial source of truth too early
- trying to share visual UI code across web and native clients
- introducing a second runtime before there are real multi-client pressures

## Best-Fit Roles

### Go

Go is the default recommendation for shared mobile contract tooling.

Why it fits:

- easy to ship as one static CLI binary in CI and in client repositories
- very good standard-library support for JSON, HTTP, files, and command-line
  tools
- low operational overhead compared with a Rust toolchain
- good fit for validators, compatibility diff tools, fixture generators, and
  schema-driven codegen helpers

Best use cases:

- `mobile-contract validate`
- `mobile-contract diff old.json new.json`
- `mobile-contract fixtures`
- `mobile-contract codegen swift`
- `mobile-contract codegen kotlin`

### Rust

Rust is viable, but it should be a deliberate choice rather than the default.

Use Rust only if at least one of these becomes true:

- you want one very strict core parsing or validation library reused through
  multiple targets
- contract tooling grows into a performance-sensitive parser or transformation
  engine
- you want to share one low-level implementation through FFI or WebAssembly

For this repository today, those benefits are still theoretical.

### Ruby

Ruby is a weak fit for this problem.

It can certainly handle JSON and CLI work, but it adds another runtime without
giving a strong advantage over Deno or Go for the contract-tooling use case.

### R

R is not a fit for app-contract tooling here.

It would make sense only for content analytics or offline reporting, which is a
different problem from mobile client contracts.

## What Stays In Deno

Even if a shared contract tool is introduced later, these concerns should stay
in the current web repository and build:

- reading editorial source files
- resolving multilingual post metadata
- generating the static site
- generating the canonical app JSON output from the same source of truth
- publishing the generated JSON files under the same deployment flow as the site

The goal is not to move content generation out of Deno. The goal is to avoid
duplicating consumer-side contract logic across native apps.

## Recommended Sequence

### Phase 0 and Phase 1

Keep everything in the current Deno repository:

- freeze the app-manifest, posts-index, and post-detail contract family
- generate the app JSON from the existing build
- validate the generated JSON in CI
- add consumer-oriented decoding smoke tests

### Later, If Multi-Client Pressure Appears

Add a separate shared contract tool, most likely in Go, for:

- compatibility checking
- reusable validation outside this repo
- fixture generation for iOS, Android, and HarmonyOS tests
- optional client model generation

This keeps the web build simple while giving mobile work a stronger shared
boundary.

## Trigger Criteria

Revisit this decision when at least one of these is true:

- a second native client starts beside Android
- HarmonyOS work has started alongside another native client
- contract changes are causing repeated decoder breakage in client apps
- more than one consumer repository now needs the same contract checks
- manual model maintenance in Swift and Kotlin becomes noisy enough to justify
  code generation

## Practical Recommendation

Current recommendation:

- no second language for the web build
- no second language for app-contract generation yet
- keep the option open for a Go-based shared contract tool once mobile client
  work creates real reuse pressure

If the problem later shifts from contract tooling to shared runtime logic across
iOS and Android, that is a different decision and should be evaluated separately
from the contract-tooling question.
