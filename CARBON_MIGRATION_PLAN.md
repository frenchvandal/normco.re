# Carbon Design System Migration — Audit & Plan

## Overview

Complete audit of the normco.re repository covering the Carbon Design System
migration, architecture refactoring, and monorepo transformation. This document
replaces the previous handoff/Telegram-focused migration plan.

---

## 1. Current state audit

### 1.1. Contradictions and inconsistencies

| Issue                                                                            | File(s)                                                 | Impact                                                             | Recommendation                                                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md` §6.3 mandates "system fonts only" but project uses IBM Plex (Carbon) | `CLAUDE.md`, `src/style.css`                            | **Blocking** — mutually exclusive goals                            | Update `CLAUDE.md` to authorize IBM Plex as Carbon exception                                                                       |
| Google Fonts CDN used (`@import url("https://fonts.googleapis.com/...")`)        | `src/style.css:8`                                       | **Blocking** — violates "serve locally" constraint                 | Migrate to Lume `google_fonts` plugin for local hosting                                                                            |
| `@carbon/web-components@2.50.0` in `deno.json`                                   | `deno.json`                                             | **Contradictory** — constraint says "no Carbon npm components"     | Remove npm Carbon dependency; implement everything locally                                                                         |
| Legacy Primer aliases still present in CSS tokens                                | `src/styles/tokens-carbon.css:191-207`                  | **Medium** — namespace pollution, confusing for maintainers        | Remove `--bgColor-*`, `--fgColor-*`, `--borderColor-*`, `--color-meta`, `--color-text`, `--color-accent`, `--color-border` aliases |
| Breakpoints defined in two places                                                | `tokens-carbon.css:41-46` AND `layout-carbon.css:22-28` | **Medium** — ambiguous source of truth                             | Define breakpoints only once in `tokens-carbon.css`                                                                                |
| `layout.css` and `layout-carbon.css` are near-duplicates                         | `src/styles/`                                           | **High** — 1467 lines of duplicated grid code                      | Remove `layout.css`, keep `layout-carbon.css`                                                                                      |
| `base.css` redefines tokens already in `tokens-carbon.css`                       | `src/styles/base.css`                                   | **High** — three sources of truth for color tokens                 | Consolidate all tokens in `tokens-carbon.css` only                                                                                 |
| Invalid CSS selector for dark mode                                               | `tokens-carbon.css:345`                                 | **Medium** — `:root:has(> style:contains("dark"))` is non-standard | Use only `[data-color-mode="dark"]` and `@media (prefers-color-scheme: dark)`                                                      |

### 1.2. `_config.ts` — 614 lines, too monolithic

Mixes site configuration, asset registration (20+ scripts), 15+ plugin configs,
post-build hooks, image processing, and feed generation.

**Target refactoring:**

```text
_config.ts          → ~100 lines: site + imports
_config/
├── plugins.ts      → all Lume plugin configurations
├── assets.ts       → script and stylesheet registration
├── feeds.ts        → 4 multilingual feed configurations
├── post-build.ts   → post-build hooks (fingerprint, vendor, etc.)
└── image-rules.ts  → image dimension validation
```

### 1.3. JS pipeline — 18 scripts, excessive complexity

| Script                            | Recommendation                                              |
| --------------------------------- | ----------------------------------------------------------- |
| `anti-flash.js`                   | Keep (FOUC prevention)                                      |
| `theme-toggle.js`                 | Keep                                                        |
| `language-preference.js`          | Keep                                                        |
| `disclosure-controls.js`          | Keep                                                        |
| `carbon.js`                       | Merge into `disclosure-controls.js`                         |
| `pagefind-lazy-init.js`           | Keep                                                        |
| `link-prefetch-intent.js`         | Keep (performance)                                          |
| `post-code-copy.js`               | Keep                                                        |
| `post-code-copy-exec-command.js`  | **Remove** — `navigator.clipboard` is universally supported |
| `feed-copy.js`                    | Keep                                                        |
| `archive-year-nav.js`             | Keep                                                        |
| `sw.js` + 5 SW files (~870 lines) | **Consolidate** into 2 files: `sw.js` + `sw-register.js`    |

### 1.4. CSS architecture

**Well done:**

- Cascade layers correctly used
  (`@layer tokens, reset, base, layout, components, utilities`)
- Carbon v11 tokens faithfully implemented
- Colors in `oklch()` throughout
- Dark mode (Gray 90) and High Contrast (Gray 100) supported
- Full accessibility media queries

**Problems:**

- `components.css` is 52 KB — too large, mixes many components
- `layout-carbon.css` has 740 lines with full 16-column grid system — most
  classes unused
- `layout.css` is a near-duplicate with Primer fallbacks — must be removed
- `base.css` (708 lines) redefines tokens, creating triple source of truth

### 1.5. Dependencies — cleanup needed

| Dependency                              | Action                                           |
| --------------------------------------- | ------------------------------------------------ |
| `@carbon/web-components@2.50.0`         | **Remove** — violates "no npm Carbon" constraint |
| `@carbon/styles` (in `allowScripts`)    | **Remove**                                       |
| `@ibm/plex` (in `allowScripts`)         | **Replace** with Lume `google_fonts` plugin      |
| Octicons `icons` plugin in `_config.ts` | **Remove** if no longer used                     |

---

## 2. UI component inventory

| Component          | Status  | Carbon pattern          | Classes                                    |
| ------------------ | ------- | ----------------------- | ------------------------------------------ |
| Fixed header       | Done    | UI Shell Header         | `bx--header`, `bx--header__*`              |
| Desktop navigation | Done    | Header Navigation       | `bx--header__nav`, `bx--header__menu-item` |
| Mobile SideNav     | Done    | UI Shell Left Panel     | `bx--side-nav`, `bx--side-nav__*`          |
| Hamburger menu     | Done    | Menu Toggle             | `bx--header__menu-toggle`                  |
| Search panel       | Partial | Header Panel + Pagefind | `bx--header__panel`                        |
| Language selector  | Done    | Header Panel + Dropdown | `bx--header__language-*`                   |
| Theme toggle       | Done    | Header Action           | `bx--header__action`                       |
| Footer             | Done    | Custom (Carbon-aligned) | `site-footer`                              |
| Post cards         | Done    | Structured List         | `post-card`                                |
| Breadcrumb         | Done    | Breadcrumb              | In `components.css`                        |
| Pagination         | Done    | Pagination              | In `components.css`                        |
| Code blocks        | Done    | Code Snippet            | Prism.js + copy button                     |
| Skip link          | Done    | Skip to Content         | `bx--skip-to-content`                      |
| Hero text          | Done    | Expressive Type         | `heading-05`/`heading-06`                  |
| Year nav (archive) | Done    | Content Switcher        | Sidebar + JS                               |

### Icons — all using Carbon inline SVG

Search, Menu, Translate, Sun/Moon, GitHub, RSS — all defined as inline SVG path
constants in `Header.tsx` and `Footer.tsx`.

---

## 3. Carbon mapping

| Current UI component | Carbon v11 component                                                                        | Guideline                     | Difficulty | Risk   |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- | ---------- | ------ |
| Fixed header         | [UI Shell Header](https://carbondesignsystem.com/components/UI-shell-header/usage/)         | 48px height, Gray 10 bg       | **Done**   | Low    |
| Desktop navigation   | [Header Navigation](https://carbondesignsystem.com/components/UI-shell-header/usage/)       | Active: bottom border blue-60 | **Done**   | Low    |
| Mobile SideNav       | [UI Shell Left Panel](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/) | 256px width, slide-in         | **Done**   | Low    |
| Search               | [Search](https://carbondesignsystem.com/components/search/usage/)                           | Compact variant in header     | Partial    | Medium |
| Language selector    | [Dropdown](https://carbondesignsystem.com/components/dropdown/usage/)                       | Within Header Panel           | **Done**   | Low    |
| Theme toggle         | [Toggle](https://carbondesignsystem.com/components/toggle/usage/)                           | Header action pattern         | **Done**   | Low    |
| Post list            | [Structured List](https://carbondesignsystem.com/components/structured-list/usage/)         | Selectable variant            | Medium     | Low    |
| Breadcrumb           | [Breadcrumb](https://carbondesignsystem.com/components/breadcrumb/usage/)                   | Slash separator               | Easy       | Low    |
| Pagination           | [Pagination](https://carbondesignsystem.com/components/pagination/usage/)                   | Page numbers + arrows         | Medium     | Medium |
| Code blocks          | [Code Snippet](https://carbondesignsystem.com/components/code-snippet/usage/)               | Multi-line + copy button      | Medium     | Medium |
| Year nav             | [Content Switcher](https://carbondesignsystem.com/components/content-switcher/usage/)       | Horizontal tabs-like          | Medium     | Low    |
| Tags                 | [Tag](https://carbondesignsystem.com/components/tag/usage/)                                 | Filter variant                | Easy       | Low    |

---

## 4. Target architecture

### 4.1. Simplified repository structure

The proposed `apps/` + `packages/` monorepo is over-engineered for this project.
Deno does not manage workspaces like npm. The Lume site and the Swift app share
no code (different languages).

```text
normco.re/
├── src/                    # Lume site (unchanged, source of truth)
│   ├── _components/
│   ├── _includes/layouts/
│   ├── posts/
│   ├── scripts/
│   ├── styles/
│   │   └── components/     # Split from monolithic components.css
│   └── utils/
├── ios/                    # SwiftUI app (peer directory)
│   ├── NormCore/
│   │   ├── App/
│   │   ├── Models/
│   │   ├── Network/
│   │   ├── ViewModels/
│   │   ├── Views/
│   │   └── DesignSystem/
│   ├── NormCore.xcodeproj
│   └── Package.swift
├── contracts/              # Shared JSON schemas
│   ├── feed.schema.json
│   ├── post.schema.json
│   └── validate.ts
├── plugins/
├── scripts/
├── design-tokens/          # Figma JSON exports (Carbon v11 variables)
├── _config.ts
├── _config/                # Split config modules
│   ├── plugins.ts
│   ├── assets.ts
│   ├── feeds.ts
│   └── post-build.ts
├── deno.json
├── CLAUDE.md
├── AGENTS.md
└── .github/
    └── workflows/
        ├── site.yml
        └── ios.yml
