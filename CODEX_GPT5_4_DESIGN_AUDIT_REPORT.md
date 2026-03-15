# CODEX GPT-5.4 Design Audit Report

Context update: since this audit was produced, individual post bodies moved from
TSX modules to multilingual Markdown files under `src/posts/<slug>/`. The
archive page at `src/posts/index.page.tsx` remains unchanged.

## 1. Executive summary

This repository uses Carbon v11 tokens as a real foundation, but most UI
primitives are custom implementations that borrow Carbon class names, naming,
and visual intent rather than importing Carbon component styles directly.

The strongest issues are not cosmetic:

- Localized header navigation can expose multiple `aria-current="page"` links at
  once.
- The mirrored `feed.xsl` and `sitemap.xsl` shells drop primary navigation on
  small screens because they omit the mobile UI shell controls that the shared
  CSS expects.
- The XSL search panels advertise modal state with invalid ARIA.
- Several archive and pagination states depend on Carbon-looking CSS variables
  that are not actually emitted by this project build.

Acceptable areas:

- The base layout provides a skip link, `main`, `nav`, and `footer` landmarks.
- Theme mode is initialized before paint and the theme toggle keeps
  `aria-pressed` and labels synchronized.
- Header toggles consistently pair `aria-expanded` with `aria-controls`, and
  focus restoration is implemented.

Severity summary:

- High: 3
- Medium: 4
- Low: 1

## 2. Audit scope

Audited implementation surfaces:

- `src/_components/`
- `src/_includes/layouts/`
- `src/styles/`
- `src/styles/carbon/`
- `src/scripts/`
- `src/feed.xsl`
- `src/sitemap.xsl`
- current build artifacts under `_site/` after running `deno task build`

Intentionally excluded as authoritative:

- `/docs/**`
- prior local audit writeups

## 3. Sources used

Official Carbon sources:

- <https://carbondesignsystem.com/guidelines/accessibility/overview/>
- <https://carbondesignsystem.com/elements/color/overview/>
- <https://carbondesignsystem.com/elements/color/tokens/>
- <https://carbondesignsystem.com/elements/themes/overview/>
- <https://carbondesignsystem.com/elements/2x-grid/code/>
- <https://carbondesignsystem.com/elements/2x-grid/usage/>
- <https://carbondesignsystem.com/elements/typography/overview/>
- <https://carbondesignsystem.com/elements/typography/type-sets/>
- <https://carbondesignsystem.com/components/ui-shell-header/usage/>
- <https://carbondesignsystem.com/components/breadcrumb/usage/>
- <https://carbondesignsystem.com/components/pagination/usage/>

Repository implementation evidence:

- `src/style.scss`
- `src/styles/carbon/_theme-tokens.scss`
- `src/styles/editorial/_tokens.scss`
- `src/styles/_layout.scss`
- `src/styles/_base.scss`
- `src/styles/components/_header.scss`
- `src/styles/components/_breadcrumb.scss`
- `src/styles/components/_archive.scss`
- `src/styles/components/_pagination.scss`
- `src/styles/components/_prism.scss`
- `src/_components/Header.tsx`
- `src/_includes/layouts/base.tsx`
- `src/_includes/layouts/post.tsx`
- `src/posts/index.page.tsx`
- `src/scripts/disclosure-controls.js`
- `src/scripts/archive-year-nav.js`
- `src/feed.xsl`
- `src/sitemap.xsl`
- `_site/style.288a3c0b9b.css`
- `_site/fr/posts/instructions/index.html`

## 4. Findings by severity

### [High] Localized header matching can mark multiple nav items as the current page

- Files: `src/_components/Header.tsx:21-29`,
  `_site/fr/posts/instructions/index.html`
- Type: accessibility defect | implementation inconsistency
- Evidence: `ariaCurrent()` returns `aria-current="page"` for any non-root
  `href` when `currentUrl.startsWith(href)`. On localized routes the home link
  is `/fr/`, `/zh-hans/`, or `/zh-hant/`, so every descendant route starts with
  the home URL. The current build output for
  `_site/fr/posts/instructions/index.html` shows both `Accueil` and `Articles`
  marked `aria-current="page"` in the header and side nav.
- Carbon reference:
  <https://carbondesignsystem.com/guidelines/accessibility/overview/>
- Why it matters: a single navigation landmark should not expose multiple
  current pages. This confuses screen readers and produces incorrect active
  styling.
- Recommended fix: special-case localized home URLs to exact-match only, and use
  segment-aware matching for section roots such as `/posts/`.

