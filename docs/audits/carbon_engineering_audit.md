# Engineering Carbon v11 + Performance Audit

Project: frenchvandal.com / normco.re\
Stack: Deno + Lume + TSX + modern CSS\
Architecture: static SSG

This document is an **engineering‑grade audit** designed for AI coding
assistants (Claude Code, Codex, Cursor, Copilot).

It merges:

1. Carbon Design System v11 compliance audit
2. Performance audit (Lighthouse reconstruction)

The goal is to provide a **precise migration / remediation roadmap**.

Carbon official documentation is treated as the **single source of truth**.

Primary references:

Carbon homepage\
https://carbondesignsystem.com

Design guidelines\
https://carbondesignsystem.com/guidelines/

Component library\
https://carbondesignsystem.com/components/

---

# 1 Executive summary

The project implements a **custom editorial design system inspired by Carbon**
rather than a strict Carbon v11 implementation.

Strengths:

• strong token architecture\
• excellent performance\
• coherent UI shell\
• modern semantic HTML\
• minimal critical path

Weaknesses:

• Carbon classes used for custom components\
• incomplete accessibility semantics\
• partial deviation from Carbon layout and interaction rules\
• hybrid token system

---

# 2 Global score

| category               | score |
| ---------------------- | ----- |
| Carbon compliance      | 70    |
| Accessibility          | 66    |
| Interaction robustness | 62    |
| Token architecture     | 79    |
| Typography alignment   | 76    |
| Layout alignment       | 70    |
| Performance            | 96    |

---

# 3 Performance audit

Source reconstruction from Lighthouse captures.

Main observations:

• CSS ≈ 11 KiB\
• only two blocking resources\
• text LCP\
• extremely small network waterfall

Critical request chain

```
HTML
 ├ style.css
 └ anti-flash.js
```

Blocking impact ≈ 440 ms

Recommended improvements

Inline anti‑flash script

```
<script>
(() => {
const theme = localStorage.getItem("theme");
if (theme) document.documentElement.dataset.theme = theme;
})();
</script>
```

Defer non‑critical scripts

```
theme-toggle.js
language-preference.js
disclosure-controls.js
pagefind-lazy-init.js
link-prefetch-intent.js
sw-register.js
```

Example

```
<script src="/scripts/theme-toggle.js" defer></script>
```

CSS critical path optimization not required due to very small size.

---

# 4 Carbon design governance

Carbon design systems rely on **three governance layers**:

1 tokens\
2 components\
3 layout grid

Reference documentation:

Design tokens\
https://carbondesignsystem.com/guidelines/tokens/overview/

Spacing scale\
https://carbondesignsystem.com/guidelines/spacing/overview/

Typography\
https://carbondesignsystem.com/guidelines/typography/overview/

Layout grid\
https://carbondesignsystem.com/guidelines/layout/overview/

Accessibility\
https://carbondesignsystem.com/guidelines/accessibility/overview/

---

# 5 Token architecture

Observed tokens

Carbon‑style

```
--cds-spacing-*
--cds-background
--cds-layer
--cds-text-primary
--cds-border-subtle
```

Custom tokens

```
--space-*
--text-*
--measure
--borderRadius-medium
```

Carbon recommendation:

Use semantic tokens derived from base tokens rather than parallel systems.

Reference

https://carbondesignsystem.com/guidelines/tokens/overview/

Issue:

Hybrid token vocabulary introduces maintainability risk.

Recommendation:

Create three explicit layers

```
carbon base tokens
semantic tokens
local editorial tokens
```

---

# 6 UI shell architecture

Carbon UI shell documentation:

https://carbondesignsystem.com/components/ui-shell-header/usage/

Side navigation:

https://carbondesignsystem.com/components/side-nav/usage/

Expected shell anatomy

• global header\
• left navigation panel\
• header actions\
• overlay behavior\
• consistent panel semantics

Strengths

• header exists\
• side nav exists\
• overlay present\
• language selector integrated\
• search panel integrated

Problems

Panels marked

```
aria-modal="true"
```

But do not implement dialog behavior.

Carbon accessibility rules require:

