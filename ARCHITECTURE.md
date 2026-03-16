# Architecture

normco.re is a static, multilingual editorial site built with Deno and Lume. The
architecture keeps content, presentation, and build concerns separate:

- Markdown for editorial post bodies
- TSX for pages, layouts, and shared UI components
- build-time plugins and scripts for localization, feeds, assets, validation,
  and search

## System overview

```text
shared post metadata + localized Markdown bodies
                    +
TSX pages, layouts, and components
                    +
Lume plugins, processors, and post-build scripts
                    =
localized HTML, feeds, assets, search indexes, and deployment artifacts
```

## Source tree

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
├── docs/
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

## Content and routing model

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
multiple years are present, the page includes a local year jump navigation in
the HTML so archive navigation does not depend on runtime JavaScript.

### Posts

Each post is a directory under `src/posts/<slug>/`:

- `_data.yml` contains shared metadata for all languages
- `en.md`, `fr.md`, `zh-hans.md`, and `zh-hant.md` contain localized frontmatter
  and Markdown body content

Shared post defaults live in `src/posts/_data.ts`, including `type = "post"`,
the TSX post layout, and JSON-LD defaults.

### Tags

Tag taxonomy pages are generated from the tags declared in post metadata. They
live at `/tags/<slug>/` and localized equivalents, and they are rendered through
their own TSX layout.

### Multilingual behavior

Lume's `multilanguage` plugin provides the routing model:

- the same canonical slug is preserved across languages
- localized prefixes are applied at the route level
- `lang`, `hreflang`, and page alternates are resolved centrally through
  `src/utils/i18n.ts`

## Build pipeline

### Site bootstrap

`_config.ts` instantiates the Lume site with `src/` as the source directory and
`_site/` as the output directory. It also registers build hooks that:

- prepare `_cache/quality/` before the build
- fingerprint CSS and JavaScript assets after the build
- verify browser-safe imports in generated output
- run the final broken-link check against the rewritten output

### Plugin registration

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

### Assets, feeds, and processors

- `_config/assets.ts` defines the asset surface
- `_config/feeds.ts` emits localized RSS and JSON feeds
- `_config/processors.ts` runs post-render processors, including editorial image
  checks and font preload injection

### Quality reports

Quality artifacts are written to `_cache/quality/`, not the repository root. The
notable reports are:

- `html-issues.json`
- `broken-links-pre-fingerprint.json` for production builds
- `broken-links.json`, the authoritative post-fingerprint link report

## Styling architecture

The site uses Carbon Design System v11 as its design-system foundation.

### Token model

- `src/styles/carbon/_theme-tokens.scss` is the local token source of truth
- `src/styles/editorial/_tokens.scss` provides project-level aliases layered on
  top of Carbon tokens
- raw values are not introduced in UI code

### Sass and npm integration

Carbon Sass is consumed from `@carbon/styles`. Because Dart Sass resolves bare
package imports from a materialized `node_modules` tree, the repo uses:

- `nodeModulesDir: "auto"` in `deno.json`
- `_config/materialize_sass_npm_packages.ts` to expose Carbon Sass load paths to
  the Lume Sass plugin

This arrangement is intentional. It keeps Carbon as the source of truth while
remaining compatible with Deno and Lume.

### CSS entrypoint

`src/style.scss` composes the styling layers in order:

1. Carbon and editorial tokens
2. reset and base styles
3. layout styles
4. component styles
5. utilities

Fonts are served locally through the Lume `google_fonts` plugin and loaded from
the generated `styles/fonts.css`.

## Client-side enhancements

Client-side JavaScript is strictly additive. The site remains readable without
it. The current enhancement layer includes:

- theme initialization and theme switching
- disclosure controls for the header, language menu, and search panel
- Carbon-style header tooltips for search, language, and theme actions
- language preference persistence
- Pagefind lazy initialization
- accessible search loading and retry status updates backed by `aria-busy`
- code-block copy feedback
- feed copy handling
- intent-based link prefetching
- service worker registration

## Search and feeds

Search is powered by Pagefind and initialized lazily through
`src/scripts/pagefind-lazy-init.js`. The UI keeps the search status surface
under project control so loading, empty, retry, and offline states can be
announced accessibly. The search container and panel also mirror busy state with
`aria-busy`, while the visible status line exposes an inline loading indicator.

Feeds are emitted per language. Feed item HTML is sourced from rendered post
content, not raw Markdown.

## LumeCMS

`_cms.ts` is configured for direct Markdown editing. The CMS edits:

- shared `_data.yml` metadata files
- localized Markdown post bodies

The archetype in `src/_archetypes/post.ts` remains the canonical way to create a
complete new post directory.

## Testing and validation

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
deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .
```

## Architectural invariants

1. Editorial post bodies remain Markdown, not TSX.
2. Pages, layouts, and reusable UI remain TSX.
3. Carbon tokens remain the source of truth for UI styling.
4. Public URLs remain language-aware and stable.
5. Quality reports belong under `_cache/quality/`, not the repository root.
6. The authoritative broken-link check runs against final output, after asset
   fingerprinting.
7. The build may retain dormant code for future pipelines, but only active
   plugins should shape the published site.