### [High] Feed and sitemap shells lose primary navigation below the Carbon `md` breakpoint

- Files: `src/feed.xsl:34-45`, `src/sitemap.xsl:30-40`,
  `src/styles/_layout.scss:325-356`
- Type: implementation inconsistency | repository deviation
- Evidence: the shared layout CSS hides `.cds--header__nav` below `md` and
  expects `.cds--header__menu-toggle` plus `.cds--side-nav` to take over. The
  XSL shells render desktop nav only and omit both the menu toggle and the side
  nav structure used by `Header.tsx`.
- Carbon reference:
  <https://carbondesignsystem.com/components/ui-shell-header/usage/>
- Why it matters: feed and sitemap pages become effectively non-navigable on
  small screens once the desktop nav is hidden.
- Recommended fix: either mirror the full responsive shell from `Header.tsx` in
  the XSL files or opt those pages out of the shared hide-at-mobile rules.

### [High] Feed and sitemap search panels use `aria-modal` without dialog semantics

- Files: `src/feed.xsl:94-99`, `src/sitemap.xsl:90-95`,
  `src/scripts/disclosure-controls.js:205-220`,
  `src/scripts/disclosure-controls.js:269-298`
- Type: accessibility defect
- Evidence: both XSL search panels set `aria-modal="true"` on a plain `div` with
  no `role="dialog"` and no accessible title relationship. The shared disclosure
  script traps focus for open header panels and locks scroll when they open, so
  the behavior is modal in practice.
- Carbon reference: not applicable
- Why it matters: invalid modal ARIA creates ambiguous panel semantics for
  assistive technology and conflicts with the actual interaction model.
- Recommended fix: either make the panels real dialogs with `role="dialog"` and
  `aria-labelledby`/`aria-label`, or remove modal behavior and treat them as
  ordinary disclosures.

### [Medium] Search/Pagefind styling targets selectors that are never rendered

- Files: `src/styles/components/_header.scss:14-145`,
  `src/_components/Header.tsx:247-263`
- Type: implementation inconsistency
- Evidence: the Pagefind customization layer is scoped to `.site-search-root`,
  but the rendered search container is `class="cds--header__search-root"`. No
  `.site-search-root` class is emitted by `Header.tsx`, `feed.xsl`,
  `sitemap.xsl`, or the generated HTML.
- Carbon reference: not applicable
- Why it matters: the search UI falls back to Pagefind defaults instead of the
  intended Carbon-adjacent styling.
- Recommended fix: align the selectors and markup. Either retarget the SCSS to
  `.cds--header__search-root` or add the missing `site-*` classes consistently.

### [Medium] Archive and pagination states depend on Carbon-looking tokens that this build does not emit

- Files: `src/styles/components/_archive.scss:38-47`,
  `src/styles/components/_archive.scss:165-168`,
  `src/styles/components/_pagination.scss:22-25`,
  `src/styles/components/_pagination.scss:58-60`,
  `src/styles/carbon/_theme-tokens.scss:18-190`,
  `_site/style.288a3c0b9b.css:520-521`
- Type: exact Carbon mismatch | implementation inconsistency
- Evidence: archive and pagination styles reference `--cds-button-primary`,
  `--cds-text-on-emphasis`, `--cds-background-disabled`, and
  `--cds-productive-body-01-font-size`. The current build artifact emits aliases
  such as `--cds-layer-active` and `--cds-layer-background`, but it does not
  define those four variables anywhere. The installed Carbon sources show
  `--cds-button-primary` in
  `node_modules/.deno/@carbon+styles@1.102.0/node_modules/@carbon/styles/css/styles.css:3040`
  and `text-inverse` in
  `node_modules/.deno/@carbon+themes@11.69.0/node_modules/@carbon/themes/scss/generated/_tokens.scss:217-218`,
  but no Carbon token named `text-on-emphasis`, which confirms local token drift
  plus missing token emission.
- Carbon reference: <https://carbondesignsystem.com/elements/color/tokens/> and
  <https://carbondesignsystem.com/elements/themes/overview/>
- Why it matters: invalid custom-property lookups silently drop visual states.
  In practice this affects the archive timeline markers, active year-nav pill
  styling, disabled pagination states, and pagination text sizing.
- Recommended fix: replace invented names with emitted tokens such as
  `--cds-text-inverse` and existing theme tokens, or intentionally import and
  emit the component-token layer before using those variables.

### [Medium] Archive pagination renders focusable controls with no navigation behavior

