# normco.re

Personal multilingual blog by Phiphi, built with [Deno](https://deno.com/) and
[Lume](https://lume.land/), and deployed as a static site to
[normco.re](https://normco.re).

## Overview

- Pages, layouts, and components are authored in TSX.
- Editorial post content is authored in Markdown.
- Styling is built on Carbon Design System v11 Sass tokens and components.
- The site is localized in English, French, Simplified Chinese, and Traditional
  Chinese.
- Deployment targets Alibaba Cloud OSS + CDN through GitHub Actions and OIDC.

## Tech stack

| Layer                 | Technology                               |
| --------------------- | ---------------------------------------- |
| Runtime               | Deno 2.7.5                               |
| Static site generator | Lume 3.2.1                               |
| Templating            | TSX for pages/layouts/components         |
| Post authoring        | Markdown in `src/posts/<slug>/{lang}.md` |
| Styling               | Carbon Sass via `@carbon/styles`         |
| CMS                   | LumeCMS                                  |
| Feeds                 | RSS 2.0 + JSON Feed 1.1 per language     |
| Deployment            | GitHub Actions + Alibaba Cloud OSS/CDN   |

## Getting started

```sh
git clone https://github.com/frenchvandal/normco.re.git
cd normco.re

# Optional: install git hooks
deno task lefthook:install

# Start the dev server
deno task serve
```

If your environment needs system CA certificates, prefix commands with
`DENO_TLS_CA_STORE=system`.

## Project structure

```text
.
├── _config.ts
├── _config/
│   ├── assets.ts
│   ├── feeds.ts
│   ├── plugins.ts
│   └── processors.ts
├── _cms.ts
├── contracts/
├── docs/
├── plugins/
├── scripts/
│   ├── check-browser-imports.ts
│   ├── fingerprint-assets.ts
│   ├── lint-commit.ts
│   ├── payload-policy.json
│   └── payload-report.ts
├── src/
│   ├── _archetypes/
│   │   └── post.ts
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
│   ├── feed.xsl
│   ├── sitemap.xsl
│   └── style.scss
├── AGENTS.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── GEMINI.md
├── deno.json
└── deno.lock
```

## Content model

### Posts

Each post lives in its own folder:

- `src/posts/<slug>/_data.yml` Shared metadata: `slug`, `id`, `date`, `url`,
  optional `tags`.
- `src/posts/<slug>/en.md`
- `src/posts/<slug>/fr.md`
- `src/posts/<slug>/zh-hans.md`
- `src/posts/<slug>/zh-hant.md`

Each language file contains:

- YAML frontmatter with `slug`, `lang`, `title`, `description`
- pure Markdown body content

Shared post defaults remain in [`src/posts/_data.ts`](./src/posts/_data.ts):

- `type = "post"`
- `layout = "layouts/post.tsx"`
- `jsonLd` article metadata

### Pages and layouts

Pages such as home, about, 404, offline, and the post archive remain authored in
`*.page.tsx`. Layouts remain TSX under `src/_includes/layouts/`.

### Multilingual behavior

Lume's `multilanguage` plugin links variants by shared `id` and preserves the
same slug across languages:

- English: `/posts/<slug>/`
- French: `/fr/posts/<slug>/`
- Simplified Chinese: `/zh-hans/posts/<slug>/`
- Traditional Chinese: `/zh-hant/posts/<slug>/`

## Authoring workflow

### Create a new post

Use the Lume archetype:

```sh
deno task lume new post "My Post Title" "A short description." design writing
```

This scaffolds:

- `src/posts/<slug>/_data.yml`
- `src/posts/<slug>/en.md`
- `src/posts/<slug>/fr.md`
- `src/posts/<slug>/zh-hans.md`
- `src/posts/<slug>/zh-hant.md`

### Edit a post

1. Update shared metadata in `_data.yml`.
2. Edit each language body in its Markdown file.
3. Keep URLs stable unless you deliberately want a route change.

### Images in posts

Store editorial images alongside the post, for example:

```text
src/posts/my-post/images/hero.png
```

Reference them relatively from Markdown:

```md
![Hero](./images/hero.png)
```

The build copies these assets and resolves localized URLs automatically.

### Markdown scanning rules

- Lume only scans `src/`, so repository docs outside `src/` are not published.
- Inside `src/`, any `.md` file can be picked up by Lume. Keep non-published
  helper Markdown files under `_`-prefixed names or ignored paths.

## LumeCMS

[`_cms.ts`](./_cms.ts) is configured for Markdown-native editing.

Collections:

- `post-metadata`: shared metadata in `src/posts/*/_data.yml`
- `posts-en`
- `posts-fr`
- `posts-zh-hans`
- `posts-zh-hant`

Behavior:

- CMS edits the production Markdown files directly.
- No Markdown-to-TSX conversion step exists anymore.
- Post images are uploaded under `src/posts/<slug>/images/` and referenced with
  relative paths from the Markdown body.

The archetype remains the canonical way to create a fully scaffolded new post.
The CMS is designed primarily for editing metadata and language content.

## Feeds and JSON outputs

The site emits four localized RSS and JSON feeds:

| Language            | RSS                 | JSON Feed            |
| ------------------- | ------------------- | -------------------- |
| English             | `/feed.xml`         | `/feed.json`         |
| French              | `/fr/feed.xml`      | `/fr/feed.json`      |
| Simplified Chinese  | `/zh-hans/feed.xml` | `/zh-hans/feed.json` |
| Traditional Chinese | `/zh-hant/feed.xml` | `/zh-hant/feed.json` |

Feed item `content_html` is generated from rendered post HTML via `=children`.

The repository still keeps `plugins/content-contract.ts`,
`contracts/post.schema.json`, and related validation code for a future
native-app/iOS pipeline, but that plugin is not registered in the active build.

## Common tasks

| Task          | Command                        | Description                                         |
| ------------- | ------------------------------ | --------------------------------------------------- |
| Build         | `deno task build`              | Production build into `_site/`                      |
| Serve         | `deno task serve`              | Local dev server with live reload                   |
| Check         | `deno task check`              | Type-check `.ts` and `.tsx` files                   |
| Test          | `deno task test`               | Run the test suite                                  |
| Lint docs     | `deno task lint:doc`           | Validate JSDoc comments                             |
| Test docs     | `deno task test:doc`           | Run inline JSDoc examples                           |
| Validate JSON | `deno task validate-contracts` | Validate feeds and optional content-contract output |
| Lint commit   | `deno task lint-commit`        | Validate Conventional Commit messages               |
| Install hooks | `deno task lefthook:install`   | Install Lefthook hooks                              |
| Update deps   | `deno task update-deps`        | Update pinned dependencies                          |

Recommended verification sequence after a non-trivial change:

```sh
deno fmt
deno lint
deno task check
deno task lint:doc
deno task test
deno task test:doc
deno task build
```

## Styling

The site uses Carbon Design System v11 Sass modules as the token source of
truth.

- Carbon token source: `src/styles/carbon/_theme-tokens.scss`
- Carbon grid: `src/styles/carbon/_grid.scss`
- Editorial aliases: `src/styles/editorial/_tokens.scss`
- Global entrypoint: `src/style.scss`

Do not introduce raw spacing or color values in UI code. Use Carbon tokens via
`var(--cds-*)` or Carbon Sass modules.

## Testing

Tests live alongside the source files they validate and focus on:

- TSX rendering invariants
- accessibility and structure
- utility logic
- Markdown post structure contracts
- feed configuration

Markdown post tests ensure that:

- every post lives in a slug folder
- each slug has `_data.yml`
- every supported language file exists
- legacy `src/posts/*.page.tsx` post modules are gone

## Deployment

GitHub Actions builds the site, assumes an Alibaba Cloud role through GitHub
OIDC, syncs `_site/` to OSS, and refreshes/preloads CDN paths.

The deployment article in
[`src/posts/alibaba-cloud-oss-cdn-deployment/en.md`](./src/posts/alibaba-cloud-oss-cdn-deployment/en.md)
documents the setup in more detail.

## Additional documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AGENTS.md](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md)
- [GEMINI.md](./GEMINI.md)
- [plugins/README.md](./plugins/README.md)

## License

See [LICENSE](./LICENSE).
