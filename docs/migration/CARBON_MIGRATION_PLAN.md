# CARBON_MIGRATION_PLAN.md

Project: frenchvandal.com / normco.re\
Stack: Deno + Lume + TSX + modern CSS

Purpose of this document: Provide a **machine‑actionable migration plan** so AI
coding agents (Claude Code, Codex, Cursor, Copilot) can progressively align the
project with **IBM Carbon Design System v11**.

Carbon documentation (source of truth):

Carbon homepage\
https://carbondesignsystem.com

Component library\
https://carbondesignsystem.com/components/

Design guidelines\
https://carbondesignsystem.com/guidelines/

Tokens\
https://carbondesignsystem.com/guidelines/tokens/overview/

Spacing\
https://carbondesignsystem.com/guidelines/spacing/overview/

Typography\
https://carbondesignsystem.com/guidelines/typography/overview/

Layout grid\
https://carbondesignsystem.com/guidelines/layout/overview/

Accessibility\
https://carbondesignsystem.com/guidelines/accessibility/overview/

---

# 1 Migration philosophy

Two possible strategies exist:

## Strategy A — Carbon strict

Replicate Carbon component structure exactly.

Pros: • predictable behavior\
• Carbon documentation applies directly

Cons: • heavier CSS\
• more component complexity

## Strategy B — Carbon‑inspired lightweight (recommended)

Keep lightweight architecture but align with:

• Carbon tokens\
• Carbon accessibility rules\
• Carbon interaction patterns

This document follows **Strategy B**.

---

# 2 Token system audit

Current tokens appear to follow two parallel systems.

## Carbon-like tokens

Observed:

```
--cds-spacing-*
--cds-background
--cds-layer
--cds-text-primary
--cds-border-subtle
```

These correspond to Carbon base tokens.

Reference: https://carbondesignsystem.com/guidelines/tokens/overview/

## Custom tokens

Observed:

```
--space-s
--space-m
--text-base
--text-lg
--measure
--borderRadius-medium
```

Problem:

These duplicate Carbon semantic layers.

---

# 3 Recommended token architecture

Introduce three explicit layers.

## Layer 1 — Carbon base tokens

Example:

```
--cds-spacing-01
--cds-spacing-02
--cds-spacing-03
--cds-text-primary
--cds-background
```

Reference: https://carbondesignsystem.com/guidelines/spacing/overview/

## Layer 2 — semantic tokens

Example:

```
--layout-gap
--content-padding
--card-spacing
--surface-border
```

These map to Carbon tokens.

Example:

```
--layout-gap: var(--cds-spacing-05)
```

## Layer 3 — editorial tokens

Example:

```
--reading-measure
--article-leading
--hero-spacing
```

Used only for blog content.

---

# 4 CSS token mapping

Example mapping table.

| current token         | recommended replacement | Carbon guideline                                               |
| --------------------- | ----------------------- | -------------------------------------------------------------- |
| --space-s             | --cds-spacing-03        | https://carbondesignsystem.com/guidelines/spacing/overview/    |
| --space-m             | --cds-spacing-05        | https://carbondesignsystem.com/guidelines/spacing/overview/    |
| --text-base           | Carbon productive body  | https://carbondesignsystem.com/guidelines/typography/overview/ |
| --borderRadius-medium | remove or document      | Carbon components often avoid large radii                      |

---

# 5 Component mapping

Mapping site components to Carbon equivalents.

| Site component  | Carbon component | Guideline                                                        |
| --------------- | ---------------- | ---------------------------------------------------------------- |
| Header          | UI Shell Header  | https://carbondesignsystem.com/components/ui-shell-header/usage/ |
| Side navigation | SideNav          | https://carbondesignsystem.com/components/side-nav/usage/        |
| Breadcrumb      | Breadcrumb       | https://carbondesignsystem.com/components/breadcrumb/usage/      |
| Tag             | Tag              | https://carbondesignsystem.com/components/tag/usage/             |
| Search          | Search           | https://carbondesignsystem.com/components/search/usage/          |
| Empty page      | Empty state      | https://carbondesignsystem.com/components/empty-states/usage/    |

---

