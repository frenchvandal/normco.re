# IBM Carbon Migration Roadmap (Lume + Deno + TSX)

## 1. Goal

This roadmap defines how to rebuild the site UI on top of IBM Carbon while
preserving the current editorial identity (minimalist, reading-first),
multilingual behavior, and static-site performance, with one core operational
goal: delegate as much design and component behavior as possible to Carbon to
minimize long-term custom maintenance.

The plan intentionally combines findings from:

- `/Users/normcore/Downloads/deep-research-report.md`
- `/Users/normcore/Downloads/Systèmes de Design Open Source et Frameworks.md`

## 1.1 Migration Status Snapshot

| Phase                                              | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 - Baseline and ADR framing                 | In progress | Technical baseline and custom-maintenance debt baseline were captured on 2026-03-12; screenshots and ADR follow-up remain open.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Phase 1 - Dependency and bootstrap plumbing        | Completed   | Carbon dependency/bootstrap plumbing is complete, including selective `cds-header*` and `cds-side-nav*` registrations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Phase 2 - Header shell migration                   | In progress | Slices 1-4 are migrated for navigation/menu/search/language/theme shell; parity hardening and debt cleanup remain in progress.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Phase 3 - Content surfaces migration               | In progress | Slice 1 is in progress with PostCard/Footer/Breadcrumb migration and Carbon code-copy affordance wiring for post detail pages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Phase 4 - Token harmonization and theming          | Completed   | Slice 3 completed on 2026-03-12 by replacing the remaining scoped bridge with global `:root` Carbon token mapping; one minimal footer utility-link override is kept as explicit `[Carbon-P5]` carryover.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Phase 5 - Search, media, and performance hardening | In progress | Slices 1 to 17 are completed: search scope/mount parity is aligned across main/feed/sitemap, editorial image-dimension gating is enforced and tested, payload reporting now includes PR-friendly regression guards plus a versioned policy mode with explicit route-existence, baseline route-parity, and metadata coherence validation for policy version/fingerprint/policy-run marker/policy-baseline provenance marker/policy-baseline completeness fields on baseline and current policy reports, along with a dedicated policy-compatible baseline generation flow for CI/PR usage; P5-S17 additionally fixed the critical home-navigation regression by switching Carbon runtime registration to browser-resolvable module URLs and adding targeted non-regression coverage. |
| Phase 6 - Cleanup and governance updates           | Planned     | Not started.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## 2. Integrated Findings from the Two Reports

## 2.1 Reading-first UX findings (deep research report)

- Keep the main reading measure in the 50-75 character range, with a practical
  target of 60-70ch for article content.
- Preserve a strict content hierarchy: clear H1, compact metadata, stable
  vertical rhythm, no visual clutter.
- Keep inline links visibly identifiable in body copy (underlined by default) to
  avoid color-only affordances.
- Keep strong baseline accessibility: visible focus states, keyboard-first
  navigation, and WCAG-compliant contrast.
- Keep JS impact low and avoid avoidable layout shifts (reserve image space,
  keep search and non-critical UI lazy where possible).

## 2.2 Design-system strategy findings (comparative report)

- Carbon is strategically strong for this migration because it has both an
  official React implementation and an official Web Components implementation.
- For a Lume + TSX static site, `@carbon/web-components` is the right target:
  framework-agnostic, no React runtime lock-in, and long-term portability.
- Bundle growth is a primary risk in any design-system migration, so selective
  imports and strict scope control are non-negotiable.
- Token-driven theming is preferred over ad hoc overrides, especially for
  light/dark parity and accessibility consistency.
- Large global CSS utility layers should not keep growing during migration; move
  behavior and styling responsibility into Carbon primitives plus a small local
  adaptation layer.

## 2.3 Decision statement

- Carbon Web Components become the default UI primitive layer.
- Local TSX components remain composition shells and keep business/i18n logic.
- Carbon adoption is phased, with parity checkpoints after each slice.
- Carbon defaults come first; custom CSS/JS is exception-only and must be
  justified, temporary, and tracked.

## 2.4 Icon strategy decision

- Carbon icons (`@carbon/icons`) are the default icon source inside migrated
  Carbon components and shells.
- Octicons remain allowed in non-migrated zones until those zones are migrated
  to Carbon equivalents.
- Do not mix Carbon and Octicon iconography within the same migrated component
  unless a documented accessibility or parity blocker exists.

## 3. Target Architecture

## 3.1 Integration model

- Add `@carbon/web-components` via `deno.json` npm alias.
- Create a dedicated client bootstrap module (for example
  `src/scripts/carbon.js`) with selective side-effect imports only for used
  custom elements.
- Load this bootstrap from the base layout before Carbon elements are expected
  to render interactively.
- Keep page rendering in TSX + TypeScript. No template engine switch.

## 3.2 Component ownership model

- Keep `src/_components/*.tsx` as stable public composition boundaries.
- Migrate internals from bespoke HTML/CSS primitives to `<cds-*>` elements.
- Keep current data contracts untouched (language resolution, URL localization,
  reading metadata, feed URLs).

## 3.3 Token and theme model

- Introduce a Carbon adaptation layer in CSS for token mapping.
- Use Carbon semantic tokens first; use local overrides only when editorial tone
  requires it.
- Align with `prefers-color-scheme`, then layer user preference persistence on
  top.

## 3.4 Carbon-by-default maintenance policy

