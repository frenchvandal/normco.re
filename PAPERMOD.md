# The PaperMod project → Lume Migration Feasibility (Hugo → Lume)

This document assesses the feasibility, cost, and feature impact of migrating
the Hugo PaperMod theme to the current Lume-based site. It outlines what is
feasible, what is risky or infeasible, which PaperMod features are likely to be
lost under Lume, and which existing Lume site features could be lost by adopting
PaperMod.

## Guideline exceptions — PaperMod migration

As part of the PaperMod migration project, the AI agent or Claude may deviate
from the guidelines defined in `CLAUDE.md` and `AGENTS.md` **only if**:

- the deviation is explicitly justified to the human user, and
- the rationale is clearly and durably documented somewhere, for example:
  - in code comments, or
  - in the commit description.

Any such deviation must be intentional, transparent, and traceable.

## MUST-DO

- All merge requests and commits related to the PaperMod project must be done in
  the `dev` branch, never the `master` branch, unless explicitly stated
  otherwise by the human user.
- No `deno test --coverage` required for tasks related to the PaperMod project.
- The Lume architecture in the `dev` branch MAY be modified if required compared
  to the current architecture in the `master` branch in order to accommodate the
  migration to PaperMod. What matters is the final outcome—achieving behavior as
  close as possible to a one-to-one match with PaperMod—not the specific
  implementation approach used to get there.
  - As part of the PaperMod project, the `PAPERMOD.md` file must be updated
    progressively and continuously.
  - The document must explicitly and distinctly describe:
    - **What has already been completed**: implemented features, finished
      migrations, validated behaviors, and any confirmed deviations from the
      original PaperMod behavior.
    - **What remains to be done**: missing features, partial implementations,
      known limitations, technical debt, and unresolved questions.
    - **The next concrete tasks to perform**: actions required to reach a full
      and functional PaperMod migration, including priorities, dependencies, and
      relevant technical notes.
  - Each update must be as detailed and explicit as possible, avoiding implicit
    knowledge or assumptions, so that:
    - human developers,
    - AI agents,
    - and Claude

### PaperMod Development Branching Rules

- The **PaperMod project must be developed exclusively in the `dev` branch**.
- The **`master` branch represents the existing, stable Lume setup without
  PaperMod**.
- No PaperMod-related changes, experiments, or refactors are allowed on the
  `master` branch.
- The `master` branch must remain a clean reference of the original Lume
  implementation.
- All work related to PaperMod (code, configuration, documentation, or
  experiments) must target the `dev` branch only.

## Reference documentation for Hugo and PaperMod

- https://github.com/adityatelange/hugo-PaperMod
- https://github.com/adityatelange/hugo-PaperMod/tree/exampleSite
- https://adityatelange.github.io/hugo-PaperMod/
- https://github.com/adityatelange/hugo-PaperMod/wiki
- https://gohugo.io

## Reference documentation for Deno and Lume

- https://docs.deno.com/runtime/
- https://lume.land/docs/overview/about-lume/

## Scope & assumptions

- Target: Port PaperMod’s **visual system and UX** to Lume (not Hugo itself).
- Preserve the current content model (Markdown posts + Lume pages).
- Avoid new dependencies unless strictly required.
- Do not modify generated output in `_site/`.
- Keep a `license.css` file in Lume and add `Copyright (c) 2026 frenchvandal`.

## High-level feasibility

**Verdict:** Feasible with moderate effort. PaperMod is primarily a theme (HTML,
CSS, JS, and Hugo templates). Lume can reproduce most of the UX and layout
patterns using custom layouts and components. The main risks lie in
Hugo-specific features (image processing, shortcodes, taxonomies) that require
Lume equivalents.

**Claude’s assessment:** The original ChatGPT analysis is accurate. The
migration is highly feasible given that:

1. Lume’s official plugin ecosystem (88 plugins) covers nearly all PaperMod
   functionality.
2. The current codebase already implements many PaperMod patterns (theme toggle,
   TOC, reading time, search modal, breadcrumbs, post navigation).
3. Hugo’s image processing disadvantage is **overstated**—Lume’s Transform
   Images + Picture plugins actually provide **better** responsive image
   automation with modern format support (AVIF, WebP).
4. The TypeScript-based component architecture in Lume is more maintainable than
   Hugo’s Go templates.

## Estimated cost (rough order of magnitude)

> These are rough estimates for a first functional parity pass. They do not
> include visual polish or refinements beyond PaperMod’s baseline.

