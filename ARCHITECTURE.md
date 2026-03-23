# Architecture

normco.re is a static, multilingual editorial site built with Deno and Lume. Its
architecture keeps content, presentation, build, and native-client concerns
distinct while letting the site ship as plain static output and expose a shared
app-facing JSON boundary.

## System Overview

```text
shared post metadata + localized Markdown bodies
                    +
TSX pages, layouts, and shared components
                    +
Lume plugins, processors, post-build scripts, and app-contract generation
                    =
localized HTML, feeds, static app JSON, assets, search indexes, Android
bootstrap artifacts, and deployment artifacts
```

## Source Tree

```text
normco.re/
├── _config.ts
├── _config/
│   ├── assets.ts
│   ├── feeds.ts
│   ├── materialize_sass_npm_packages.ts
│   ├── plugins.ts
│   └── processors.ts
├── _cms.ts
├── apps/
│   └── android/
│       └── app/
├── contracts/
├── plugins/
├── scripts/
├── src/
│   ├── _archetypes/
│   ├── _components/
│   ├── _includes/layouts/
│   ├── posts/
│   ├── tags/
│   ├── scripts/
│   ├── styles/
│   ├── utils/
│   ├── 404.page.tsx
│   ├── about.page.tsx
│   ├── index.page.tsx
│   ├── offline.page.tsx
│   └── style.scss
└── deno.json
```

## Content and Routing Model

### Pages

Route-level pages remain TSX modules. The primary routes are:

- `/`
- `/about/`
- `/posts/`
- `/tags/<slug>/`
- `/offline/`
- `/404.html`

Localized variants are generated under `/fr/`, `/zh-hans/`, and `/zh-hant/`.

The `/posts/` archive is rendered server-side as a year-grouped listing. When
multiple years are present, the page includes a built-in year jump navigation in
the HTML, so archive navigation does not depend on client-side JavaScript.

### Posts

Each post lives in `src/posts/<slug>/`:

- `_data.yml` stores metadata shared across languages
- `en.md`, `fr.md`, `zh-hans.md`, and `zh-hant.md` store localized frontmatter
  and Markdown body content

Shared post defaults live in `src/posts/_data.ts`, including `type = "post"`,
the TSX post layout, and JSON-LD defaults.

### Tags

Tag taxonomy pages are generated from post metadata. They live at
`/tags/<slug>/` and their localized equivalents, and they are rendered through
their own TSX layout.

### Multilingual Behavior

Lume’s `multilanguage` plugin provides the routing model:

- the same canonical slug is preserved across languages
- localized prefixes are applied at the route level
- `lang`, `hreflang`, and alternate URLs are resolved centrally through
  `src/utils/i18n.ts`

## Build Pipeline

### Site Bootstrap

`_config.ts` instantiates the Lume site with `src/` as the source directory and
`_site/` as the output directory. It also registers build hooks that:

- prepare `_quality/` before the build
- fingerprint CSS and JavaScript assets after the build
- verify browser-safe imports in generated output
- run the final broken-link check against the rewritten output

The supporting Deno utilities favor core runtime primitives for file I/O and
subprocesses, and use Deno std helpers for higher-level concerns such as CLI
argument parsing, recursive filesystem traversal, XML parsing, escaping, and
frontmatter extraction. Repo-local file reads should be anchored from the module
path with `import.meta.url` where appropriate instead of assuming the process
`cwd`.

### Shared App Contracts

The site build now produces a stable mobile-facing contract family in addition
to HTML and feeds:

- `/api/app-manifest.json`
- localized `/api/posts/index.json`
- localized `/api/posts/<slug>.json`

Those outputs are defined by the schemas in `contracts/` and validated through
`contracts/validate.ts`.

`scripts/sync-android-contract-assets.ts` mirrors the generated app-manifest,
localized indexes, and localized post-detail files into
`apps/android/app/src/main/assets/bootstrap/` so the Android app can bootstrap
from the same generated source of truth before remote refresh.

### Plugin Registration

`_config/plugins.ts` registers the main plugin stack:

- JSX rendering
- Carbon Sass compilation
- PostCSS and Lightning CSS
- localized feeds
- multilanguage routing
- navigation helpers
- Pagefind indexing
- HTML validation
- JSON-LD
- Prism highlighting
- app-contract generation through the repository’s content pipeline

### Assets, Feeds, and Processors

- `_config/assets.ts` defines the asset surface
- `_config/feeds.ts` emits localized RSS, Atom, and JSON feeds
- `_config/processors.ts` runs post-render processors, including editorial image
  checks, multilanguage data aliasing, and JSON Feed normalization

### Quality Reports

Quality artifacts are written to `_quality/`, separate from the Lume build
cache. The main reports are:

- `html-issues.json`
- `broken-links-pre-fingerprint.json` for production builds
- `broken-links.json`, the authoritative post-fingerprint link report

## Styling Architecture

The site uses a local Primer-inspired token system as its design foundation.

### Design-System Sources of Truth

Design-system guidance comes from two places:

- the local `--ph-*` token layer in `src/styles/primer/_theme-tokens.scss`
- the repository’s own layout and utility layers in `src/styles/_layout.scss`
  and `src/styles/_utilities.scss`

No exported design-token artifact is treated as authoritative.

### Token Model

- `src/styles/primer/_theme-tokens.scss` exposes the `--ph-*` custom properties
  used across the site
