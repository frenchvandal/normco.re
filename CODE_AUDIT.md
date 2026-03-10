# Code Audit Report — normco.re

> Audit date: 2026-03-10
> Auditor: Claude (claude-sonnet-4-6)
> Scope: Full codebase — architecture, TypeScript quality, CSS, client-side JS,
> build pipeline, i18n, accessibility, security, testing, and custom plugins.
> Branch: `claude/code-audit-report-EKic4`

---

## Executive Summary

The normco.re codebase is overall of high quality. It applies a coherent
architecture — Deno + Lume + TSX — consistently, enforces the strictest
TypeScript compiler flags, maintains a well-structured CSS layer system, and
ships a non-trivial service worker with predictive preloading. The project is
meaningfully tested (19 test files), enforces Conventional Commits via Lefthook,
and includes a production-grade OpenTelemetry plugin.

The issues identified are minor to medium in severity. None blocks shipping.
They are grouped below by theme, with severity ratings and concrete
justifications for each finding.

**Severity scale**

| Level | Meaning |
|-------|---------|
| 🔴 High | Behavioral bug, data loss risk, or significant accessibility regression |
| 🟡 Medium | Inconsistency with stated conventions, maintenance risk, or latent bug |
| 🟢 Low | Style divergence, missed optimization, or polish opportunity |

---

## 1. Architecture

### 1.1 Language code duality (internal vs. URL keys)

**Severity: 🟢 Low**

The codebase uses two parallel conventions for Chinese language codes:

- TypeScript internal keys: `zhHans`, `zhHant` (camelCase, valid identifiers)
- URL and data codes: `zh-hans`, `zh-hant` (kebab-case, matching HTML `lang` values)

The mapping is handled via `LANGUAGE_DATA_CODE`, `LANGUAGE_ALIASES`, and the
`MULTILANGUAGE_DATA_ALIASES` preprocess hook in `_config.ts`. The implementation
is correct and well-commented, but it means a developer must mentally track two
key spaces. Introducing a third or fourth script tag for Chinese (e.g., `zh-MO`)
would require updates in at least four places: `i18n.ts`, `_config.ts`,
`sw.js`, and `_data.ts`.

**Recommendation:** Document the two-key design explicitly in `i18n.ts` (a
top-level JSDoc block explaining the internal/external key split) so that future
contributors understand the invariant immediately.

---

### 1.2 `robots.txt` configuration is not DRY

**Severity: 🟢 Low**

In `_config.ts`, the `robots()` plugin lists all offline and 404 page variants
explicitly:

```ts
{ userAgent: "*", disallow: "/offline" },
{ userAgent: "*", disallow: "/offline.html" },
{ userAgent: "*", disallow: "/fr/offline" },
{ userAgent: "*", disallow: "/fr/offline/" },
{ userAgent: "*", disallow: "/zh-hans/offline" },
// …
```

This is a manual enumeration of every language-prefixed path. Adding a fifth
language would require a developer to remember this location and update it,
without any compile-time or test-time reminder. The `OFFLINE_URL_BY_LANGUAGE`
object in `sw.js` already captures this mapping; there is no shared source of
truth between the two files.

**Recommendation:** Derive the disallow entries from `LANGUAGE_PREFIX` (or
equivalent) programmatically, so adding a language propagates automatically.

---

### 1.3 `_config.ts` preprocess hook for language aliases

**Severity: 🟢 Low**

The multilanguage plugin cannot handle hyphenated keys directly (Lume resolves
`zh-hans` as `zh` then `hans`), so `_config.ts` includes a preprocess hook that
copies `pageData.zhHans → pageData["zh-hans"]` at build time:

```ts
site.preprocess([".html"], (pages: Page[]) => {
  for (const page of pages) {
    const pageData = page.data as Record<string, unknown>;
    // ...
  }
});
```

The `as Record<string, unknown>` cast is the only deliberate type escape in the
build config. It is justified by the Lume framework boundary (§5.4 of CLAUDE.md)
and is clearly commented. The logic is correct.

**Recommendation:** Add a test assertion (or at least a comment) verifying that
a post with `zhHans` data receives a correctly aliased `zh-hans` key, so the
behavior is not silently broken by a future Lume upgrade.

---

## 2. TypeScript Quality

### 2.1 Strong overall compliance