- Use Carbon components, tokens, spacing, and interaction patterns as-is by
  default.
- Allow custom styling only for editorial constraints that Carbon cannot express
  directly (reading measure, prose rhythm, language-specific typography).
- Forbid creation of new bespoke UI primitives in migrated areas when a Carbon
  equivalent exists.
- In migrated Carbon shells, use Carbon iconography by default; retain Octicons
  only in non-migrated surfaces until their migration slice lands.
- Every temporary override must have an explicit removal plan tracked with a
  migration TODO comment.
- Track custom-maintenance debt from Phase 0 onward with two indicators:
  - Bespoke UI interaction scripts tied to migrated chrome.
  - Custom CSS selector count tied to migrated components.
- Success threshold by migration end:
  - At least 50% reduction in bespoke UI interaction scripts for migrated areas.
  - At least 60% reduction in custom CSS selectors for migrated areas.

## 4. Current Codebase Baseline and Migration Scope

| Scope area              | Current implementation                                               | Carbon direction                                                                                                                                | Notes                                                                                                   |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Global shell and header | `src/_components/Header.tsx`, `src/scripts/disclosure-controls.js`   | `cds-header`, `cds-header-menu-button`, `cds-header-nav`, `cds-header-nav-item`, `cds-header-global-action`, `cds-header-panel`, `cds-side-nav` | Highest-risk slice due to menu/search/language/theme interactions currently built on `details/summary`. |
| Skip navigation         | `src/_includes/layouts/base.tsx` (`.skip-link`)                      | Keep current skip link semantics or migrate to `cds-skip-to-content` pattern                                                                    | Must preserve first-tab keyboard behavior.                                                              |
| Search UI shell         | Header + `src/scripts/pagefind-lazy-init.js` + Pagefind runtime      | Carbon search field and panel container; keep Pagefind index generation                                                                         | `pagefind({ ui: false })` is already configured in `_config.ts` and must stay.                          |
| Language switch         | Header + `src/scripts/language-preference.js`                        | Carbon dropdown/overflow action pattern                                                                                                         | Preserve localized labels and existing alternate URL logic.                                             |
| Theme toggle            | Header + `src/scripts/theme-toggle.js` + `src/scripts/anti-flash.js` | Carbon toggle/content switcher pattern                                                                                                          | Preserve persistence and no-flash behavior.                                                             |
| Post list cards         | `src/_components/PostCard.tsx`                                       | Carbon links/tags where useful, keep minimalist shell                                                                                           | Do not introduce heavy card chrome.                                                                     |
| Footer actions          | `src/_components/Footer.tsx`                                         | Carbon link primitives                                                                                                                          | Keep repo and feed affordances simple and compact.                                                      |
| Post layout enrichments | `src/_includes/layouts/post.tsx` and post pages                      | Add Carbon breadcrumb and code-copy affordances where relevant                                                                                  | Breadcrumb should sit under header and above title when hierarchy depth warrants it.                    |
| Feed view parity        | `src/feed.xsl`                                                       | Carbon-aligned visual and interaction parity                                                                                                    | Feed UI currently duplicates header patterns and must not drift from main shell.                        |

## 5. Carbon Mapping Matrix

| Existing responsibility   | Carbon candidate(s)                                                | Migration rule                                                        |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Top navigation            | `cds-header-nav`, `cds-header-nav-item`                            | Preserve `aria-current="page"` and localized URLs.                    |
| Mobile menu trigger/panel | `cds-header-menu-button`, `cds-side-nav`                           | Keep one-open-at-a-time behavior and Escape close parity.             |
| Global actions            | `cds-header-global-action`, `cds-header-panel`                     | Search, language, and theme remain secondary actions.                 |
| Search input              | `cds-search`                                                       | Keep lazy Pagefind runtime loading and focus-on-open behavior.        |
| Language selector         | `cds-dropdown` or overflow-menu composition                        | Keep all supported languages and current language indicators.         |
| Theme control             | `cds-toggle` or `cds-content-switcher`                             | Keep persisted user preference and system fallback.                   |
| Iconography               | Carbon icons in `cds-*` shells, Octicons elsewhere until migration | Keep visual consistency per component boundary during phased rollout. |
| Inline tags/metadata      | `cds-tag` (read-only)                                              | Use only when metadata clarity improves; avoid decorative tags.       |
| Content links             | `cds-link` and semantic `<a>`                                      | Body links remain clearly underlined for readability and a11y.        |
| Breadcrumb trail          | `cds-breadcrumb`, `cds-breadcrumb-item`                            | Render only on deep pages, not on shallow routes.                     |
| Code copy affordance      | `cds-copy-button` and/or `cds-code-snippet`                        | Keep code readability first; avoid visual noise.                      |

## 6. Phased Execution Plan

## Phase 0 - Baseline and ADR framing (1 sprint)

1. Freeze current screenshots for `/`, `/posts/`, one post page, `/about/`, and
   feed view.
2. Record baseline metrics (LCP, CLS, INP proxy, JS payload size).
3. Create a migration ADR summarizing the Carbon Web Components decision and
   selective import policy.
4. Confirm component availability in Carbon Storybook/docs for each mapped area.
5. Capture baseline custom-maintenance debt (script count + selector count) for
   all in-scope components.

Exit criteria:

- Baseline screenshots archived.
- Metrics snapshot stored.
- ADR approved.
- Baseline custom-maintenance debt recorded.