# 6 CSS audit checklist

AI agents should check the following rules.

## Rule 1 — no hardcoded colors

Forbidden:

```
color:#000
background:#fff
```

Must use tokens.

Reference: https://carbondesignsystem.com/guidelines/color/overview/

---

## Rule 2 — spacing must use tokens

Forbidden:

```
margin:18px
padding:23px
```

Correct:

```
margin:var(--cds-spacing-05)
```

Reference: https://carbondesignsystem.com/guidelines/spacing/overview/

---

## Rule 3 — typography must follow scale

Headings must map to Carbon expressive or productive scale.

Reference: https://carbondesignsystem.com/guidelines/typography/overview/

---

# 7 Accessibility requirements

Mandatory rules derived from Carbon guidelines.

Reference: https://carbondesignsystem.com/guidelines/accessibility/overview/

## Dialog surfaces

Required:

```
role="dialog"
aria-labelledby
focus trap
focus return
```

---

## Navigation

Use:

```
aria-current="page"
```

for active items.

---

## Skip link

Mandatory.

---

# 8 Interaction patterns

Carbon interaction patterns:

https://carbondesignsystem.com/guidelines/motion/overview/

Key principles:

• predictable toggles\
• accessible keyboard navigation\
• Escape closes dialogs\
• overlay surfaces prevent background interaction

---

# 9 JS architecture recommendations

Current scripts:

```
disclosure-controls
theme-toggle
pagefind-lazy-init
archive-year-nav
```

Recommended refactor:

Create unified module:

```
ui-disclosure.ts
```

Responsibilities:

• toggle state\
• aria-expanded synchronization\
• focus trapping\
• overlay control\
• Escape handling

---

# 10 File‑level migration targets

AI agents should inspect these files first.

```
src/_components/Header.tsx
src/_components/Footer.tsx
src/_components/PostCard.tsx
src/_includes/base.tsx
src/styles/style.css
src/scripts/disclosure-controls.ts
```

---

# 11 Automated audit tasks

AI agents should run these checks.

### CSS audit

Search for:

```
px
#hex
rgb(
```

### Token audit

Detect tokens not beginning with:

```
--cds
--semantic
--editorial
```

### Accessibility audit

Check presence of:

```
aria-expanded
aria-controls
aria-current
```

---

# 12 Visual regression testing

Recommended tools:

• Playwright\
• Loki\
• Chromatic

Purpose:

Prevent regressions in:

• header shell\
• side navigation\
• article layout

---

# 13 Migration phases

## Phase 1 — accessibility (completed 2026-03-15)

1 ~~fix dialog semantics~~ — removed invalid `aria-modal`, added `role="search"` and `role="region"` with `aria-labelledby`\
2 ~~implement focus trap~~ — added to disclosure-controls.js\
3 ~~add missing headings~~ — added `<h1>` to 404 page

## Phase 2 — tokens (partially completed 2026-03-15)

1 ~~normalize error-pages.css~~ — replaced `--space-*` and `--text-*` with Carbon tokens\
2 ~~replace hardcoded rgba~~ — replaced with Carbon shadow tokens and oklch\
3 remaining: tag.css hex colors need Carbon token alignment

## Phase 3 — interaction (completed 2026-03-15)

1 ~~unify disclosure logic~~ — centralized in disclosure-controls.js\
2 ~~add scroll locking~~ — added lockScroll/unlockScroll\
3 ~~add focus return~~ — trigger element receives focus on panel close

## Phase 4 — components (completed 2026-03-15)

1 ~~normalize breadcrumb~~ — canonical `<ol>` list structure with CSS pseudo separators\
2 ~~fix tag cursor~~ — `cursor:pointer` limited to interactive tags only

## Phase 5 — documentation

Update

```
UI_COMPONENT_REGISTRY.md (updated)
CARBON_MIGRATION_PLAN.md (updated)
```

---

# 14 Final outcome

After migration the project will be:

A **lightweight Carbon‑aligned design system** optimized for static sites.

Characteristics:

• Carbon tokens\
• Carbon accessibility compliance\
• Carbon interaction patterns\
• minimal CSS footprint\
• high performance
