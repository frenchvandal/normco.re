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
| Multi-language (i18n)        | ✅ Feasible | Multilanguage plugin (full feature parity)       | ✅ **Implemented** |
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
- Implemented i18n with Multilanguage plugin (`plugins.ts`, `src/_data/i18n.ts`,
  `src/_data.ts`, `src/_components/LanguageSelector.ts`):
  - Configured Multilanguage plugin with three languages: English (default),
    French, and Chinese.
  - Created comprehensive translations for all UI strings (navigation, post
    metadata, search, sharing, author profile).
  - Implemented `LanguageSelector.ts` component with:
    - Dropdown menu with language options.
    - Keyboard navigation (Arrow keys, Escape, Home/End).
    - Click-outside-to-close behavior.
    - Mobile-responsive design (globe icon on small screens).
    - Proper ARIA attributes and `hreflang` support.
  - Added CSS styles in `lang-selector.css` with theme-aware colors.
  - Added JavaScript module `lang-selector.js` for dropdown interactions.
  - Integrated language selector into header navigation in `layouts/base.ts`.
  - Plugin automatically generates `<link rel="alternate" hreflang>` tags.
- Added JSON feed icon to footer (`src/_components/SocialIcons.ts`,
  `src/_data.ts`, `social-icons.css`):
  - Added `jsonfeed` SVG icon to SocialIcons component.
  - Added JSON feed entry in `social_links` pointing to `/feed-json-viewer/`.
  - Added hover color style for jsonfeed icon (#f5a623).

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

1. **Cross-browser QA**: test on Chrome, Firefox, Safari, and Edge to ensure
   consistent rendering.
2. **Mobile device testing**: validate on real iOS and Android devices for touch
   targets and gestures.
3. **Performance optimization**: audit CSS bundle size, consider code splitting
   or critical CSS.
4. **Content migration**: test with real production content to identify edge
   cases.
5. **Comments integration**: implement Utterances/Giscus/Disqus support (lowest
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
- [x] i18n implementation: configured Multilanguage plugin with English
      (default), French, and Chinese languages. Created `LanguageSelector.ts`
      component with dropdown menu, keyboard navigation, and mobile-responsive
      design. Added translations for all UI strings in `src/_data/i18n.ts`.
      Integrated language selector into header navigation via `layouts/base.ts`.
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
- [ ] Create Chinese version of all posts.
- [ ] Comments integration
- [ ] Update `README.md`, `COMPONENTS_USAGE.md`,
      `DESIGN_SYSTEM_INTEGRATION_ANALYSIS.md`, `tests/README.md` according to
      the new PaperMod architecture. Updated January 28, 2026: added new
      PaperMod components documentation, feature modules table, and PaperMod
      features list in README. Deferred to lowest priority per user request.

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

---

## Status update — January 28, 2026

### Build verification

- ✅ **Build successful**: 111 files generated in ~3 seconds
- ✅ **Linting passes**: `deno lint` — no errors
- ✅ **Formatting passes**: `deno fmt` — all files formatted

### Performance audit results

| Asset      | Size  | Notes                                              |
| ---------- | ----- | -------------------------------------------------- |
| styles.css | 59 KB | ~40 CSS modules, minified by LightningCSS          |
| main.js    | 24 KB | All JS features bundled via ESBuild                |
| sw.js      | 2.5KB | Service worker                                     |
| style.css  | 40 B  | Lume component CSS (empty — components use inline) |

The CSS bundle size (59KB) is reasonable for a complete design system with:

- Design tokens and theming (light/dark)
- Base styles (reset, typography, Prism syntax highlighting, scrollbars)
- 25+ component styles (buttons, badges, alerts, modals, etc.)
- 7 layout styles (navbar, footer, posts, archives, etc.)

PurgeCSS is configured with appropriate safelists for dynamic classes.

### i18n status

The Multilanguage plugin is fully configured with:

- Languages: English (default), French, Chinese
- `LanguageSelector.ts` component with dropdown menu, keyboard navigation
- Comprehensive translations in `src/_data/i18n.ts`

**Language selector is now functional:** The selector appears on pages with
alternate language versions. Tested with the following multilingual content:

- `markdown-syntax.md` (EN) / `markdown-syntax.fr.md` (FR)
- `code-syntax.md` (EN) / `code-syntax.fr.md` (FR)
- `emoji-support.md` (EN) / `emoji-support.fr.md` (FR)
- `rich-content.md` (EN) / `rich-content.fr.md` (FR)

The `hreflang` tags are automatically generated in the HTML `<head>`.

### Content migration — PaperMod example site

**Status: COMPLETED**

All required demo posts have been created:

1. **Demo posts** (to showcase theme features):
   - ✅ `code-syntax.md` — Code syntax highlighting (JS, TS, Python, Go, Rust,
     HTML, CSS, Bash, JSON, YAML, diff)
   - ✅ `emoji-support.md` — Emoji rendering (smileys, nature, food, tech,
     symbols, flags)
   - ✅ `markdown-syntax.md` — Markdown feature showcase (headings, lists,
     tables, blockquotes, alerts)
   - ⬜ `math-typesetting.md` — Math/LaTeX rendering (requires KaTeX plugin —
     deferred)
   - ✅ `rich-content.md` — Embedded content (YouTube, Vimeo, audio, collapsible
     sections, ASCII diagrams)
   - ✅ `draft-post.md` — Draft indicator demonstration

2. **French translations** (for i18n testing):
   - ✅ `markdown-syntax.fr.md`
   - ✅ `code-syntax.fr.md`
   - ✅ `emoji-support.fr.md`
   - ✅ `rich-content.fr.md`

3. **Documentation pages:**
   - ✅ `archives.md` — Already implemented as `archive.page.ts`
   - ✅ `search.md` — Already implemented via Pagefind modal

**Source:**
https://github.com/adityatelange/hugo-PaperMod/tree/exampleSite/content

### Generated pages

The following pages are now generated:

**English posts:**

- `/posts/code-syntax/`
- `/posts/markdown-syntax/`
- `/posts/emoji-support/`
- `/posts/rich-content/`
- `/posts/css-architecture/`
- `/posts/lume-blog-architecture-deep-dive/`

**French posts:**

- `/fr/posts/code-syntax-fr/`
- `/fr/posts/markdown-syntax-fr/`
- `/fr/posts/emoji-support-fr/`
- `/fr/posts/rich-content-fr/`

**Archive pages** (auto-generated from tags):

- `/archive/` (main)
- `/archive/markdown/`
- `/archive/code/`
- `/archive/syntax/`
- `/archive/emoji/`
- `/archive/demo/`
- `/archive/media/`
- `/author/phiphi/`

### Next actions (ordered)

1. **Cross-browser QA** — Test on Chrome, Firefox, Safari, Edge with the new
   demo content in place.

2. **Mobile testing** — Validate on real iOS/Android devices.

3. **Math typesetting** — Add KaTeX plugin for math rendering (optional,
   deferred).

4. **Comments integration** — Implement Utterances/Giscus (deferred, lowest
   priority).

5. **Update Documentation** — Files `README.md`, `COMPONENTS_USAGE.md`,
   `DESIGN_SYSTEM_INTEGRATION_ANALYSIS.md`, and `tests/README.md`.

---

## Visual Audit — January 28, 2026 (REVISED)

### Executive Summary

After visual comparison between the current Lume site and the original PaperMod
Hugo theme, the previous scores were **overly optimistic**. While the functional
components are largely complete, there are **significant visual differences**
that need to be addressed.

| Metric                      | Previous Score | Revised Score |
| --------------------------- | -------------- | ------------- |
| **Overall progress**        | ~95%           | **~70%**      |
| **Functional parity**       | 97%            | **~90%**      |
| **Visual/CSS parity**       | ~92-95%        | **~60%**      |
| **Layout structure parity** | —              | **~65%**      |

### Critical Visual Differences (Side-by-Side Comparison)

The following differences were identified by comparing the current site
screenshot with the official PaperMod demo at
https://adityatelange.github.io/hugo-PaperMod/.

---

## 1. HEADER / NAVIGATION BAR

### PaperMod Original

- Logo "PaperMod" on the left
- Theme toggle icon (sun) immediately after logo
- Separator `|` between logo section and language selector
- Language selector with flag icon (🇫🇷) + language code ("Fa")
- Navigation links on the right: "Archive", "Search", "Tags", "WiKi" (with
  external link icon ↗)

### Current Site (normco.re)

- Logo "normco.re" on the left
- Navigation links in middle: "Archive", "Contact"
- Theme toggle icon on the far right
- No visible separator
- Language selector hidden (only shows when alternates exist)

### Tasks

- [ ] **TASK-NAV-01**: Move theme toggle icon immediately after the logo
      (PaperMod style)
- [ ] **TASK-NAV-02**: Add vertical separator `|` between logo/theme toggle and
      navigation
- [ ] **TASK-NAV-03**: Make language selector always visible with flag icon
      format (currently only dropdown)
- [ ] **TASK-NAV-04**: Add "Search" link in navigation (PaperMod shows it as nav
      item, not just Cmd+K)
- [ ] **TASK-NAV-05**: Add "Tags" link in navigation pointing to tags archive
- [ ] **TASK-NAV-06**: Add external link icon (↗) for menu items with
      `target="_blank"`

---

## 2. HOME PAGE HERO SECTION

### PaperMod Original ("Home-Info" Mode)

- Large bold title: "PaperMod's Demo"
- Welcome text with emoji: "👋 Welcome to demo page of Hugo's theme PaperMod!"
- Bullet list describing features:
  - "PaperMod is designed to be clean and simple..."
  - "Feel free to show your support by giving us a star 🌟..."
  - "PaperMod is based on theme Paper."
- Social icons row (GitHub, Discord, X/Twitter, Ko-fi) **directly below the hero
  text**
- **NO search bar on the home page**

### Current Site (normco.re)

- Italic display title: "Hello, I am a person that writes stuff."
- Search bar directly below title
- No bullet list
- No social icons in hero section (they're in the footer only)

### Tasks

- [ ] **TASK-HOME-01**: Implement PaperMod "Home-Info" mode with:
  - Bold title (not italic)
  - Markdown-rendered content (bullet points)
  - Social icons row below hero text
- [ ] **TASK-HOME-02**: Remove search bar from home page (search is accessed via
      nav link or Cmd+K in PaperMod)
- [ ] **TASK-HOME-03**: Add `home.content` field in `_data.ts` for markdown
      content (bullet points)
- [ ] **TASK-HOME-04**: Create `HomeInfo.ts` component for hero section

---

## 3. POST CARDS / LIST ENTRIES

### PaperMod Original

- Each post is a **distinct card** with:
  - **Background color**: `var(--entry)` — a lighter shade than the page
    background (dark mode: `rgb(46, 46, 51)` vs page `rgb(29, 30, 32)`)
  - **Border radius**: 8px (var(--radius))
  - **Padding**: Generous internal spacing
  - **Full card is clickable** (no separate "Continue reading" link)
- Card layout (top to bottom):
  1. **Title** (large, bold)
  2. **Description/excerpt** (regular text)
  3. **Metadata line** at bottom: "January 20, 2021 · 5 min · Aditya Telange"
- **NO tags displayed** in the home page list
- **NO "Continue reading" link** — entire card is the link
- Hover effect: Border color change + subtle elevation
- Active/click effect: `transform: scale(0.96)`

### Current Site (normco.re)

- Posts appear as **list items** without distinct background
- Layout (top to bottom):
  1. Title
  2. "by phiphi · January 28th, 2026 · 1 min read"
  3. "Tags: #Draft #Demo"
  4. Description/excerpt
  5. "Continue reading →→"
- Tags are prominently displayed with "Tags:" label and hashtags
- Separate "Continue reading" link at bottom
- Border visible but no background differentiation

### Tasks

- [ ] **TASK-CARD-01**: Add `--color-entry` CSS variable for card background
      (distinct from `--color-background`)
  - Light mode: slightly darker than white
  - Dark mode: `#2e2e33` (PaperMod's `--entry`)
- [ ] **TASK-CARD-02**: Apply `--color-entry` background to `.post-entry` class
- [ ] **TASK-CARD-03**: Restructure post card layout:
  - Title first
  - Description second
  - Metadata at bottom
- [ ] **TASK-CARD-04**: Remove tags from home page post list (keep on single
      post and archive pages)
- [ ] **TASK-CARD-05**: Remove "Continue reading" link — make entire card
      clickable
- [ ] **TASK-CARD-06**: Update `PostList.ts` component to wrap entire card in
      `<a>` tag
- [ ] **TASK-CARD-07**: Modify `index.page.ts` to use the updated PostList
      component
- [ ] **TASK-CARD-08**: Update metadata format to "Date · Reading time · Author"
      (remove "by" prefix)

---

## 4. POST METADATA FORMAT

### PaperMod Original

- Format: `January 20, 2021 · 5 min · Aditya Telange`
- Order: Date → Reading time → Author
- No "by" prefix
- Positioned at **bottom** of card

### Current Site

- Format: `by phiphi · January 28th, 2026 · 1 min read`
- Order: "by" + Author → Date → Reading time
- "by" prefix present
- "read" suffix on reading time
- Positioned at **top** of card (under title)

### Tasks

- [ ] **TASK-META-01**: Change metadata order to: Date → Reading time → Author
- [ ] **TASK-META-02**: Remove "by" prefix from author
- [ ] **TASK-META-03**: Change "X min read" to "X min" (remove "read" suffix)
- [ ] **TASK-META-04**: Update `PostDetails.ts` component with new order
- [ ] **TASK-META-05**: Create separate component or variant for list vs single
      post metadata display

---

## 5. FOOTER

### PaperMod Original

- Single line: `© PaperMod Contributors · Powered by Hugo & PaperMod`
- Links to Hugo and PaperMod
- **NO social icons in footer** (they're in the hero section)
- Minimal design

### Current Site

- Copyright + commit hash: `© 2026 · 31998140`
- Social icons row below
- More complex footer

### Decision

The current footer implementation is **intentionally different** and provides
useful features (commit tracking, social links). This is an **acceptable
deviation** from PaperMod.

- [x] **TASK-FOOTER**: No changes needed — current implementation is intentional
      enhancement

---

## 6. PAGINATION

### PaperMod Original

- Shows pagination like "Next 2/2 »" on home page when there are more posts
- Numeric page indicator

### Current Site

- Shows "More posts can be found in the archive." with link
- No numeric pagination on home

### Tasks

- [ ] **TASK-PAG-01**: Add pagination to home page when more than 3 posts exist
- [ ] **TASK-PAG-02**: Use PaperMod-style pagination format: "« Previous 1/2" /
      "Next 2/2 »"

---

## 7. TYPOGRAPHY

### PaperMod Original

- Page title: Bold, not italic
- Clean sans-serif throughout

### Current Site

- Page title: Uses `.u-display-title` which may be italic
- Generally similar typography

### Tasks

- [ ] **TASK-TYPO-01**: Ensure home page title is bold, not italic (check
      `.u-display-title` utility)

---

## 8. MISSING CSS TOKENS

The following PaperMod CSS variables are missing or incorrectly mapped:

| PaperMod Variable | Value (Dark)         | Lume Equivalent | Status   |
| ----------------- | -------------------- | --------------- | -------- |
| `--entry`         | `rgb(46, 46, 51)`    | Missing         | ❌ Add   |
| `--border`        | `rgb(51, 51, 51)`    | `--color-line`  | ⚠️ Check |
| `--content`       | `rgb(196, 196, 197)` | `--color-text`  | ✅ OK    |

### Tasks

- [ ] **TASK-TOKEN-01**: Add `--color-entry` variable for card backgrounds
- [ ] **TASK-TOKEN-02**: Verify `--color-line` matches PaperMod's `--border`

---

## Priority Task List (Ordered)

### High Priority (Visual Parity)

1. **TASK-CARD-01 to TASK-CARD-08**: Post card styling is the most visible
   difference
2. **TASK-HOME-01 to TASK-HOME-04**: Home page hero section structure
3. **TASK-META-01 to TASK-META-05**: Metadata format and position
4. **TASK-TOKEN-01**: Add missing CSS token for entry background

### Medium Priority (Navigation)

5. **TASK-NAV-01 to TASK-NAV-06**: Header/navigation restructuring
6. **TASK-PAG-01 to TASK-PAG-02**: Home page pagination
7. **TASK-TYPO-01**: Typography adjustments

### Low Priority (Polish)

8. Cross-browser testing (Chrome, Firefox, Safari, Edge)
9. Mobile device testing (iOS, Android)
10. Comments integration (Utterances/Giscus) — deferred
11. Math typesetting (KaTeX) — deferred

---

## Implementation Notes

### Card Background Color Values

From PaperMod source (`theme-vars.css`):

```css
/* Light theme */
:root {
  --theme: rgb(255, 255, 255);
  --entry: rgb(255, 255, 255);
  --primary: rgb(30, 30, 30);
  --secondary: rgb(108, 108, 108);
  --tertiary: rgb(214, 214, 214);
  --content: rgb(31, 31, 31);
  --border: rgb(238, 238, 238);
}

/* Dark theme */
[data-theme="dark"] {
  --theme: rgb(29, 30, 32);
  --entry: rgb(46, 46, 51);
  --primary: rgb(218, 218, 219);
  --secondary: rgb(155, 156, 157);
  --tertiary: rgb(65, 66, 68);
  --content: rgb(196, 196, 197);
  --border: rgb(51, 51, 51);
}
```

### Post Entry HTML Structure (PaperMod)

```html
<article class="post-entry">
  <header class="entry-header">
    <h2>Post Title</h2>
  </header>
  <section class="entry-content">
    <p>Post description/excerpt...</p>
  </section>
  <footer class="entry-footer">
    <span>January 20, 2021</span>
    <span>·</span>
    <span>5 min</span>
    <span>·</span>
    <span>Author Name</span>
  </footer>
  <a
    class="entry-link"
    aria-label="post link to Post Title"
    href="/posts/..."
  ></a>
</article>
```

Note: PaperMod uses an absolutely positioned `<a>` that covers the entire card
for click handling, while keeping the card structure semantic.

---

## Files to Modify

| File                                         | Tasks                        |
| -------------------------------------------- | ---------------------------- |
| `src/_includes/css/01-tokens/tokens.css`     | TASK-TOKEN-01, TASK-TOKEN-02 |
| `src/_includes/css/05-layouts/post-list.css` | TASK-CARD-01 to TASK-CARD-08 |
| `src/_components/PostList.ts`                | TASK-CARD-06, TASK-META-*    |
| `src/_components/PostDetails.ts`             | TASK-META-01 to TASK-META-05 |
| `src/index.page.ts`                          | TASK-HOME-*, TASK-CARD-07    |
| `src/_includes/layouts/base.ts`              | TASK-NAV-*                   |
| `src/_includes/css/05-layouts/navbar.css`    | TASK-NAV-*                   |
| `src/_data.ts`                               | TASK-HOME-03                 |

---

## Superseded Sections

The previous "Comparative Audit — January 28, 2026" section with 98.65% score
has been superseded by this more accurate visual audit. The functional
components remain valid, but the visual parity was overstated.