| Workstream                               | Effort   | Notes                                        |
| ---------------------------------------- | -------- | -------------------------------------------- |
| Core layout + typography + spacing       | 3–5 days | Port base HTML/SCSS structure and tokens.    |
| Navigation, header, footer, social icons | 1–2 days | Lume components + data mapping.              |
| Post templates (list + single)           | 2–4 days | Includes cover, metadata, TOC, reading time. |
| Search UI integration                    | 1–2 days | Map PaperMod search UI to Pagefind.          |
| Theme switch (dark/light)                | 1–2 days | CSS vars + JS toggle + persistence.          |
| Taxonomies (tags, categories, series)    | 2–4 days | Lume data + archive pages.                   |
| Shortcodes & Hugo-only features          | 2–5 days | Identify and reimplement manually.           |
| QA + polish                              | 2–4 days | Cross-browser, responsive, accessibility.    |

**Total:** ~14–28 days for a realistic parity port, depending on how many of
PaperMod’s optional features are required.

## Feasible feature mapping (PaperMod → Lume)

### Complete PaperMod feature analysis

| PaperMod feature             | Feasibility | Lume solution                                    | Status in codebase |
| ---------------------------- | ----------- | ------------------------------------------------ | ------------------ |
| Light/dark theme + toggle    | ✅ Feasible | CSS vars + localStorage + `theme.js`             | ✅ **Implemented** |
| Auto theme (system pref)     | ✅ Feasible | `prefers-color-scheme` media query in `theme.js` | ✅ **Implemented** |
| Themed scroll bar            | ✅ Feasible | CSS `::-webkit-scrollbar` + CSS vars             | ✅ **Implemented** |
| Smooth scroll                | ✅ Feasible | CSS `scroll-behavior: smooth`                    | ✅ **Implemented** |
| Scroll-to-top button         | ✅ Feasible | `scroll-to-top.js` + CSS                         | ✅ **Implemented** |
| Responsive layout            | ✅ Feasible | Lightning CSS + mobile-first SCSS                | ✅ **Implemented** |
| Search (Fuse.js in PaperMod) | ✅ Feasible | Pagefind plugin (better: static index)           | ✅ **Implemented** |
| Search keyboard nav          | ✅ Feasible | Pagefind UI built-in + custom JS                 | ✅ **Implemented** |
| Table of contents            | ✅ Feasible | `lume/markdown-plugins/toc.ts`                   | ✅ **Implemented** |
| Reading time                 | ✅ Feasible | `reading_info` plugin                            | ✅ **Implemented** |
| Word count                   | ✅ Feasible | `reading_info` plugin (provides both)            | ✅ **Implemented** |
| Syntax highlighting          | ✅ Feasible | Prism plugin                                     | ✅ **Implemented** |
| Code copy button             | ✅ Feasible | `code-copy.js` + clipboard API                   | ✅ **Implemented** |
| Social icons                 | ✅ Feasible | `SocialIcons.ts` component with inline SVGs      | ✅ **Implemented** |
| Breadcrumbs                  | ✅ Feasible | `Breadcrumbs.ts` component                       | ✅ **Implemented** |
| Post cover image             | ✅ Feasible | Front matter `image` + layout logic              | ✅ **Implemented** |
| Responsive images            | ✅ Feasible | Transform Images + Picture plugins               | ✅ **Implemented** |
| Archive/tag pages            | ✅ Feasible | Search plugin + paginate + archive layout        | ✅ **Implemented** |
| Share buttons                | ✅ Feasible | Template links (Twitter, Facebook, etc.)         | ✅ **Implemented** |
| RSS/JSON feeds               | ✅ Feasible | Feed plugin                                      | ✅ **Implemented** |
| Sitemap                      | ✅ Feasible | Sitemap plugin                                   | ✅ **Implemented** |
| Robots.txt                   | ✅ Feasible | Robots plugin                                    | ✅ **Implemented** |
| Related posts                | ✅ Feasible | `RelatedPosts.ts` component + Search plugin      | ✅ **Implemented** |
| Prev/next post navigation    | ✅ Feasible | `search.previousPage`/`nextPage`                 | ✅ **Implemented** |
| Author profile widget        | ✅ Feasible | Data-driven component                            | ✅ **Implemented** |
| Profile mode (home layout)   | ✅ Feasible | Custom `index.page.ts` layout                    | ✅ **Implemented** |
| Home-Info mode               | ✅ Feasible | Custom `index.page.ts` layout                    | ✅ **Implemented** |
| Comments integration         | ✅ Feasible | Embed script (Utterances/Giscus/Disqus)          | ⬜ Not yet         |
| SEO meta tags                | ✅ Feasible | Metas plugin                                     | ✅ **Implemented** |
| JSON-LD structured data      | ✅ Feasible | JSON-LD plugin                                   | ✅ **Implemented** |
| OpenGraph / Twitter Cards    | ✅ Feasible | Metas plugin                                     | ✅ **Implemented** |
| OG image generation          | ✅ Feasible | OG images plugin + TSX layout                    | ✅ **Implemented** |
| Favicon generation           | ✅ Feasible | Favicon plugin                                   | ✅ **Implemented** |
| Draft page indicators        | ✅ Feasible | `badge--draft` CSS + layout logic                | ✅ **Implemented** |
| Edit post link (GitHub)      | ✅ Feasible | `SourceInfo.ts` component                        | ✅ **Implemented** |
| Multi-language (i18n)        | ✅ Feasible | Multilanguage plugin (full feature parity)       | ⬜ Not yet         |
| Access key shortcuts         | ✅ Feasible | `accesskeys.js` module                           | ✅ **Implemented** |
| Archives layout (timeline)   | ✅ Feasible | Custom archive layout                            | ✅ **Implemented** |

