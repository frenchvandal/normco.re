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

---

## Tech Stack

| Layer      | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Runtime    | [Deno](https://deno.com/) 2.7.4 (version pinned in `.tool-versions`) |
| SSG        | [Lume](https://lume.land/) 3.2.1                                     |
| Templating | ESM + TypeScript (`*.page.ts`, `*.ts` layouts and components)        |
| Styling    | Modern CSS (`style.css`, processed by Lightning CSS)                 |
| Feeds      | RSS 2.0 and JSON Feed 1.1                                            |
| Testing    | Deno's built-in test runner with `@std/testing/bdd`                  |
| Git hooks  | [Lefthook](https://github.com/evilmartians/lefthook)                 |
| Deployment | GitHub Pages (via GitHub Actions)                                    |

---

## Prerequisites

- **Deno** 2.7.4 — install via [asdf](https://asdf-vm.com/) with the
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

  Alternatively: `brew install lefthook` (macOS) or
  `go install github.com/evilmartians/lefthook@latest`.

> **Important:** Set the environment variable `DENO_TLS_CA_STORE=system` before
> every Deno CLI command, especially in corporate or proxy environments. All
> tasks below assume this variable is set.

---

## Getting Started

```sh
# Clone the repository
git clone https://github.com/frenchvandal/normco.re.git
cd normco.re

# (Optional) Install Lefthook for Git hooks
deno install --global --allow-all --name lefthook npm:lefthook
lefthook install

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
│       └── site.yml          # GitHub Actions: build and deploy to GitHub Pages
├── scripts/
│   └── lint-commit.ts        # Conventional Commits validator
├── src/
│   ├── _components/          # Reusable UI components (used via comp.*, never direct import)
│   │   ├── Footer.ts
│   │   ├── Footer_test.ts
│   │   ├── Header.ts
│   │   ├── Header_test.ts
│   │   ├── PostCard.ts
│   │   └── PostCard_test.ts
│   ├── _data.ts              # Site-wide shared data (lang, metas)
│   ├── _includes/
│   │   └── layouts/
│   │       ├── _anti-flash.ts        # Inline script to prevent theme flash on load
│   │       ├── _anti-flash_test.ts
│   │       ├── _base_test.ts
│   │       ├── _post_test.ts
│   │       ├── base.ts               # Root HTML shell layout
│   │       └── post.ts               # Individual post layout
│   ├── posts/
│   │   ├── _data.ts          # Post-scoped defaults (type = "post", layout = "layouts/post.ts")
│   │   ├── index.page.ts     # Archive page (/posts/)
│   │   └── *.page.ts         # Individual posts
│   ├── 404.page.ts
│   ├── about.page.ts
│   ├── feed.xsl              # XSLT stylesheet for RSS/Atom feeds
│   ├── feeds.page.ts         # Syndication hub (/feeds/)
│   ├── index.page.ts         # Home page (/)
│   ├── sitemap.xsl           # XSLT stylesheet for the sitemap
│   ├── style.css             # Main stylesheet (~870 lines, modern CSS)
│   └── theme-toggle.page.ts  # Client-side theme toggle script (/theme-toggle.js)
├── plugins/
│   └── otel.ts               # Lume plugin for OpenTelemetry build observability
├── .cms.ts                   # Lume CMS configuration
├── .gitignore
├── .tool-versions            # Pins Deno version (used by asdf)
├── CLAUDE.md                 # Project guidelines and conventions (source of truth)
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

# 6. Build the site (when rendering or structure is affected)
DENO_TLS_CA_STORE=system deno task build
```

Commit messages are validated automatically by the Lefthook `commit-msg` hook.
To validate manually:

```sh
DENO_TLS_CA_STORE=system deno task lint-commit
```

### Available tasks

| Task          | Command                 | Description                                  |
| ------------- | ----------------------- | -------------------------------------------- |
| `build`       | `deno task build`       | Production build into `_site/`               |
| `serve`       | `deno task serve`       | Dev server at `localhost:3000` (live reload) |
| `check`       | `deno task check`       | Type-check all `.ts`/`.tsx` files            |
| `lint:doc`    | `deno task lint:doc`    | Lint JSDoc comments                          |
| `lint-commit` | `deno task lint-commit` | Validate the last commit message             |
| `update-deps` | `deno task update-deps` | Update Lume and regenerate `deno.lock`       |

---

## Authoring Content

### Writing a new post

All posts are TypeScript files using Lume's page format. Create a new file in
`src/posts/` with a `.page.ts` extension:

```ts
// src/posts/my-new-post.page.ts

export const title = "My New Post";
export const date = new Date("2026-03-06");
export const tags = ["software", "tools"];

export default (_data: Lume.Data, _helpers: Lume.Helpers) =>
  `<p>The post body goes here. Use template literals to compose HTML.</p>`;
```

The `layout` and `type` fields are inherited from `src/posts/_data.ts` and do
not need to be redeclared.

**Do not use Markdown** (`.md`) for new content. All posts and pages must be
TypeScript (`*.page.ts`).

### Reading time

The post layout computes and displays reading time automatically, based on 238
words per minute (Brysbaert et al., 2019). No manual configuration is required.

### Feeds

RSS and JSON feeds are generated automatically from posts tagged with
`type = "post"` by the Lume `feed` plugin. The feeds are available at:

- RSS/Atom: `/feed.xml`
- JSON Feed 1.1: `/feed.json`

A syndication hub listing all feed endpoints is available at `/feeds/`.

---

## Configuration

### `_config.ts` — Lume site configuration

The central Lume configuration file. Key settings:

| Setting          | Value               | Notes                                    |
| ---------------- | ------------------- | ---------------------------------------- |
| Source directory | `./src`             |                                          |
| Output directory | `./_site`           | Git-ignored; do not edit generated files |
| Production URL   | `https://normco.re` |                                          |
| Pretty URLs      | `true`              | `/about/` instead of `/about.html`       |
| Reading speed    | 238 wpm             | Brysbaert et al., 2019                   |

**Active plugins:**

| Plugin          | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `lightningcss`  | Minifies CSS; targets modern browsers             |
| `sourceMaps`    | Generates source maps for the minified stylesheet |
| `attributes`    | HTML attribute helpers in templates               |
| `date`          | Date formatting (e.g., `"SHORT"` → `"MMM d"`)     |
| `sitemap`       | Generates `/sitemap.xml` and `/robots.txt`        |
| `nav`           | Navigation tree for previous/next post links      |
| `codeHighlight` | Syntax highlighting for fenced code blocks        |
| `feed`          | Generates RSS 2.0 and JSON Feed 1.1               |

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

### `.cms.ts` — Lume CMS

Configures the optional [Lume CMS](https://lume.land/cms/) for visual content
editing. Not required for local development.

---

## Styling

All styles live in `src/style.css` (~870 lines of modern CSS). No CSS
preprocessor is used; Lightning CSS handles minification and vendor prefixes at
build time.

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

Light and dark modes are implemented with the native `light-dark()` function and
toggled via a `data-color-scheme` attribute on `<html>`. A small inline script
(`_anti-flash.ts`) reads `localStorage` and applies the saved preference before
first paint, eliminating the flash-of-incorrect-theme.

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
suffix (e.g., `Header.ts` → `Header_test.ts`). Integration tests and fixtures
belong in `tests/`.

### What is tested

| Code type      | Strategy                                           |
| -------------- | -------------------------------------------------- |
| Components     | Structure, accessibility, variants, edge cases     |
| Layouts        | Rendered HTML structure, data propagation          |
| Pages          | Hero content, dynamic sections, fallback behavior  |
| Utilities      | Edge cases with `describe`/`it` and `assertEquals` |
| JSDoc examples | Run as documentation tests via `deno test --doc`   |

### Coverage

```sh
DENO_TLS_CA_STORE=system deno test --coverage
DENO_TLS_CA_STORE=system deno coverage --html
```

---

## Tooling

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

The project integrates with [OpenTelemetry](https://opentelemetry.io/) via
Deno's built-in support. Observability is opt-in: set `OTEL_DENO=true` to
activate it. Without that variable, all instrumentation is a no-op with
negligible overhead.

### Build observability

The `plugins/otel.ts` Lume plugin instruments the static build pipeline:

| Signal    | Name                  | Description                    |
| --------- | --------------------- | ------------------------------ |
| Trace     | `lume.build`          | Span covering the full build   |
| Histogram | `lume.build.duration` | Build duration in milliseconds |
| Counter   | `lume.build.count`    | Number of builds completed     |

To run with telemetry enabled, keep using the standard tasks (`build` or
`serve`) and configure OpenTelemetry through environment variables.

### Local JSON inspection (no LGTM stack required)

For local development, set `OTEL_EXPORTER_OTLP_PROTOCOL=http/json`. When this
protocol is active, the plugin prints one structured build record per build in
the terminal (`console.table` + raw JSON), so you can inspect trace IDs, span
IDs, duration, and timestamps directly.

```sh
OTEL_DENO=true OTEL_SERVICE_NAME=normcore \
OTEL_EXPORTER_OTLP_PROTOCOL=http/json \
DENO_TLS_CA_STORE=system deno task serve
```

### Development server observability

When running the dev server with `OTEL_DENO=true`, Deno automatically
instruments the underlying `Deno.serve` instance:

- **HTTP traces** — a span per request with method, URL, and status code
- **`http.server.request.duration`** — request duration histogram
- **`http.server.active_requests`** — in-flight request gauge
- **Logs** — all `console.*` output is forwarded to the OTLP endpoint

### Configuration

All configuration is done through standard OpenTelemetry environment variables:

| Variable                      | Default      | Description                                  |
| ----------------------------- | ------------ | -------------------------------------------- |
| `OTEL_DENO`                   | `true`       | Enable the integration                       |
| `OTEL_SERVICE_NAME`           | `lume build` | Service name in all signals                  |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/json`  | Exporter protocol (`http/json` for local DX) |
| `OTEL_METRIC_EXPORT_INTERVAL` | `60000`      | Metric flush interval (ms)                   |

---

## Deployment

The site is deployed to [GitHub Pages](https://pages.github.com/) automatically
on every push to `master`.

**Pipeline (`.github/workflows/site.yml`):**

1. Check out the repository (full history).
2. Set up Deno from `.tool-versions`, with caching enabled.
3. Run `deno task build` to produce `_site/`.
4. Upload `_site/` as a GitHub Pages artifact.
5. Deploy to GitHub Pages.

The site is served from `https://normco.re`. No server-side runtime is involved;
the output is entirely static HTML, CSS, and JavaScript.

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

### TypeScript everywhere

All pages, layouts, data files, and components are TypeScript. Template engines
(Nunjucks, Vento, JSX) are fallbacks of last resort and are not currently used.

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
