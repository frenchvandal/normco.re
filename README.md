# normco.re

A minimalist personal blog by Phiphi, based in Chengdu, China. Built with
[Deno](https://deno.com/) and [Lume](https://lume.land/), authored entirely in
ESM TypeScript, and deployed as a static site to [normco.re](https://normco.re).

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Development Workflow](#development-workflow)
7. [Authoring Content](#authoring-content)
8. [Configuration](#configuration)
9. [Styling](#styling)
10. [Testing](#testing)
11. [Tooling](#tooling)
12. [Observability](#observability)
13. [Deployment](#deployment)
14. [Design Principles](#design-principles)

---

## Overview

normco.re is a personal blog focused on software, tools, language, and everyday
life. The site has no comments, no analytics, and no newsletter — just writing.

The project is intentionally narrow in scope: every architectural decision
favors simplicity, type safety, and long-term maintainability over feature
breadth. Content is written in TypeScript rather than Markdown, styles are
written in modern CSS rather than a framework, and the only runtime is Deno.

The site is fully multilingual: posts and pages are available in English,
French, Simplified Chinese, and Traditional Chinese, each with dedicated feeds
and localized routes.

---

## Tech Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Runtime    | [Deno](https://deno.com/) 2.7.5 (version pinned in `.tool-versions`)  |
| SSG        | [Lume](https://lume.land/) 3.2.1                                      |
| Templating | TSX + TypeScript (`*.page.tsx`, `*.tsx` layouts and components)       |
| Styling    | Modern CSS (`src/style.css` entrypoint + `src/styles/*.css` partials) |
| Feeds      | RSS 2.0 and JSON Feed 1.1 (per language: en, fr, zh-hans, zh-hant)    |
| i18n       | Lume `multilanguage` plugin (4 languages)                             |
| Testing    | Deno's built-in test runner with `@std/testing/bdd`                   |
| Git hooks  | [Lefthook](https://github.com/evilmartians/lefthook)                  |
| Deployment | Alibaba Cloud OSS + CDN (via GitHub Actions OIDC workflow)            |

---

## Prerequisites

- **Deno** 2.7.5 — install via [asdf](https://asdf-vm.com/) with the
  `.tool-versions` file, or follow the
  [official installation guide](https://docs.deno.com/runtime/getting_started/installation/).

  ```sh
  asdf install
  ```

- **Lefthook** (optional, recommended) — manages Git hooks for formatting,
  linting, and commit-message validation. Install once after cloning:

  ```sh
  deno install --global --allow-all --name lefthook npm:lefthook
  lefthook install
  ```

  Alternatively, install via Deno task (no global install required):

  ```sh
  deno task lefthook:install
  ```

  Or via Homebrew (`brew install lefthook`) or Go
  (`go install github.com/evilmartians/lefthook@latest`).

> **Note:** If you encounter TLS/certificate issues (for example behind a
> corporate proxy), prefix Deno commands with `DENO_TLS_CA_STORE=system`. On
> most personal setups, this is not required.

---

## Getting Started

```sh
# Clone the repository
git clone https://github.com/frenchvandal/normco.re.git
cd normco.re

# (Optional) Install Lefthook for Git hooks
deno task lefthook:install

# Start the development server
DENO_TLS_CA_STORE=system deno task serve
```

The development server starts at `http://localhost:3000` and rebuilds
automatically on file changes.

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── site.yml          # GitHub Actions: build and deploy to Alibaba Cloud OSS/CDN
├── scripts/
│   ├── fingerprint-assets.ts # Post-build asset fingerprinting + service-worker graph version
│   ├── lint-commit.ts        # Conventional Commits validator
│   └── md-to-tsx.ts          # Converts LumeCMS Markdown drafts to .page.tsx
├── src/
│   ├── _archetypes/
│   │   └── post.ts           # Post archetype for LumeCMS
│   ├── _components/          # Reusable UI components (used via comp.*, never direct import)
│   │   ├── Footer.tsx
│   │   ├── Footer_test.ts
│   │   ├── Header.tsx
│   │   ├── Header_test.ts
│   │   ├── PostCard.tsx
│   │   └── PostCard_test.ts
│   ├── _data.ts              # Site-wide shared data (lang, metas)
│   ├── _includes/
│   │   └── layouts/
│   │       ├── _base_test.ts
│   │       ├── _post_test.ts
│   │       ├── base.tsx              # Root HTML shell layout
│   │       └── post.tsx              # Individual post layout
│   ├── posts/
│   │   ├── _data.ts          # Post-scoped defaults (type = "post", layout = "layouts/post.tsx")
│   │   ├── post-metadata.ts  # Shared post metadata helpers
│   │   ├── index.page.tsx    # Archive page (/posts/)
│   │   └── *.page.tsx        # Individual posts
│   ├── 404.page.tsx
│   ├── about.page.tsx
│   ├── feed.xsl              # XSLT stylesheet for RSS/Atom feeds
│   ├── index.page.tsx        # Home page (/)
│   ├── offline.page.tsx      # Offline fallback page (/offline/)
│   ├── sitemap.xsl           # XSLT stylesheet for the sitemap
│   ├── scripts/
│   │   ├── anti-flash.js         # Pre-paint theme bootstrap
│   │   ├── feed-copy.js          # Feed URL copy helper
│   │   ├── language-preference.js # Language preference selector
│   │   ├── sw-register.js        # Service-worker registration
│   │   ├── sw.js                 # Service worker source (emitted as /sw.js)
│   │   └── theme-toggle.js       # Theme toggle behavior
│   ├── style.css             # CSS entrypoint (imports layered partials)
│   ├── styles/               # Layered partials (reset/base/layout/components/utilities)
│   └── utils/
│       ├── i18n.ts           # Language tag and locale helpers
│       ├── slugify.ts        # Slug normalization utility
│       └── xml-stylesheet.ts # Maps XML output URLs to their XSLT stylesheets
├── plugins/
│   ├── console_debug.ts      # Shared LUME_LOGS-driven console debug policy
│   └── otel.ts               # Lume plugin for OpenTelemetry build observability
├── _cms.ts                   # Lume CMS configuration
├── .gitignore
├── .tool-versions            # Pins Deno version (used by asdf)
├── AGENTS.md                 # Project guidelines and conventions (source of truth)
├── CLAUDE.md                 # Compatibility copy of project guidelines
├── LICENSE
├── _config.ts                # Lume site configuration (plugins, processing, feeds)
├── deno.json                 # Deno manifest: import map, tasks, compiler options
├── deno.lock                 # Dependency lock file
├── favicon.png
```

### Source directory (`src/`)

All content, layouts, components, and static assets live in `src/`. Lume reads
from this directory and writes the built site to `_site/` (git-ignored).

### Private files (prefixed with `_`)

Files and directories prefixed with `_` are Lume conventions:

- `_includes/` — layouts and partials, not emitted as pages.
- `_components/` — reusable components, available globally via the `comp`
  variable.
- `_data.ts` — data files whose exports are merged into page data at their
  scope.

---

## Development Workflow

The mandatory sequence before finalizing any change:

```sh
# 1. Format all source files
DENO_TLS_CA_STORE=system deno fmt

# 2. Lint TypeScript and JavaScript
DENO_TLS_CA_STORE=system deno lint

# 3. Type-check the entire project
DENO_TLS_CA_STORE=system deno task check

# 4. Lint JSDoc comments
DENO_TLS_CA_STORE=system deno task lint:doc

# 5. Run the test suite
DENO_TLS_CA_STORE=system deno test

# 6. Run JSDoc documentation tests
DENO_TLS_CA_STORE=system deno task test:doc

# 7. Build the site (when rendering or structure is affected)
DENO_TLS_CA_STORE=system deno task build
```

Commit messages are validated automatically by the Lefthook `commit-msg` hook.
To validate manually:

```sh
DENO_TLS_CA_STORE=system deno task lint-commit
```

### Available tasks

| Task               | Command                      | Description                                    |
| ------------------ | ---------------------------- | ---------------------------------------------- |
| `build`            | `deno task build`            | Production build into `_site/`                 |
| `serve`            | `deno task serve`            | Dev server at `localhost:3000` (live reload)   |
| `check`            | `deno task check`            | Type-check all `.ts`/`.tsx` files              |
| `lint:doc`         | `deno task lint:doc`         | Lint JSDoc comments                            |
| `test:doc`         | `deno task test:doc`         | Run inline JSDoc documentation tests           |
| `lint-commit`      | `deno task lint-commit`      | Validate the last commit message               |
| `md-to-tsx`        | `deno task md-to-tsx`        | Convert LumeCMS Markdown drafts to `.page.tsx` |
| `lefthook:install` | `deno task lefthook:install` | Install Lefthook Git hooks via `deno x`        |
| `update-deps`      | `deno task update-deps`      | Update Lume and regenerate `deno.lock`         |

---

## Authoring Content

### Writing a new post

All posts are TypeScript files using Lume's page format. Create a new file in
`src/posts/` with a `.page.tsx` extension:

```ts
// src/posts/my-new-post.page.tsx

export const title = "My New Post";
export const date = new Date("2026-03-06");
export const tags = ["software", "tools"];

export default (_data: Lume.Data, _helpers: Lume.Helpers) =>
  `<p>The post body goes here. Use template literals to compose HTML.</p>`;
```

The `layout` and `type` fields are inherited from `src/posts/_data.ts` and do
not need to be redeclared.

TSX uses `children` in layouts (instead of `content`) and favors `comp.*`
component resolution in templates for better live-reload behavior.

**Do not use Markdown** (`.md`) for new content. All posts and pages must be TSX
(`*.page.tsx`).

### Reading time

The post layout computes and displays reading time automatically, based on 238
words per minute (Brysbaert et al., 2019). No manual configuration is required.

### Multilingual content

The site supports four languages: **English** (`en`), **French** (`fr`),
**Simplified Chinese** (`zh-hans`), and **Traditional Chinese** (`zh-hant`).
Language variants are managed by the Lume `multilanguage` plugin. Each post can
export per-language overrides using the language code as the export key (or the
camelCase alias `zhHans`/`zhHant` for hyphenated codes):

```ts
export const title = "My Post"; // English (default)
export const fr = { title: "Mon article" };
export const zhHans = { title: "我的文章" };
export const zhHant = { title: "我的文章" };
```

Localized routes follow the pattern `/{lang}/posts/{slug}/` for non-English
languages.

### Feeds

RSS and JSON feeds are generated automatically from posts by the Lume `feed`
plugin, one set per language:

| Language            | RSS                 | JSON Feed            |
| ------------------- | ------------------- | -------------------- |
| English             | `/feed.xml`         | `/feed.json`         |
| French              | `/fr/feed.xml`      | `/fr/feed.json`      |
| Simplified Chinese  | `/zh-hans/feed.xml` | `/zh-hans/feed.json` |
| Traditional Chinese | `/zh-hant/feed.xml` | `/zh-hant/feed.json` |

---

## Configuration

### `_config.ts` — Lume site configuration

The central Lume configuration file. Key settings:

| Setting          | Value                | Notes                                    |
| ---------------- | -------------------- | ---------------------------------------- |
| Source directory | `./src`              |                                          |
| Output directory | `./_site`            | Git-ignored; do not edit generated files |
| Production URL   | `https://normco.re`  |                                          |
| Pretty URLs      | `true`               | `/about/` instead of `/about.html`       |
| Reading metrics  | `readingInfo` plugin | Word count, reading minutes, and pages   |

**Active plugins:**

| Plugin          | Purpose                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| `jsx`           | Enables TSX/JSX rendering for pages, layouts, and components               |
| `terser`        | Minifies client-side JavaScript                                            |
| `postcss`       | Resolves CSS partial imports (`@import`) into one bundle                   |
| `lightningcss`  | The single CSS minifier (plus modern browser targets)                      |
| `purgecss`      | Removes unused selectors based on rendered pages                           |
| `sourceMaps`    | Generates source maps for processed CSS and JS assets                      |
| `attributes`    | HTML attribute helpers in templates                                        |
| `icons`         | On-demand SVG icon fetching (Octicons catalog)                             |
| `inline`        | Replaces `<img inline>` tags with inline SVG                               |
| `date`          | Date formatting (e.g., `"SHORT"` → `"MMM d"`) with locale support          |
| `readingInfo`   | Computes word count and reading time via `Intl.Segmenter`                  |
| `sitemap`       | Generates `/sitemap.xml`                                                   |
| `robots`        | Generates `/robots.txt` with explicit disallow rules                       |
| `multilanguage` | Per-language URL prefixes and data overrides (en, fr, zh-hans, zh-hant)    |
| `nav`           | Navigation tree for previous/next post links                               |
| `validateHtml`  | Validates generated HTML against html-validate recommended/document rules  |
| `checkUrls`     | Detects broken internal links and hash anchors; fails the build on errors  |
| `jsonLd`        | Renders `<script type="application/ld+json">` from page data               |
| `seo`           | Reports common SEO issues in the Lume debug bar                            |
| `prism`         | Syntax highlighting for fenced code blocks (grammars preloaded explicitly) |
| `feed`          | Generates RSS 2.0 and JSON Feed 1.1 (one set per language)                 |

### Client-side JavaScript assets

Client-side behavior is authored as standalone JavaScript assets in
`src/scripts/` instead of inline string literals inside layouts or `*.page.tsx`
files. Lume registers these files directly with `site.add(...)` and emits them
as first-class assets during `deno task build` and `deno task serve`:

| Source                                | Emitted path                       | Purpose                               |
| ------------------------------------- | ---------------------------------- | ------------------------------------- |
| `src/scripts/theme-toggle.js`         | `/scripts/theme-toggle.js`         | Light/dark theme toggle               |
| `src/scripts/anti-flash.js`           | `/scripts/anti-flash.js`           | Pre-paint theme bootstrap             |
| `src/scripts/language-preference.js`  | `/scripts/language-preference.js`  | Language selector                     |
| `src/scripts/feed-copy.js`            | `/scripts/feed-copy.js`            | Feed URL copy helper                  |
| `src/scripts/disclosure-controls.js`  | `/scripts/disclosure-controls.js`  | Mobile menu, search, and modal state  |
| `src/scripts/link-prefetch-intent.js` | `/scripts/link-prefetch-intent.js` | Intent-based link prefetch            |
| `src/scripts/archive-year-nav.js`     | `/scripts/archive-year-nav.js`     | Archive year navigation controls      |
| `src/scripts/pagefind-lazy-init.js`   | `/scripts/pagefind-lazy-init.js`   | Deferred Pagefind UI initialization   |
| `src/scripts/sw-register.js`          | `/scripts/sw-register.js`          | Service-worker registration bootstrap |
| `src/scripts/sw.js`                   | `/sw.js`                           | Service-worker module entrypoint      |
| `src/scripts/sw-core.js`              | `/sw-core.js`                      | Service-worker cache/runtime core     |
| `src/scripts/sw-lifecycle.js`         | `/sw-lifecycle.js`                 | Service-worker install/activate flow  |
| `src/scripts/sw-routing.js`           | `/sw-routing.js`                   | Service-worker request routing        |
| `src/scripts/sw-module.js`            | `/sw-module.js`                    | Service-worker module bundle helper   |
| `src/scripts/sw-classic.js`           | `/sw-classic.js`                   | Classic fallback service worker       |

All scripts are minified in production via the `terser` plugin.

### `deno.json` — Deno manifest

Defines the import map, Deno tasks, and TypeScript compiler options. All
external imports must be declared here under `imports`; bare specifiers are
never used in source files.

**Compiler options beyond `strict: true`:**

| Option                       | Effect                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `noUncheckedIndexedAccess`   | Adds `\| undefined` to every indexed access                   |
| `exactOptionalPropertyTypes` | Distinguishes missing properties from `undefined`-valued ones |
| `verbatimModuleSyntax`       | Enforces `import type` for type-only imports                  |
| `noFallthroughCasesInSwitch` | Catches missing `break` statements                            |
| `noImplicitOverride`         | Requires `override` keyword on overriding methods             |
| `noImplicitReturns`          | Ensures all code paths return a value                         |

### `_cms.ts` — Lume CMS

Configures the optional [Lume CMS](https://lume.land/cms/) for visual content
editing. Not required for local development. CMS-generated Markdown drafts must
be converted to `.page.tsx` before opening a PR:

```sh
DENO_TLS_CA_STORE=system deno task md-to-tsx
```

---

## Styling

Styles are organized with a CUBE CSS/ITCSS-inspired structure: one entrypoint
(`src/style.css`) plus layered partials in `src/styles/` (`reset`, `base`,
`layout`, `components`, `utilities`).

The build pipeline uses `postcss` (imports), `purgecss` (dead selector removal),
and `lightningcss` as the **single CSS minifier** and target-aware optimizer.

The current visual system is **Primer-inspired**, implemented locally through
project tokens and components. The site does not import `@primer/css` globally
or use `@primer/react` at runtime.

### Cascade layers

Styles are organized into five explicit cascade layers, in ascending
specificity:

```css
@layer reset, base, layout, components, utilities;
```

### Design tokens

All colors, spacing, and typography values are defined as CSS custom properties
at `:root`. Colors use `oklch()` for perceptually uniform representation and
wide-gamut support:

```css
:root {
  --color-bg: light-dark(oklch(97% …), oklch(11% …));
  --color-text: light-dark(oklch(14% …), oklch(88% …));
  --color-accent: light-dark(oklch(42% …), oklch(70% …));
}
```

**Spacing scale** (`--space-xs` through `--space-2xl`), **fluid type scale**
(`--text-xs` through `--text-2xl` via `clamp()`), and a **reading measure**
(`--measure: 68ch`) are all defined as tokens.

### Theming

Light and dark modes use Primer-compatible HTML attributes: `data-color-mode`,
`data-light-theme`, and `data-dark-theme` on `<html>`. For backward
compatibility, `data-color-scheme` is also set. The bootstrap script
(`src/scripts/anti-flash.js`) reads `localStorage` (`color-mode`, with legacy
fallback to `color-scheme`) and applies the resolved mode before first paint.

### Icons

The UI uses the Octicons catalog (via the Lume `icons` plugin). Icons are
fetched on demand from jsDelivr CDN at build time and inlined as SVG through the
`inline` plugin (`fill: currentColor`). The `icons()` helper is available in all
templates via `helpers.icon("octicons", "name", "variant")`.

### Accessibility in CSS

The stylesheet explicitly handles:

- `prefers-reduced-motion` — disables animations
- `prefers-contrast: more` — increases contrast ratios
- `prefers-reduced-transparency` — removes alpha values
- `forced-colors` — respects Windows High Contrast mode
- `prefers-color-scheme` — native light/dark support as a fallback
- `@view-transition { navigation: auto }` — smooth page transitions

---

## Testing

Tests use Deno's built-in runner with BDD-style grouping from
`@std/testing/bdd`.

```sh
DENO_TLS_CA_STORE=system deno test
```

### File placement

Unit tests live alongside the source file they test, named with a `_test.ts`
suffix (e.g., `Header.tsx` → `Header_test.ts`). Integration tests and fixtures
belong in `tests/`.

### What is tested

| Code type      | Strategy                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| Utilities      | Highest priority: pure logic (sorting, grouping, URLs, formatting, fallbacks) |
| Components     | Rendered HTML contracts: semantics, accessibility, variants, critical attrs   |
| Layouts/Pages  | Targeted integration checks for critical routes and `<head>` metadata         |
| Client JS      | Behavior tested separately from TSX template rendering                        |
| JSDoc examples | Run as documentation tests via `deno test --doc`                              |

### TSX testing policy (Lume)

- Test **behavioral invariants**, not full HTML dumps.
- Prefer DOM/structure assertions over brittle full-string comparisons.
- Avoid massive snapshots; reserve small snapshots for stable critical
  fragments.
- Not every TSX file needs a dedicated test: prioritize files with conditional
  logic, SEO/accessibility impact, broad reuse, or high regression risk.

### Coverage

```sh
DENO_TLS_CA_STORE=system deno test --coverage
DENO_TLS_CA_STORE=system deno coverage --html
```

---

## Tooling

### Markdown-to-TSX conversion (`scripts/md-to-tsx.ts`)

Converts LumeCMS-generated Markdown drafts in `src/posts/*.md` to the
`.page.tsx` format required for production. Run this before opening a PR when
content was drafted via the CMS:

```sh
DENO_TLS_CA_STORE=system deno task md-to-tsx
```

### Commit-message linting (`scripts/lint-commit.ts`)

A standalone script that validates commit messages against the
[Conventional Commits](https://www.conventionalcommits.org/) specification,
mirroring the rules of `@commitlint/config-conventional`.

**Allowed types:** `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`,
`refactor`, `revert`, `style`, `test`

**Rules enforced:**

- Header maximum 100 characters
- Type must be lowercase and from the allowed list
- Subject must not end with a period
- Scope must be lowercase
- Body must be separated from header by a blank line

Exit code `0` = valid; exit code `1` = one or more errors.

```sh
# Validate the last commit (reads .git/COMMIT_EDITMSG)
DENO_TLS_CA_STORE=system deno task lint-commit

# Validate an arbitrary file
DENO_TLS_CA_STORE=system deno task lint-commit path/to/COMMIT_EDITMSG
```

### Git hooks — Lefthook (`lefthook.yml`)

Install once after cloning (three equivalent options):

```sh
# Option A — via Deno task (no global install required)
deno task lefthook:install

# Option B — via Deno global install
deno install --global --allow-all --name lefthook npm:lefthook
lefthook install

# Option C — via Homebrew or Go
brew install lefthook          # macOS
go install github.com/evilmartians/lefthook@latest
lefthook install
```

| Hook         | Command                            | Scope                     |
| ------------ | ---------------------------------- | ------------------------- |
| `pre-commit` | `deno fmt --check` (parallel)      | `*.{ts,tsx,js,jsx,css,…}` |
| `pre-commit` | `deno lint` (parallel)             | `*.{ts,tsx,js,jsx}`       |
| `commit-msg` | `deno task lint-commit <msg-file>` | all commits               |

### Dependency management

```sh
# Update Lume and regenerate deno.lock
DENO_TLS_CA_STORE=system deno task update-deps
```

Commit `deno.lock` only when `deno.json` dependencies change in the same commit.
Do not add new dependencies unless explicitly required.

---

## Observability

The project integrates with [OpenTelemetry](https://opentelemetry.io/) through
Deno's runtime instrumentation plus the custom
[`plugins/otel.ts`](./plugins/otel.ts) Lume plugin.

Outside Deno Deploy, runtime telemetry is opt-in and requires `OTEL_DENO=true`.
On Deno Deploy, OpenTelemetry integration is enabled by the platform, and the
plugin automatically runs in production mode (`mode: "auto"` resolves to
`"production"` when Deploy runtime markers are present).

### Build observability (`plugins/otel.ts`)

The plugin instruments build and update lifecycle events:

| Signal    | Name                  | Description                                 |
| --------- | --------------------- | ------------------------------------------- |
| Trace     | `lume.build`          | Span covering a full build/update lifecycle |
| Histogram | `lume.build.duration` | Build/update duration in milliseconds       |
| Counter   | `lume.build.count`    | Number of completed build/update operations |

In development mode, the plugin can also record recent requests and route
counters in the Lume debug bar.

### Local OTLP JSON inspection

For local inspection without a full observability stack, use an OTLP HTTP JSON
endpoint and run the standard `serve` task:

```sh
OTEL_DENO=true OTEL_SERVICE_NAME=normcore \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/json \
DENO_TLS_CA_STORE=system deno task serve
```

When enabled, request/build diagnostics are emitted with `console.table()` and
linked to active spans.

### Development server observability

When telemetry is enabled, Deno automatically instruments `Deno.serve`:

- **HTTP traces** — one span per request
- **`http.server.request.duration`** — request duration histogram
- **`http.server.active_requests`** — in-flight request gauge
- **Request/response size metrics** — collected by runtime instrumentation

### Environment variables

Common variables used in local/self-hosted environments:

| Variable                      | Typical value           | Notes                                                   |
| ----------------------------- | ----------------------- | ------------------------------------------------------- |
| `OTEL_DENO`                   | `true`                  | Enables Deno OTEL runtime instrumentation               |
| `OTEL_SERVICE_NAME`           | `normcore`              | Service/resource name for spans and metrics             |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | OTLP collector endpoint                                 |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/json`             | Recommended locally for readable payload inspection     |
| `OTEL_METRIC_EXPORT_INTERVAL` | e.g. `60000`            | Optional runtime-controlled metric export interval (ms) |

Deploy runtime markers (`DENO_DEPLOY`, `DENO_DEPLOYMENT_ID`) are set by Deno
Deploy and are used by the plugin to auto-select production behavior.

---

## Deployment

The site is deployed to Alibaba Cloud OSS (with CDN refresh) on every push to
`master`.

**Pipeline (`.github/workflows/site.yml`):**

1. Check out the repository (full history).
2. Set up Deno from `.tool-versions`, with caching enabled.
3. Run `deno task build` to produce `_site/`.
4. Assume an Alibaba Cloud role through GitHub OIDC.
5. Sync `_site/` to OSS and trigger CDN refresh.

The production site is served from `https://normco.re`. No server-side runtime
is involved; the output is static HTML, CSS, JavaScript, and feed artifacts.

---

## Design Principles

### Refined Minimalism / Swiss Design

The site's identity is defined by typography, whitespace, and content quality —
not by decorative elements. Fewer elements, higher impact.

### Typography over decoration

- **System fonts only** — no external web fonts
- Fluid type scale via `clamp()` for responsive sizing without breakpoints
- Hierarchy through weight, size, and letter-spacing — not through color or
  decoration
- Reading measure capped at `68ch` for optimal line length

### Modern CSS first

Native CSS now covers cascade layers, custom properties, container queries, the
`light-dark()` function, `oklch()` colors, view transitions, and scroll-driven
animations. This project uses all of them; SCSS is not in use.

### TSX + TypeScript everywhere

Pages, layouts, and components are authored in TSX + TypeScript; data/config
files remain TypeScript. Alternative template engines (Nunjucks, Vento, etc.)
are fallbacks of last resort.

### Zero `any`, no non-null assertions

The TypeScript compiler is set to maximum strictness. `any` is forbidden without
a documented suppression comment; non-null assertions (`!`) are never used.
`unknown` with explicit narrowing is the correct approach.

### Functional core, imperative shell

Business logic — date formatting, reading-time calculation, feed generation —
lives in pure functions without side effects. Side effects are isolated to
Lume's processing pipeline and the thin client-side JavaScript for the theme
toggle.

---

## License

See [LICENSE](./LICENSE).