### Lume plugins available (not yet used)

The following official Lume plugins can enhance the migration:

| Plugin | Purpose                          | Relevance                       |
| ------ | -------------------------------- | ------------------------------- |
| Icons  | Import icons from icon libraries | Social icons, UI icons          |
| Nav    | Build menus and breadcrumbs      | Could simplify `Breadcrumbs.ts` |
| SVGO   | Optimize SVG files               | Icon optimization               |

**Note:** Transform Images, Picture, Favicon, OG Images, and Robots plugins are
now in use. Related posts are implemented via a custom `RelatedPosts.ts`
component using the Search plugin.

### Multilanguage plugin (i18n) — detailed analysis

The Lume Multilanguage plugin provides **full feature parity** with Hugo’s i18n
system and in some ways is **more flexible**. Here is a technical comparison:

| Feature                          | Hugo/PaperMod               | Lume Multilanguage                        |
| -------------------------------- | --------------------------- | ----------------------------------------- |
| URL prefixing by language        | `/fr/about/`, `/en/about/`  | ✅ Same (configurable default language)   |
| Default language without prefix  | ✅ `defaultContentLanguage` | ✅ `defaultLanguage` option               |
| UI string translations           | `i18n/*.yaml` files         | ✅ `_data.ts` with language-keyed values  |
| Automatic `hreflang` tags        | ✅ Built-in                 | ✅ Automatic `<link rel="alternate">`     |
| Language selector (alternates)   | Manual template             | ✅ `alternates` variable exposed          |
| Single-file multilingual content | ❌ Not supported            | ✅ `lang: [en, fr, es]` generates all     |
| Separate file per language       | ✅ Standard approach        | ✅ Same with `id` + `lang` front matter   |
| Translation linking by ID        | Filename convention         | ✅ Explicit `id` variable (more reliable) |
| `x-default` hreflang             | Manual                      | ✅ Automatic support                      |
| Paginated multilingual pages     | Complex setup               | ✅ Works with explicit `id` assignment    |

**Implementation approach for normco.re:**

1. **Configure the plugin** in `_config.ts`:
   ```ts
   import multilanguage from "lume/plugins/multilanguage.ts";
   site.use(multilanguage({
     languages: ["en", "fr", "zh"],
     defaultLanguage: "en",
   }));
   ```

2. **UI strings** in `src/_data.ts`:
   ```ts
   export const site_name = "normco.re";
   export const fr = { site_name: "normco.re" };
   export const zh = { site_name: "normco.re" };
   ```

3. **Content files** with matching `id`:
   - `src/posts/about.md` → `id: about`, `lang: en`
   - `src/posts/about.fr.md` → `id: about`, `lang: fr`

4. **Language selector component** using `alternates` variable.

**Conclusion:** i18n is **fully feasible** with Lume and does not require
deferral. The Multilanguage plugin is mature and well-documented.

## Infeasible or high-friction features (Hugo-specific)

These features are **not impossible**, but they are **expensive** to port
cleanly and may require custom tooling outside the current repository
constraints.

### Revised assessment (Claude)

| Feature                   | ChatGPT assessment | Claude reassessment          | Rationale                                                                            |
| ------------------------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------ |
| Hugo image processing     | High friction      | ✅ **Feasible (better)**     | Lume Transform Images + Picture plugins provide superior responsive image automation |
| Hugo shortcodes           | High friction      | ⚠️ Medium friction           | Lume components + Markdown-it plugins can replicate most shortcode functionality     |
| Hugo taxonomy behavior    | High friction      | ✅ **Feasible**              | Lume Search plugin + paginate covers all taxonomy needs                              |
| Hugo Pipes asset pipeline | High friction      | ✅ **Feasible (equivalent)** | ESbuild + Lightning CSS + PurgeCSS already configured                                |
| Hugo `.Summary` behavior  | High friction      | ✅ **Already implemented**   | `<!--more-->` excerpt extraction in `plugins.ts` preprocessor                        |
| Hugo `.TableOfContents`   | High friction      | ✅ **Already implemented**   | `lume/markdown-plugins/toc.ts` provides identical functionality                      |