```

### 4.2. Grid simplification

Replace the 116-class `bx--col-*` system with native CSS Grid:

```css
@layer layout {
  .grid {
    display: grid;
    grid-template-columns: 1fr min(65ch, 100%) 1fr;
    padding-inline: var(--cds-spacing-05);
  }

  .grid > * {
    grid-column: 2;
  }

  .grid--wide {
    grid-template-columns: 1fr min(var(--cds-breakpoint-max), 100%) 1fr;
  }

  .grid--16 {
    display: grid;
    grid-template-columns: repeat(16, 1fr);
    gap: var(--cds-spacing-07);
    max-width: var(--cds-breakpoint-max);
    margin-inline: auto;
    padding-inline: var(--cds-spacing-05);
  }
}
```

This reduces `layout-carbon.css` from 740 lines to ~50 lines.

### 4.3. CSS target structure

```text
src/styles/
├── tokens-carbon.css       # Single source of truth for all tokens
├── reset.css               # Keep as-is
├── base.css                # Typography + element styles ONLY (no token redefinition)
├── layout.css              # Simplified CSS Grid (replaces layout-carbon.css)
├── components/
│   ├── header.css
│   ├── side-nav.css
│   ├── footer.css
│   ├── post-card.css
│   ├── breadcrumb.css
│   ├── pagination.css
│   ├── code-block.css
│   └── search.css
└── utilities.css           # Keep as-is
```

---

## 5. Font strategy — IBM Plex local hosting

### Configuration

```ts
// In _config.ts
import googleFonts from "lume/plugins/google_fonts.ts";

