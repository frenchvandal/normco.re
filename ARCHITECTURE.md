# Architecture

normco.re is a static, multilingual editorial site built with Deno and Lume. Its
architecture keeps content, presentation, and build concerns distinct while
letting the site ship as plain static output.

## System Overview

```text
shared post metadata + localized Markdown bodies
                    +
TSX pages, layouts, and shared components
                    +
Lume plugins, processors, and post-build scripts
                    =
localized HTML, feeds, assets, search indexes, and deployment artifacts
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
- OpenTelemetry debug instrumentation

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

The site uses Carbon Design System v11 as its design-system foundation.

### Design-System Sources of Truth

Carbon guidance comes from two places:

- the official Carbon documentation
- the installed Carbon npm packages, especially `@carbon/styles`

Within this repository, `src/styles/carbon/_theme-tokens.scss` is the local
bridge that exposes the Carbon-backed custom properties consumed by the site. No
exported design-token artifact is treated as authoritative.

### Token Model

- `src/styles/carbon/_theme-tokens.scss` exposes the Carbon-backed custom
  properties used in the site
- `src/styles/editorial/_tokens.scss` provides project-level aliases layered on
  top of those values
- new UI work should avoid inventing hard-coded values when a Carbon token
  already exists

### Sass and npm Integration

Carbon Sass is consumed from `@carbon/styles`. Because Dart Sass resolves bare
package imports from a materialized `node_modules` tree, the repository uses:

- `nodeModulesDir: "auto"` in `deno.json`
- `_config/materialize_sass_npm_packages.ts` to expose Carbon Sass load paths to
  the Lume Sass plugin

This keeps the site aligned with the official Carbon packages while remaining
compatible with Deno and Lume.

### CSS Entrypoint

`src/style.scss` composes the styling layers in order:

1. Carbon and editorial tokens
2. reset and base styles
3. layout styles
4. component styles
5. utilities

Typography relies on the Carbon-backed system font stacks exposed through
`src/styles/carbon/_theme-tokens.scss`. Chinese pages use language-targeted
system CJK fallback stacks instead of bundled webfonts, and the build no longer
generates `styles/fonts.css` or `/fonts/*` assets.

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
`_config/feeds.ts`. HTML feeds use Microformats2 directly in the TSX and string
templates:

- localized `/posts/` archives are the canonical `h-feed` routes
- localized tag listings also expose `h-feed`
- shared post cards emit `h-entry` for listing contexts
- post detail pages emit a full `h-entry` with `e-content`

Feed item HTML is sourced from rendered post content, not raw Markdown.

Generated feeds and optional JSON outputs are checked by
`contracts/validate.ts`. RSS and Atom validation is structural: the script
parses XML and validates feed-level elements against the actual document tree
instead of scanning substrings with regular expressions.

### Microformats2 Mapping

The homepage’s recent-writing section also exposes an `h-feed`, but the
discoverable and canonical HTML feed target remains the localized `/posts/`
archive.

`src/_includes/layouts/base.tsx` publishes the localized archive route with:

```html
<link rel="alternate" type="text/mf2+html" href="/posts/">
```

and the language-specific equivalent for the active page.

Feed-level properties:

- `h-feed`: route-level listing container
- `p-name`: visible listing heading
- `u-url`: canonical listing URL
- `p-author h-card`: hidden localized author link to `/about/`

Entry-level properties:

- `h-entry`: shared post card and individual post layout
- `p-name`: post title
- `u-url u-uid`: canonical permalink
- `dt-published`: published date
- `p-summary`: localized frontmatter description
- `e-content`: rendered post HTML on detail pages
- `p-category`: post tags
- `p-author h-card`: localized author link

Implementation sources of truth:

- site author and localization rules: `src/_data.ts` and `src/utils/i18n.ts`
- shared mf2 modules: `src/mf2/`
- shared list entry markup: `src/_components/PostCard.tsx`
- feed containers: `src/index.page.tsx`, `src/posts/index.page.tsx`, and
  `src/_includes/layouts/tag.tsx`
- full entry markup: `src/_includes/layouts/post.tsx`

Authoring implications:

- keep `description` in each localized Markdown frontmatter because it is reused
  as `p-summary`
- keep shared post `url`, `date`, and `tags` in `src/posts/<slug>/_data.yml`
- if the site starts tracking real modification times later, map that field to
  `dt-updated` in the post layout instead of synthesizing it

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
