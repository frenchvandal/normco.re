# Code Audit Report — normco.re

> Audit date: 2026-03-11 Auditor: Codex (GPT-5) Scope: Full codebase —
> architecture, TypeScript quality, CSS/UX, client-side JavaScript, build
> pipeline, i18n, accessibility, security, testing, and custom plugins. Branch:
> `master`

---

## Executive Summary

The codebase remains technically strong overall. The Deno + Lume + TSX stack is
applied consistently, strict TypeScript settings are enabled, and the quality
workflow commands pass cleanly (`deno fmt`, `deno lint`, `deno task check`,
`deno task lint:doc`, `deno test`, `deno task test:doc`, `deno task build`).

The highest-value improvements are now concentrated in three areas:

1. Better separation between render templates and client behavior (notably
   inline script generation in `src/posts/index.page.tsx`).
2. Stricter typing and test coverage for browser scripts (only `sw.js` currently
   uses `@ts-check`).
3. Closer alignment of CSS architecture with the repository standard (DTCG-style
   tokens, `oklch()`, native select styling, and scoped component styling).

No release-blocking runtime defects were identified. The majority of findings
are medium/low severity maintenance and quality risks.

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
string (`archiveYearNavScript`, lines 148–222) and concatenates it into the
rendered HTML.

This works, but it creates architectural coupling:

- The archive template now carries DOM logic, event wiring, and hash-state
  management.
- The code is harder to lint/test in isolation than a dedicated asset under
  `src/scripts/`.
- It increases CSP friction (inline script requires hash/nonce allowances).

**Recommendation:** Move this logic to a dedicated client script (for example
`src/scripts/archive-year-nav.js`) and load it from the base layout only on
archive pages.

---

### 1.2 `i18n.ts` is becoming a high-churn monolith

**Severity: 🟢 Low**

`src/utils/i18n.ts` combines:

- language contracts and key normalization,
- URL/data tag mapping,
- all translation dictionaries for four locales,
- formatting helpers.

The file is now large and central to most pages/components. This is not
incorrect, but it increases merge pressure and the blast radius of unrelated
edits (copy updates and logic updates in the same module).

**Recommendation:** Split the module into `i18n-types.ts`, `i18n-routing.ts`,
and `i18n-translations.ts` (or equivalent) while keeping `i18n.ts` as a narrow
public API.

---

### 1.3 Language mapping still requires manual synchronization in multiple files

**Severity: 🟢 Low**

The internal/external language key model is well documented, but key updates
still require coordinated edits across:

- `src/utils/i18n.ts` (`LANGUAGE_DATA_CODE`, `LANGUAGE_PREFIX`),
- `_config.ts` (`MULTILANGUAGE_DATA_ALIASES`, robots rules),
- `src/scripts/sw.js` (`OFFLINE_URL_BY_LANGUAGE`, pathname language resolver).

This is manageable with four languages but remains an easy place for drift.

**Recommendation:** Derive service-worker and robots language path maps from a
generated artifact (or one shared source module consumed at build time).

---

## 2. TypeScript Quality

### 2.1 Strict TypeScript baseline is strong and stable

The repository keeps a strong TS baseline:

- strict compiler options plus additional hardening flags are enabled.
- `deno lint` and `deno task check` pass cleanly.
- Modern patterns (`as const satisfies`, explicit boundary casts at framework
  edges) are used consistently.

This remains one of the strongest areas of the project.

---

### 2.2 Most browser scripts are still untyped JavaScript

**Severity: 🟡 Medium**

Only `src/scripts/sw.js` has `@ts-check`. The rest of the client scripts
(`anti-flash.js`, `disclosure-controls.js`, `feed-copy.js`,
`language-preference.js`, `sw-register.js`, `theme-toggle.js`) run without
static type checking.

Given current complexity (DOM state orchestration, URL routing logic,
service-worker lifecycle interactions), this leaves avoidable room for
runtime-only defects.

**Recommendation:** Add `// @ts-check` incrementally to each script and annotate
non-obvious APIs with JSDoc types. Migrate hot paths to `.ts` where practical.

---

### 2.3 Theme mode compatibility path duplicates state and selectors

**Severity: 🟢 Low**