### True high-friction items

The following items remain genuinely challenging:

1. **Hugo shortcodes with complex logic** — Shortcodes that perform data
   transformations or conditional rendering require custom Markdown-it plugins
   or preprocessors. Common shortcodes like `figure`, `highlight`, and `ref` can
   be replicated, but theme-specific shortcodes need case-by-case evaluation.

2. **Hugo’s built-in image filters** — Hugo provides 12+ image filters (Blur,
   Brightness, Contrast, Saturation, Hue, Grayscale, etc.) out of the box.
   Lume’s Transform Images uses Sharp, which supports custom functions but
   requires Sharp API knowledge. For a blog, this is rarely needed.

3. **Hugo `.Resources` pattern** — Hugo’s page bundles with `.Resources` for
   co-located assets require a different mental model in Lume. Files should be
   placed in `src/` or referenced via front matter.

4. **Exact Hugo taxonomy URL semantics** — Hugo’s default `/tags/foo/` and
   `/categories/bar/` URLs with automatic pluralization are not automatic in
   Lume. However, the Search plugin + custom archive pages achieve the same
   result with explicit control.

## PaperMod features likely to be lost under Lume

### Revised assessment (Claude)

Most PaperMod features can be replicated or improved upon in Lume. The following
are the **only features genuinely at risk**:

| Feature                        | Risk level | Mitigation                                               |
| ------------------------------ | ---------- | -------------------------------------------------------- |
| Hugo-specific shortcodes       | ⚠️ Medium  | Identify used shortcodes and create Lume equivalents     |
| JXL image format support       | ❌ Lost    | Sharp (Lume backend) does not support JXL; use AVIF/WebP |
| Hugo’s 12+ image filters       | ⚠️ Medium  | Custom Sharp functions required if needed                |
| Exact `.Resources` co-location | 🔄 Changed | Different pattern but equivalent functionality           |

### Features previously listed as "lost" but actually available

- **Hugo image processing** → ✅ Lume Transform Images + Picture plugins
  (actually **better** with AVIF support)
- **Responsive srcsets** → ✅ Picture plugin generates automatic srcsets
- **WebP conversion** → ✅ Transform Images plugin
- **`.Summary` behavior** → ✅ Already implemented via `<!--more-->`
  preprocessor
- **`.TableOfContents`** → ✅ TOC Markdown plugin already in use
- **Taxonomy URLs** → ✅ Search plugin + archive pages (already working)

## Current Lume features likely to be lost when adopting PaperMod

The following capabilities exist in the current Lume site and **may be lost**
when moving toward PaperMod unless explicitly rebuilt:

### Features to preserve (REQUIRED)

| Feature                  | Current status         | Recommendation                                   |
| ------------------------ | ---------------------- | ------------------------------------------------ |
| Service worker + offline | `sw.page.ts`           | ✅ **Keep** — PaperMod doesn’t have this         |
| Pagefind search          | Integrated with modal  | ✅ **Keep** — Superior to Fuse.js (static index) |
| Toast notifications      | `toast.js` + component | ✅ **Keep** — Useful for UX feedback             |
| Modal component          | `Modal.ts`             | ✅ **Keep** — Used by search, extensible         |
| JSON-LD structured data  | Fully configured       | ✅ **Keep** — Already matches PaperMod’s SEO     |
| Git commit tracking      | `SourceInfo.ts`        | ✅ **Keep** — Unique feature not in PaperMod     |
| Code tabs component      | `CodeTabs.ts`          | ✅ **Keep** — Enhancement over PaperMod          |
| Alert/admonition styling | `@mdit/plugin-alert`   | ✅ **Keep** — Better than PaperMod’s default     |
| Feed XSL stylesheet      | `feed.xsl`             | ✅ **Keep** — Better UX for RSS viewing          |

### Features that may need adaptation

| Feature                | Current status      | Impact of migration                             |
| ---------------------- | ------------------- | ----------------------------------------------- |
| Archive page structure | `archive.page.ts`   | May need restyling to match PaperMod’s timeline |
| i18n data structure    | `_data/i18n/`       | Migrate to Multilanguage plugin pattern         |
| Current footer design  | Minimal with commit | May adopt PaperMod’s copyright + social links   |

### Features unique to current Lume site (not in PaperMod)

These features are **enhancements** over PaperMod that MUST be retained:

