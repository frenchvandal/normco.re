# normco.re

normco.re is Phiphi's multilingual personal site. It is built with
[Deno](https://deno.com/) and [Lume](https://lume.land/), rendered with TSX
templates and Markdown content, styled with Carbon Design System v11 through the
official Carbon packages, and deployed as a static site to
[normco.re](https://normco.re).

## Overview

- Pages, layouts, and shared UI components live in TSX.
- Editorial post bodies live in Markdown under `src/posts/<slug>/`.
- Shared post metadata lives in `src/posts/<slug>/_data.yml`.
- The site is localized in English, French, Simplified Chinese, and Traditional
  Chinese.
- The UI is built on `@carbon/styles`.
- Carbon documentation and the installed Carbon npm packages are the
  authoritative design-system references.
- `src/styles/carbon/_theme-tokens.scss` exposes the Carbon-backed custom
  properties consumed by the site.
- The writing archive is grouped by year and exposes a server-rendered year jump
  navigation without relying on runtime JavaScript.
- Search exposes inline loading, retry, and result feedback with accessible
  status announcements.
- Repository utilities standardize on Deno core APIs plus Deno std helpers for
  CLI parsing, recursive filesystem traversal, XML validation, escaping, and
  frontmatter parsing.
- GitHub Actions builds the site and deploys it to Alibaba Cloud OSS and CDN by
  way of OIDC.

## Getting Started

```sh
git clone https://github.com/frenchvandal/normco.re.git
cd normco.re

# Optional: install git hooks
deno task lefthook:install

# Start the local development server
deno task serve
```

If your environment requires system CA certificates, prefix commands with
`DENO_TLS_CA_STORE=system`.

## Daily Commands

| Task          | Command                        | Notes                                                  |
| ------------- | ------------------------------ | ------------------------------------------------------ |
| Serve         | `deno task serve`              | Starts the local site and LumeCMS                      |
| Check         | `deno task check`              | Type-checks the codebase                               |
| Test          | `deno task test`               | Runs unit and integration tests                        |
| Build         | `deno task build`              | Builds `_site/` for production                         |
| Contracts     | `deno task validate-contracts` | Validates feeds structurally and optional JSON outputs |
| Install hooks | `deno task lefthook:install`   | Installs local Git hooks                               |
| Update deps   | `deno task update-deps`        | Updates pinned dependencies and the lockfile           |

Recommended verification for a nontrivial change:

```sh
deno fmt
deno task check
deno task test
deno task build
```

## Project Layout

```text
.
├── _config.ts
├── _config/
├── _cms.ts
├── contracts/
├── plugins/
├── scripts/
├── src/
│   ├── _archetypes/
│   ├── _components/
│   ├── _includes/layouts/
│   ├── posts/
│   │   └── <slug>/
│   │       ├── _data.yml
│   │       ├── en.md
│   │       ├── fr.md
│   │       ├── zh-hans.md
│   │       └── zh-hant.md
│   ├── tags/
│   ├── scripts/
│   ├── styles/
│   ├── utils/
│   ├── 404.page.tsx
│   ├── about.page.tsx
│   ├── index.page.tsx
│   ├── offline.page.tsx
│   └── style.scss
├── AGENTS.md
├── ARCHITECTURE.md
├── deno.json
└── deno.lock
```

## Content Model

### Posts

Each post lives in its own slug directory:

- `src/posts/<slug>/_data.yml` stores shared metadata such as `id`, `slug`,
  `date`, `url`, and optional `tags`
- `src/posts/<slug>/en.md`
- `src/posts/<slug>/fr.md`
- `src/posts/<slug>/zh-hans.md`
- `src/posts/<slug>/zh-hant.md`

Each language file contains frontmatter and a Markdown body. Shared defaults for
all posts remain in [src/posts/_data.ts](./src/posts/_data.ts).

### Pages and Taxonomies

Route-level pages remain TSX modules under `src/`:

- `/`
- `/about/`
- `/posts/`
- `/tags/<slug>/`
- `/offline/`
- `/404.html`

Localized routes follow the same structure under `/fr/`, `/zh-hans/`, and
`/zh-hant/`.

The `/posts/` archive is rendered as a year-grouped listing. When multiple years
are present, the page emits its year jump navigation directly in the HTML rather
than depending on a client-side enhancement.

### Feeds

The site emits localized RSS, Atom, JSON Feed, and HTML Microformats2 feeds:

- `/feed.rss`, `/feed.atom`, and `/feed.json`
- `/fr/feed.rss`, `/fr/feed.atom`, and `/fr/feed.json`
- `/zh-hans/feed.rss`, `/zh-hans/feed.atom`, and `/zh-hans/feed.json`
- `/zh-hant/feed.rss`, `/zh-hant/feed.atom`, and `/zh-hant/feed.json`
- `/posts/`, `/fr/posts/`, `/zh-hans/posts/`, and `/zh-hant/posts/` as the
  canonical localized `h-feed` archive routes
- `/tags/<slug>/` and localized tag routes as secondary `h-feed` listings

`src/_includes/layouts/base.tsx` also publishes the localized archive route as a
discoverable HTML feed with `rel="alternate"` and `type="text/mf2+html"`.

## Authoring Workflow

Create a new post with the Lume archetype:

```sh
deno task lume new post "My Post Title" "A short description." design writing
```

That command scaffolds the shared metadata file and all four localized Markdown
files.

When editing an existing post:

1. Update shared metadata in `_data.yml`.
2. Edit each language body in its Markdown file.
3. Keep public URLs stable unless a route change is intentional.

Editorial images should live alongside the post, for example:

```text
src/posts/my-post/images/hero.png
```

Then reference them from Markdown with relative paths.

## Styling and UI

The site uses Carbon Design System v11 Sass modules as its design-system
foundation.

- Design-system authority: official Carbon documentation and installed Carbon
  npm packages
- Local theme bridge: `src/styles/carbon/_theme-tokens.scss`
- Editorial aliases: `src/styles/editorial/_tokens.scss`
- Global stylesheet entrypoint: `src/style.scss`

When a Carbon token already exists, do not introduce new hard-coded spacing,
color, or typography values in UI code. Prefer `var(--cds-*)` or Carbon Sass
modules.

Interactive UI is intentionally narrow and explicit:

- Header icon actions expose tooltips for search, language, and theme.
- Search keeps a dedicated status surface under project control, including
  loading, empty, retry, and offline feedback.
- Code blocks in posts remain editorial `pre > code` blocks, enhanced only by a
  lightweight copy action when JavaScript is available.

## Quality Gates

The production build runs several checks in sequence:

- HTML validation
- browser-safe import validation
- broken-link validation against final output after asset fingerprinting

Feed and JSON contract validation is also available separately through
`deno task validate-contracts`. The RSS and Atom checks parse XML structurally
instead of relying on tag-matching regexes.

Generated quality artifacts live under `_cache/quality/`, which is ignored by
Git. The key reports are:

- `_cache/quality/html-issues.json`
- `_cache/quality/broken-links.json`
- `_cache/quality/broken-links-pre-fingerprint.json` for production builds

## Deployment

The `site` GitHub Actions workflow builds the site, assumes an Alibaba Cloud
role using GitHub OIDC, syncs `_site/` to OSS, and refreshes or preloads CDN
paths. The workflow inherits the build-time quality gates, so a failing build or
link check blocks deployment.

The deployment walkthrough in
[src/posts/alibaba-cloud-oss-cdn-deployment/en.md](./src/posts/alibaba-cloud-oss-cdn-deployment/en.md)
documents the infrastructure in more detail.

## Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AGENTS.md](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md)
- [GEMINI.md](./GEMINI.md)
- [docs/mobile-clients.md](./docs/mobile-clients.md)
- [docs/mobile-content-api.md](./docs/mobile-content-api.md)
- [docs/mobile-phase-0.md](./docs/mobile-phase-0.md)
- [plugins/README.md](./plugins/README.md)

## License

See [LICENSE](./LICENSE).