`theme-toggle.js` writes both `data-color-mode` and legacy `data-color-scheme`,
and CSS still includes paired selectors for both forms.

The compatibility strategy is valid, but maintaining dual state paths increases
surface area for subtle divergences.

**Recommendation:** Plan a controlled deprecation of `data-color-scheme` once
all selectors and scripts are confirmed to rely on `data-color-mode` only.

---

## 3. CSS Architecture

### 3.1 Token taxonomy and color format diverge from the project standard

**Severity: 🟡 Medium**

`src/styles/base.css` uses Primer-style token names (`--bgColor-*`,
`--fgColor-*`, `--borderColor-*`) and many hex/rgb values. The repository
standard asks for DTCG-style semantic naming and `oklch()` color tokens.

The current system is coherent internally, but it does not align with the
documented token policy.

**Recommendation:** Introduce a semantic DTCG token layer
(`--color-background-default`, `--color-text-default`, etc.) in `oklch()`, then
progressively alias or replace existing Primer-style tokens.

---

### 3.2 `@scope` is still not used for component encapsulation

**Severity: 🟢 Low**

No `@scope` usage was found across `src/styles/`. Component styling is
centralized in a large global `components.css` file, which keeps specificity
manageable today but increases risk of selector coupling over time.

**Recommendation:** Apply `@scope` for high-churn components first (header
controls, archive navigation, search panel).

---

### 3.3 Language selector implementation diverges from native `base-select` guideline

**Severity: 🟡 Medium**

The header uses a custom `<details>` + links language menu while the native
`<select>` is visually hidden and marked with `aria-hidden="true"` /
`tabindex="-1"`.

This diverges from the documented rule to style native selects
(`appearance: base-select`) instead of replacing them with custom dropdown
behavior.

**Recommendation:** Either:

1. move to a fully native `<select>` control styled with
   `appearance: base-select`, or
2. document a project-level exception with explicit accessibility rationale and
   keyboard/screen-reader behavior guarantees.

---

### 3.4 Sticky archive sidebar still lacks scroll-state container query behavior

**Severity: 🟢 Low**

`src/styles/components.css` still carries a TODO for `scroll-state(stuck: top)`
behavior on `.archive-year-nav`.

This is non-blocking, but the gap is explicitly tracked in comments and remains
unresolved.

**Recommendation:** Implement once formatter/tooling support is acceptable, then
remove the TODO.

---

### 3.5 Dead navigation selectors remain in `layout.css`

**Severity: 🟢 Low**

`.site-nav`, `.site-nav-list`, `.site-nav-item`, and `.site-nav-link` are
defined in `src/styles/layout.css` but not used in TSX templates.

Unused selectors are low risk but increase maintenance overhead and cognitive
load.

**Recommendation:** Remove or archive unused selectors after verifying there is
no runtime-generated usage.

---

## 4. Client-side JavaScript

### 4.1 Language preference script is render-critical and may redirect after parse begins

**Severity: 🟡 Medium**

`language-preference.js` runs synchronously in `<head>` and can call
`location.replace()` when preferred language differs from current page language.

This is intentional for correctness, but it can still produce avoidable
first-load overhead on mismatched locale visits.

**Recommendation:** Keep only minimal redirect logic in an inline bootstrap
snippet and defer non-critical control wiring (menu/select listeners) to a
deferred script.

---

### 4.2 Archive navigation logic is not cacheable as a standalone asset

**Severity: 🟡 Medium**

Because archive hash-navigation behavior is inlined from template strings, it
cannot be shared/cached as a normal static script and is harder to validate
independently.

This overlaps with §1.1 but has direct runtime and delivery impact.

**Recommendation:** Externalize into a versioned static script and load
conditionally for archive pages.

---

### 4.3 `feed-copy.js` still uses `document.execCommand("copy")` fallback

**Severity: 🟢 Low**

The fallback is there for compatibility, which is reasonable. Still,
`execCommand` is legacy and may degrade over time.

**Recommendation:** Keep the fallback for now, but isolate it behind a utility
and mark it for removal once target browser support no longer requires it.

---

### 4.4 Service-worker crawler bypass remains heuristic

**Severity: 🟢 Low**