```
role="dialog"
aria-labelledby
focus trapping
focus return
```

Reference

https://carbondesignsystem.com/guidelines/accessibility/overview/

---

# 7 Component mapping

Mapping between site components and Carbon equivalents.

| site component  | Carbon component              | guideline                                                        |
| --------------- | ----------------------------- | ---------------------------------------------------------------- |
| header          | UI Shell Header               | https://carbondesignsystem.com/components/ui-shell-header/usage/ |
| side navigation | SideNav                       | https://carbondesignsystem.com/components/side-nav/usage/        |
| breadcrumb      | Breadcrumb                    | https://carbondesignsystem.com/components/breadcrumb/usage/      |
| tags            | Tag                           | https://carbondesignsystem.com/components/tag/usage/             |
| search panel    | Header panel / search pattern | https://carbondesignsystem.com/components/search/usage/          |
| empty states    | Empty state                   | https://carbondesignsystem.com/components/empty-states/usage/    |

---

# 8 Component compliance

## Header

Guideline

https://carbondesignsystem.com/components/ui-shell-header/usage/

Correct

• action buttons\
• aria-expanded used\
• aria-controls used

Deviation

• custom icon rotation\
• custom panel behavior

---

## Side navigation

Guideline

https://carbondesignsystem.com/components/side-nav/usage/

Correct

• hidden by default\
• overlay behavior

Deviation

• no focus trap\
• no scroll locking

---

## Breadcrumb

Guideline

https://carbondesignsystem.com/components/breadcrumb/usage/

Issue

Separators implemented both via CSS pseudo elements and HTML markup.

Recommendation

Use canonical list structure.

---

## Tags

Guideline

https://carbondesignsystem.com/components/tag/usage/

Issue

```
cursor:pointer
```

applied to non interactive tags.

---

# 9 Typography

Guideline

https://carbondesignsystem.com/guidelines/typography/overview/

Correct

• IBM Plex fonts used\
• good hierarchy

Deviation

• hybrid token scale

---

# 10 Layout

Guideline

https://carbondesignsystem.com/guidelines/layout/overview/

Correct

• constrained content width\
• consistent spacing

Deviation

• grid not implemented as Carbon grid system.

---

# 11 Accessibility

Guideline

https://carbondesignsystem.com/guidelines/accessibility/overview/

Good

• skip link\
• aria-current\
• focus-visible

Issues

Incorrect modal semantics

```
aria-modal=true
```

Missing

• focus trap\
• dialog roles

404 page missing h1.

---

# 12 Interaction system

Scripts

```
disclosure-controls
theme-toggle
pagefind
archive-nav
```

Strengths

• modular JS\
• Escape handling\
• outside click handling

Issues

• mixed state model

```
hidden
expanded
aria-expanded
```

• no scroll locking

---

# 13 Page audit

Homepage

Strong editorial layout.

Archive

Clear information architecture.

Post page

Readable article layout.

404 page

Accessibility issue: missing heading.

---

# 14 Migration roadmap

Critical

1 fix dialog semantics\
2 add focus trapping\
3 add h1 to 404\
4 label search panel

Important

5 unify token system\
6 normalize breadcrumb markup\
7 add scroll locking

Nice

8 add visual regression tests\
9 formalize design system documentation

---

# 15 AI development tasks

Target tools

Claude Code\
Codex\
Cursor\
Copilot

---

## Task 1 Shell accessibility

Files

```
Header.tsx
base.tsx
disclosure-controls.ts
```

Add

• dialog semantics\
• focus trap\
• focus return

---

## Task 2 Token cleanup

Audit

```
--space
--text
--measure
```

Align with

https://carbondesignsystem.com/guidelines/tokens/overview/

---

## Task 3 Documentation

Update

```
AGENTS.md
CLAUDE.md
ARCHITECTURE.md
```

Define

• Carbon compliant components\
• custom components

---

# Final conclusion

The site shows:

excellent performance\
good design discipline\
clear Carbon inspiration

But it cannot be certified as a strict Carbon implementation.

Correct description:

A **custom lightweight design system inspired by IBM Carbon Design System v11**.
