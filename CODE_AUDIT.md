# Code Audit Report — normco.re

> Audit date: 2026-03-10. Auditor: Claude (claude-sonnet-4-6). Scope: Full
> codebase — architecture, TypeScript quality, CSS/UX, client-side JavaScript,
> build pipeline, i18n, accessibility, security, testing, and custom plugins.
> Branch: `master`.

---

## Executive Summary

The codebase remains technically strong. The Deno + Lume + TSX stack is applied
consistently, strict TypeScript settings are enabled, and the mandatory quality
workflow commands pass cleanly (`deno fmt`, `deno lint`, `deno task check`,
`deno task lint:doc`, `deno test`, `deno task test:doc`, `deno task build`).

One area of genuine progress since the previous audit is code-block color
theming: Prism syntax highlighting in `src/styles/components.css` now uses
`oklch()` and `light-dark()` for all token colors, aligning that surface with
the project's stated color standard. The base design token layer still uses
Primer-style hex tokens, so the migration is partial.

The highest-value remaining improvements are concentrated in three areas:

1. Separation of render templates and client behavior (inline script generation
   in `src/posts/index.page.tsx`).
2. Stricter typing and test coverage for browser-side scripts (only `sw.js`
   currently carries `@ts-check`).
3. Closing the gap between the documented CSS token standard (DTCG naming,
   `oklch()`) and the live base token definitions.

No release-blocking runtime defects were identified. The majority of findings
are medium or low severity maintenance and quality risks.

**Severity scale**

| Level     | Meaning                                                                 |
| --------- | ----------------------------------------------------------------------- |
| 🔴 High   | Behavioral bug, data loss risk, or significant accessibility regression |
| 🟡 Medium | Inconsistency with stated conventions, maintenance risk, or latent bug  |
| 🟢 Low    | Style divergence, missed optimization, or polish opportunity            |

---

## 1. Architecture

### 1.1 Archive page mixes rendering and behavior via inline script string

**Severity: 🟡 Medium**

`src/posts/index.page.tsx` builds a long `<script>...</script>` block as a
string (`archiveYearNavScript`) and concatenates it directly into rendered HTML.

This creates architectural coupling:

- The archive template carries DOM logic, event wiring, and hash-state
  management in a raw string — a context where linting and type checking cannot
  reach it.
- The behavior cannot be tested in isolation from the page rendering pass.
- Inline script content raises CSP friction (requires a per-deployment hash or
  nonce allowance).

**Recommendation:** Extract this logic into a dedicated client script (for
example `src/scripts/archive-year-nav.js`) loaded conditionally for archive
pages. This would make the behavior cacheable, lintable, and independently
testable.

---

### 1.2 `i18n.ts` is becoming a high-churn monolith

**Severity: 🟢 Low**

`src/utils/i18n.ts` bundles four distinct concerns in a single module:

- Language contracts and key normalization,
- URL and data-tag mapping,
- all translation dictionaries for four locales,
- formatting helpers (`formatReadingTime`, `formatPostCount`).

The file is large and central to most pages and components. This is not
incorrect, but it increases merge pressure and the blast radius of unrelated
edits — copy changes and logic changes land in the same module and conflict
resolution requires understanding both domains.

**Recommendation:** Split into `i18n-types.ts`, `i18n-routing.ts`, and
`i18n-translations.ts` while keeping `i18n.ts` as a narrow re-exporting public
API.

---

### 1.3 Language mapping still requires manual synchronization across multiple files

**Severity: 🟢 Low**

The internal/external language key model is well documented, but adding or
renaming a locale still requires coordinated edits across:

- `src/utils/i18n.ts` (`LANGUAGE_DATA_CODE`, `LANGUAGE_PREFIX`),
- `_config.ts` (`MULTILANGUAGE_DATA_ALIASES`, robots rules),
- `src/scripts/sw.js` (`OFFLINE_URL_BY_LANGUAGE`, pathname language resolver).