`sw-register.js` and `sw.js` use a known-bot regex to bypass crawler behavior.
This is a secondary safeguard, not a reliable canonical bot detection mechanism.

**Recommendation:** Keep existing comments explicit that this is best-effort
only, and avoid adding complexity around UA parsing.

---

## 5. Build Pipeline and Tooling

### 5.1 Build currently succeeds despite a large HTML validation warning set

**Severity: 🟡 Medium**

During this audit run (`2026-03-11`), `deno task build` completed but reported:

- `149 HTML error(s)` from `validate_html`.
- `36 pages found with SEO errors`.

The build remains green, which is practical for velocity but weakens quality
gating.

**Recommendation:** Add a ratchet strategy (for example, fail when count exceeds
current baseline, then reduce over time) instead of allowing unconstrained
warning growth.

---

### 5.2 GitHub Actions does not enforce lint/type/test gates

**Severity: 🟡 Medium**

`.github/workflows/site.yml` currently runs checkout, Deno setup, and
`deno task build`, then deploys. It does not run the full quality workflow
mandated in project instructions.

**Recommendation:** Add CI steps for `deno fmt --check`, `deno lint`,
`deno task check`, `deno task lint:doc`, `deno test`, and `deno task test:doc`
before deployment.

---

### 5.3 `update-deps` uses `--latest` unconditionally

**Severity: 🟡 Medium**

`deno.json` task `update-deps` runs `deno outdated --update --latest`, which can
pull semver-major updates in one step.

**Recommendation:** Use range-respecting updates by default; reserve `--latest`
for deliberate upgrade sessions.

---

### 5.4 Build remains CDN-dependent for core Lume imports

**Severity: 🟢 Low**

Core imports still depend on jsDelivr URLs (`lume/`, `lume/cms/`, lint plugin).
Locking mitigates integrity drift but not availability/network issues.

**Recommendation:** Document the risk explicitly and consider a fallback
strategy for restricted-network environments.

---

## 6. Internationalization

### 6.1 Dual key model is implemented correctly but remains operationally expensive

**Severity: 🟢 Low**

The internal camelCase vs external kebab-case language key split is now clearly
documented and works correctly. The tradeoff remains maintenance complexity when
adding locales.

**Recommendation:** Add a single i18n consistency test that validates all
mapping tables and alias hooks against one canonical language registry.

---

### 6.2 Several French metadata strings remain ASCII-transliterated

**Severity: 🟡 Medium**

Some French page metadata still uses unaccented transliterations (for example
`A propos`, `regroupes`, `annee`, `base a`) in page-level exports.

This is user-visible quality debt in localized metadata.

**Recommendation:** Normalize French strings with proper diacritics in metadata
exports (`index.page.tsx`, `about.page.tsx`, `posts/index.page.tsx`).

---

### 6.3 Multi-language URL generation can mask untranslated body content

**Severity: 🟢 Low**

The multilingual pipeline generates per-language URLs reliably, but some posts
share largely equivalent body text across languages. This is valid editorially,
but it can make localization completeness hard to track.

**Recommendation:** Add an editorial content check (or lint hint) flagging when
a page declares four languages without language-specific content branches.

---

## 7. Performance

### 7.1 First-visit language redirection can add avoidable navigation work

**Severity: 🟡 Medium** _(overlaps with §4.1)_

Locale-based redirect logic may trigger an extra navigation for first-time
visitors whose preferred locale differs from the served URL.

**Recommendation:** Reduce critical-path work in `language-preference.js` and
isolate only strict redirect logic in the earliest possible bootstrap path.

---

### 7.2 Inline archive script prevents independent caching/compression strategy

**Severity: 🟢 Low** _(overlaps with §1.1/§4.2)_

Archive behavior code is embedded per-page rather than served as a static asset.

**Recommendation:** Move to a static script asset to benefit from caching and
simpler delivery analysis.

---

### 7.3 `content-visibility` adoption is present but narrow

**Severity: 🟢 Low**

`content-visibility: auto` is already used for archive year sections, which is
positive. Adoption is still limited to one surface.

**Recommendation:** Evaluate additional long-content candidates after measuring
real impact (avoid broad speculative application).

---

## 8. Accessibility

### 8.1 Language switcher semantics rely on custom menu while native select is hidden