The codebase correctly applies all "beyond strict" flags: `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`,
`noImplicitOverride`, and `noImplicitReturns`. There is no `any`, no
`@ts-ignore`, and non-null assertions (`!`) are absent from application code.
The `as const satisfies Record<…>` pattern is used consistently for config
objects (`LANGUAGE_TAG`, `LANGUAGE_DATA_CODE`, `LANGUAGE_PREFIX`, `SITE_TRANSLATIONS`).

This is the strongest aspect of the project's TypeScript hygiene.

---

### 2.2 `resolvePostDate` mutable default parameter

**Severity: 🟡 Medium**

`src/posts/post-metadata.ts`:

```ts
export function resolvePostDate(
  value: unknown,
  fallback: Date = new Date(),  // ← evaluated at call time, not definition time
): Date {
```

In JavaScript/TypeScript, a default parameter expression is evaluated at each
call site, not once at module load. Here, `new Date()` is called afresh every
time `resolvePostDate` is invoked without a fallback. This is not a mutable
shared-state bug (unlike `= []` or `= {}`), but it does mean that two calls
to `resolvePostDate(undefined)` with no second argument will return different
`Date` instances, one millisecond apart. This can make snapshot tests
non-deterministic.

The existing test file `post-metadata_test.ts` presumably uses faker or a fixed
date to avoid this, but the function signature silently invites non-determinism.