site.use(googleFonts({
  fonts: {
    sans:
      "https://fonts.google.com/share?selection.family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400",
    mono:
      "https://fonts.google.com/share?selection.family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400",
  },
  folder: "/fonts",
  cssFile: "/styles/fonts.css",
}));
```

### Performance

```html
<!-- In base.tsx <head> — preload critical weights -->
<link
  rel="preload"
  href="/fonts/ibm-plex-sans-400.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="/fonts/ibm-plex-sans-600.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### Update `style.css`

```css
/* BEFORE */
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:...");

/* AFTER */
@import "./styles/fonts.css"; /* Generated by google_fonts plugin */
```

---

## 6. Content contract for apps

### `post.json` — structured block format

```json
{
  "version": "1.0.0",
  "id": "alibaba-cloud-oss-cdn-deployment",
  "title": "Alibaba Cloud OSS CDN Deployment",
  "date": "2024-03-15T00:00:00Z",
  "lang": "en",
  "readingTime": 5,
  "tags": ["cloud", "deployment"],
  "blocks": [
    { "type": "heading", "level": 2, "text": "Introduction" },
    { "type": "paragraph", "text": "Lorem ipsum..." },
    { "type": "code", "language": "bash", "content": "aws s3 sync ..." },
    {
      "type": "image",
      "src": "/images/diagram.png",
      "alt": "Architecture",
      "width": 800,
      "height": 600
    },
    { "type": "quote", "text": "Quote text.", "attribution": "Author" },
    { "type": "list", "ordered": false, "items": ["Item 1", "Item 2"] }
  ]
}
```