- Files: `src/posts/index.page.tsx:165-203`
- Type: implementation inconsistency | repository deviation
- Evidence: the archive page emits page-number and next/previous buttons, but
  the same file documents the feature as “Static for now; would be dynamic with
  query params,” and there is no script or routing logic anywhere in the repo
  for `.cds--pagination__page-button` or the next/previous controls.
- Carbon reference:
  <https://carbondesignsystem.com/components/pagination/usage/>
- Why it matters: users encounter Carbon-styled pagination affordances that do
  nothing.
- Recommended fix: either implement real paginated routes/links or remove the
  controls until they are functional.

### [Medium] Archive year-nav never receives its intended active styling

- Files: `src/posts/index.page.tsx:120-131`,
  `src/scripts/archive-year-nav.js:17-26`,
  `src/styles/components/_archive.scss:165-168`
- Type: implementation inconsistency
- Evidence: the archive markup and JS both set `aria-current="location"`, but
  the SCSS only styles `.archive-year-nav-link[aria-current="true"]`.
- Carbon reference: not applicable
- Why it matters: the current year/section indicator is never visually applied,
  which weakens orientation in the sticky year nav.
- Recommended fix: style `[aria-current="location"]` or change the emitted ARIA
  value to match the selector.

### [Low] The archive breadcrumb uses a different DOM contract than the project’s own Carbon breadcrumb implementation

- Files: `src/posts/index.page.tsx:135-141`,
  `src/_includes/layouts/post.tsx:183-204`,
  `src/styles/components/_breadcrumb.scss:8-33`
- Type: implementation inconsistency | repository deviation
- Evidence: post pages use an ordered-list breadcrumb structure that matches the
  component SCSS. The archive page uses a flat `nav` with anchors/spans carrying
  `cds--breadcrumb-item` plus manual separator elements, even though the shared
  breadcrumb SCSS already injects separators with
  `.cds--breadcrumb-item::after`.
- Carbon reference:
  <https://carbondesignsystem.com/components/breadcrumb/usage/>
- Why it matters: the same breadcrumb pattern now has two incompatible markup
  contracts, increasing maintenance risk and making separator handling fragile.
- Recommended fix: reuse the list-based breadcrumb structure already used in
  post pages.

## 5. Carbon component mapping table

| Pattern                      | Implementation evidence                                                                                 | Classification                                                                      | Notes                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| UI shell header              | `src/_components/Header.tsx`, `src/styles/_layout.scss`, `src/scripts/disclosure-controls.js`           | Adapted Carbon component                                                            | Uses Carbon class names and shell concepts, but markup, styling, and behavior are hand-authored. |
| Side navigation              | `src/_components/Header.tsx`, `src/styles/_layout.scss`, `src/scripts/disclosure-controls.js`           | Adapted Carbon component                                                            | Carbon-inspired side nav behavior, with custom overlay and state logic.                          |
| Search                       | `src/_components/Header.tsx`, `src/styles/components/_header.scss`, `src/scripts/pagefind-lazy-init.js` | Carbon-styled custom component                                                      | Pagefind is mounted inside a custom panel; this is not Carbon Search.                            |
| Breadcrumb                   | `src/_includes/layouts/post.tsx`, `src/posts/index.page.tsx`, `src/styles/components/_breadcrumb.scss`  | Mixed: adapted Carbon component on posts; Carbon-styled custom component on archive | The post breadcrumb is structurally coherent; the archive breadcrumb diverges.                   |
| Tags                         | `src/_includes/layouts/post.tsx`, `src/styles/components/_tag.scss`                                     | Carbon-styled custom component                                                      | Carbon naming is reused, but colors and rounded treatment are custom.                            |
| Pagination                   | `src/posts/index.page.tsx`, `src/styles/components/_pagination.scss`                                    | Carbon-styled custom component                                                      | Visually modeled after Carbon pagination but not yet functional.                                 |
| Code snippets                | `src/styles/_base.scss`, `src/styles/components/_prism.scss`, `src/scripts/post-code-copy.js`           | Custom component with no strong Carbon equivalent                                   | This does not map to Carbon Code Snippet.                                                        |
| Language selector            | `src/_components/Header.tsx`, `src/scripts/disclosure-controls.js`                                      | Custom component with no strong Carbon equivalent                                   | Closest to a switcher/menu pattern, but fully custom.                                            |
| Feed/sitemap action controls | `src/feed.xsl`, `src/sitemap.xsl`, `src/styles/components/_feeds.scss`                                  | Custom component with no strong Carbon equivalent                                   | Not a Carbon component mapping.                                                                  |

## 6. Token integrity review

