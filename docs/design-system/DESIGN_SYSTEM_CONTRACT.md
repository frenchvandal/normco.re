# DESIGN_SYSTEM_CONTRACT.md

Project: frenchvandal.com / normco.re\
Design system strategy: **Carbon‑aligned lightweight system**

This document defines the **design system contract** used in this repository.

Its purpose is to ensure that:

- developers
- designers
- and AI coding agents

follow the same rules when implementing UI.

Carbon Design System is the **reference framework**, but the repository uses a
**lightweight implementation** adapted for a static site architecture.

Carbon documentation:

https://carbondesignsystem.com\
https://carbondesignsystem.com/components/\
https://carbondesignsystem.com/guidelines/

---

# 1 Design system strategy

The project follows a **Carbon‑aligned architecture**.

This means:

• Carbon tokens and principles are used\
• accessibility rules follow Carbon guidance\
• interaction patterns follow Carbon logic\
• components may be simplified for static architecture

The system is **not a strict Carbon implementation**.

Instead it is:

> a lightweight design system inspired by Carbon.

---

# 2 Component classification

All UI components must belong to one of three categories.

## 1 Carbon‑aligned components

These components must closely follow Carbon structure and accessibility.

Examples:

| component       | reference                                                        |
| --------------- | ---------------------------------------------------------------- |
| Header          | https://carbondesignsystem.com/components/ui-shell-header/usage/ |
| Side navigation | https://carbondesignsystem.com/components/side-nav/usage/        |
| Breadcrumb      | https://carbondesignsystem.com/components/breadcrumb/usage/      |
| Tag             | https://carbondesignsystem.com/components/tag/usage/             |
| Search          | https://carbondesignsystem.com/components/search/usage/          |

Rules:

• structure must follow Carbon patterns\
• ARIA attributes must follow Carbon accessibility rules

---

## 2 Carbon‑inspired components

These components are adapted to editorial content.

Examples:

• PostCard\
• Article layout\
• Archive timeline\
• Hero section

Rules:

• must still use Carbon tokens\
• must follow spacing scale

---

## 3 Custom components

These components do not exist in Carbon.

Examples:

• multilingual language selector\
• blog archive navigation

Rules:

• must remain accessible\
• must respect token system

---

# 3 Token system

Token system has three layers.

## Layer 1 — Carbon base tokens

Examples

--cds-spacing-01\
--cds-spacing-02\
--cds-text-primary

Reference

https://carbondesignsystem.com/guidelines/tokens/overview/

---

## Layer 2 — semantic tokens

Examples

--layout-gap\
--content-padding\
--surface-border

Semantic tokens must reference Carbon tokens.

Example

--layout-gap: var(--cds-spacing-05)

---

## Layer 3 — editorial tokens

Used only for blog content.

Examples

--reading-measure\
--article-leading

---

# 4 CSS rules

The following rules are mandatory.

## Colors

Forbidden

color:#000\
background:#fff

Use tokens instead.

Reference

https://carbondesignsystem.com/elements/color/overview/

---

## Spacing

Use Carbon spacing scale.

Reference

https://v10.carbondesignsystem.com/guidelines/spacing/overview/

---

## Typography

Use IBM Plex fonts.

Reference

https://v10.carbondesignsystem.com/guidelines/typography/overview/

---

# 5 Accessibility contract

Accessibility rules are mandatory.

Reference

https://carbondesignsystem.com/guidelines/accessibility/overview/

Dialogs must include

role="dialog"\
aria-labelledby\
focus trap\
focus return

Navigation must use

aria-current="page"

---

# 6 Interaction rules

All disclosure interactions must:

• synchronize aria-expanded\
• respond to Escape\
• support keyboard navigation

Reference

https://carbondesignsystem.com/guidelines/motion/overview/

---

# 7 Performance rules

The system must remain lightweight.

Rules:

• CSS < 20 KiB preferred\
• minimal blocking JS\
• lazy load optional features

---

# 8 Governance

All UI changes must follow this workflow.

1. check Carbon documentation
2. update tokens if necessary
3. maintain accessibility compliance
4. update migration documentation

Relevant docs:

docs/migration/CARBON_MIGRATION_PLAN.md\
docs/tokens/CARBON_TOKEN_MAP.json

---

# 9 Source of truth

The design system source of truth is:

Carbon documentation\
https://carbondesignsystem.com

plus repository documentation.
