# Carbon Web Components Migration Roadmap

## 1. Objective and Constraints

This roadmap defines a phased migration from Primer-like bespoke components to
Carbon Web Components while preserving the blog's minimalist visual identity,
performance profile, accessibility quality, and content-first experience.

### Primary objective

- Replace Primer-equivalent UI primitives with Carbon Web Components from
  `@carbon/web-components`.
- Import Carbon components on a case-by-case basis, matching each existing UI
  responsibility to the closest Carbon equivalent.
- Keep pages authored in TSX + TypeScript and avoid introducing non-Lume
  rendering layers.

### Non-negotiable constraints

- Preserve the site's core visual spirit (typography, whitespace, minimalist
  hierarchy).
- Maintain existing feature set and IA (navigation, posts, search, feeds,
  language switch, theme toggle).
- Keep build quality gates intact (formatting, linting, type checking, doc
  lint/tests, tests, build + HTML validation).
- Avoid broad runtime JavaScript expansion by importing only components that are
  actually used.

## 2. Target Architecture

## 2.1 Integration approach

- Add `@carbon/web-components` through npm specifier aliases in `deno.json`.
- Create one dedicated client bootstrap file (for example
  `src/scripts/carbon.ts`) that performs selective side-effect imports for the
  exact custom elements required by each migrated view.
- Register bootstrap in the base layout so custom elements are defined before
  interactive usage.
- Keep present TSX templates as the orchestration layer, replacing HTML
  fragments class-by-class with semantic Carbon tags (`<cds-*>`).

## 2.2 Design token bridge

- Introduce a token bridge layer that maps current site tokens to
  Carbon-compatible tokens.
- Keep a local adapter section in CSS to preserve the current visual identity
  while using Carbon internals.
- Prefer semantic token mapping over one-off selector overrides.

## 2.3 Component boundary strategy

- Continue using local TSX components (`Header`, `Footer`, `PostCard`, layout
  files) as composition shells.
- Gradually swap internals to Carbon tags instead of rewriting page
  architecture.
- Keep project-specific behaviors (i18n routing, URL localization, reading-time
  metadata) in local logic and pass values into Carbon components.

## 3. Migration Inventory and Mapping Matrix

The table below should be validated against Storybook availability before
implementation starts.

| Existing responsibility                                                           | Current location                                                             | Carbon candidate(s)                                                                                                             | Migration notes                                                                                                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Header command area (menu trigger, search trigger, language switch, theme toggle) | `src/_components/Header.tsx`                                                 | `cds-header`, `cds-header-menu-button`, `cds-header-nav`, `cds-header-nav-item`, `cds-header-global-action`, `cds-header-panel` | Highest-risk integration because this area currently combines custom `details/summary`, overlays, and Pagefind container mounting. |
| Navigation list and active state                                                  | `src/_components/Header.tsx`                                                 | `cds-header-nav` + `cds-header-nav-item`                                                                                        | Must preserve `aria-current="page"` and locale-aware links.                                                                        |
| Search overlay container                                                          | `src/_components/Header.tsx`, pagefind styles in `src/styles/components.css` | `cds-modal` or `cds-header-panel` + Carbon text input/search                                                                    | Validate keyboard focus trapping and escape behavior against current implementation.                                               |
| Theme and a11y controls                                                           | `src/_components/Header.tsx`                                                 | `cds-switch`, `cds-toggle`, or icon-only `cds-header-global-action` patterns                                                    | Might require custom hybrid handling if exact UX parity is not provided by Carbon primitives.                                      |
| Post list card shell                                                              | `src/_components/PostCard.tsx`                                               | `cds-link`, `cds-tag` (optional metadata chips), layout primitives                                                              | Carbon does not require heavy card chrome; keep minimalist rendering and avoid unnecessary framing.                                |
| Footer action links and feed links                                                | `src/_components/Footer.tsx`                                                 | `cds-link`, optional `cds-inline-notification` patterns only if needed                                                          | Keep footer lightweight; avoid decorative Carbon usage.                                                                            |
| Form controls (search and future forms)                                           | Header search and potential pages                                            | `cds-search`, `cds-text-input`, `cds-select`                                                                                    | Import only controls that are actively used.                                                                                       |
| Inline status/alerts (if any future content uses them)                            | Future-ready                                                                 | `cds-inline-notification`, `cds-toast-notification`                                                                             | Defer until needed to avoid scope creep.                                                                                           |

## 4. Execution Plan (Phased)

## Phase 0 — Discovery and baseline (1 sprint)

1. Audit all UI primitives and classify each as:
   - direct Carbon replacement,
   - replacement with adaptation,
   - temporary local component to keep.
2. Produce a Carbon availability matrix from Storybook and package exports.
3. Capture visual baseline screenshots (home + posts list + post page + about +
   search overlay).
4. Record current Core Web Vitals and bundle-size baseline.

**Deliverables**

- Audited inventory file.
- Baseline image set.
- Risk register with priority levels.

## Phase 1 — Dependency and bootstrap plumbing (1 sprint)

1. Add `@carbon/web-components` alias in `deno.json`.
2. Update lockfile only if dependency declaration changes and run dependency
   update workflow.
3. Add selective Carbon registration script (`src/scripts/carbon.ts`).
4. Wire script into `base.tsx` with controlled loading order.
5. Confirm no hydration/runtime conflicts with existing scripts.

**Exit criteria**

- Build succeeds.
- No runtime custom-element definition errors.
- No visual regressions yet (only infrastructure).

## Phase 2 — Header migration (2–3 sprints)

1. Replace header structure progressively:
   - navigation primitives,
   - global actions,
   - search trigger/panel pattern,
   - language and theme controls.
