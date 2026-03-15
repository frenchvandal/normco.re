# Claude Code / Codex Migration Prompt

Repository: `frenchvandal/normco.re`

## Mission

Continue the migration of the repository toward a **Carbon‑aligned lightweight
design system** based on **IBM Carbon Design System v11**, while preserving the
project's static architecture:

- Deno
- Lume
- TSX
- modern CSS
- no React runtime
- local implementation of Carbon‑inspired patterns

Do **not** assume the goal is a strict one‑to‑one Carbon implementation.\
The target architecture is a **lightweight static system aligned with Carbon
tokens, accessibility rules, interaction principles, and component guidance**,
with documented deviations where needed.

---

# Mandatory reading order

Before changing any UI code, read these repository documents in this exact
order:

1. AGENTS.md
2. CLAUDE.md
3. docs/design-system/DESIGN_SYSTEM_CONTRACT.md
4. docs/design-system/UI_COMPONENT_REGISTRY.md
5. docs/migration/CARBON_MIGRATION_PLAN.md
6. docs/migration/CARBON_GUIDELINE_INDEX.md
7. docs/tokens/CARBON_TOKEN_MAP.json
8. docs/audits/carbon_engineering_audit.md
9. docs/audits/combined_carbon_performance_audit.md

These documents define:

- design system posture
- allowed deviations
- component inventory
- migration priorities
- token strategy
- audit baseline

---

# Authoritative external references

Use Carbon documentation as the external source of truth.

Core references:

https://carbondesignsystem.com\
https://carbondesignsystem.com/components/\
https://carbondesignsystem.com/guidelines/\
https://carbondesignsystem.com/guidelines/tokens/overview/\
https://carbondesignsystem.com/guidelines/accessibility/overview/

Component references most relevant to this repository:

UI Shell Header\
https://carbondesignsystem.com/components/ui-shell-header/usage/

Side nav\
https://carbondesignsystem.com/components/side-nav/usage/

Breadcrumb\
https://carbondesignsystem.com/components/breadcrumb/usage/

Tag\
https://carbondesignsystem.com/components/tag/usage/

Search\
https://carbondesignsystem.com/components/search/usage/

Empty states\
https://carbondesignsystem.com/components/empty-states/usage/

Typography\
https://carbondesignsystem.com/guidelines/typography/overview/

Layout\
https://carbondesignsystem.com/guidelines/layout/overview/

Motion\
https://carbondesignsystem.com/guidelines/motion/overview/

---

# Repository posture

Treat the repository as a **Carbon‑aligned lightweight system**, not as a strict
Carbon clone.

This means:

- Carbon tokens and semantic layers should be used whenever possible
- Carbon accessibility expectations are mandatory
- Carbon interaction patterns should guide shell behavior
- editorial components may remain custom
- deviations must be explicit and documented

---

# Primary objectives

## 1 Normalize the token system

Audit CSS tokens and eliminate unnecessary parallel token systems.

Tasks:

- detect raw spacing values in `px`
- detect hard‑coded colors (`#hex`, `rgb`, `rgba`)
- align tokens with `docs/tokens/CARBON_TOKEN_MAP.json`

Target architecture:

1. Carbon base tokens
2. semantic tokens
3. editorial tokens

---

## 2 Refactor the UI shell and disclosure model

Priority files:

src/_components/Header.tsx\
src/_includes/base.tsx\
src/scripts/disclosure-controls.ts

If necessary create:

src/scripts/ui-disclosure.ts

Goals:

- unify toggle logic
- synchronize aria-expanded
- manage overlay behavior
- ensure keyboard accessibility

Each surface must be explicitly classified as:

- dialog
- disclosure panel
- navigation surface
- custom accessible surface

Do not mix semantics.

---

## 3 Fix accessibility issues

Audit and correct:

- aria-expanded
- aria-controls
- aria-current
- focus-visible
- keyboard navigation
- Escape handling
- focus return
- heading hierarchy

If `aria-modal="true"` is used ensure:

- role="dialog"
- aria-labelledby
- focus trap
- focus return

Otherwise remove invalid modal semantics.

Also verify:

- 404 page has `<h1>`
- skip link exists
- icon-only controls have accessible labels

---

## 4 Normalize component structures

Use `docs/design-system/UI_COMPONENT_REGISTRY.md` as the component inventory.

Priority components:

1. Header
2. Side navigation
3. Search panel
4. Language selector
5. Breadcrumb
6. Tag
7. Empty / error states

Rules:

- Breadcrumb must use a single separator model
- Non-interactive tags must not use `cursor:pointer`
- Error states must include semantic headings

---

## 5 Preserve performance

The site already performs extremely well.

Do not regress:

- CSS size
- blocking scripts
- theme initialization
- lazy loading

Reference:

docs/audits/combined_carbon_performance_audit.md

---

# Required workflow

Step 1 — Read documentation

Understand migration goals and design system contract.

Step 2 — Run repository scanner

```
deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .
```

Review generated `CARBON_COMPLIANCE_REPORT.md`.

Step 3 — Implement targeted refactors

Refactor:

- tokens
- shell interactions
- accessibility semantics
- component structure

Step 4 — Update documentation

If component behavior changes update:

docs/design-system/UI_COMPONENT_REGISTRY.md\
docs/design-system/DESIGN_SYSTEM_CONTRACT.md\
docs/migration/CARBON_MIGRATION_PLAN.md

Step 5 — Produce migration report

Summarize:

- files changed
- components updated
- accessibility fixes
- token normalization
- remaining technical debt

---

# Implementation rules

Tokens:

- avoid raw colors
- avoid raw spacing
- use Carbon tokens whenever possible

Accessibility:

All interactive controls must support:

- keyboard navigation
- visible focus
- correct ARIA state

Components:

Do not label a component Carbon-compliant unless it truly follows Carbon
structure and behavior.

Documentation:

Any architectural UI change must be reflected in repository documentation.

---

# Target files

Start with:

src/_components/Header.tsx\
src/_components/Footer.tsx\
src/_components/PostCard.tsx\
src/_includes/base.tsx\
src/styles/style.css\
src/scripts/disclosure-controls.ts\
src/scripts/pagefind-lazy-init.ts

Also inspect:

archive templates\
post templates\
404 template\
offline template

---

# Deliverables

Provide:

1. updated source files
2. updated documentation
3. migration diff
4. summary of changes
5. updated CARBON_COMPLIANCE_REPORT.md if relevant

---

# Success criteria

Migration is successful if:

- Carbon alignment improves
- performance remains excellent
- accessibility is correct
- tokens become consistent
- documentation matches implementation