### Phase 0 baseline snapshot (2026-03-12)

Technical baseline (source-level):

- Runtime/tooling baseline: Deno `2.7.5` (`.tool-versions`) and Lume `3.2.1`
  (`deno.json` import alias).
- Header shell baseline: 3 bespoke disclosure surfaces in
  `src/_components/Header.tsx` (`site-menu`, `site-search`, `language-menu`),
  currently built with `details/summary`.
- Base layout baseline: 7 script tags in `src/_includes/layouts/base.tsx`,
  including bespoke shell interaction scripts.
- Carbon baseline before this slice: no `@carbon/web-components` alias wired in
  `deno.json`.

Custom-maintenance debt baseline (scope: header/search/language/theme/skip):

- Bespoke interaction scripts tied to migrated chrome: 5 files, 860 LOC total.
  - `src/scripts/disclosure-controls.js` (159 LOC)
  - `src/scripts/pagefind-lazy-init.js` (213 LOC)
  - `src/scripts/language-preference.js` (354 LOC)
  - `src/scripts/theme-toggle.js` (95 LOC)
  - `src/scripts/anti-flash.js` (39 LOC)
- Custom CSS selectors tied to migrated components: 90 selector entries (89
  unique) across `src/styles/layout.css`, `src/styles/components.css`, and
  `src/styles/utilities.css`.
  - Header/menu selectors: 24
  - Search selectors: 37
  - Language selectors: 20
  - Theme selectors: 7
  - Skip-link selectors: 2

## Phase 1 - Dependency and bootstrap plumbing (1 sprint)

1. Add `@carbon/web-components` import alias in `deno.json`.
2. Update lockfile only if dependency declarations changed.
3. Add `src/scripts/carbon.js` with selective registration imports.
4. Wire Carbon bootstrap into `src/_includes/layouts/base.tsx`.
5. Confirm no runtime custom-element registration errors.
6. Add an explicit rule in code review checklist: no new bespoke primitives when
   Carbon alternatives exist.

Exit criteria:

- Build passes with Carbon bootstrap loaded.
- No functional or visual regressions expected yet.

## Phase 2 - Header shell migration (2-3 sprints)

1. Replace bespoke menu/search/language wrappers with Carbon UI shell
   primitives.
2. Migrate search trigger + panel to Carbon-compatible structure while keeping
   Pagefind lazy behavior.
3. Keep current language-routing data contract from
   `src/scripts/language-preference.js`.
4. Keep theme behavior parity from `theme-toggle.js` and `anti-flash.js`.
5. Remove or reduce `disclosure-controls.js` responsibility as Carbon shell
   behavior takes over.
6. Remove superseded custom header selectors immediately after each migrated
   sub-slice.

Exit criteria:

- Header parity complete (desktop + mobile + keyboard).
- Search open/close/focus behavior preserved.
- Language and theme controls unchanged functionally.
- Custom header interaction debt decreases from the Phase 0 baseline.

## Phase 3 - Content surfaces migration (1-2 sprints)

1. Migrate `PostCard.tsx` internals toward Carbon primitives without adding
   heavy container styling.
2. Migrate footer links/actions to Carbon equivalents where useful.
3. Introduce breadcrumb on post/detail pages where hierarchy depth requires it.
4. Introduce Carbon copy affordance for code blocks where it improves UX.

Exit criteria:

- Home/archive/post/footer all render correctly in every language.
- Reading-first visual rhythm preserved.

## Phase 4 - Token harmonization and theming (1 sprint)

1. Add a Carbon token bridge section in styles (`src/styles/` layered files).
2. Align light/dark surfaces, text, links, and focus colors via semantic tokens.
3. Keep explicit link distinguishability in prose content.
4. Validate contrast and focus states in both color modes.
5. Remove temporary token overrides that are no longer needed after Carbon
   defaults are proven sufficient.

Exit criteria:

- Carbon components match the site's editorial tone.
- No accessibility regressions in color and focus behavior.
- Override surface remains minimal and documented.

## Phase 5 - Search, media, and performance hardening (1 sprint)

1. Keep `pagefind({ ui: false })` and render Carbon-driven search shell only.
2. Scope search indexing with `data-pagefind-body` to editorial content.
3. Ensure image dimensions are always emitted (evaluate `image_size` plugin if
   needed).
4. Compare JS/CSS payload deltas against baseline after each merged slice.
5. Keep Temporal migration as an explicit deferred item for Phase 6 (minor
   cleanup after core Carbon parity and hardening are complete).

Exit criteria:

- Search remains fast and predictable.
- CLS protections validated.
- Payload growth remains controlled.

## Phase 6 - Cleanup and governance updates (1 sprint)

1. Remove dead bespoke selectors and obsolete scripts after parity is proven.
2. Eliminate leftover Primer-like assumptions in migrated areas.
3. Update contributor guidance files (`AGENTS.md`, `CLAUDE.md`, `README.md`)
   with Carbon-first conventions and selective import policy.
4. Perform final full regression pass.
5. Finalize maintenance debt audit against Phase 0 baseline.
6. Evaluate replacing `npm/date-fns-locale` with native `Temporal` + `Intl` date
   formatting only if compatibility is preserved with the current Lume date
   formatting contract and multilingual output parity.