**Recommendation:** Either document the intent explicitly in JSDoc ("The fallback
date is computed at call time; pass an explicit `Date` for deterministic
behavior") or change the signature to `fallback?: Date` and compute `new Date()`
inside the body, making the evaluation site unambiguous.

---

### 2.3 Service worker is plain JavaScript, not TypeScript

**Severity: 🟢 Low**

`src/scripts/sw.js` is authored in JavaScript without type annotations. This is
the most complex client-side file in the project (488 lines), implementing three
caching strategies, predictive preloading with memory bounding, bot detection,
and a navigation transition model. Running it without types means that type
errors in arguments (e.g., passing a `string` where a `URL` is expected) are
only caught at runtime.

The omission is understandable: Deno's service worker type support (`lib.webworker.d.ts`)
requires a specific compiler configuration that conflicts with the rest of the
project's `lib` settings. This is a documented Deno limitation.

**Recommendation:** Add a `// @ts-check` comment at the top of the file and
declare `/// <reference lib="webworker" />` to get at least basic JSDoc-based
type checking without a full TypeScript migration. Update JSDoc `@param` and
`@returns` annotations to use TypeScript-style types (already partially done)
so that VS Code can surface errors at authoring time.

---

### 2.4 `otel.ts` uses a `\x00` separator in counter keys

**Severity: 🟢 Low**

In `plugins/otel.ts`:

```ts
const key = `${record.method}\x00${record.route}\x00${record.status}`;
```

Using null bytes as separators is an unusual but technically valid way to prevent
key collisions (route names cannot contain null bytes). However, this pattern is
not immediately readable and could confuse a future contributor who encounters
the raw key in a debugger or serialized output.

**Recommendation:** Use a helper function or a structured key type to make the
intent explicit:

```ts
function buildCounterKey(method: string, route: string, status: number): string {
  return `${method}\x00${route}\x00${status}`;
}
```

Or use a nested `Map<string, Map<string, Map<number, number>>>` structure to
eliminate the string-encoding concern entirely.

---

## 3. CSS Architecture

### 3.1 Root `color-scheme` property diverges from CLAUDE.md

**Severity: 🟡 Medium**

`src/styles/base.css`:

```css
:root {
  color-scheme: light;  /* ← only light */
}
```

CLAUDE.md §6.2 states: "Declare `color-scheme: light dark;` on `:root` to inform
the browser." The current value `light` tells the browser (and the OS) that the
page only supports a light theme. This has two concrete consequences:

1. **Native browser chrome** (scrollbars, form controls, browser-provided UI)
   does not adopt a dark appearance even when the user has a system dark mode
   active, because the browser trusts the `color-scheme: light` declaration.
2. **`color-scheme: dark`** is only applied inside `[data-color-mode="dark"]`,
   which is set by `anti-flash.js`. If JavaScript is disabled (or blocked by a
   content policy), the dark mode CSS variables never apply, and the root
   declares only `light`, so native controls remain light even if the OS is in
   dark mode.

The current design is intentional (JS-driven theming) but diverges from the
project's own stated convention. A hybrid approach — `color-scheme: light dark`
at `:root`, plus the attribute-driven variable overrides — would restore
consistency between native controls and the page content.

**Recommendation:** Change `:root { color-scheme: light; }` to
`color-scheme: light dark;`. Keep the attribute-driven dark overrides as-is.
This correctly handles both the JS-enabled path (explicit data attribute) and
the JS-disabled path (media query fallback via `prefers-color-scheme`).

---

### 3.2 Hardcoded hex colors instead of design tokens

**Severity: 🟡 Medium**

Two locations use hardcoded hex values instead of the token system defined in
`base.css`:

**`src/styles/layout.css` line 87:**
```css
.site-nav-link[aria-current="page"] {
  border-color: light-dark(#fd8c73, #f78166);
```

**`src/styles/components.css` lines 758–760:**
```css
.feed-copy-control--copied .feed-copy-trigger {
  color: light-dark(#1a7f37, #3fb950);
  border-inline-start-color: light-dark(#1f883d, #3fb950);
}
```

The rest of the CSS uses `var(--bgColor-…)` and `var(--fgColor-…)` tokens
consistently. These two exceptions are invisible in a normal audit but become
significant when changing the accent color or adding a high-contrast variant:
the changes must be made in the token definitions *and* in these hardcoded
values, which are easy to forget.

The active-nav border color (`#fd8c73` / `#f78166`) is Primer's coral/salmon
accent — a deliberate visual choice. The success-state color (`#1a7f37` /
`#3fb950`) is Primer's green. Both deserve named tokens.

**Recommendation:** Add semantic tokens to `base.css`:

```css
--fgColor-success: oklch(38% 0.14 145);    /* light */
--borderColor-navActive: oklch(72% 0.18 30); /* light */
```

with dark mode overrides in the `[data-color-mode="dark"]` block. Replace the
hardcoded values with their respective tokens.

---

### 3.3 `@scope` is not used for component encapsulation

**Severity: 🟢 Low**

CLAUDE.md §6.1 explicitly recommends the native `@scope` at-rule for component
style boundaries:

> "Use the native `@scope` at-rule to restrict styles to a component's subtree
> without resorting to verbose BEM-style class chains."

The current CSS uses BEM-adjacent flat class naming (`.post-card`,
`.post-card-date`, `.post-card-title`, `.post-card-meta`). This approach works
and is readable, but it does not match the stated convention and does not
provide the specificity isolation benefits of `@scope`.

**Recommendation:** Where components have clearly bounded subtrees (`.post-card`,
`.archive-item`, `.pagehead`), consider wrapping their styles in `@scope`:

```css
@scope (.post-card) {
  .post-card-date { … }
  .post-card-title { … }
}
```

This is a progressive improvement, not a critical fix.

---

### 3.4 `prefers-reduced-transparency` is not handled

**Severity: 🟢 Low**

CLAUDE.md §6.7 lists `prefers-reduced-transparency` as a media query that "must
be handled." The project handles `prefers-reduced-motion`, `prefers-contrast`,
`prefers-color-scheme`, and `forced-colors`, but `prefers-reduced-transparency`
is absent.

The CSS uses `rgb(9 105 218 / 20%)` for selection background and
`rgb(56 139 253 / 18%)` for dark-mode accent backgrounds — both transparency
effects. Users who have enabled `prefers-reduced-transparency` at the OS level
(macOS "Reduce Transparency") would ideally receive fully opaque fallbacks.

**Recommendation:** Add a `@media (prefers-reduced-transparency: reduce)` block
in `base.css` that replaces semi-transparent values with opaque equivalents.

---

### 3.5 Sticky archive sidebar does not use `scroll-state` container queries

**Severity: 🟢 Low**

CLAUDE.md §6.4 recommends `container-type: scroll-state` for scroll-position-
dependent styling. The archive page features a sticky year-navigation sidebar:

```css
.archive-year-nav {
  position: sticky;
  inset-block-start: calc(var(--space-l) + 0.25rem);
}
```

This works correctly, but the sidebar has no visual elevation change when it
becomes sticky. Adding a `scroll-state(stuck: top)` shadow would communicate
the sticky state to the user without JavaScript. This is purely a polish
opportunity.

---

## 4. Client-side JavaScript

### 4.1 French feed description missing accented characters

**Severity: 🔴 High**

`src/_data.ts` line 26:

```ts
export const fr = {
  metas: {
    description: `Blog personnel de ${author}, base a Chengdu, en Chine.`,
```

`_config.ts` line 455:

```ts
description: "Blog personnel de Phiphi, base a Chengdu, en Chine.",
```

Both use "base a" instead of "basé à". This is a typo: the accents on "é" and
"à" are missing. The error appears in two places:

1. The `<meta name="description">` for all French-language pages.
2. The `<description>` element of the French RSS feed (`/fr/feed.xml`).

Feed readers and search engines that index the French version of the site will
display this malformed description. For a multilingual blog that explicitly
serves French-speaking readers, this is the most impactful issue in the audit.

**Recommendation:** Replace `"base a Chengdu, en Chine."` with
`"basé à Chengdu, en Chine."` in both `_data.ts` and `_config.ts`.

---

### 4.2 `language-preference.js` blocks the rendering critical path

**Severity: 🟡 Medium**

`src/_includes/layouts/base.tsx` loads `language-preference.js` as a
synchronous inline script in `<head>`:

```html
<script
  src={`/scripts/language-preference.js?v=${assetVersion}`}
  data-supported-languages={…}
  …
>
```

No `defer` or `async` attribute is present, which is correct: the script uses
`document.currentScript` (available only during synchronous execution) and must
perform a potential `location.replace()` redirect before the browser begins
rendering the page body.

However, the script can issue a `location.replace()` that navigates away from
the page after the browser has already begun downloading and processing the HTML.
On slow connections, this results in a visible flash of the wrong-language page
before the redirect fires.

An alternative approach that avoids both the render-blocking issue and the
language flash is to emit a small inline `<script>` (not a separate file) that
reads `localStorage` and calls `location.replace()` synchronously. This would
execute before any external resources are fetched and would eliminate the
redirect latency entirely for returning users.

**Recommendation:** Evaluate converting the redirect logic to a small inline
`<script>` block in `<head>`. The initialization of the `<select>` element
(which requires the DOM) would remain in the external file.

---

### 4.3 `anti-flash.js` sets duplicate backward-compatibility attribute

**Severity: 🟢 Low**

`src/scripts/anti-flash.js` lines 21–25:

```js
root.setAttribute("data-color-mode", resolvedMode);
// Keep backward compatibility for selectors still using the old attribute.
root.setAttribute("data-color-scheme", resolvedMode);
```

The `data-color-scheme` attribute is the legacy key. The CSS in `base.css` and
`components.css` uses both selectors:

```css
:root[data-color-mode="dark"],
:root[data-color-scheme="dark"] { … }
```

If the migration to `data-color-mode` is complete, the `data-color-scheme`
attribute and the redundant CSS selectors can be removed. If it is not complete
(i.e., some selectors still rely on `data-color-scheme`), there is no single
source of truth for which attribute is canonical.

**Recommendation:** Audit all CSS selectors. If no selector uses only
`data-color-scheme` (without also using `data-color-mode`), remove the legacy
attribute and its CSS counterpart. If both are still needed, document why.

---

### 4.4 Bot detection in the service worker is incomplete

**Severity: 🟢 Low**

`src/scripts/sw.js`:

```js
const KNOWN_BOT_PATTERN =
  /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;
```

This is a allowlist-style pattern — only named bots are detected. It correctly
skips caching for those crawlers, preventing service worker cache poisoning for
indexed pages. However, bot detection via User-Agent is inherently fragile:
bots frequently rotate or modify their UA strings. More importantly, the
Service Worker typically cannot intercept Googlebot's requests at all (Chrome's
implementation prevents SWs from intercepting search engine crawlers at the
browser level). The check is therefore belt-and-suspenders rather than the
primary defense.