**Severity: 🟡 Medium**

The interactive language control is primarily a custom menu (`<details>` +
links). The native `<select>` is intentionally hidden from assistive
interaction.

Keyboard and screen-reader behavior may still be acceptable, but this departs
from the documented “native select first” standard and increases semantic risk.

**Recommendation:** Prefer a visible, native select control or formally
validate/document the custom pattern with assistive-tech test results.

---

### 8.2 Search panel dialog semantics are partial

**Severity: 🟡 Medium**

The search panel uses `role="dialog"`, but there is no explicit `aria-modal`,
and focus trapping is not implemented as a modal contract.

This can create ambiguous interaction expectations for assistive technologies.

**Recommendation:** Either implement full modal dialog behavior (focus trap +
`aria-modal`) or remove dialog semantics and treat it as a non-modal disclosure
panel.

---

### 8.3 Theme toggle initial `aria-pressed` is corrected by JS, not markup truth

**Severity: 🟢 Low**

Markup starts with `aria-pressed="false"`; `anti-flash.js`/`theme-toggle.js`
correct it after script execution.

This is mostly acceptable, but there is a short mismatch window in no-JS or
delayed-JS scenarios.

**Recommendation:** Render the best-known initial pressed state server-side
where possible, or keep current behavior with explicit fallback documentation.

---

## 9. Security

### 9.1 No Content Security Policy is defined

**Severity: 🟡 Medium**

No CSP header/meta policy is configured, and inline script generation (archive
page) complicates strict CSP rollout.

**Recommendation:** Start with a report-only CSP and refactor inline scripts to
external assets, then tighten progressively.

---

### 9.2 Feed caching relies on transport trust only

**Severity: 🟢 Low**

Service-worker feed caching uses HTTPS transport guarantees and freshness TTLs
but no application-layer integrity checks.

This is acceptable for a static blog, though worth documenting as an explicit
tradeoff.

**Recommendation:** Keep current model, but document threat boundaries and
revisit only if threat model changes.

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

`deno test` reported `23 passed` test modules and `0 failed`.

---

### 10.2 Core i18n runtime functions are not directly unit-tested

**Severity: 🟡 Medium**

`src/utils/i18n.ts` is central to URL resolution and locale behavior but
currently has no dedicated `_test.ts` coverage.

**Recommendation:** Add targeted tests for `tryResolveSiteLanguage`,
`getLocalizedUrl`, and mapping invariants.

---

### 10.3 Client-side scripts have no direct automated tests

**Severity: 🟡 Medium**

Complex scripts (`language-preference.js`, `theme-toggle.js`,
`disclosure-controls.js`, `sw-register.js`, `feed-copy.js`, and service-worker
behavior) are not covered by script-level tests.

**Recommendation:** Add lightweight DOM-level tests for critical behavior
(language redirect, theme toggle ARIA updates, disclosure close rules).

---

### 10.4 No coverage threshold or CI enforcement currently exists

**Severity: 🟢 Low**

A `coverage/` folder exists, but there is no threshold enforcement and no CI
gate for minimum coverage or mandatory test execution.

**Recommendation:** Add a baseline coverage threshold (even modest) and enforce
it in CI.

---

## 11. OpenTelemetry Plugin (`plugins/otel.ts`)

### 11.1 Plugin design and typing quality are strong

The plugin remains well-structured:

- strong option typing and default handling,
- clear boundary handling for Deno permissions,
- practical development-mode debug integration,
- bounded in-memory request tracking.

No critical issues were identified in the plugin architecture during this audit.

---

### 11.2 Development logging can be verbose but is policy-controlled

**Severity: 🟢 Low**

Development logging is intentionally detailed and controlled through `LUME_LOGS`
policy mapping (`plugins/console_debug.ts`). This is a good design, though it
can produce high console volume when verbose mode is active.

**Recommendation:** Keep the current policy model and document recommended
levels for local debugging vs CI builds.

---

## 12. Positive Patterns Worth Noting

**Strict TS posture + modern typing idioms:** `as const satisfies`, strict
compiler flags, and clean framework-boundary casts are consistently applied.

**Component and layout testing discipline:** Header/footer/layout tests are
granular and behavior-focused, with meaningful assertions on localization and
structure.