Actual token foundation:

- `src/styles/carbon/_theme-tokens.scss` is the real theme source. It uses
  `@carbon/styles/scss/theme` with `themes.$white`, `themes.$g90`, and
  `themes.$g100`.
- That file also emits local convenience tokens for spacing, motion, type
  shorthands, font families, z-indexes, and focus-ring measurements.

Observed token risks:

- `src/styles/editorial/_tokens.scss` introduces a second, repository-specific
  token layer with raw values for text sizes, leading, measure, and border
  radii. This is a repository deviation, not an exact Carbon violation by
  itself.
- `src/styles/_base.scss:145-160` overrides theme tokens with raw hex values in
  `prefers-contrast: more`. That bypasses Carbon token derivation and could
  drift from upstream theme updates.
- `src/styles/components/_prism.scss:1-87` uses direct `oklch()` colors and
  `light-dark()` instead of Carbon tokens. This is an intentional local
  editorial palette, not an exact Carbon component implementation.
- The project currently mixes theme tokens and component tokens inconsistently.
  Some component-token names are referenced as CSS vars without ensuring those
  vars are emitted by the build.

Token conclusion:

- Carbon tokens are present and materially used.
- Token discipline is not strict enough to call the system “Carbon-token-only.”
- The main correctness problem is not the existence of local aliases; it is the
  use of unsupported or unemitted `--cds-*` names in live component states.

## 7. Accessibility and semantics review

Working well:

- `src/_includes/layouts/base.tsx` provides a skip link, `main`, `nav`, and
  `footer` landmarks.
- Header controls consistently expose `aria-expanded` and `aria-controls`.
- `src/scripts/disclosure-controls.js` restores focus on close and supports
  `Escape`.
- `src/scripts/theme-toggle.js` updates `aria-label` and `aria-pressed` to
  reflect the active theme.

Defects or risks:

- Localized header matching can expose multiple `aria-current="page"` states in
  one nav.
- Feed and sitemap pages lose primary navigation on small screens.
- Feed and sitemap search panels use invalid modal ARIA.
- Archive pagination is inert but focusable.
- Archive breadcrumb markup is inconsistent with the shared breadcrumb contract.

Semantics verdict:

- The repository has a solid baseline semantic shell.
- The highest-risk accessibility issues come from custom shell behavior,
  duplicated XSL chrome, and navigation-state logic rather than from missing
  landmarks.

## 8. Repository deviations from Carbon

- Carbon component class names are used heavily, but most components are not
  built from Carbon component Sass or Carbon component packages.
- `src/style.scss` claims “Carbon 2x Grid,” but the entrypoint does not import
  `src/styles/carbon/_grid.scss`, and the implemented layouts rely on custom CSS
  Grid rules instead of Carbon grid utilities.
- The tag, breadcrumb, pagination, search, and code patterns are best described
  as Carbon-inspired custom components.
- The editorial token layer and Prism palette create a distinct local design
  language on top of Carbon’s theme tokens.
- `src/styles/carbon/_theme-tokens.scss` defines a `gray-100` theme mode, but no
  user-facing control or script path exposes it.
- `src/feed.xsl` and `src/sitemap.xsl` duplicate the shell rather than sharing
  one source of truth, and that duplication is already drifting from the TSX
  implementation.

## 9. Open questions

- Should `feed.xsl` and `sitemap.xsl` keep the full responsive site shell, or
  are they intentionally meant to be simplified utility pages? Human said: YES
- Should the search and language panels behave as modal dialogs, or should they
  remain non-modal disclosures with no focus trap? Human said: Explain the pros
  and cons of each solution
- Is archive pagination expected to become functional in the near term, or
  should the current placeholder controls be removed? Humain said: YES
- Is the `gray-100` theme mode dead code, or is there a future
  accessibility/theming plan for it? Human said: No clue, what do you think?

## 10. Recommended remediation order

1. Fix header current-state logic so only one link per nav can expose
   `aria-current="page"`.
2. Repair the XSL shell: restore mobile navigation parity with `Header.tsx` and
   correct the search-panel modal semantics.
3. Remove or replace unsupported `--cds-*` variable usages in archive and
   pagination styles.
4. Align the search styling selectors with the rendered Pagefind container
   classes.
5. Either implement real archive pagination or remove the placeholder controls.
6. Fix archive year-nav ARIA/state selector drift and normalize breadcrumb
   markup across page types.
7. Decide explicitly which non-Carbon layers are intentional long-term
   deviations: editorial aliases, Prism palette, custom grid, and dormant theme
   modes.