7. Add a deferred contact channel page powered by Carbon form primitives that
   posts to a Cloudflare Worker endpoint and relays validated submissions to
   Telegram; keep this item explicitly scheduled for the end of migration after
   core parity, payload, and governance goals are complete.
8. Validate contact-flow quality gates before closing the migration:
   accessibility semantics (labels, keyboard, focus-visible), clear success and
   failure feedback, and no-flash/theme parity on mobile and desktop.

Exit criteria:

- Migration rules documented and enforceable.
- Legacy migration scaffolding removed.
- Custom-maintenance reduction thresholds are met or explicitly deferred.
- Deferred contact channel is implemented and verified end-to-end (form ->
  Worker -> Telegram) with documented operational and a11y checks.

## 7. Progress Tracking in the Repository

Migration work must stay inspectable from the repository at any time.

## 7.1 Roadmap-driven status board

- This roadmap is the source of truth for migration status.
- At PR open: mark one phase as in progress in this file.
- At PR merge: update phase status and add a short progress note in section 7.3.
- Do not move to the next phase until the current phase exit criteria are met or
  explicitly deferred in writing.

## 7.2 In-code TODO conventions for migration carryover

Temporary compatibility code is allowed only when marked with explicit TODOs.

- Every migration TODO must include owner or issue reference, following project
  rules.
- Required format:
  - `// TODO(phiphi): [Carbon-P2] Remove details-based search fallback after Header shell parity is complete.`
  - `// TODO(#123): [Carbon-P4] Replace temporary token override with semantic Carbon token mapping.`
- Include a phase marker (`[Carbon-PX]`) and a concrete removal condition.
- A phase cannot be closed while it still contains unresolved TODOs from an
  earlier phase, unless each item is listed as an accepted carryover in section
  7.3.

## 7.3 Progress log (update on every merge to `main`)