**Recommendation:** Add a comment explaining that the UA check is a secondary
safeguard and that most crawlers bypass the SW at the browser level. This
prevents future developers from over-relying on this check or over-engineering
it.

---

## 5. Build Pipeline and Tooling

### 5.1 `update-deps` task updates to `--latest` unconditionally

**Severity: 🟡 Medium**

`deno.json`:

```json
"update-deps": {
  "command": "deno outdated --update --latest"
}
```

The `--latest` flag bypasses semver range constraints and updates all
dependencies to their absolute latest version, including potentially
semver-major breaking changes. Running this task on a Deno 2.x project could
pin a breaking 3.x dependency before the project is ready.

**Recommendation:** Remove `--latest` and rely on semver ranges. Reserve
`--latest` for deliberate upgrade sessions by running it manually with explicit
review. Alternatively, document in a comment that `--latest` is intentional and
that post-upgrade testing is mandatory.

---

### 5.2 CDN dependency on `cdn.jsdelivr.net` for Lume itself

**Severity: 🟡 Medium**

`deno.json`:

```json
"lume/": "https://cdn.jsdelivr.net/gh/lumeland/lume@3.2.1/"
```

Lume is loaded directly from jsDelivr CDN at build time. This creates a hard
dependency on CDN availability:

- Any build in a network-restricted CI environment (corporate proxy, air-gapped
  runner) fails silently.