### Footer evolution

As part of the migration, the footer must be extended with an additional icon
linking to the JSON feed viewer.

- A dedicated JSON feed icon MUST be added to the footer.
- The icon MUST link to `.../feed-json-viewer/`.
- The icon may be sourced from an appropriate open icon set (for example via the
  Lume Icons plugin or an equivalent SVG source). If not, an icon asset is
  stored on the `dev` branch at the following path in the repository:
  `PaperMod/jsonfeed.svg`.

1. **Service worker with update notifications** — PaperMod has no offline
   support. The current implementation provides progressive enhancement.
2. **Feed JSON viewer** — `feed-json-viewer.page.ts` provides a user-friendly
   way to view the JSON feed.
3. **Source info with commit link** — Shows the last commit that modified each
   post, linking to GitHub.
4. **Toast notification system** — Provides feedback for theme changes, updates,
   and actions.
5. **Pagefind search** — Static search index is faster and more reliable than
   PaperMod’s Fuse.js client-side search.

## Content migration requirement

As part of the PaperMod migration, the content of the official Hugo PaperMod
example site must also be recreated.

- The content located at:
  https://github.com/adityatelange/hugo-PaperMod/tree/exampleSite/content must
  be reimplemented as Lume pages.
- All tasks described in this section MUST be performed exclusively on the `dev`
  branch.
- The goal is to achieve functional and structural parity with the original
  PaperMod example site, adapted to Lume’s content and layout model.

## Approved approach

1. **Audit the content model** (front matter fields, existing layouts).
2. **Port PaperMod styles** into SCSS using CSS variables for theming.
3. **Rebuild the layout hierarchy** using Lume `_includes/` and `_components/`.
4. **Map PaperMod UI elements** (search, TOC, reading time, metadata) to
   existing Lume plugins.
5. **Identify missing Hugo features** and decide whether to replace, simplify,
   or drop them.
6. **Run QA on a content snapshot** to validate typography, spacing, and layout
   fidelity.

## Implementation log (PaperMod → Lume)

### Completed

- Established baseline PaperMod-inspired design tokens (colors, typography,
  layout widths) with a matching dark theme palette.
- Aligned global layout spacing and navigation/post list spacing to reflect
  PaperMod’s compact rhythm.
- Refined page header and footer treatments to match PaperMod’s divider-driven
  structure.
- Updated the main header navigation structure to mirror PaperMod (inner
  container alignment, tighter menu spacing, and an isolated theme toggle
  control).
- Expanded the shared post list rendering to include post headers, excerpts, and
  a read-more affordance so archive listings align with PaperMod’s list rhythm.
- Restructured post metadata blocks to mirror PaperMod (meta line + tags row
  with label and hashtag styling).
- Added post description support in the single post header and tightened header
  spacing to better match PaperMod’s title block rhythm.
- Fixed search input focus ring color to match the design system’s primary blue
  (`--color-primary`) instead of an inconsistent red value
  (`src/_includes/css/04-components/search.css`).
- Improved `Pagination` component (`src/_components/Pagination.ts`):
  - Added complete JSDoc documentation with testable code examples.
  - Added `aria-label="Pagination"` for accessibility.
  - Added `role="list"` to the navigation list.
  - Added `aria-current="page"` to the current page indicator.
- Enhanced pagination styles (`src/_includes/css/05-layouts/page.css`) to match
  PaperMod’s layout: flexbox-based layout with previous/next links on opposite
  sides and centered page indicator.
- Created comprehensive Pagefind UI styles
  (`src/_includes/css/04-components/pagefind.css`) matching PaperMod’s search
  panel aesthetic with custom input, result card, and loading state styling.
- Improved search modal styles (`src/_includes/css/04-components/modal.css`)
  with better scrollbar styling, refined padding, and enhanced results area.
- Refined post navigation (prev/next) styles to match PaperMod’s two-column
  layout with background container, uppercase labels, title truncation, and
  responsive stacking on mobile.
- Updated post list styles (`src/_includes/css/05-layouts/post-list.css`) with
  more compact spacing, line-clamped excerpts, animated read-more links with
  arrow indicator, and archive-specific density adjustments.
- Replaced theme toggle Unicode character (`◐`) with proper SVG sun/moon icons
  (`src/_includes/layouts/base.ts`) for better cross-platform rendering.
- Added theme toggle CSS (`src/_includes/css/04-components/theme-toggle.css`)
  with icon visibility switching between light/dark themes, hover animation, and
  reduced motion support.