| Date       | Phase   | Status      | PR/Commit    | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Remaining TODOs                                                                                                                                                                                                                                                                                                                                                                                                       | Custom debt delta                                                                                                                                                                                                                                                                                    |
| ---------- | ------- | ----------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-12 | P5-S17  | Completed   | Working tree | Fixed a critical UX regression where most home links became non-clickable by replacing browser-unresolvable `npm/...` runtime imports in `src/scripts/carbon.js` with browser-compatible Carbon module URLs built from a pinned CDN base, while keeping selective element registration and static-hosting compatibility intact; added stable targeted coverage in `src/scripts/carbon_test.ts` to lock the runtime contract (browser-compatible base URL + expected selective module paths) and prevent reintroduction of unresolved `npm/...` specifiers; preserved payload PR/CI flow (`payload:pr`, `payload:baseline`, `payload:ci`) and validated the fix with a reproducible before/after report.                                                                                                                                                                                                                                                                                                               | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,106 LOC (no change vs P5-S16, +246 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S16). Payload (default key routes): total JS/CSS bytes reduced by 6,321 vs P5-S17 baseline report. |
| 2026-03-12 | P5-S16  | Completed   | Working tree | Hardened policy-mode payload coherence in `scripts/payload-report.ts` by extending explicit metadata completeness validation to the current policy report (not only policy baselines), with actionable failure guidance for regenerating report/baseline artifacts; expanded policy metadata coverage in `scripts/payload-report_test.ts` with targeted pass/fail assertions for missing current-report `policyMode`, `policyVersion`, and `policyFingerprint`; and delivered an editorial post-detail payload micro-slice by trimming `src/scripts/post-code-copy.js` (removing the runtime `post-code-copy-target` class mutation) and switching `src/styles/components.css` to a stable adjacent sibling selector (`.post-content .post-code-copy-button + pre`), with targeted render-contract coverage in `src/_includes/layouts/_post_test.ts` to keep legacy marker emission absent while copy-script injection remains intact.                                                                                | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,106 LOC (down 1 vs P5-S15, +246 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S15). Payload (default key routes): total JS/CSS bytes reduced by 27 vs P5-S16 baseline report.       |
| 2026-03-12 | P5-S15  | Completed   | Working tree | Strengthened policy-mode baseline hardening in `scripts/payload-report.ts` by adding an explicit policy-baseline completeness validation that requires the expected metadata set (`policyMode`, `baselineKind`, `policyVersion`, `policyFingerprint`, `routeSetHash`, `routeCount`) and fails with actionable regeneration guidance through `deno task payload:baseline`; expanded policy metadata pass/fail coverage in `scripts/payload-report_test.ts` for the completeness paths; and delivered a low-risk editorial post-detail payload micro-slice by trimming `src/scripts/post-code-copy.js` selector gating (removing the redundant `data-code-copy-enabled` requirement) and removing the unused marker emission in `src/_includes/layouts/post.tsx`, with targeted rendering coverage updates in `src/_includes/layouts/_post_test.ts` to keep copy-script injection and localized dataset behavior stable.                                                                                                | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,107 LOC (up 1 vs P5-S14, +247 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S14). Payload (default key routes): total JS/CSS bytes reduced by 60 vs P5-S15 baseline report.         |
| 2026-03-12 | P5-S14  | Completed   | Working tree | Hardened policy-baseline provenance in `scripts/payload-report.ts` by adding an explicit metadata marker (`baselineKind: "policy-baseline"`) emitted only in `--policy-baseline` mode and enforcing actionable policy-mode failures when a baseline lacks this provenance marker even if policy mode/version/fingerprint metadata exist, while preserving existing schema/hash/version/fingerprint coherence checks and markdown stability; expanded coverage in `scripts/payload-report_test.ts` with pass/fail assertions for the missing provenance marker path; and delivered an editorial post-detail payload micro-slice by trimming `src/scripts/post-code-copy.js` runtime bytes plus reducing default-English post HTML dataset emission in `src/_includes/layouts/post.tsx` to only emit `data-code-copy-*` overrides when translations differ from runtime defaults, with targeted rendering coverage in `src/_includes/layouts/_post_test.ts` for localized dataset emission and default-marker behavior. | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,106 LOC (down 8 vs P5-S13, +246 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S13). Payload (default key routes): total JS/CSS bytes reduced by 27 vs P5-S14 baseline report.       |
| 2026-03-12 | P5-S13  | Completed   | Working tree | Hardened policy baseline provenance in `scripts/payload-report.ts` by adding an explicit metadata marker (`policyMode: "policy"`) that is emitted only for policy-driven runs and enforced during policy-mode baseline comparisons with actionable remediation guidance, while preserving route hash/policy version/fingerprint coherence checks and markdown output stability; expanded coverage in `scripts/payload-report_test.ts` with pass/fail assertions for missing policy compatibility markers and policy metadata in baseline contexts; and delivered an editorial post-detail micro-slice by trimming `src/scripts/post-code-copy.js` runtime code size (without removing the `[Carbon-P3]` execCommand carryover), with targeted rendering coverage in `src/_includes/layouts/_post_test.ts` to keep single-script injection semantics when multiple code blocks are present.                                                                                                                            | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,114 LOC (down 14 vs P5-S12, +254 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S12). Payload (default key routes): total JS/CSS bytes reduced by 25 vs P5-S13 baseline report.      |
| 2026-03-12 | P5-S12  | Completed   | Working tree | Added policy-fingerprint coherence hardening to `scripts/payload-report.ts` by hashing policy semantics (`version`, `rootDir`, canonicalized routes, baseline requirement, and regression thresholds), persisting this fingerprint in report metadata, surfacing it in markdown output, and enforcing actionable policy-mode failures when current/baseline fingerprints are missing or mismatched even when policy version matches; expanded coverage in `scripts/payload-report_test.ts` with stable fingerprint equivalence checks and metadata pass/fail cases; and delivered a low-risk editorial payload micro-slice by trimming `src/scripts/archive-year-nav.js` runtime setup while preserving hash-driven `aria-current` behavior, with targeted rendering coverage in `src/posts/_index_test.ts` to keep multi-year `aria-current` ownership in runtime script scope.                                                                                                                                      | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,128 LOC (down 2 vs P5-S11, +268 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S11). Payload (default key routes): total JS/CSS bytes reduced by 6 vs P5-S11 baseline report.        |
| 2026-03-12 | P5-S11  | Completed   | Working tree | Added a lightweight policy-compatible baseline flow by introducing `--policy-baseline` in `scripts/payload-report.ts` and wiring `deno task payload:baseline` in `deno.json`, so PR/CI can generate versioned baseline metadata without manual JSON patching; tightened policy-mode baseline validation by requiring explicit `baseline.metadata.policyVersion` parity with actionable remediation guidance; expanded regression coverage in `scripts/payload-report_test.ts` for missing baseline policy metadata; and shipped an editorial payload micro-slice by trimming `src/scripts/archive-year-nav.js` runtime selection logic while preserving hash-driven `aria-current` behavior, with a targeted archive rendering test in `src/posts/_index_test.ts` to lock the hash-anchor contract used by the runtime selector.                                                                                                                                                                                      | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,130 LOC (down 4 vs P5-S10, +270 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S10). Payload (default key routes): total JS/CSS bytes reduced by 46 vs P5-S10 baseline report.       |
| 2026-03-12 | P5-S10  | Completed   | Working tree | Added explicit baseline/policy metadata coherence checks in `scripts/payload-report.ts` by versioning payload report metadata (`schemaVersion`, canonical `routeSetHash`, `routeCount`, optional `policyVersion`) and enforcing schema/hash/policy consistency for policy-mode comparisons, extended regression coverage in `scripts/payload-report_test.ts`, and shipped an editorial payload micro-slice by trimming `post-code-copy.js` runtime DOM wrapping while preserving Carbon copy-button behavior and reducing shared CSS bytes in `src/styles/components.css`; also added targeted archive rendering coverage in `src/posts/_index_test.ts` to lock year-nav script loading to multi-year archives only.                                                                                                                                                                                                                                                                                                  | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,134 LOC (down 3 vs P5-S9, +274 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S9). Payload (default key routes): total JS/CSS bytes reduced by 210 vs P5-S10 baseline report.        |
| 2026-03-12 | P5-S9   | Completed   | Working tree | Added baseline route-parity enforcement in `scripts/payload-report.ts` so payload comparisons fail with actionable errors when baseline and current route sets diverge, expanded policy regression coverage in `scripts/payload-report_test.ts`, and delivered a post-detail payload micro-slice by lazy-loading the legacy `execCommand` clipboard fallback from `post-code-copy.js` through a dedicated helper module (`post-code-copy-exec-command.js`) wired into `_config.ts` and `scripts/fingerprint-assets.ts`; also added a targeted post-layout assertion to guarantee this fallback helper is never eagerly loaded in post HTML while preserving reading-first behavior, keyboard/focus handling, and theme persistence/no-flash guarantees.                                                                                                                                                                                                                                                               | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 7 files, 1,137 LOC (up 33 vs P5-S8, +277 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S8). Payload (default key routes): total JS/CSS bytes reduced by 164 vs P5-S8 baseline report.          |
| 2026-03-12 | P5-S8   | Completed   | Working tree | Strengthened payload policy mode in `scripts/payload-report.ts` by validating that every configured route exists in the current build output with actionable failures before report/guard execution, added policy-route validation coverage in `scripts/payload-report_test.ts`, and shipped an editorial-route payload micro-slice by trimming `archive-year-nav.js` and `post-code-copy.js` runtime logic without changing reading-first rendering, keyboard/focus behavior, or theme persistence/no-flash contracts; also added a targeted post-layout regression test to keep inline-code-only pages from loading the copy script.                                                                                                                                                                                                                                                                                                                                                                                | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,104 LOC (down 22 vs P5-S7, +244 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S7). Payload (default key routes): total JS/CSS bytes reduced by 456 vs P5-S7 baseline report.        |
| 2026-03-12 | P5-S7   | Completed   | Working tree | Added a versioned payload policy mode (`--policy`) in `scripts/payload-report.ts` with strict schema validation and CLI override semantics, introduced repository policy config (`scripts/payload-policy.json`) plus policy-aware tasks (`payload:policy`, updated `payload:ci`) that generate stable markdown output for PR comments, and reduced shipped JS/CSS payload by enabling source maps only in `serve` sessions so production/CI builds stop shipping source-map comments and sidecar artifacts while preserving reading-first behavior, keyboard/focus navigation, and theme persistence/no-flash behavior.                                                                                                                                                                                                                                                                                                                                                                                               | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S6, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S6). Payload (default key routes): total JS/CSS bytes reduced by 3,000 vs P5-S6 baseline report.    |
| 2026-03-12 | P5-S6   | Completed   | Working tree | Added a single-command PR/CI payload workflow (`deno task payload:ci`) that chains build + payload report + regression guard while preserving explicit baseline requirements and threshold overrides, delivered an editorial-route micro-slice by skipping `link-prefetch-intent.js` on posts archive routes (default and localized) to reduce JS payload without changing reading-first rendering or theme persistence/no-flash behavior, and added stable automated coverage in `src/_includes/layouts/_base_test.ts` to lock this route-level loading contract.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S5, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S5). Payload (default key routes): total JS/CSS bytes reduced by 3,065 vs P5-S5 baseline report.    |
| 2026-03-12 | P5-S5   | Completed   | Working tree | Added lightweight PR-safe payload regression guards to `scripts/payload-report.ts` with configurable thresholds (`--max-total-delta`, `--max-route-delta`) and a dedicated `deno task payload:guard` flow that enforces an explicit baseline, plus automated guard tests (`scripts/payload-report_test.ts`), and delivered a route-focused JS micro-slice by simplifying `archive-year-nav.js` to reduce `/posts/` payload while preserving reading-first behavior, keyboard navigation, focus visibility, and theme persistence/no-flash behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S4, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S4). Payload (default key routes): total JS/CSS bytes reduced by 252 vs P5-S4 baseline report.      |
| 2026-03-12 | P5-S4   | Completed   | Working tree | Added stable automated coverage for the editorial image-dimension build gate (pass + fail scenarios) by extracting the gate into a testable utility and keeping runtime enforcement in `_config.ts`, industrialized payload comparison for PRs with a single-command flow (`deno task payload:pr`) that requires an explicit baseline and writes reusable markdown output, and shipped a low-risk payload micro-slice by skipping `link-prefetch-intent.js` on post-detail routes to preserve reading-first UX while reducing route-level JS bytes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S3, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S3). Payload (default key routes): total JS/CSS bytes reduced by 6,130 vs P5-S3 baseline report.    |
| 2026-03-12 | P5-S3   | Completed   | Working tree | Added a deterministic editorial-image dimension build gate scoped to `main[data-pagefind-body]` so generated HTML fails when any editorial `<img>` lacks explicit `width`/`height`, and introduced a reproducible route-level JS/CSS payload reporting utility (`scripts/payload-report.ts` + `deno task payload:report`) that outputs a compact markdown table with optional baseline deltas for PRs, without changing theme persistence/no-flash behavior or Carbon shell interactions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S2, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S2).                                                                                                |
| 2026-03-12 | P5-S2   | Completed   | 62d5527      | Continued Phase 5 with a concrete media/payload hardening slice: integrated the official Lume `image_size` plugin and scoped auto-marking of editorial local images missing dimensions in `_config.ts`, then reduced post-page payload by loading `post-code-copy.js` only when post content includes `<pre><code>` blocks, preserving reading-first UX and existing keyboard/theme persistence/no-flash behavior across main/feed/sitemap surfaces.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts (migrated chrome): 6 files, 1,126 LOC (no change vs P5-S1, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P5-S1).                                                                                                |
| 2026-03-12 | P5-S1   | Completed   | Working tree | Started Phase 5 with a search-first hardening slice: kept `pagefind({ ui: false })`, scoped indexing to editorial content by adding `data-pagefind-body` to the base layout main shell while skipping unlisted pages, explicitly marked feed/sitemap mains as `data-pagefind-ignore`, and aligned Carbon search shell mount parity across main/feed/sitemap via `data-search-root` consumed by the lazy Pagefind initializer, without touching theme persistence or no-flash behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts: 6 files, 1,126 LOC (no change vs P4-S3, +266 vs baseline). Selectors (search/content surfaces): no new custom selector debt introduced in this slice (no change vs P4-S3).                                                                                                                  |
| 2026-03-12 | P4-S3   | Completed   | Working tree | Replaced the remaining scoped Carbon token bridge with global `:root` semantic token mappings in `base.css`, removed the temporary scoped bridge block from `components.css`, and preserved reading-first link/focus affordance for prose and utility surfaces (search/feed/footer) across light and dark modes without touching theme persistence/no-flash behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2 TODOs (accepted carryover): `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P5]` remove footer utility-link token overrides after global Carbon link tokens preserve muted idle/hover affordance parity on home, feed, and sitemap without local wrappers). | Scripts: 6 files, 1,126 LOC (no change vs P4-S2, +266 vs baseline). Selectors (content surfaces): scoped bridge entries reduced from 1 block covering 8 scoped surfaces to 0 by moving token mapping to `:root`; only one minimal footer link override remains with a documented removal condition.  |
| 2026-03-12 | P4-S2   | In progress | Working tree | Extended the scoped Carbon token bridge to remaining heterogeneous utility surfaces (feed/search/footer actions), tightened utility-link affordance to avoid color-only signaling, and aligned focus-visible handling for feed copy controls in both color modes while preserving theme persistence/no-flash behavior and keyboard/mobile interactions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 2 TODOs: `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P4]` remove scoped token bridge after global Carbon token parity is complete for content, search, and feed utility surfaces).                                                                        | Scripts: 6 files, 1,126 LOC (no change vs P4-S1, +266 vs baseline). Selectors (content surfaces): scoped bridge coverage expanded to feed/search wrappers without new temporary bridges, and `::part(...)` overrides reduced from 1 to 0 (net -1).                                                   |
| 2026-03-12 | P4-S1   | In progress | Working tree | Harmonized migrated content surfaces with a scoped Carbon token bridge across PostCard/Footer/Post detail/breadcrumb/code-copy shells, mapped light/dark/focus/link semantics to Carbon tokens, removed temporary `::part(...)` overrides that became redundant after token adoption, and preserved reading-first prose link affordance with explicit underlines (non color-only), without changing theme persistence/no-flash behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 2 TODOs: `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API support baseline for site visitors reaches parity in analytics), `src/styles/components.css` (`[Carbon-P4]` remove scoped token bridge after global Carbon token parity is complete for content and feed surfaces).                                                                                         | Scripts: 6 files, 1,126 LOC (no change vs P3-S1, +266 vs baseline). Selectors (content surfaces): 15 scoped entries (from 16, net -1) and `::part(...)` overrides reduced to 1 from 5 (net -4); one scoped bridge TODO added for planned removal.                                                    |
| 2026-03-12 | P3-S1   | In progress | Working tree | Migrated content surfaces to Carbon by replacing PostCard internals with `cds-link` + `cds-tag`, migrating footer actions to `cds-link` in TSX and XSL shells, adding post-detail breadcrumbs with `cds-breadcrumb`, and shipping a localized Carbon copy affordance for post code blocks via `cds-copy-button`, while preserving theme persistence/no-flash and existing post navigation semantics.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 1 TODO: `src/scripts/post-code-copy.js` (`[Carbon-P3]` remove `execCommand` fallback after clipboard API coverage reaches parity in analytics).                                                                                                                                                                                                                                                                       | Scripts: 6 files, 1,126 LOC (+128 vs P2-S4, +266 vs baseline) due temporary `post-code-copy.js`. Selectors (content surfaces): removed 8 legacy entries, added 10 Carbon adaptation entries (net +2); header selectors remain 37 entries.                                                            |
| 2026-03-12 | P2-S4   | In progress | Working tree | Migrated the header theme control shell to Carbon in main/feed/sitemap with `cds-button` icon-only actions, preserved theme persistence/no-flash behavior through `theme-toggle.js` and `anti-flash.js`, finalized selective Carbon bootstrap registration for the theme shell in `carbon.js`, and removed obsolete legacy theme-toggle selectors from `components.css` while keeping search/language behavior unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | None                                                                                                                                                                                                                                                                                                                                                                                                                  | Scripts: 5 files, 998 LOC (+35 vs P2-S3, +138 vs baseline); `disclosure-controls.js` reduced to panel-bound actions only. Selectors: 37 entries (37 unique), down from 40 (40 unique). Theme selectors: 4 (from 7 baseline).                                                                         |
| 2026-03-12 | P2-S3   | In progress | Working tree | Migrated the header language shell to Carbon in main/feed/sitemap (`cds-header-global-action` + `cds-header-panel` + `cds-switcher`), preserved i18n routing and preference persistence through `language-preference.js`, reduced language legacy behavior in `disclosure-controls.js`, and removed details-era language selectors from `components.css` while leaving theme behavior unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 1 TODO: `src/scripts/carbon.js` (P2 theme shell selective registrations)                                                                                                                                                                                                                                                                                                                                              | Scripts: 5 files, 963 LOC (+28 vs P2-S2, +103 vs baseline). Selectors: 40 entries (40 unique), down from 57 (57 unique). Language selectors: 3 (from 20 baseline).                                                                                                                                   |
| 2026-03-12 | P2-S2   | In progress | Working tree | Migrated the header search shell to Carbon in main/feed/sitemap (`cds-header-global-action` + `cds-header-panel`), kept Pagefind lazy init and autofocus-on-open behavior, moved search focus/init orchestration into `pagefind-lazy-init.js`, and removed details/summary-era search selectors from `components.css` while keeping language/theme behavior unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 2 TODOs: `src/_includes/layouts/base.tsx` (P2 disclosure removal after language panel migration), `src/scripts/carbon.js` (P2 language/theme registrations)                                                                                                                                                                                                                                                           | Scripts: 5 files, 935 LOC (+17 vs P2-S1, +75 vs baseline). Selectors: 57 entries (57 unique), down from 74 (74 unique). Search selectors: 20 (from 37 baseline).                                                                                                                                     |
| 2026-03-12 | P2-S1   | In progress | Working tree | Migrated header/menu shell to Carbon (`cds-header`, `cds-header-menu-button`, `cds-side-nav`, `cds-header-nav`, `cds-header-nav-item`) in main and feed/sitemap shells; kept search/language/theme behavior unchanged; documented Carbon icon policy for migrated shells; replaced the i18n trigger globe with the IBM Watson Language Translator service icon.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 2 TODOs: `src/_includes/layouts/base.tsx` (P2 disclosure removal), `src/scripts/carbon.js` (P2 header-action registrations)                                                                                                                                                                                                                                                                                           | Scripts: 5 files, 918 LOC (+58). Selectors: 74 entries (74 unique), down from 90 (89 unique). Header/menu selectors: 8 (from 24).                                                                                                                                                                    |
| 2026-03-12 | P0 + P1 | In progress | Working tree | Captured Phase 0 technical/debt baseline and started Phase 1 Carbon plumbing (dependency alias + selective bootstrap wiring) without mass visual migration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2 TODOs: `src/_includes/layouts/base.tsx` (P2 disclosure removal), `src/scripts/carbon.js` (P2 selective registrations)                                                                                                                                                                                                                                                                                               | Baseline set: 5 bespoke scripts, 90 selectors (89 unique); delta is 0 at snapshot time.                                                                                                                                                                                                              |

## 8. Quality Gates and Validation Protocol

For every migration slice:

1. `deno fmt`
2. `deno lint`
3. `deno task check`
4. `deno task lint:doc`
5. `deno test`
6. `deno task test:doc`
7. `deno task build`
8. Review `_html-issues.json` and resolve all HTML errors.

For rendering-affecting slices:

- Capture before/after screenshots for core routes.
- Validate keyboard-only navigation paths (header, search, language, theme,
  pagination).
- Validate focus visibility and contrast in light and dark modes.
- Confirm body-link distinguishability is not color-only.

## 9. Risk Register and Mitigations

| Risk                                                | Impact | Likelihood | Mitigation                                                                             |
| --------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------- |
| Header interaction regressions (menu/search/panels) | High   | High       | Slice migration by behavior, not by file; keep parity checklists and staged merges.    |
| Bundle growth from broad component imports          | High   | Medium     | Enforce selective imports in `src/scripts/carbon.js`; track payload deltas per PR.     |
| Visual drift from minimalist editorial identity     | Medium | High       | Keep token bridge small, run screenshot diffs, and reject decorative overreach.        |
| Accessibility regressions during shell swap         | High   | Medium     | Add explicit keyboard/focus/contrast validation checklist to each migration PR.        |
| Feed shell divergence (`feed.xsl`) from main shell  | Medium | Medium     | Include feed view in baseline and parity checks for every header-related change.       |
| Over-customization reintroduces maintenance burden  | High   | Medium     | Enforce Carbon-by-default policy and track custom debt delta in every migration merge. |

## 10. Definition of Done

Migration is complete when all of the following are true:

- Carbon primitives replace bespoke UI shells in all scoped areas.
- No regressions in navigation, search, language switch, theme switch, or feeds.
- Reading-first constraints remain intact (measure, hierarchy, link
  distinguishability).
- Accessibility and performance baselines are maintained or improved.
- `AGENTS.md`, `CLAUDE.md`, and `README.md` are updated to reflect Carbon-first
  guidance.
- The status snapshot and progress log in this roadmap are up to date.
- No undocumented migration TODO remains in code.
- Carbon defaults are used by default in all migrated areas, with documented
  exceptions only.
- Custom-maintenance reduction thresholds are achieved, or remaining gaps are
  formally tracked with dated follow-up items.
- All quality gates pass and `_html-issues.json` is clean.

## 11. Suggested Commit Breakdown

1. Commit A: baseline captures, metrics snapshot, ADR.
2. Commit B: Carbon dependency alias + bootstrap wiring.
3. Commit C: header shell slice 1 (nav/menu/actions).
4. Commit D: header shell slice 2 (search/language/theme parity).
5. Commit E: post card + footer migration.
6. Commit F: breadcrumb + code copy enhancements.
7. Commit G: token harmonization and dark/light validation.
8. Commit H: cleanup of obsolete scripts/selectors.
9. Commit I: AGENTS/CLAUDE policy alignment and final hardening.

This sequencing concentrates risk where interaction complexity is highest, then
converges on visual, accessibility, and governance stability.