### Supported block types

| Block       | Required fields         | Optional fields   |
| ----------- | ----------------------- | ----------------- |
| `paragraph` | `type`, `text`          | —                 |
| `heading`   | `type`, `level`, `text` | —                 |
| `code`      | `type`, `content`       | `language`        |
| `image`     | `type`, `src`, `alt`    | `width`, `height` |
| `quote`     | `type`, `text`          | `attribution`     |
| `list`      | `type`, `items`         | `ordered`         |

### Generation strategy

A Lume processor parses rendered HTML into blocks and writes
`/api/posts/{slug}.json` for each article during build.

### Validation

```bash
deno task validate-contracts  # Validates all generated JSON against schemas
```

---

## 7. Architecture diagram

```text
                    ┌─────────────────────────────────────┐
                    │         normco.re (root)             │
                    │  deno.json · _config.ts · CLAUDE.md  │
                    └──────────┬──────────────┬────────────┘
                               │              │
              ┌────────────────┘              └────────────────┐
              ▼                                                ▼
┌──────────────────────────┐                    ┌──────────────────────────┐
│         src/             │                    │         ios/             │
│    Lume SSG (Deno)       │                    │   SwiftUI native app     │
│                          │                    │                          │
│  posts/*.page.tsx        │                    │  Models/ (Codable)       │
│  _components/*.tsx       │                    │  Views/ (SwiftUI)        │
│  _includes/layouts/*.tsx │                    │  ViewModels/             │
│  styles/ (Carbon CSS)    │                    │  DesignSystem/ (HIG)     │
│  scripts/ (vanilla JS)   │                    │  Network/ (URLSession)   │
│  utils/ (TS helpers)     │                    └──────────┬───────────────┘
└──────────┬───────────────┘                               │
           │                                               │
           │ deno task build                               │ fetches at runtime
           ▼                                               │
┌──────────────────────────┐                               │
│       _site/ (output)    │                               │
│                          │                               │
│  *.html (pages)          │                               │
│  /fonts/ (IBM Plex)      │◄──────────────────────────────┘
│  /style.css              │
│  /feed.xml · /feed.json  │──── JSON Feed 1.1 (article list)
│  /api/posts/*.json       │──── Content contract (per-article blocks)
│  /scripts/*.js           │
└──────────────────────────┘

              ┌──────────────────────────┐
              │     contracts/           │
              │  feed.schema.json        │──── validates /feed.json
              │  post.schema.json        │──── validates /api/posts/*.json
              │  validate.ts             │──── deno task validate-contracts
              └──────────────────────────┘
```