- Aligned Prism syntax highlighting colors with PaperMod’s dark code block style
  (`src/_includes/css/01-tokens/tokens.css`):
  - Code blocks now use dark backgrounds in both light and dark themes (PaperMod
    style).
  - Added separate inline code variables (`--code-inline-*`) for lighter inline
    code styling.
  - Updated `typography.css` to use inline code variables for `<code>` elements.
- Added post body lead section styling
  (`src/_includes/css/05-layouts/post.css`):
  - First paragraph gets emphasized font size (1.125em) and line height.
  - Added header anchor styling with hover reveal animation.
- Polished footer styling (`src/_includes/css/05-layouts/footer.css`,
  `src/_includes/layouts/base.ts`):
  - Increased top margin for better visual separation.
  - Added `.footer-commit` class with monospace font for commit hash.
  - Added `.footer-separator` class for consistent separator styling.
  - Improved link transitions.
- Implemented scroll-to-top button (`src/js/features/scroll-to-top.js`,
  `src/_includes/css/04-components/scroll-to-top.css`):
  - Floating button appears after scrolling 300px.
  - Smooth scroll behavior with `prefers-reduced-motion` support.
  - Throttled scroll event handling for performance.
  - Keyboard accessible with Enter/Space activation.
  - Hover/focus states with primary color highlight.
- Implemented code copy button (`src/js/features/code-copy.js`,
  `src/_includes/css/04-components/code-copy.css`):
  - Adds copy button to all `<pre><code>` blocks.
  - Visual feedback with success (green) and error (red) states.
  - Clipboard API with fallback for older browsers.
  - Button reveals on hover/focus, always visible on mobile.
  - Respects reduced motion preferences.
- Added Robots plugin (`plugins.ts`):
  - Auto-generates `robots.txt` with sitemap reference.
  - Configured in the plugin chain after Pagefind.
- Implemented related posts component (`src/_components/RelatedPosts.ts`,
  `src/_includes/css/04-components/related-posts.css`):
  - Displays up to 3 related posts based on shared tags.
  - Sorted by relevance (tag overlap count), then by date.
  - Integrated into `layouts/post.ts` between source info and navigation.
  - Added `related_posts` i18n string to `src/_data/i18n.ts`.
- Implemented themed scrollbar (`src/_includes/css/02-base/scrollbar.css`):
  - Custom scrollbar styling using CSS `::-webkit-scrollbar` and
    `scrollbar-color` for Firefox.
  - Adapts to light/dark theme via CSS variables.
  - Narrower scrollbars for code blocks and TOC containers.
  - PaperMod-style aesthetic with rounded thumb and subtle track.
- Smooth scroll already implemented in `global.css` with
  `prefers-reduced-motion` support.
- Implemented draft page indicators:
  - Added `badge--draft` CSS variant in `badge.css` with warning color and
    uppercase styling.
  - Modified `PostList.ts` to display draft badge before post title.
  - Modified `layouts/post.ts` to display draft badge in single post view.
  - Added `draft` i18n string to `src/_data/i18n.ts`.
  - Posts with `draft: true` front matter now show visual indicator.
- Implemented social icons component (`src/_components/SocialIcons.ts`,
  `src/_includes/css/04-components/social-icons.css`):
  - Renders social media links with inline SVG icons (Feather Icons).
  - Supports GitHub, Twitter, LinkedIn, Mastodon, YouTube, Instagram, Facebook,
    Twitch, Email, and RSS platforms.
  - Platform-specific hover colors for visual feedback.
  - Integrated into site footer via `layouts/base.ts`.
  - Configurable via `social_links` array in `src/_data.ts`.
  - Accessible with `aria-label` on each link.
- Implemented responsive images with Transform Images + Picture plugins
  (`plugins.ts`, `src/_components/CoverImage.ts`,
  `src/_includes/css/04-components/cover-image.css`):
  - Added `picture` and `transformImages` plugins to the build chain.
  - Created `CoverImage.ts` component with support for `image`, `imageAlt`, and
    `imageCaption` front matter fields.
  - Generates responsive srcsets at 640/1024/1280px widths with AVIF, WebP, and
    JPG format support.
  - Integrated into `layouts/post.ts` (eager loading) and `PostList.ts` (lazy
    loading with link wrapper).
  - Added `cover-image.css` with responsive styling, dark theme support, and
    post list integration.
  - Updated purgecss safelist to include `cover-image` pattern.
- Implemented share buttons component (`src/_components/ShareButtons.ts`,
  `src/_includes/css/04-components/share-buttons.css`,
  `src/js/features/share-copy.js`):
  - Created `ShareButtons.ts` component with Twitter, Facebook, LinkedIn,
    WhatsApp, and copy-to-clipboard buttons.
  - Platform-specific hover colors matching brand guidelines.
  - Accessible with ARIA labels and keyboard navigation.
  - Uses Clipboard API with fallback for older browsers.
  - Integrated into `layouts/post.ts` between source info and related posts.
  - Added `share` i18n strings to `src/_data/i18n.ts`.
  - Updated purgecss safelist to include `share-button` pattern.