2. Keep i18n URL logic untouched; only view layer changes.
3. Re-test keyboard order, focus visibility, escape handling, and screen-reader
   labels.
4. Port relevant CSS from Primer-like control styles to Carbon token bridge.

**Exit criteria**

- Header functionality is parity-complete.
- Search remains operational with Pagefind.
- Accessibility checks pass for keyboard and landmarks.

## Phase 3 — Content components migration (1–2 sprints)

1. Migrate `PostCard` internals to Carbon-friendly primitives while preserving
   minimalist rhythm.
2. Migrate footer links and utility actions where meaningful.
3. Remove obsolete Primer-like utility selectors from
   `src/styles/components.css`.

**Exit criteria**

- Post lists and footer render correctly in all languages.
- No unused legacy selector clusters remain for migrated parts.

## Phase 4 — Token harmonization and visual refinement (1 sprint)

1. Define Carbon-to-local token mapping for color, spacing, radius, and
   typography.
2. Tune dark/light mode for equivalence with current editorial tone.
3. Add targeted overrides only where Carbon defaults conflict with project
   identity.
4. Re-run screenshot diff and accessibility contrast checks.

**Exit criteria**

- Visual identity remains recognizably the same, now implemented through Carbon
  components.
- Contrast and focus states meet accessibility targets.

## Phase 5 — Cleanup and hardening (1 sprint)

1. Remove dead Primer-style classes and helper code paths.
2. Ensure only case-by-case Carbon imports remain (no blanket component bundle
   imports).
3. Verify no circular imports and no regressions in tests.
4. Update contributor guidance files (`AGENTS.md` and `CLAUDE.md`) to encode the
   Carbon-first policy for future work.

**Exit criteria**

- Legacy Primer assumptions removed.
- New contribution rules committed and consistent.

## 5. Required Policy Updates (AGENTS.md and CLAUDE.md)

The migration should include synchronized updates to both guidance files.

### 5.1 Sections to update

- Stack summary: replace Primer-like implementation guidance with Carbon Web
  Components guidance.
- CSS section: clarify how Carbon tokens and local overrides coexist.
- Component conventions: define when to use `<cds-*>` directly versus local
  wrapper TSX components.
- Import policy: enforce selective component imports from
  `@carbon/web-components`.
- Accessibility section: define Carbon component accessibility validation
  expectations.

### 5.2 Proposed wording direction

- "Carbon Web Components are the default UI primitive layer."
- "Prefer semantic Carbon components with local TSX composition."
- "Import only components used by a given view or feature."
- "Do not reintroduce Primer-specific utility classes for new UI work."

## 6. Exception Requests (to validate before implementation)

Because this migration intentionally departs from existing Primer-oriented
guidance, the following temporary exceptions are proposed and must be explicitly
approved before execution:

1. **Dependency exception**: allow adding `@carbon/web-components` and related
   minimal utilities needed for integration.
2. **Styling exception**: allow targeted overrides of Carbon internals through
   supported theming hooks where strict local token naming may need
   compatibility bridging.
3. **Component exception**: allow use of Carbon custom elements (`<cds-*>`)
   within TSX render files as first-class UI primitives.
4. **Guideline transition exception**: allow interim coexistence of legacy
   Primer-like selectors and Carbon selectors during phased rollout.
5. **Testing exception (if needed)**: allow temporary snapshot churn and update
   tests incrementally per phase rather than one massive rewrite.

## 7. Quality Gates per Phase

For each phase, execute and record:

1. `deno fmt`
2. `deno lint`
3. `deno task check`
4. `deno task lint:doc`
5. `deno test`
6. `deno task test:doc`
7. `deno task build`
8. Review `_html-issues.json` and resolve all reported HTML issues.

Additionally for migration phases that affect rendering:

- Capture before/after screenshots for home, archive, post page, and search
  interaction.
- Verify keyboard-only navigation and focus ring visibility.
- Run Lighthouse or equivalent performance checks and compare against baseline.

## 8. Risk Register and Mitigations

| Risk                                                  | Impact | Likelihood | Mitigation                                                                            |
| ----------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------- |
| Header behavior mismatch (search, menu, overlays)     | High   | High       | Migrate header in small sub-steps with feature flags or branch checkpoints.           |
| Bundle size growth from naive imports                 | Medium | Medium     | Enforce selective imports and analyze generated output after each component addition. |
| Visual drift from established identity                | Medium | High       | Maintain token bridge and screenshot diffs as merge criteria.                         |
| Accessibility regressions during component swap       | High   | Medium     | Add explicit keyboard and screen-reader test checklist per PR.                        |
| Style conflicts between local CSS and Carbon defaults | Medium | High       | Contain overrides in dedicated Carbon adaptation layer with strict scope.             |

## 9. Definition of Done for the Migration Program

The migration is complete when all conditions below are met:

- Primer-like component patterns are fully replaced by Carbon equivalents where
  applicable.
- No critical UX behavior regressed (navigation, search, language switch, theme
  toggle, feeds).
- `AGENTS.md` and `CLAUDE.md` are updated and aligned with Carbon-first
  guidance.
- Mandatory quality gates pass.
- Visual and accessibility parity is documented with screenshots and checklist
  evidence.
- Remaining technical debt (if any) is explicitly tracked in follow-up issues.

## 10. Suggested Work Breakdown for the `carbon` Branch

1. Commit A: baseline audit + this roadmap.
2. Commit B: dependency/bootstrap plumbing.
3. Commit C: header migration slice 1 (navigation/actions).
4. Commit D: header migration slice 2 (search + controls).
5. Commit E: post card/footer migration.
6. Commit F: token harmonization and CSS cleanup.
7. Commit G: AGENTS/CLAUDE policy update and final hardening.

This sequencing keeps risk concentrated in the header first, then converges on
visual consistency and governance updates.
