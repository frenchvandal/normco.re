# normco.re — Personal Blog

This repository contains the source for [normco.re](https://normco.re), a
personal blog built with [Lume](https://lume.land) on top of Deno. The site uses
TypeScript templates, a layered CSS architecture, and a focused set of plugins
to keep the output fast, accessible, and easy to maintain.

The design system is inspired by
[Hugo PaperMod](https://github.com/adityatelange/hugo-PaperMod) and has been
fully migrated to Lume with TypeScript components and modern CSS.

## Highlights

- **Deno + Lume stack** with TypeScript-based pages, layouts, and components
- **PaperMod-inspired design** with dark/light theme toggle, smooth scrolling,
  and responsive layout
- **Layered CSS architecture** (tokens, base, utilities, components, layouts)
- **Markdown content** with table of contents, footnotes, alerts, and image
  enhancements
- **SEO tooling** (meta tags, JSON-LD, sitemap, OG image generation)
- **Feeds** (RSS + JSON with a custom XSL stylesheet)
- **Search** via Pagefind with keyboard shortcut (Cmd/Ctrl+K)
- **i18n** with Multilanguage plugin (English, French, Chinese)
- **Performance** through Lightning CSS minification and ESBuild bundling
- **Accessibility** with keyboard navigation, ARIA labels, and focus management
- **Offline support** via a service worker that caches core assets

## PaperMod Features

The following PaperMod features have been implemented:

- **Theme toggle** with system preference detection and localStorage persistence
- **Scroll-to-top button** with smooth scroll and reduced motion support
- **Code copy button** with visual feedback (success/error states)
- **Related posts** based on shared tags
- **Share buttons** (Twitter, Facebook, LinkedIn, WhatsApp, copy link)
- **Social icons** in footer (GitHub, Twitter, RSS, etc.)
- **Author profile** widget with avatar and bio
- **Cover images** with responsive srcsets (AVIF, WebP, JPG)
- **Draft indicators** for unpublished posts
- **Access key shortcuts** (h=home, a=archives, s=search)
- **Language selector** dropdown for multilingual content

## Project Structure

```
.
├── _cms.ts                 # Lume CMS configuration
├── _cms-fields.ts          # CMS field helpers
├── _config.ts              # Lume site configuration
├── plugins.ts              # Plugin definitions and build hooks
├── mod.ts                  # Exported site instance
├── deno.json               # Deno configuration and task definitions
├── src/                    # Site source files
│   ├── _archetypes/        # Content scaffolds for new pages/posts
│   ├── _components/        # Reusable TypeScript components
│   ├── _config/            # Site-specific constants
│   ├── _data/              # Data loaders and structured data
│   ├── _data.ts            # Global site data
│   ├── _includes/          # Layouts, partials, and CSS bundles
│   │   ├── css/             # ITCSS layers (tokens → layouts)
│   │   └── layouts/         # TypeScript layout templates
│   ├── _utilities/         # Helper utilities
│   ├── js/                 # Client-side scripts
│   ├── pages/              # Top-level pages
│   ├── posts/              # Blog posts (Markdown)
│   ├── 404.md              # Not-found page
│   ├── archive.page.ts     # Archive pagination generator
│   ├── archive-result.page.ts  # Tag/author archives
│   ├── feed-json-viewer.page.ts # Feed JSON viewer template
│   ├── index.page.ts       # Homepage template
│   ├── sw.page.ts          # Service worker entry (builds to /sw.js)
│   ├── styles.css          # CSS entry point
│   └── feed.xsl            # Feed stylesheet
├── tests/                  # Integration tests and shared fixtures
│   ├── fixtures/           # Shared DOM helpers and test utilities
│   └── integration/        # Cross-module integration tests
└── _site/                  # Build output (generated)
```

## Service Worker

The service worker (`src/sw.page.ts` → `/sw.js`) provides offline support and
faster repeat visits.

### Caching strategies

| Request type      | Strategy               | Rationale                                      |
| ----------------- | ---------------------- | ---------------------------------------------- |
| Navigation (HTML) | Network-first          | Fresh content when online, offline fallback    |
| CSS, JS           | Cache-first            | Consistent versioned assets                    |
| Images, fonts     | Stale-while-revalidate | Fast loads with background updates             |
| Pagefind, uploads | Stale-while-revalidate | Search and user content with background update |

### Pre-cached assets

At install time, the service worker pre-caches:

- All HTML pages (via `search.pages()`)
- Offline fallback page (`/offline/`)
- CSS and JavaScript files
- Fonts (`fonts/**/*`)
- Images (PNG, ICO, SVG, WebP)
- Uploaded content (`uploads/**/*`)
- Pagefind CSS and JS

### Additional features

- **Offline fallback**: Navigation failures show a cached offline page
- **Prefetch support**: Client can request prefetching via
  `postMessage({ type: "prefetch", urls: [...] })`

### Cache invalidation

The cache name includes the build version (git commit SHA or timestamp). When a
new version is deployed:

1. New service worker installs with fresh cache
2. Old caches are deleted on activation
3. Clients receive an `SW_UPDATED` message
4. A toast notification prompts users to refresh

### Registration

The service worker is registered in `src/js/main.js` with a query parameter
containing the build ID to ensure proper cache busting.

## Development

Install [Deno](https://deno.land) and run:

```bash
deno task serve
```

Build the site:

```bash
deno task build
```

Launch the local CMS UI:

```bash
deno task cms
```

## Testing

Unit tests are co-located with the code they validate, while integration tests
and fixtures live in `tests/`. Run the full test suite with read access (needed
for snapshot assertions):

```bash
DENO_TLS_CA_STORE=system deno test --allow-read
```

Update snapshots when intentional changes occur:

```bash
DENO_TLS_CA_STORE=system deno test --allow-read --allow-write -- --update
```

## Content Archetypes

The repo includes archetypes in `src/_archetypes/` to scaffold new content:

```bash
# Create a new blog post
deno task lume new post "My new post"

# Create a new static page
deno task lume new page "About"
```

## License

This project is licensed under the terms specified in the LICENSE file.