**Service-worker architecture quality:** `sw.js` has bounded predictive
preloading structures, explicit cache strategy separation, and versioned cache
names.

**CSS layering structure is clear:**
`@layer reset, base, layout, components, utilities` is cleanly organized and
easy to navigate.

**Accessibility basics are present:** skip link, focus-visible styling,
reduced-motion handling, and forced-colors handling are all implemented.

**Build observability is practical:** SEO diagnostics and OTEL hooks provide
useful build-time introspection without custom per-feature environment sprawl.

---

## Summary Table

| #    | Location                                                               | Severity | Issue                                                                           |
| ---- | ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| 1.1  | `src/posts/index.page.tsx`                                             | 🟡       | Archive page embeds a long inline script, mixing rendering and behavior         |
| 1.2  | `src/utils/i18n.ts`                                                    | 🟢       | i18n module combines large translation corpus and runtime helpers               |
| 1.3  | `src/utils/i18n.ts`, `_config.ts`, `src/scripts/sw.js`                 | 🟢       | Language mapping requires multi-file manual synchronization                     |
| 2.2  | `src/scripts/*.js`                                                     | 🟡       | Most browser scripts are untyped JS without `@ts-check`                         |
| 2.3  | `src/scripts/theme-toggle.js`, `src/styles/*.css`                      | 🟢       | Legacy `data-color-scheme` path duplicates theme state handling                 |
| 3.1  | `src/styles/base.css`                                                  | 🟡       | Token names/colors diverge from DTCG + `oklch()` project guidance               |
| 3.2  | `src/styles/`                                                          | 🟢       | `@scope` is not yet used for component encapsulation                            |
| 3.3  | `src/_components/Header.tsx`, `src/styles/`                            | 🟡       | Language switcher diverges from native `base-select` pattern                    |
| 3.4  | `src/styles/components.css`                                            | 🟢       | Sticky archive nav still lacks `scroll-state` container behavior                |
| 3.5  | `src/styles/layout.css`                                                | 🟢       | Unused `.site-nav*` selectors remain                                            |
| 4.1  | `src/scripts/language-preference.js`                                   | 🟡       | Render-critical locale script may redirect after parse starts                   |
| 4.2  | `src/posts/index.page.tsx`                                             | 🟡       | Archive script cannot be cached/linted/tested as a standalone asset             |
| 4.3  | `src/scripts/feed-copy.js`                                             | 🟢       | Clipboard fallback still relies on legacy `execCommand`                         |
| 5.1  | `_config.ts`, build output                                             | 🟡       | Build reports many HTML/SEO warnings while remaining green                      |
| 5.2  | `.github/workflows/site.yml`                                           | 🟡       | Deployment workflow skips lint/type/test/doc quality gates                      |
| 5.3  | `deno.json`                                                            | 🟡       | `update-deps` task uses `--latest` unconditionally                              |
| 5.4  | `deno.json`                                                            | 🟢       | Core imports depend on jsDelivr availability                                    |
| 6.2  | `src/index.page.tsx`, `src/about.page.tsx`, `src/posts/index.page.tsx` | 🟡       | French metadata strings include ASCII transliterations                          |
| 7.1  | `src/scripts/language-preference.js`                                   | 🟡       | First-visit locale redirect can add extra navigation work                       |
| 8.1  | `src/_components/Header.tsx`                                           | 🟡       | Custom language menu semantics carry more accessibility risk than native select |
| 8.2  | `src/_components/Header.tsx`, `src/scripts/disclosure-controls.js`     | 🟡       | Search dialog semantics are partial (non-modal behavior with dialog role)       |
| 9.1  | Global delivery/security headers                                       | 🟡       | No CSP policy defined; inline script path raises rollout friction               |
| 10.2 | `src/utils/i18n.ts`                                                    | 🟡       | No direct unit tests for core i18n resolver functions                           |
| 10.3 | `src/scripts/*.js`, `src/scripts/sw.js`                                | 🟡       | Client scripts and SW behavior are largely untested directly                    |
| 10.4 | CI / test tooling                                                      | 🟢       | No coverage threshold enforcement                                               |

---

_End of audit report._