With four languages the risk is manageable, but the sources can easily diverge.

**Recommendation:** Derive the service-worker and robots language path maps from
a single generated artifact or a shared source module consumed at build time.

---

## 2. TypeScript Quality

### 2.1 Strict TypeScript baseline is strong and stable

The repository maintains a strong TS baseline:

- `strict: true` plus the full set of additional hardening flags
  (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`, `noImplicitOverride`,
  `noImplicitReturns`) are enabled.
- `deno lint` and `deno task check` pass cleanly.
- Modern patterns (`as const satisfies`, discriminated unions, explicit boundary
  casts at framework edges) are used consistently across pages, layouts,
  components, and plugins.

This remains one of the strongest areas of the project and should be maintained
as new code lands.

---

### 2.2 Most browser-side scripts are still untyped JavaScript

**Severity: 🟡 Medium**

Only `src/scripts/sw.js` carries `// @ts-check`. The remaining client scripts
(`anti-flash.js`, `disclosure-controls.js`, `feed-copy.js`,
`language-preference.js`, `sw-register.js`, `theme-toggle.js`) run without
static analysis.

Given their current complexity — DOM state orchestration, URL routing logic,
service-worker lifecycle interactions — this leaves meaningful room for
runtime-only defects that type annotations would catch at authoring time.

**Recommendation:** Add `// @ts-check` incrementally to each script and annotate
non-obvious APIs with JSDoc types. Migrate the most complex paths (language
preference, SW registration) to `.ts` sources once the inline-script
architecture question (§1.1) is resolved.

---

### 2.3 Theme mode compatibility path duplicates state and selectors

**Severity: 🟢 Low**

`theme-toggle.js` writes both `data-color-mode` and the legacy
`data-color-scheme` attribute. `src/styles/components.css` still carries paired
selectors for both attributes in three places (shadow rules for
`.site-menu-panel` and `.language-menu-list`, and the search-overlay background
for `.site-search[open]::before`).

The strategy is valid as a compatibility bridge, but dual selector maintenance
raises the surface area for subtle divergences as future style changes land.

**Recommendation:** Plan a controlled deprecation of `data-color-scheme` once
all selectors and scripts are confirmed to rely solely on `data-color-mode`.
Remove the legacy selectors in a single targeted commit.

---

## 3. CSS Architecture

### 3.1 Base token taxonomy and color format diverge from the project standard

**Severity: 🟡 Medium**

`src/styles/base.css` uses Primer-style token names (`--bgColor-*`,
`--fgColor-*`, `--borderColor-*`) and hex color values. The repository standard
calls for DTCG-style semantic naming (`category-property-modifier`) and
`oklch()` color tokens.

**Partial progress:** The Prism syntax-highlighting section in
`src/styles/components.css` has been migrated to `oklch()` paired with
`light-dark()` for automatic theme switching, and the implementation is
perceptually uniform and WCAG 2.2 AA compliant. This approach should serve as
the model for the base layer migration.

The base tokens remain Primer-compatible hex, which is coherent internally but
diverges from the documented policy and makes future palette-wide adjustments
harder (for example, shifting the entire hue axis would require touching every
hex value rather than a single `oklch` hue parameter).

**Recommendation:** Introduce a DTCG-compliant `oklch()` token layer
(`--color-background-default`, `--color-text-default`, etc.) and progressively
alias or replace the existing Primer-style tokens, following the same
`oklch()` + `light-dark()` pattern already established in the Prism section.

---

### 3.2 `@scope` is not yet used for component encapsulation

**Severity: 🟢 Low**

No `@scope` usage is present across `src/styles/`. Component styles are
centralized in a large global `components.css` file. Specificity stays low
enough today, but the flat structure increases the risk of unintentional
selector coupling as the component set grows.

**Recommendation:** Apply `@scope` starting with the highest-churn components
(header controls, archive navigation, search panel) to localize rules without
relying on naming discipline alone.

---

### 3.3 Language selector implementation diverges from the native `base-select` guideline

**Severity: 🟡 Medium**

The header renders a custom `<details>` + links language menu as the primary
interactive control. A native `<select>` is present in markup but is visually
hidden and excluded from assistive interaction (`aria-hidden="true"`,
`tabindex="-1"`).

This arrangement diverges from the documented rule to style native controls with
`appearance: base-select` instead of replacing them with custom disclosure
behavior.

**Recommendation:** Either migrate to a visible native `<select>` styled with
`appearance: base-select`, or formally document a project-level exception with
explicit accessibility rationale and validated keyboard and screen-reader
behavior guarantees.

---

### 3.4 Sticky archive sidebar still lacks scroll-state container query behavior

**Severity: 🟢 Low**

`src/styles/components.css` carries an explicit `TODO(phiphi)` (line ~888) for
`container-type: scroll-state` and a matching
`@container scroll-state(stuck: top)` shadow rule on `.archive-year-nav`. The
comment attributes the gap to Deno's CSS formatter not yet supporting
`scroll-state()` query syntax.

This is tracked and non-blocking, but it remains an open gap between the
documented CSS practice and the live implementation.

**Recommendation:** Implement once formatter support is confirmed, then remove
the TODO and add it to the CSS architecture section's positive patterns.

---

### 3.5 Dead navigation selectors remain in `layout.css`

**Severity: 🟢 Low**

`.site-nav`, `.site-nav-list`, `.site-nav-item`, and `.site-nav-link` are
defined in `src/styles/layout.css` (lines 51–97) with non-trivial style rules,
but none of these selectors match any element in the current TSX templates. The
primary navigation is rendered through the `.site-menu` hamburger disclosure
pattern instead.

Unused selectors add cognitive overhead during maintenance and may interfere
with `purgecss` allowlist reasoning.

**Recommendation:** Remove the dead selectors after confirming no runtime or
script-generated usage. If they represent an intended future component, move
them to a clearly marked experimental partial.

---

### 3.6 Search overlay `backdrop-filter` is not suppressed by `prefers-reduced-transparency`

**Severity: 🟢 Low**

`src/styles/components.css` renders a full-screen overlay with
`backdrop-filter: blur(1.5px)` when the search panel is open. The
`prefers-reduced-motion: reduce` block in `src/styles/base.css` zeros out
`transition-duration` and `animation-duration` via `!important`, but filter
effects are not addressed there.

The `prefers-reduced-transparency: reduce` media query block in `base.css`
covers `--selection-bgColor` and `--bgColor-accent-muted`, but does not remove
or neutralize the `backdrop-filter` on the search overlay. Users who opt into
reduced transparency may still receive a blurred backdrop.

**Recommendation:** Add a `prefers-reduced-transparency: reduce` rule that sets
`backdrop-filter: none` on `.site-search[open]::before`.

---

## 4. Client-side JavaScript

### 4.1 Language preference script is render-critical and may redirect after parse begins

**Severity: 🟡 Medium**

`language-preference.js` executes synchronously in `<head>` and can call
`location.replace()` when the visitor's preferred locale differs from the
current URL. This is intentionally designed for correctness, but it can produce
an avoidable full-page navigation for first-time visitors whose browser locale
does not match the served URL.

**Recommendation:** Keep only the strict redirect decision in an inlined
bootstrap snippet (`<script>` in `<head>`) and defer all non-critical listener
setup (menu state, select synchronization) to a script loaded with `defer` or
`type="module"`.

---

### 4.2 Archive navigation logic is not cacheable as a standalone asset

**Severity: 🟡 Medium**

Because the archive hash-navigation behavior is embedded as a template string,
it is generated fresh in each page response. It cannot be served as a static
asset, benefits from no shared caching across page navigations, and is harder to
validate or lint independently.

This is a direct delivery-side consequence of the architectural concern in §1.1.

**Recommendation:** Externalize the behavior into a versioned static script and
reference it with a `<script src>` tag loaded only on archive pages.

---

### 4.3 `feed-copy.js` still uses `document.execCommand("copy")` as a fallback

**Severity: 🟢 Low**

The `execCommand` fallback is present for compatibility with older environments
and does not introduce a defect. However, `execCommand` is formally deprecated
and browser vendors may remove it without notice.

**Recommendation:** Keep the fallback for now but isolate it behind a utility
function and mark it with a `// TODO` comment referencing the relevant browser
removal tracking. Remove once browser support data confirms it is no longer
needed.

---

### 4.4 Service-worker crawler bypass relies on a UA heuristic

**Severity: 🟢 Low**

`sw-register.js` and `sw.js` use a regex-based user-agent check to skip
service-worker registration for known crawlers. This is a best-effort safeguard,
not a reliable bot-detection mechanism, and can be trivially bypassed by any
client that omits a common crawler UA.

**Recommendation:** Keep the existing comments clear that this is best-effort
only. Avoid adding complexity around UA parsing — the real value here is
preventing accidental SERP interference, which the heuristic accomplishes
adequately.

---

## 5. Build Pipeline and Tooling

### 5.1 Build continues to succeed despite a large HTML validation warning set

**Severity: 🟡 Medium**

Previous audit runs found `deno task build` completing with `149 HTML error(s)`
from the `validate_html` plugin and `36 pages found with SEO errors`. The build
remains green by design, which supports iteration velocity but removes a
meaningful quality gate.

**Recommendation:** Introduce a ratchet strategy — fail when the error count
exceeds the current baseline, and reduce the baseline over time. This prevents
regression without requiring all existing warnings to be resolved immediately.

---

### 5.2 GitHub Actions does not enforce lint, type-check, or test gates

**Severity: 🟡 Medium**

`.github/workflows/site.yml` checks out the repository, installs Deno, runs
`deno task build`, and deploys to Alibaba Cloud OSS. It does not run the full
quality workflow mandated by the project: `deno fmt --check`, `deno lint`,
`deno task check`, `deno task lint:doc`, `deno test`, or `deno task test:doc`.

This means changes that fail static analysis or break tests can be deployed to
production if they do not cause a build-step failure.

**Recommendation:** Add a dedicated `quality` job that runs before the `deploy`
job and executes all mandatory workflow steps. The deploy job should depend on
the quality job completing successfully.

---

### 5.3 `update-deps` uses `--latest` unconditionally

**Severity: 🟡 Medium**

The `update-deps` task in `deno.json` runs `deno outdated --update --latest`,
which resolves all packages to their absolute latest versions in a single
invocation, ignoring semver ranges. This can silently introduce semver-major
upgrades with breaking changes.

**Recommendation:** Use range-respecting updates as the default
(`deno outdated --update` without `--latest`). Reserve `--latest` for explicit
upgrade sessions where each major bump is reviewed individually.

---

### 5.4 Build remains dependent on jsDelivr CDN availability

**Severity: 🟢 Low**

`deno.json` pins core Lume imports to jsDelivr URLs
(`cdn.jsdelivr.net/gh/lumeland/lume@3.2.1/`). The lock file mitigates integrity
drift, but CDN downtime or network restrictions (particularly relevant given the
Chengdu deployment context) can block builds entirely.

**Recommendation:** Document this dependency explicitly and consider a
contingency strategy such as a local Deno cache warm-up step in CI or a mirrored
artifact store.

---

## 6. Internationalization

### 6.1 Dual key model is implemented correctly but remains operationally expensive

**Severity: 🟢 Low**

The internal camelCase (TypeScript keys) vs. external kebab-case (URL/HTML lang)
split is clearly documented and functions correctly. The design tradeoff is
justified — avoiding bracket notation across the codebase is a real ergonomic
gain. The cost is that adding a new locale requires careful, synchronized edits
in multiple locations (see also §1.3).

**Recommendation:** Add a single i18n consistency test that validates all
mapping tables, alias hooks, and URL prefix entries against one canonical
language registry object. This would catch drift at the test layer before it
reaches a deployed URL.

---

### 6.2 Several French metadata strings remain ASCII-transliterated

**Severity: 🟡 Medium**

French page-level metadata exports still contain unaccented ASCII
transliterations. Confirmed instances:

- `src/about.page.tsx`: `"A propos"` (title), `"ecrit"` (body of description).
- `src/posts/index.page.tsx`: `"regroupes par annee"` (description).

These strings appear in `<title>`, `<meta name="description">`, and feed
metadata, making them user-visible quality debt in localized contexts.

**Recommendation:** Replace the transliterated strings with properly accented
French: `"À propos"`, `"écrit"`, `"regroupés par année"`.

---

### 6.3 Multi-language URL generation can mask untranslated body content

**Severity: 🟢 Low**

The multilingual pipeline generates per-language URLs reliably, but some posts
share largely equivalent body text across all four locale variants. This is
editorially acceptable but makes localization completeness difficult to audit at
a glance.

**Recommendation:** Add an editorial hint or lint check flagging pages that
declare four language variants without any language-specific content branches,
so the state is intentional and visible rather than implicit.

---

## 7. Performance

### 7.1 First-visit language redirection can add an avoidable navigation

**Severity: 🟡 Medium** _(overlaps with §4.1)_

When a first-time visitor's browser locale does not match the URL's language
prefix, `language-preference.js` issues a `location.replace()` call before the
page has finished rendering. This adds a full navigation round-trip and delays
all subsequent resource loading.

**Recommendation:** Minimize the critical-path footprint of this script to the
redirect decision only, as described in §4.1. Non-redirect logic can move to a
deferred module.

---

### 7.2 Inline archive script prevents independent caching and compression

**Severity: 🟢 Low** _(overlaps with §1.1 and §4.2)_

Archive behavior code embedded per-page rather than served as a versioned static
asset cannot benefit from HTTP caching, CDN compression, or content negotiation
strategies. Every archive page response must repeat the full script payload.

**Recommendation:** Move to a static script asset to benefit from edge caching
and enable delivery analysis in isolation.

---

### 7.3 `content-visibility` adoption is present but narrow

**Severity: 🟢 Low**

`content-visibility: auto` with `contain-intrinsic-size` is already applied to
`.archive-year` sections — a well-targeted use of the property for a potentially
long list. Adoption is currently limited to this one surface.

**Recommendation:** Evaluate additional off-screen long-content candidates (post
body sections, feed entry lists) only after measuring real rendering impact.
Avoid broad speculative application, which can produce unexpected layout shifts.

---

## 8. Accessibility

### 8.1 Language switcher semantics rely on a custom menu while the native control is hidden

**Severity: 🟡 Medium**

The interactive language control is a custom `<details>` + anchor links pattern.
The native `<select>` is present but hidden from both visual and assistive-tech
interaction (`aria-hidden="true"`, `tabindex="-1"`).

Keyboard and screen-reader behavior of the custom pattern may be adequate, but
it departs from the documented "native control first" standard and carries more
semantic risk than a styled `<select>` would.

**Recommendation:** Prefer a visible, native `<select>` styled with
`appearance: base-select`, or formally validate and document the custom pattern
with assistive-technology test results covering keyboard traversal, focus
management, and announcement behavior.

---

### 8.2 Search panel dialog semantics are partial

**Severity: 🟡 Medium**

The search panel carries `role="dialog"`, but there is no `aria-modal` attribute
and focus is not trapped within the panel when it is open. This creates an
ambiguous contract for assistive technologies: the panel announces itself as a
modal dialog but does not enforce modal interaction boundaries.

**Recommendation:** Either implement full modal dialog behavior (focus trapping
within the panel, `aria-modal="true"`, and a labeled dismiss action), or remove
the `role="dialog"` attribute and treat the panel as a non-modal disclosure
region, which would be semantically accurate for the current behavior.

---

### 8.3 Theme toggle initial `aria-pressed` state is corrected by JavaScript, not markup

**Severity: 🟢 Low**

The theme toggle button is rendered with `aria-pressed="false"` in server-
generated markup. `anti-flash.js` and `theme-toggle.js` correct this to the
actual color mode preference after execution. The mismatch window is short on
most devices, but a no-JS or slow-JS scenario will present incorrect state to
assistive technologies until scripts run.

**Recommendation:** Document the fallback behavior explicitly, or explore
rendering the initial `aria-pressed` value based on a cookie or
`Accept-Language` hint to minimize the gap.

---

## 9. Security

### 9.1 No Content Security Policy is defined

**Severity: 🟡 Medium**

No CSP header or `<meta http-equiv="Content-Security-Policy">` policy is
configured. The inline script generation on the archive page (§1.1) further
complicates a strict CSP rollout, since any `script-src` directive excluding
`'unsafe-inline'` would require either a per-deployment hash or a nonce.

**Recommendation:** Start with a report-only CSP
(`Content-Security-Policy-Report-Only`), instrument the violation stream, and
refactor inline scripts to external assets (§1.1) before tightening to an
enforced policy.

---

### 9.2 Feed caching relies on transport-layer trust only

**Severity: 🟢 Low**

The service worker caches feed responses using HTTPS transport guarantees and
TTL-based freshness, but performs no application-level integrity verification
(no `Content-Hash` or similar mechanism). For a static personal blog, this is an
entirely reasonable tradeoff.

**Recommendation:** Keep the current model. Document the threat boundary
explicitly and revisit only if the threat model changes (for example, if the
site begins caching third-party content).

---

## 10. Testing

### 10.1 Test and doc-test execution status is healthy

All mandatory workflow commands passed during this audit:

1. `deno fmt`
2. `deno lint`
3. `deno task check`
4. `deno task lint:doc`
5. `deno test`
6. `deno task test:doc`
7. `deno task build`

`deno test` reported `23 passed` test modules and `0 failed`. The test suite
covers component rendering, layout contracts, post metadata utilities, i18n
routing constants, scripts, and plugin behavior with BDD-style grouping and
faker-seeded deterministic test data.

---

### 10.2 Core i18n runtime functions are not directly unit-tested

**Severity: 🟡 Medium**

`src/utils/i18n.ts` is central to URL resolution and locale switching behavior
across all pages and components. Despite its critical role, it has no dedicated
`_test.ts` coverage — only indirect coverage through page-level and layout tests
that happen to exercise translation lookups.

Functions most in need of direct tests: `tryResolveSiteLanguage`,
`resolveSiteLanguage`, `getLocalizedUrl`, and the `LANGUAGE_ALIASES` resolution
path for `zh-hans`/`zh-hant` variants.

**Recommendation:** Add a `src/utils/i18n_test.ts` with targeted tests for each
of the above functions, including edge cases (unknown codes, alias resolution,
default fallback behavior). Use seed range 1101–1199 for faker-generated test
data.

---

### 10.3 Client-side scripts have no direct automated test coverage

**Severity: 🟡 Medium**

Complex browser scripts (`language-preference.js`, `theme-toggle.js`,
`disclosure-controls.js`, `sw-register.js`, `feed-copy.js`, and the
service-worker logic in `sw.js`) are exercised only implicitly through
build-time checks. No script-level tests validate their behavior.

Given the non-trivial DOM state management and lifecycle coordination these
scripts perform, the testing gap represents meaningful exposure for
hard-to-reproduce regressions.

**Recommendation:** Add lightweight DOM-simulation tests for the highest-risk
paths: language redirect logic, theme toggle ARIA state transitions, disclosure
close-on-click-outside behavior, and clipboard copy with fallback.

---

### 10.4 No coverage threshold or CI enforcement currently exists

**Severity: 🟢 Low**

The `coverage/` output directory exists, but there is no threshold configuration
and no CI gate verifying a minimum coverage level or enforcing that tests run
before deployment.

**Recommendation:** Add a modest baseline coverage threshold (even 60–70%) and
enforce it in the quality CI job (see §5.2). The goal is regression prevention,
not an artificial coverage race.

---

## 11. OpenTelemetry Plugin (`plugins/otel.ts`)

### 11.1 Plugin design and typing quality remain strong

The plugin is well-structured:

- Option types are explicit and exhaustive, with practical defaults for
  development and production modes.
- Deno permission boundaries are handled cleanly — the plugin degrades
  gracefully when network or environment access is unavailable.
- Development-mode debug bar integration is practical and scoped.
- In-memory request tracking is bounded and does not leak across build cycles.

No critical issues were identified in the plugin architecture during this audit.

---

### 11.2 Development logging can be verbose but is policy-controlled

**Severity: 🟢 Low**

Development logging is intentionally detailed and governed by the `LUME_LOGS`
policy mapping implemented in `plugins/console_debug.ts`. The design is sound.
In verbose mode, the output volume can be high enough to obscure other build
diagnostics.

**Recommendation:** Keep the current policy model. Document the recommended
`LUME_LOGS` levels for local debugging sessions vs. CI builds in the project
README or developer setup notes.

---

## 12. Positive Patterns Worth Noting

**Strict TypeScript posture and modern typing idioms:** `as const satisfies`,
full strict compiler flags, `import type` enforcement, and clean
framework-boundary casts are applied consistently across all source layers.

**Prism token theming via `oklch()` + `light-dark()`:** The syntax-highlighting
color layer uses perceptually uniform, wide-gamut `oklch()` values paired with
`light-dark()` for automatic theme switching. This is well-executed and serves
as the model for the broader base token migration.

**Component and layout testing discipline:** Header, footer, and layout tests
are granular and behavior-focused, with meaningful assertions on localization,
heading structure, and critical accessibility attributes.

**Service-worker architecture quality:** `sw.js` maintains bounded predictive
preloading structures, explicit cache strategy separation, versioned cache
names, and a well-commented crawler bypass heuristic.

**CSS cascade layering is clean and navigable:**
`@layer reset, base, layout, components, utilities` is consistently organized,
keeps specificity flat and predictable, and provides a clear map for new rule
placement.

**Accessibility basics are present and consistent:** Skip link, `focus-visible`
styling, `prefers-reduced-motion` handling, `prefers-contrast` handling, and
`forced-colors` handling are all implemented in `src/styles/base.css`.

**Build observability is practical:** SEO diagnostics and OpenTelemetry hooks
provide useful build-time introspection without introducing feature-specific
environment variable sprawl, honoring the `LUME_LOGS` policy defined in
`plugins/console_debug.ts`.

---

## Summary Table

| #    | Location                                                           | Severity | Issue                                                                             |
| ---- | ------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| 1.1  | `src/posts/index.page.tsx`                                         | 🟡       | Archive page embeds a long inline script, mixing rendering and behavior           |
| 1.2  | `src/utils/i18n.ts`                                                | 🟢       | i18n module combines a large translation corpus with runtime helpers              |
| 1.3  | `src/utils/i18n.ts`, `_config.ts`, `src/scripts/sw.js`             | 🟢       | Language mapping requires coordinated edits across multiple files                 |
| 2.2  | `src/scripts/*.js`                                                 | 🟡       | Most browser scripts are untyped JS without `@ts-check`                           |
| 2.3  | `src/scripts/theme-toggle.js`, `src/styles/components.css`         | 🟢       | Legacy `data-color-scheme` compatibility selectors duplicate theme state handling |
| 3.1  | `src/styles/base.css`                                              | 🟡       | Base token names and colors diverge from DTCG + `oklch()` project guidance        |
| 3.2  | `src/styles/`                                                      | 🟢       | `@scope` is not yet used for component style encapsulation                        |
| 3.3  | `src/_components/Header.tsx`, `src/styles/`                        | 🟡       | Language switcher diverges from the native `base-select` guideline                |
| 3.4  | `src/styles/components.css`                                        | 🟢       | Sticky archive nav still lacks `scroll-state` container query behavior            |
| 3.5  | `src/styles/layout.css`                                            | 🟢       | Unused `.site-nav*` selectors remain in `layout.css`                              |
| 3.6  | `src/styles/components.css`                                        | 🟢       | Search overlay `backdrop-filter` not suppressed by `prefers-reduced-transparency` |
| 4.1  | `src/scripts/language-preference.js`                               | 🟡       | Render-critical locale script may redirect after parse has begun                  |
| 4.2  | `src/posts/index.page.tsx`                                         | 🟡       | Archive script cannot be cached, linted, or tested as a standalone asset          |
| 4.3  | `src/scripts/feed-copy.js`                                         | 🟢       | Clipboard fallback still relies on deprecated `execCommand`                       |
| 4.4  | `src/scripts/sw-register.js`, `src/scripts/sw.js`                  | 🟢       | Service-worker crawler bypass relies on a UA heuristic                            |
| 5.1  | `_config.ts`, build output                                         | 🟡       | Build reports many HTML and SEO warnings while remaining green                    |
| 5.2  | `.github/workflows/site.yml`                                       | 🟡       | Deployment workflow skips lint, type-check, and test quality gates                |
| 5.3  | `deno.json`                                                        | 🟡       | `update-deps` task uses `--latest` unconditionally, risking semver-major upgrades |
| 5.4  | `deno.json`                                                        | 🟢       | Core imports depend on jsDelivr CDN availability                                  |
| 6.1  | `src/utils/i18n.ts`, `_config.ts`                                  | 🟢       | Dual internal/external key model is correct but operationally expensive to extend |
| 6.2  | `src/about.page.tsx`, `src/posts/index.page.tsx`                   | 🟡       | French metadata strings contain ASCII transliterations without diacritics         |
| 6.3  | `src/posts/*.page.tsx`                                             | 🟢       | Multi-language URL generation can mask pages with no per-locale content branches  |
| 7.1  | `src/scripts/language-preference.js`                               | 🟡       | First-visit locale redirect can add an avoidable full-page navigation             |
| 7.2  | `src/posts/index.page.tsx`                                         | 🟢       | Inline archive script prevents independent caching and delivery optimization      |
| 7.3  | `src/styles/components.css`                                        | 🟢       | `content-visibility: auto` adoption is present but limited to one surface         |
| 8.1  | `src/_components/Header.tsx`                                       | 🟡       | Custom language menu carries more accessibility risk than a native select control |
| 8.2  | `src/_components/Header.tsx`, `src/scripts/disclosure-controls.js` | 🟡       | Search dialog declares `role="dialog"` without `aria-modal` or focus trapping     |
| 8.3  | `src/_includes/layouts/base.tsx`, `src/scripts/`                   | 🟢       | Theme toggle initial `aria-pressed` state is corrected by JS, not by markup       |
| 9.1  | Global delivery / security headers                                 | 🟡       | No CSP policy defined; inline script path raises rollout friction                 |
| 9.2  | `src/scripts/sw.js`                                                | 🟢       | Feed caching relies on transport-layer trust with no application-layer integrity  |
| 10.2 | `src/utils/i18n.ts`                                                | 🟡       | No direct unit tests for core i18n resolver and URL translation functions         |
| 10.3 | `src/scripts/*.js`, `src/scripts/sw.js`                            | 🟡       | Client scripts and service-worker behavior lack direct automated test coverage    |
| 10.4 | CI / test tooling                                                  | 🟢       | No coverage threshold or CI enforcement for test execution                        |

---

_End of audit report._