- jsDelivr serves GitHub tarballs through a CDN layer that is occasionally
  unavailable in China (the site's maintainer is based in Chengdu), requiring
  `DENO_TLS_CA_STORE=system` workarounds.
- The `deno.lock` file pins the content hash, so accidental mutation of the CDN
  content is detected. But a CDN outage still blocks the build.

The standard alternative is `jsr:@lume/lume` (if available) or vendor-locking
via `deno cache` into the project. For a personal project with a single
maintainer, this risk is acceptable, but it is worth noting.

**Recommendation:** Document the CDN dependency in a comment in `deno.json` and
note that `DENO_TLS_CA_STORE=system` may be required in China-based builds.

---

### 5.3 `purgecss` safelist for `.sr-only` suggests dynamic class usage

**Severity: 🟢 Low**

`_config.ts`:

```ts
purgecss({
  options: {
    safelist: [/^feed-/, /^sr-only$/],
  },
}),
```

The `sr-only` class is explicitly safelisted. PurgeCSS removes selectors it
cannot statically trace in `.html`, `.js`, and `.xsl` files. A safelist entry
means the class is either:

1. Applied dynamically at runtime (not in static HTML), or
2. Applied in a file type not included in `contentExtensions`.

The class appears in the layout `base.tsx` for the skip link label (confirmed).
Because TSX is compiled to `.html` at build time, PurgeCSS scans the generated
HTML and should find `.sr-only` there. The safelist may be a leftover from an
earlier build configuration.

**Recommendation:** Verify by temporarily removing `sr-only` from the safelist
and running a build. If the skip link styling is preserved, the safelist entry
is unnecessary and can be removed.

---

## 6. Internationalization

### 6.1 `formatReadingTime` and `formatPostCount` use if/else chains

**Severity: 🟢 Low**

`src/utils/i18n.ts`:

```ts
export function formatReadingTime(minutes: number, language: SiteLanguage): string {
  if (language === "fr") { return `${minutes}\u00a0min de lecture`; }
  if (language === "zhHans") { return `${minutes} 分钟阅读`; }
  if (language === "zhHant") { return `${minutes} 分鐘閱讀`; }
  return `${minutes} min read`;
}
```

With four languages, this is readable. However, the pattern is inconsistent with
the rest of the i18n module, which uses typed lookup tables (`LANGUAGE_TAG`,
`LANGUAGE_DATA_CODE`, `SITE_TRANSLATIONS`). The English language is handled by
fallthrough (`return` at the end), which means adding a fifth language requires
a developer to know to insert a new `if` branch *before* the final return — a
pattern error waiting to happen.

**Recommendation:** Refactor into a typed lookup table similar to the other
constants, which would catch missing translations at compile time:

```ts
const READING_TIME_FORMAT = {
  en: (m: number) => `${m} min read`,
  fr: (m: number) => `${m}\u00a0min de lecture`,
  zhHans: (m: number) => `${m} 分钟阅读`,
  zhHant: (m: number) => `${m} 分鐘閱讀`,
} as const satisfies Record<SiteLanguage, (m: number) => string>;
```

---

### 6.2 No fallback for posts that exist in some languages but not others

**Severity: 🟢 Low**

All current posts export
`export const lang = ["en", "fr", "zh-hans", "zh-hant"]`, meaning every post
exists in all four languages. However, the content of some posts (e.g.,
`lorem-ipsum.page.tsx`) uses a single language string (English) with no
per-language overrides. The multilanguage plugin will generate four URLs
pointing to the same English content.

This is a content issue rather than a code issue, but it sets a precedent where
the `lang` array is treated as a metadata declaration rather than a guarantee
that localized content exists. Future posts that genuinely differ per language
(as `instructions.page.tsx` demonstrates with inline language branches) are the
correct model.

**Recommendation:** Either ensure all four language variants have localized
content, or document clearly that the `lang` array only controls URL generation
and that cross-language content reuse is intentional.

---

## 7. Performance

### 7.1 `language-preference.js` may cause a redirect on first visit

**Severity: 🟡 Medium** *(overlaps with §4.2)*

On a user's first visit from a Chinese browser (`navigator.language === "zh-CN"`),
the script detects no stored preference, falls back to the browser locale,
resolves `zh-hans`, and calls `location.replace("/zh-hans/")`. This redirect
happens after the browser has already downloaded and begun parsing the English
HTML, wasting one full round trip.

For users behind a high-latency connection (e.g., international connections from
China), this is a measurable LCP regression on the first visit.

**Recommendation:** Implement the redirect as a small inline `<script>` block
injected at the very top of `<head>`, before any external resources. The inline
script reads `localStorage` and issues a synchronous redirect. The `<select>`
initialization portion remains in the external file but does not block rendering.

---

### 7.2 No `content-visibility: auto` on off-screen page sections

**Severity: 🟢 Low**

CLAUDE.md §6.8 recommends `content-visibility: auto` on off-screen sections for
rendering performance. The archive page can render many year-grouped post lists.
Applying `content-visibility: auto` to each `.archive-year` section would allow
the browser to skip layout and paint for sections below the fold, improving
initial render performance on content-heavy pages.

**Recommendation:** Apply `content-visibility: auto` and an explicit
`contain-intrinsic-size` to `.archive-year` blocks.

---

## 8. Accessibility

### 8.1 `aria-pressed` initial value is hardcoded to `"false"`

**Severity: 🟡 Medium**

`src/_components/Header.tsx`:

```tsx
<button
  type="button"
  id="theme-toggle"
  aria-label={translations.site.themeToggleLabel}
  aria-pressed="false"
  …
>
```

The button's `aria-pressed` state is statically rendered as `"false"` in the
SSG output. `theme-toggle.js` updates this attribute dynamically once the script
runs, but between the browser's first parse of the HTML and the JS execution,
screen readers will announce the button as "not pressed" regardless of the
actual stored theme preference.

For a user with a screen reader who prefers dark mode, the button announcement
will initially be incorrect. The `anti-flash.js` script already reads the stored
preference before render; the same value could be used to set `aria-pressed`
correctly in the HTML response, but this would require passing the theme state
through the Lume data layer, which is not currently done (and is complex for a
static site).

**Recommendation:** As a lighter-weight fix, update `anti-flash.js` to also set
`aria-pressed` on `#theme-toggle` immediately after setting `data-color-mode`,
so the state is correct before the heavier `theme-toggle.js` script initializes.

---

### 8.2 Language selector `<label>` is `sr-only` but `aria-label` is also present

**Severity: 🟢 Low**

`src/_components/Header.tsx`:

```tsx
<label class="sr-only" for="language-select">
  {translations.site.languageSelectLabel}
</label>
<select
  id="language-select"
  aria-label={translations.site.languageSelectAriaLabel}
  …
>
```

Both a visible-but-visually-hidden `<label>` (linked via `for`) and an
`aria-label` attribute are present on the `<select>`. When both exist, `aria-label`
takes precedence over the `<label>` element's text. The `<label>` element is
therefore redundant for assistive technology, though it has no negative effect.

The accessible name of the select is determined by `aria-label` (higher
specificity). The `<label>` exists only to satisfy HTML validation (which
requires form controls to have an associated label).

**Recommendation:** Remove the `aria-label` from `<select>` and let the `<label
for="language-select">` provide the accessible name — this is the semantically
correct approach. The `<label>` is already visually hidden via `.sr-only`, so
there is no visual change.

---

## 9. Security

### 9.1 No Content Security Policy

**Severity: 🟡 Medium**

The site serves scripts from the same origin (`/scripts/*.js`), inline SVG
content, and JSON-LD structured data (`<script type="application/ld+json">`). No
`Content-Security-Policy` (CSP) header or meta tag is configured.

For a fully static site without user-generated content, the absence of a CSP is
less critical than for a dynamic application. However, a CSP would:

1. Prevent exfiltration if a dependency (CDN-loaded icon, XSLT) is compromised.
2. Explicitly declare that no external scripts are permitted.
3. Enable `upgrade-insecure-requests` and `block-all-mixed-content`.

The Lume build pipeline does not expose HTTP header configuration (it generates
static HTML), so a CSP would need to be implemented at the reverse proxy or CDN
layer (e.g., via Deno Deploy's response headers or Cloudflare headers).

**Recommendation:** Define a strict CSP at the CDN/proxy layer:
`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
object-src 'none'; base-uri 'self';`. The `data:` allowance is needed for
inline SVG fallbacks.

---

### 9.2 Service worker caches feeds without integrity verification

**Severity: 🟢 Low**

The `staleWhileRevalidateFeed` strategy in `sw.js` caches feed responses with a
custom `x-sw-cached-at` header but does not verify the response integrity (e.g.,
via Subresource Integrity or a content hash). A feed response from a compromised
network could be cached and served to subsequent users until the TTL expires.

For a static personal blog, this is a low-risk attack vector. The feeds are also
served over HTTPS, which prevents in-transit modification under normal
conditions.

**Recommendation:** Add a note in `sw.js` documenting this limitation and the
HTTPS dependency. No code change required unless the threat model changes.

---

## 10. Testing

### 10.1 Seed range table in CLAUDE.md could fall out of sync

**Severity: 🟢 Low**

CLAUDE.md §10 documents reserved faker seed ranges per test file. This table
must be maintained manually. If a new test file is created and the author forgets
to claim a range, two test files could collide on seed values, causing
non-deterministic cross-file interactions.

The seed reservation is a convention enforced only by human discipline, not by
tooling. A `deno test` failure would only surface if two colliding files
happened to use the same seeds in ways that interfere.

**Recommendation:** Add a meta-test (e.g., `tests/seed-registry_test.ts`) that
imports all test files' seed constants and asserts they do not overlap. This
converts a human convention into a machine-checked invariant.

---

### 10.2 No coverage threshold enforcement

**Severity: 🟢 Low**

The project has 19 test files covering components, layouts, utilities, and
scripts. However, there is no automated coverage threshold enforced in CI
(`.github/workflows/site.yml`). Coverage is generated manually via
`deno test --coverage` but is not a blocking check.

**Recommendation:** Add a coverage report step to the CI workflow and establish
a minimum threshold (e.g., 80% line coverage for `src/utils/` and
`src/posts/post-metadata.ts`). Keep the threshold realistic — the goal is to
detect coverage regressions, not to chase 100%.

---

## 11. OpenTelemetry Plugin (`plugins/otel.ts`)

The OTel plugin is the most architecturally sophisticated file in the project.
It correctly:

- Resolves mode at setup time, not per-request (no repeated `if (isDev)` checks
  in the hot path).
- Bounds the in-memory request store via `maxRequests` with `shift()` on
  overflow.
- Enriches Deno's auto-generated spans rather than creating redundant child
  spans.
- Handles build lifecycle via `beforeBuild`/`afterBuild`/`beforeUpdate`/`afterUpdate`
  events symmetrically.
- Uses `performance.now()` for sub-millisecond timing accuracy.

**One minor observation:**

The `server.addEventListener("start", …, { once: true })` pattern registers the
middleware lazily on server start. This is correct but means that if `getServer()`
is called before the server is created, the middleware would not be registered.
Lume's plugin lifecycle guarantees that `getServer()` is called after site
initialization, making this safe in practice.

**Recommendation:** Document the lazy registration behavior with a comment
explaining that the `{ once: true }` event listener is used instead of
`server.use()` to allow the middleware to be registered before the server starts.

---

## 12. Positive Patterns Worth Noting

The following practices are explicitly called out as exemplary for their
correctness, adherence to conventions, and design quality:

**`MULTILANGUAGE_DATA_ALIASES` preprocessing (§1.3):** The Lume framework
limitation is correctly isolated into a single preprocess hook in `_config.ts`,
keeping all other files unaware of the aliasing workaround.

**`collectAlternateUrls` in `base.tsx`:** Builds the `<link rel="alternate">`
map defensively, ensuring the current language is always represented even if
alternates are missing from the data.

**`pruneTransitionHistory` in `sw.js`:** The predictive preloading model bounds
both the per-route transition count (`MAX_TRANSITIONS_PER_ROUTE = 12`) and the
total tracked routes (`MAX_TRACKED_ROUTES = 60`). This prevents unbounded memory
growth in long sessions.

**`as const satisfies Record<SiteLanguage, …>` pattern:** Used consistently
throughout `i18n.ts` for all lookup tables, providing both compile-time
exhaustiveness checking and literal type inference.

**`ariaCurrent()` helper in `Header.tsx`:** Returns an empty object `{}` for
non-active links and `{ "aria-current": "page" }` for active ones, enabling
safe spread (`{...ariaCurrent(…)}`) without conditionally rendering attributes.

**`createEnvReader()` in `otel.ts`:** Isolates the `Deno.env.get()` call behind
a function that catches `NotCapable` errors, making the plugin safe in
permission-restricted environments.

**`resolveLanguageByPathname()` in `sw.js`:** The service worker cannot import
from `i18n.ts` (it runs in a different global context), so the language
resolution is correctly reimplemented as a pure pathname prefix check, without
duplicating the full normalization logic.

---

## Summary Table

| # | Location | Severity | Issue |
|---|----------|----------|-------|
| 4.1 | `src/_data.ts`, `_config.ts` | 🔴 | French description missing accented characters |
| 3.1 | `src/styles/base.css` | 🟡 | `color-scheme: light` diverges from CLAUDE.md |
| 3.2 | `layout.css`, `components.css` | 🟡 | Hardcoded hex colors bypass token system |
| 7.1 | `base.tsx`, `language-preference.js` | 🟡 | Language redirect blocks LCP on first visit |
| 8.1 | `Header.tsx`, `anti-flash.js` | 🟡 | `aria-pressed` initially incorrect |
| 2.2 | `post-metadata.ts` | 🟡 | Mutable default parameter |
| 5.1 | `deno.json` | 🟡 | `update-deps` unconditionally uses `--latest` |
| 5.2 | `deno.json` | 🟡 | CDN dependency on jsDelivr for Lume itself |
| 9.1 | Build pipeline | 🟡 | No Content Security Policy defined |
| 1.2 | `_config.ts` | 🟢 | `robots.txt` rules not derived from `LANGUAGE_PREFIX` |
| 1.3 | `_config.ts` | 🟢 | Language alias preprocess lacks regression test |
| 2.3 | `src/scripts/sw.js` | 🟢 | Service worker is plain JS, no `@ts-check` |
| 2.4 | `plugins/otel.ts` | 🟢 | `\x00` separator is valid but unusual |
| 3.3 | `src/styles/` | 🟢 | `@scope` not used for component encapsulation |
| 3.4 | `src/styles/base.css` | 🟢 | `prefers-reduced-transparency` not handled |
| 3.5 | `src/styles/` | 🟢 | Archive sticky sidebar lacks `scroll-state` |
| 4.3 | `anti-flash.js` | 🟢 | Legacy `data-color-scheme` attribute may be removable |
| 4.4 | `sw.js` | 🟢 | Bot detection via UA is partially redundant |
| 5.3 | `_config.ts` | 🟢 | `sr-only` safelist may be unnecessary |
| 6.1 | `i18n.ts` | 🟢 | `formatReadingTime`/`formatPostCount` use if/else chains |
| 6.2 | `src/posts/` | 🟢 | Posts claim 4 languages but ship English-only content |
| 8.2 | `Header.tsx` | 🟢 | `<label>` and `aria-label` both present on `<select>` |
| 9.2 | `sw.js` | 🟢 | Feed cache has no integrity verification |
| 10.1 | `CLAUDE.md` | 🟢 | Seed range table could fall out of sync |
| 10.2 | CI | 🟢 | No coverage threshold in CI |

---

*End of audit report.*