---

## 8. Migration phases

### Phase 1 — Dependency cleanup ✅

1. ~~Remove `@carbon/web-components` and `@carbon/styles` from `deno.json`~~
2. ~~Remove corresponding entries from `allowScripts`~~
3. ~~Verify no imports reference these packages~~
4. ~~Run `deno task check`~~

**Status:** Complete.

### Phase 2 — Local fonts ✅

1. ~~Add `google_fonts` plugin to `_config/plugins.ts`~~
2. ~~Configure IBM Plex Sans (400, 400i, 500, 600) and Mono (400, 400i, 500)~~
3. ~~Replace `@import url(...)` in `src/style.css` with
   `@import "./styles/fonts.css"`~~
4. ~~Add dynamic font preload processor (replaces hardcoded `<link>` tags)~~
5. ~~Verify `font-display: swap` is used~~

**Status:** Complete. Font preload links are now injected dynamically by
`_config/processors.ts` based on actual font files generated by the
`google_fonts` plugin (see `src/utils/font-preload.ts`).

### Phase 3 — CSS token cleanup ✅

1. ~~Remove Primer aliases~~
2. ~~Remove duplicate breakpoints in `layout-carbon.css`~~
3. ~~Remove `layout.css` (duplicate of `layout-carbon.css`)~~
4. ~~Remove token redefinitions from `base.css`~~
5. ~~Fix invalid dark mode selector~~

**Status:** Complete. `base.css` now contains only convenience aliases that
reference `--cds-*` tokens via `var()`.

### Phase 4 — Grid simplification

1. Replace the `bx--col-*` system (116 classes) with native CSS Grid
2. Adapt TSX templates to use new classes
3. Keep header/footer with existing `bx--` classes

**Status:** Deferred — grid classes are actively used in layout-carbon.css.
Evaluate after other phases.

**Verification:** responsive correct at 320px, 672px, 1056px+.

### Phase 5 — `_config.ts` refactoring ✅

1. ~~Extract plugin config into `_config/plugins.ts`~~
2. ~~Extract asset registration into `_config/assets.ts`~~
3. ~~Extract feeds into `_config/feeds.ts`~~
4. ~~Extract processors into `_config/processors.ts`~~
5. ~~Reduce `_config.ts` to ~100 lines of orchestration~~

**Status:** Complete. `_config.ts` is 119 lines.

### Phase 6 — JS consolidation ✅

1. ~~Remove `post-code-copy-exec-command.js`~~
2. ~~Merge `carbon.js` into `disclosure-controls.js`~~
3. ~~Consolidate 6 service worker files into 1 (`sw.js`)~~
4. ~~Simplify `sw-register.js` (remove classic fallback)~~
5. ~~Remove `sw-module.js` and `sw-classic.js` shims~~
6. ~~Update `_config/assets.ts` and `scripts/fingerprint-assets.ts`~~

**Status:** Complete. Removed predictive navigation preloading (over-engineered
for a personal blog), module/classic dual registration, and `__swRuntime`
inter-file sharing pattern. SW reduced from ~870 lines (6 files) to ~290 lines
(1 file).

### Phase 7 — Icon extraction ✅

1. ~~Create `src/utils/carbon-icons.ts` with all SVG paths~~
2. ~~Refactor `Header.tsx` and `Footer.tsx` to import from this module~~
3. ~~Remove `icons` plugin (Octicons) from `_config/plugins.ts`~~
4. ~~Remove dead Octicons CSS classes from `base.css`~~

**Status:** Complete. All icons are inline SVG from `carbon-icons.ts`. The Lume
`icons` plugin (Octicons catalog) was dead code — no `comp.icon()` calls existed.

### Phase 8 — Split `components.css` ✅

1. ~~Create `src/styles/components/` with one file per component~~
2. ~~Move each block from `components.css` into its own file~~
3. ~~Update imports in `style.css`~~

