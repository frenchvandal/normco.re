# Architecture

normco.re is a static, multilingual editorial site built with Deno and Lume. The
architecture separates three concerns clearly:

- TSX for pages, layouts, and UI components
- Markdown for post bodies
- build-time processors/plugins for feeds, assets, validation, and localization

## High-level model

```text
Markdown post bodies + shared YAML metadata
            +
TSX layouts, pages, and components
            +
Lume plugins/processors
            =
localized static HTML, feeds, assets, and search index
```

## Source map

```text
normco.re/
├── _config.ts
├── _config/
│   ├── assets.ts
│   ├── feeds.ts
│   ├── plugins.ts
│   └── processors.ts
├── _cms.ts
├── contracts/
│   ├── feed.schema.json
│   ├── post.schema.json
│   └── validate.ts
├── plugins/
│   ├── console_debug.ts
│   ├── content-contract.ts
│   └── otel.ts
├── scripts/
├── src/
│   ├── _archetypes/post.ts
│   ├── _components/
│   ├── _includes/layouts/
│   ├── posts/
│   │   ├── _data.ts
│   │   ├── index.page.tsx
│   │   ├── post-metadata.ts
│   │   └── <slug>/
│   │       ├── _data.yml
│   │       ├── en.md
│   │       ├── fr.md
│   │       ├── zh-hans.md
│   │       └── zh-hant.md
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

## Rendering model

### Pages and layouts

- Route-level pages remain `*.page.tsx`.
- Layouts remain TSX under `src/_includes/layouts/`.
- Components remain TSX under `src/_components/`.
- Lume's JSX plugin renders these templates to static HTML.

### Posts

Each post is a directory:

- `src/posts/<slug>/_data.yml` Shared metadata for all languages.
- `src/posts/<slug>/<lang>.md` Localized frontmatter and Markdown body.

Shared defaults for all posts live in
[`src/posts/_data.ts`](./src/posts/_data.ts):

- `type = "post"`
- `layout = "layouts/post.tsx"`
- JSON-LD article data

This keeps the editorial authoring surface simple while preserving TSX-based
presentation and layout logic.

### Multilingual behavior

The active build follows Lume's recommended `multilanguage` model for
multilingual content:

- one file per language
- same shared `id`
- same canonical slug across languages
- localized prefixes handled by the plugin

Routes:

- `/posts/<slug>/`
- `/fr/posts/<slug>/`
- `/zh-hans/posts/<slug>/`
- `/zh-hant/posts/<slug>/`

## Build pipeline

1. `_config.ts` initializes the site with `src/` as source and `_site/` as
   destination.
2. `_config/plugins.ts` registers the Lume plugin set: JSX, multilanguage,
   feeds, Pagefind, Prism, validation, JSON-LD, and other build helpers.
3. `_config/assets.ts` registers scripts, styles, and editorial image
   extensions.
4. Markdown files under `src/posts/<slug>/` are rendered through the shared TSX
   post layout.
5. `_config/processors.ts` runs post-render processors such as editorial image
   checks and font preload injection.
6. `_config/feeds.ts` emits multilingual RSS and JSON feeds, using rendered
   `children` HTML for feed content.
7. Post-build scripts fingerprint assets and verify browser-safe imports.

## Feeds and JSON contracts

### Active outputs

The active build emits localized feeds only:

- `/feed.xml` and `/feed.json`
- `/fr/feed.xml` and `/fr/feed.json`
- `/zh-hans/feed.xml` and `/zh-hans/feed.json`
- `/zh-hant/feed.xml` and `/zh-hant/feed.json`

`content_html` is populated from rendered HTML, not raw Markdown or source code.

### Inactive but retained

The repository still contains:

- `plugins/content-contract.ts`
- `contracts/post.schema.json`
- `contracts/validate.ts`

These remain for a future native-app/iOS content pipeline, but the
content-contract plugin is not registered in the active build.

`deno task validate-contracts` therefore validates:

- current JSON feeds
- optional `/api/posts/*.json` output only if that plugin is re-enabled later

## LumeCMS model

`_cms.ts` is configured for direct Markdown editing:

- `post-metadata`: shared `_data.yml` files
- `posts-en`
- `posts-fr`
- `posts-zh-hans`
- `posts-zh-hant`

Images uploaded from Markdown fields are stored under the corresponding post
folder, typically `src/posts/<slug>/images/`, and referenced with relative
paths.

The archetype in `src/_archetypes/post.ts` is the canonical way to scaffold a
complete new post folder. The CMS is optimized for editing metadata and
localized Markdown content.

## CSS architecture

The design system is Carbon v11, expressed through Sass modules and CSS custom
properties.

Key layers:

- `src/styles/carbon/_theme-tokens.scss`
- `src/styles/carbon/_grid.scss`
- `src/styles/editorial/_tokens.scss`
- `src/styles/_reset.scss`
- `src/styles/_base.scss`
- `src/styles/_layout.scss`
- `src/styles/components/*.scss`
- `src/styles/_utilities.scss`

Global entrypoint: `src/style.scss`

Invariants:

- no raw spacing/color values in UI code
- Carbon tokens are the source of truth
- project-specific aliases sit on top of Carbon tokens, not beside them

## Client-side JavaScript

Client-side scripts are opt-in enhancements emitted as first-class assets:

- theme bootstrap and toggle
- disclosure/menu/search controls
- language preference persistence
- feed copy helper
- intent-based link prefetch
- Pagefind lazy initialization
- service worker registration
- code-block copy enhancement

The site remains functional without JavaScript.

## Testing strategy

The test suite prioritizes:

- TSX rendering invariants
- accessibility semantics
- utility behavior
- Markdown post structure
- feed configuration

The Markdown contract test ensures that:

- every post lives in a slug directory
- shared metadata exists in `_data.yml`
- all four language Markdown files exist
- no legacy `src/posts/*.page.tsx` post modules remain

## Architectural invariants

1. Post content is Markdown, not TSX.
2. Presentation remains TSX.
3. Slugs and public URLs stay stable across languages.
4. Carbon Sass tokens remain the UI source of truth.
5. The active build emits feeds; the content-contract plugin is retained but
   inactive.
6. Lume only scans `src/`, so repo documentation outside `src/` is not part of
   the published site.