- Implemented author profile widget (`src/_components/AuthorProfile.ts`,
  `src/_includes/css/04-components/author-profile.css`):
  - Created `AuthorProfile.ts` component with two variants: "compact" for post
    footers and "full" for profile pages.
  - Supports avatar (with placeholder fallback), name, bio, email, website, and
    social links.
  - Social icons for GitHub, Twitter, LinkedIn, Mastodon, email, and website.
  - Responsive design with mobile-friendly adjustments.
  - Added `author` i18n strings to `src/_data/i18n.ts`.
  - Updated purgecss safelist to include `author-profile` pattern.
- Implemented Profile mode for home page (`src/index.page.ts`,
  `src/_includes/css/05-layouts/home-profile.css`):
  - Added `home.mode` configuration option in `src/_data.ts` supporting "posts"
    (default) and "profile" modes.
  - Profile mode displays centered author profile using `AuthorProfile`
    component in "full" variant.
  - Added `home.profile` configuration with name, avatar, and bio fields.
  - Created `home-profile.css` with responsive styling for profile display.
  - Integrates site-wide `social_links` into profile display.
  - Also satisfies "Home-Info mode" requirement (welcome text in posts mode).
- Implemented access key shortcuts (`src/js/features/accesskeys.js`):
  - PaperMod-style keyboard navigation: h (home), a (archives), s (search).
  - Platform-aware modifier detection: Alt+key on Windows/Linux,
    Control+Option+key on macOS.
  - Added `data-accesskey` attributes to navigation elements in `base.ts`.
  - Hidden search trigger button for access key activation.
  - Added `.visually-hidden` utility class for screen reader accessibility.
- Implemented Favicon plugin (`plugins.ts`):
  - Configured Favicon plugin with `favicon.png` as input source.
  - Plugin auto-generates `favicon.ico` and `apple-touch-icon.png`.
  - Removed manual favicon link from `base.ts` (plugin injects automatically).
  - Removed `.add("favicon.png")` from build (plugin handles it).
- Implemented OG Images plugin (`plugins.ts`,
  `src/_includes/layouts/og_images.tsx`):
  - Created PaperMod-style TSX layout for Open Graph image generation.
  - Configured JSX support in `deno.json` (jsx-runtime, compilerOptions).
  - Added `openGraphLayout` to global `_data.ts` for site-wide OG images.
  - Layout features: dark background, site name, title, description, reading
    time.
  - Updated `CLAUDE.md` to allow JSX/TSX exception for OG images (justified
    deviation documented).

### Audit summary (January 2026)

**What is working well:**

- CSS architecture is well organized: design tokens, base styles, utilities,
  components, and layouts follow a clear separation.
- Component structure mirrors PaperMod’s patterns: `PostList`, `PostDetails`,
  `Pagination`, `Breadcrumbs`, `Modal`, and `SourceInfo` components are
  functional.
- Theme toggle works correctly with localStorage persistence and system
  preference detection (`prefers-color-scheme`).
- Search modal with Pagefind integration responds to `Cmd/Ctrl+K` shortcut.
- TOC and footnotes are styled and functional.
- Responsive breakpoints at 480px and 768px are applied consistently.
- Accessibility: skip links, ARIA labels, `focus-visible` states, and semantic
  HTML are in place.
- JS tests for theme, toast, modal, and other features are well structured.

**Items requiring attention:**

- Cross-browser testing: verify rendering consistency across Chrome, Firefox,
  and Safari.
- Mobile testing: validate touch targets, font scaling, and navigation on actual
  devices.
- Performance audit: check CSS bundle size and consider critical CSS extraction.

### Next priorities (in order)

1. **i18n implementation**: configure Multilanguage plugin, migrate UI strings,
   create language selector component.
2. **Cross-browser QA**: test on Chrome, Firefox, Safari, and Edge to ensure
   consistent rendering.
3. **Mobile device testing**: validate on real iOS and Android devices for touch
   targets and gestures.
4. **Performance optimization**: audit CSS bundle size, consider code splitting
   or critical CSS.
5. **Content migration**: test with real production content to identify edge
   cases.
6. **Comments integration**: implement Utterances/Giscus/Disqus support (lowest
   priority, deferred).

### Remaining work checklist (living)

- [x] Search modal: style `.pagefind-ui__*` classes to match PaperMod’s search
      panel (input, results, loading states).