- `src/styles/_base.scss`, `src/styles/_layout.scss`, and
  `src/styles/_utilities.scss` consume those values directly
- new UI work should avoid inventing hard-coded values when an existing token
  already covers the need

### Sass and npm Integration

The active stylesheet is local Sass only. The repository still uses:

- `nodeModulesDir: "auto"` in `deno.json`
- `_config/materialize_sass_npm_packages.ts` to centralize Sass load paths for
  the Lume Sass plugin

This keeps the build predictable under Deno and Lume.

### CSS Entrypoint

`src/style.scss` composes the styling layers in order:

1. reset
2. tokens
3. base styles
4. layout styles
5. utilities

Typography relies on the local system font stacks exposed through
`src/styles/primer/_theme-tokens.scss`, and the build does not generate bundled
webfont assets.

## Client-Side Enhancements

Client-side JavaScript is strictly additive. The site remains readable without
it. The current enhancement layer includes:

- theme initialization and theme switching
- a unified header controller for disclosure controls, tooltips, theme
  switching, and lazy search initialization
- language preference persistence
- accessible search loading, retry, and result announcements
- code-block copy actions with explicit status feedback
- feed copy handling
- intent-based link prefetching
- service worker registration and first-use caching of Pagefind assets for
  offline search recovery

## Android Client Architecture

`apps/android` is the first native client implementation in the repository. It
consumes the generated app contracts rather than HTML pages or feeds.

### Android Runtime Shape

The Android app currently uses:

- Kotlin
- Jetpack Compose
- Material 3
- Hilt
- ViewModel + `StateFlow`
- `kotlinx.serialization`
- Room
- DataStore
- WorkManager
- Coil

The current package shape is feature-oriented inside `:app`:

```text
apps/android/app/src/main/java/re/phiphi/android/
├── MainActivity.kt
├── PhiphiApplication.kt
├── data/
│   ├── posts/
│   └── settings/
├── feature/
│   ├── archive/
│   ├── home/
│   ├── post/
│   └── settings/
└── ui/
    ├── components/
    ├── navigation/
    └── theme/
```

### Android Data Flow

The Android reader follows an offline-first structure:

1. generated site contracts are mirrored into Android bootstrap assets
2. Room is seeded from those assets on first use
3. repositories read from Room as the local source of truth
4. remote contract endpoints refresh manifest, index, and detail content back
   into Room
5. Compose screens observe `ViewModel` state built from repositories and
   preferences

Persistent user state is split deliberately:

- Room stores content bootstrap and refreshed contract data
- DataStore stores reader preferences, bookmarks, recent reading, and reading
  progress
- WorkManager schedules background content sync

This keeps the shared contract boundary independent from platform UI while still
allowing the Android app to behave like a native offline-capable reader.

## Search and Feeds

Search is powered by Pagefind and initialized lazily through
`src/scripts/header-client.js`. The UI keeps the search status surface under
project control so loading, empty, retry, and offline states can be announced
accessibly. The search container and panel also mirror busy state through
`aria-busy`. Post detail pages emit declarative Pagefind metadata for `tag` and
`year` filtering plus publish-date sorting, so the search index gains facets
without adding custom client-side filter state. The service worker caches
`/pagefind/*` resources on demand, which lets search recover offline after the
runtime and current-language index have been loaded once.

Feeds are emitted per language. RSS, Atom, and JSON outputs are generated in
`_config/feeds.ts`.

Feed item HTML is sourced from rendered post content, not raw Markdown.

Generated feeds and app JSON outputs are checked by `contracts/validate.ts`. RSS
and Atom validation is structural: the script parses XML and validates
feed-level elements against the actual document tree instead of scanning
substrings with regular expressions.

Implementation sources of truth:

- keep `description` in each localized Markdown frontmatter because it is reused
  in list cards and feed summaries
- keep shared post `url`, `date`, and `tags` in `src/posts/<slug>/_data.yml`
- if the site starts tracking real modification times later, map that field to
  feed `updated` metadata instead of synthesizing it

## LumeCMS

`_cms.ts` is configured for direct Markdown editing. The CMS edits:

- shared `_data.yml` metadata files
- localized Markdown post bodies

The archetype in `src/_archetypes/post.ts` remains the canonical way to create a
complete new post directory.

## Testing and Validation

The test suite is designed around invariants, not snapshots. It focuses on:

- TSX rendering contracts
- accessibility semantics
- utility functions
- Markdown post structure
- feed configuration
- build and pipeline helper scripts

The recommended validation sequence for a meaningful change is:

```sh
deno task check
deno task test
deno task build
```

Run `deno task validate-contracts` when your changes affect feeds or generated
JSON outputs.

## Architectural Invariants

1. Editorial post bodies remain Markdown, not TSX.
2. Pages, layouts, and reusable UI remain TSX.
3. Carbon documentation and official Carbon npm packages remain the
   design-system authority.
4. `src/styles/carbon/_theme-tokens.scss` remains the local bridge for the
   Carbon-backed custom properties used by the site.
5. Public URLs remain language-aware and stable.
6. Quality reports belong under `_quality/`, separate from the Lume build cache.
7. The authoritative broken-link check runs against final output, after asset
   fingerprinting.
8. The build may retain dormant code for future pipelines, but only active
   plugins should shape the published site.
9. Native clients consume generated contracts, not rendered HTML or feed output,
   as their application data boundary.