**Status:** Complete. 16 individual component CSS files.

### Phase 8b — Token audit against Figma exports ✅

1. ~~Refactor `src/utils/carbon-tokens.ts` to load from `design-tokens/*.json`
   generically (no hardcoded filenames)~~
2. ~~Fix `rgbaToOklch()` conversion pipeline (sRGB→LMS→Oklab→Oklch)~~
3. ~~Audit all `tokens-carbon.css` values against Figma White Theme export~~
4. ~~Add missing dark mode (Gray 90) overrides for links, focus, support colors,
   background-inverse, border-inverse~~
5. ~~Fix incorrect oklch values for gray scale, blue accent, semantic tokens~~
6. ~~Add `--cds-focus-inset`, `--cds-focus-inverse`, `--cds-link-inverse`,
   `--cds-support-*-inverse` tokens~~

**Status:** Complete. All color tokens now match Figma exports precisely.
Key corrections:
- Theme renamed from "Gray 10" to "White" (background is `#ffffff`)
- Gray palette oklch values corrected (e.g., Gray 100 was `oklch(8.6% 0 0)`,
  now `oklch(20.02% 0 0)` per Figma `#161616`)
- Blue 60 corrected from `oklch(45% 0.2 264)` to `oklch(55.65% 0.243 262)`
- Dark mode now has complete overrides for links (Blue 40), focus (white),
  text-error, support colors, background/border inverse
- Hover/active states use alpha transparency (e.g., `oklch(64.34% 0 0 / 0.12)`)
  instead of solid gray values

### Phase 9 — Content contract

1. Create `contracts/post.schema.json` and `contracts/feed.schema.json`
2. Implement Lume plugin `content-contract.ts` generating `/api/posts/*.json`
3. Create `contracts/validate.ts` for validation
4. Add `deno task validate-contracts` to `deno.json`

**Status:** Not started.

**Verification:** valid JSON generated for each article, conforming to schema.

### Phase 10 — Documentation update

1. Update `CLAUDE.md` and `AGENTS.md` (must stay identical) with Carbon changes
2. Update `ARCHITECTURE.md` with diagram and content contract (Mermaid)
3. Update this file with completed phases

**Status:** Not started.

**Verification:** `CLAUDE.md` and `AGENTS.md` are byte-identical.

---

## 9. Design JSON sources (from `design-tokens/` directory)

All Figma variable exports live in `design-tokens/*.json`. The
`loadDesignTokens()` function in `src/utils/carbon-tokens.ts` scans the
directory at build time and loads every `.json` file generically — no hardcoded
filenames. Each file contains an array of Figma variable collections (themes,
spacing, colors, etc.).

Current files:

- `design-tokens/carbon.json` — consolidated Carbon Design System v11 variables

## 10. Carbon guidelines references

- [Themes overview](https://carbondesignsystem.com/elements/themes/overview/)
- [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/)
- [Typography overview](https://carbondesignsystem.com/elements/typography/overview/)
- [UI Shell Header](https://carbondesignsystem.com/components/UI-shell-header/usage/)
- [UI Shell Left Panel](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/)
- [Search](https://carbondesignsystem.com/components/search/usage/)
- [Dropdown](https://carbondesignsystem.com/components/dropdown/usage/)
- [Link](https://carbondesignsystem.com/components/link/usage/)
- [Breadcrumb](https://carbondesignsystem.com/components/breadcrumb/usage/)
- [Pagination](https://carbondesignsystem.com/components/pagination/usage/)
- [Tag](https://carbondesignsystem.com/components/tag/usage/)
- [Tile](https://carbondesignsystem.com/components/tile/usage/)
- [Code Snippet](https://carbondesignsystem.com/components/code-snippet/usage/)
- [Content Switcher](https://carbondesignsystem.com/components/content-switcher/usage/)
- [Icons](https://carbondesignsystem.com/elements/icons/usage/)
- [Pictograms](https://carbondesignsystem.com/elements/pictograms/usage/)
- [Modal](https://carbondesignsystem.com/components/modal/usage/)