- [x] Post navigation (prev/next): verify two-column layout and title truncation
      in `layouts/post.ts` pagination block.
- [x] Post list layout: verify metadata ordering (date/reading time), spacing
      between title/excerpt, and confirm read-more link sizing across archive
      vs. home.
- [x] Post content view: added lead section styling (first paragraph emphasis)
      and header anchor hover reveal.
- [x] Archive/tag pages: ensure list density, metadata, and title sizing are
      aligned with PaperMod.
- [x] Theme toggle: consider SVG icon for cross-platform consistency; confirm
      icon sizing, hover/focus states, and alignment in the navigation bar.
- [x] Responsive QA: breakpoints at 480px/768px verified consistent across all
      layout files.
- [x] Code blocks: aligned Prism syntax highlighting colors with PaperMod’s dark
      code block style in both themes.
- [x] Footer: added `.footer-commit` monospace styling and improved separators.
- [ ] Cross-browser testing: verify rendering in Chrome, Firefox, Safari, Edge.
- [ ] Mobile device testing: validate on real iOS and Android devices.
- [ ] Performance audit: check CSS bundle size and loading performance.
- [ ] Content migration: test with production content for edge cases.
- [ ] i18n implementation: configure Multilanguage plugin, migrate UI strings,
      create language selector component.
- [x] Responsive images: configured Transform Images + Picture plugins for post
      cover images and content images. Created `CoverImage.ts` component with
      AVIF/WebP/JPG format support at 640/1024/1280px widths. Integrated into
      `layouts/post.ts` and `PostList.ts`. Added `cover-image.css` styles.
- [x] Scroll-to-top button: implemented JS component with CSS positioning,
      smooth scroll, throttled visibility toggle, and reduced motion support.
- [x] Code copy button: implemented clipboard API integration for code blocks
      with visual feedback (success/error states), fallback for older browsers.
- [x] Social icons: implemented `SocialIcons.ts` component with inline SVGs
      (Feather Icons), platform-specific hover colors, integrated into footer.
- [x] Robots.txt: added Robots plugin to `plugins.ts`, auto-generates
      `robots.txt`.
- [x] Related posts: implemented using Search plugin query by tags, displays up
      to 3 related posts sorted by relevance (shared tag count) then by date.
- [x] Themed scrollbar: implemented in `scrollbar.css` with theme-aware colors,
      Firefox support via `scrollbar-color`, and narrower scrollbars for code.
- [x] Smooth scroll: already implemented in `global.css` with reduced motion
      support.
- [x] Draft page indicators: implemented with `badge--draft` CSS, i18n string,
      and integration in `PostList.ts` and `layouts/post.ts`.
- [x] Access key shortcuts: implemented `accesskeys.js` module with
      PaperMod-style keyboard navigation (h=home, a=archives, s=search).
      Supports both Alt+key (Windows/Linux) and Control+Option+key (macOS)
      combinations.
- [x] Favicon generation: configured Favicon plugin in `plugins.ts` with
      `favicon.png` as input. Plugin auto-generates `favicon.ico`,
      `apple-touch-icon.png`, and injects appropriate `<link>` tags.
- [x] OG image generation: implemented via OG Images plugin with TSX layout.
      JSX/TSX exception documented in `CLAUDE.md` for PaperMod project.
- [ ] Comments integration: deferred to lowest priority per user request.

## Accepted trade-offs

1. ~~i18n migration can be delayed~~ — **RETRACTED**: The Lume Multilanguage
   plugin provides full feature parity with Hugo’s i18n system. i18n can be
   implemented as part of the migration using the Multilanguage plugin.
2. Search will rely on Pagefind UI with PaperMod-like styling (this is an
   **improvement** over PaperMod’s Fuse.js client-side search).

## Recommendation

PaperMod can be ported to Lume with **excellent parity**. The original concerns
about Hugo’s image pipeline and i18n have been resolved:

- **Image processing**: Lume’s Transform Images + Picture plugins provide
  **superior** responsive image automation with modern format support (AVIF,
  WebP).
- **i18n**: The Multilanguage plugin offers **full feature parity** with Hugo’s
  i18n system and is more flexible (single-file multilingual content support).

The remaining high-friction areas are limited to:

1. **Complex Hugo shortcodes** — Require case-by-case evaluation and custom
   Markdown-it plugins.
2. **Hugo’s 12+ image filters** — Rarely needed for blogs; custom Sharp
   functions available if required.

**Recommended approach**: Proceed with full migration rather than selective
adoption. The current Lume codebase already implements most PaperMod patterns,
and the plugin ecosystem covers the remaining functionality.

## Maintenance notes

- Updated client-side test mocks for toast, theme, and service worker features
  to align with stricter type checking.
