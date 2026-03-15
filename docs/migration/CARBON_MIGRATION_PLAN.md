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

## Phase 1 — accessibility

1 fix dialog semantics\
2 implement focus trap\
3 add missing headings

## Phase 2 — tokens

1 remove duplicate tokens\
2 introduce semantic token layer

## Phase 3 — interaction

1 unify disclosure logic\
2 add scroll locking

## Phase 4 — documentation

Update

```
AGENTS.md
CLAUDE.md
ARCHITECTURE.md
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
