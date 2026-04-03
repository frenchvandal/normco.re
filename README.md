# normco.re

normco.re is Phiphi's multilingual personal site. It is built with
[Deno](https://deno.com/) and [Lume](https://lume.land/), rendered with TSX
templates and Markdown content, styled with a local `--ph-*` token system plus
route-scoped Ant Design blog islands, and deployed as a static site to
[normco.re](https://normco.re).

## Overview

- Pages, layouts, and shared UI components are authored in TypeScript, with the
  rendered site shell and reusable UI expressed in TSX.
- Editorial post bodies live in Markdown under `src/posts/<slug>/`.
- Shared post metadata lives in `src/posts/<slug>/_data.yml`.
- Build processors enrich each localized post with Git-derived created and
  updated dates, plus a last-commit link, whenever full repository history is
  available.
- The site is localized in English, French, Simplified Chinese, and Traditional
  Chinese.
- The UI is built on a local `--ph-*` token layer in
  `src/styles/antd/theme-tokens.css`.
- The visual direction is Swiss editorial with restrained monochrome surfaces,
  one blue accent family, generous whitespace, and Ant Design reserved for the
  interactive blog surfaces.
- The stylesheet entrypoint is `src/style.css`, which composes the site's five
  cascade layers (`tokens`, `reset`, `base`, `layout`, `utilities`) while
  importing the generated Ant Design bridge and component modules into that
  ordered pipeline.
- The writing archive is enhanced by a route-split Ant Design client with a
  timeline and month navigator rather than duplicating the home page.
- Search exposes inline loading, retry, and result feedback with accessible
  status announcements, plus Pagefind-backed `tag` and `year` facets on post
  detail pages.
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

| Task             | Command                                     | Notes                                                                   |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Serve            | `deno task serve`                           | Starts the local site and LumeCMS                                       |
| Check            | `deno task check`                           | Type-checks the codebase                                                |
| Test             | `deno task test`                            | Runs unit and integration tests                                         |
| Coverage         | `deno task test:coverage`                   | Collects coverage data under `.tmp/deno-coverage`                       |
| Coverage summary | `deno task coverage:summary`                | Prints the latest coverage summary                                      |
| Coverage HTML    | `deno task coverage:html`                   | Generates browsable HTML from the latest coverage run                   |
| Doc tests        | `deno task test:doc`                        | Runs JSDoc examples as executable documentation tests                   |
| Design guard     | `deno task design:guard`                    | Blocks normalized UI literals outside tokenized paths                   |
| Typography guard | `deno task typography:guard`                | Fails on smart quotes/apostrophes in Markdown/comments                  |
| Lint commit      | `deno task lint-commit .git/COMMIT_EDITMSG` | Validates a commit message with `@miscellaneous/commitlint`             |
| Validate         | `deno task validate`                        | Runs both guards, check, test, and build                                |
| Build            | `deno task build`                           | Builds `_site/` for production                                          |
| Contracts        | `deno task validate-contracts`              | Validates feeds structurally and optional JSON outputs                  |
| Android assets   | `deno task android:sync-contract-assets`    | Builds site contracts and mirrors Android bootstrap assets              |
| Payload report   | `deno task payload:report`                  | Reports route-level JS and CSS from generated output                    |
| Install hooks    | `deno task lefthook:install`                | Installs local Git hooks                                                |
| Regenerate locks | `deno task locks:regen`                     | Rebuilds the root and frontend `deno.lock` files from the current graph |
| Update deps      | `deno task update-deps`                     | Updates pinned dependencies, then normalizes both lockfiles via regen   |

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
├── apps/
│   └── android/
├── contracts/
├── plugins/
├── scripts/
├── src/
│   ├── _archetypes/
│   ├── blog/client/
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
│   │   └── components/
│   ├── utils/
│   │   └── i18n/
│   ├── 404.page.tsx
│   ├── about.page.tsx
│   ├── index.page.tsx
│   ├── offline.page.tsx
│   └── style.css
├── AGENTS.md
├── ARCHITECTURE.md
├── deno.jsonc
└── deno.lock
```

## Content Model

### Posts

Each post lives in its own slug directory:

- `src/posts/<slug>/_data.yml` stores shared metadata such as the stable `id`,
  `date`, `url`, and optional `tags`
- `src/posts/<slug>/en.md`
- `src/posts/<slug>/fr.md`
- `src/posts/<slug>/zh-hans.md`
- `src/posts/<slug>/zh-hant.md`

Each language file contains frontmatter and a Markdown body. Shared defaults for
all posts remain in [src/posts/_data.ts](./src/posts/_data.ts).

### Pages and Taxonomies

Route-level pages are TypeScript entry modules under `src/` and render through
TSX layouts:

- `/`
- `/about/`
- `/posts/`
- `/tags/<slug>/`
- `/offline/`
- `/404.html`

Localized routes follow the same structure under `/fr/`, `/zh-hans/`, and
`/zh-hant/`.

The `/posts/` archive is rendered from TSX and enhanced by a small route-scoped
Ant Design client bundle that adds the timeline and month navigation UI. Shared
archive grouping and formatting logic lives in `src/blog/archive-common.ts` so
the SSR renderer and client views stay aligned.

### Feeds

The site emits localized RSS, Atom, and JSON feeds:

- `/rss.xml`, `/atom.xml`, and `/feed.json`
- `/fr/rss.xml`, `/fr/atom.xml`, and `/fr/feed.json`
- `/zh-hans/rss.xml`, `/zh-hans/atom.xml`, and `/zh-hans/feed.json`
- `/zh-hant/rss.xml`, `/zh-hant/atom.xml`, and `/zh-hant/feed.json`

`src/_includes/layouts/base.tsx` publishes the localized RSS, Atom, and JSON
feed endpoints via standard `rel="alternate"` links in the document head.

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

If a legacy post is still missing a shared `id`, run:

```sh
deno task posts:fix-ids
```

That task writes UUID v7 values into post `_data.yml` files that still lack an
explicit `id`.

Editorial images should live alongside the post, for example:

```text
src/posts/my-post/images/hero.png
```

Then reference them from Markdown with relative paths.

## Styling and UI

The site uses a local `--ph-*` token layer for the global shell and Ant Design
for the interactive blog client bundles.

- Design-system authority: the local `--ph-*` token system and the site's core
  layout layer
- Local theme bridge: `src/styles/antd/theme-tokens.css`
- Generated Ant Design bridge: `src/styles/generated/antd-components.css`
- Component layout modules: `src/styles/components/*.css`
- Shell layout implementation: `src/styles/layout.css`
- Global stylesheet entrypoint: `src/style.css`
- Frontend React/Ant Design config: `src/blog/client/deno.json`
- Public i18n module: `src/utils/i18n.ts`, backed by `src/utils/i18n/`

When a local token already exists, do not introduce new hard-coded spacing,
color, or typography values in UI code. Prefer `var(--ph-*)`.

Deno resolves npm packages for the repo from its global cache. The root and
frontend configs both use `nodeModulesDir: "none"`, so local `node_modules`
folders are not part of the normal workflow.

In production builds, Lume runs Lightning CSS before PurgeCSS. PurgeCSS is
configured with an explicit safelist for ARIA/data-state selectors, Pagefind
runtime classes, and the small set of site-specific state classes that are only
visible after hydration.

Interactive UI is intentionally narrow and explicit:

- Header icon actions expose tooltips for search, language, and theme.
- Search keeps a dedicated status surface under project control, including
  loading, empty, retry, and offline feedback.
- Post pages expose declarative Pagefind metadata for `tag`, `year`, and
  publish-date sorting without adding custom client-side search state.
- The service worker caches `/pagefind/*` assets on first use so search can
  recover cleanly while offline after the runtime has been loaded once.
- Code blocks in posts remain editorial `pre > code` blocks, enhanced only by a
  lightweight copy action when JavaScript is available.
- Shiki handles fenced-code highlighting with GitHub's default light and dark
  themes. Ant Design is used for interactive blog surfaces, not syntax
  highlighting.

## Quality Gates

The production build runs several checks in sequence:

- HTML validation
- browser-safe import validation
- broken-link validation against final output after asset fingerprinting

Feed and JSON contract validation is also available separately through
`deno task validate-contracts`. The RSS and Atom checks parse XML structurally
instead of relying on tag-matching regexes.

Generated quality artifacts live under `_quality/`, which is ignored by Git and
kept separate from the Lume build cache. The key reports are:

- `_quality/html-issues.json`
- `_quality/broken-links.json`
- `_quality/broken-links-pre-fingerprint.json` for production builds

## Deployment

The `site` GitHub Actions workflow builds the site, assumes an Alibaba Cloud
role using GitHub OIDC, syncs `_site/` to OSS, and refreshes or preloads CDN
paths. The workflow inherits the build-time quality gates, so a failing build or
link check blocks deployment. The checkout step intentionally keeps
`fetch-depth: 0` so the build can resolve per-file Git creation dates, update
timestamps, and commit links in CI.

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
- [docs/android-roadmap.md](./docs/android-roadmap.md)
- [plugins/README.md](./plugins/README.md)

## License

See [LICENSE](./LICENSE).
