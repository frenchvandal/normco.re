# Carbon Design System v11 + Performance Audit

## Project: frenchvandal.com / normco.re

Architecture: Deno + Lume + TSX + modern CSS

This document merges two independent audits into a **single technical
certification-style report**:

1. **Carbon Design System v11 compliance audit**
2. **Performance / Lighthouse audit**

Performance findings originate from the Lighthouse reconstruction report.
fileciteturn0file0

---

# 1. Executive summary

The project is a **lightweight static architecture** designed around:

- Deno runtime
- Lume static site generator
- TSX templating
- modern CSS with design tokens
- local Carbon-inspired components
- multilingual support

The site demonstrates **strong design discipline and exceptional performance**,
but it **does not strictly implement Carbon Design System v11**.

Instead, the system should be considered:

> A custom design system **inspired by IBM Carbon Design System v11**, with
> partial token and component alignment.

---

# 2. Global scores

| Category                 | Score        |
| ------------------------ | ------------ |
| Carbon design compliance | 70 / 100     |
| Accessibility maturity   | 66 / 100     |
| Interaction robustness   | 62 / 100     |
| Token architecture       | 79 / 100     |
| Typography alignment     | 76 / 100     |
| Layout system            | 70 / 100     |
| **Performance**          | **96 / 100** |

---

# 3. Performance audit

## Main observations

The site is already extremely optimized.

Key observations:

- Main CSS ≈ **11 KiB**
- Only **two render‑blocking resources**
- LCP element is **text**, not image
- Network chain extremely small
- TTFB ≈ **40 ms**

Source: Lighthouse capture reconstruction. fileciteturn0file0

### Critical request chain

```
HTML
 ├ style.fa69e0047a.css
 └ scripts/anti-flash.js
```

Blocking cost:

≈ **440 ms**

Source: Lighthouse report reconstruction. fileciteturn0file0

---

## LCP analysis

Largest Contentful Paint element:

```html
<p class="hero-lead">
  A personal blog by Phiphi – software, culture, and everyday life from Chengdu.
</p>
```

Breakdown:

| metric       | duration |
| ------------ | -------- |
| TTFB         | ~40 ms   |
| render delay | ~90 ms   |

Source: Lighthouse reconstruction. fileciteturn0file0

Conclusion:

Text-based LCP dramatically reduces rendering complexity.

---

## Performance improvements (minor)

### Inline anti-flash script

Recommended because it avoids a blocking external request.

Example:

```html
<script>
  (() => {
    const theme = localStorage.getItem("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  })();
</script>
```

Source: performance audit reconstruction. fileciteturn0file0

---

### Defer non‑critical scripts

Recommended for:

```
theme-toggle.js
language-preference.js
disclosure-controls.js
pagefind-lazy-init.js
link-prefetch-intent.js
sw-register.js
```

Example:

```html
<script src="/scripts/theme-toggle.js" defer></script>
```

Source: Lighthouse audit reconstruction. fileciteturn0file0

---

### CSS critical path

CSS size:

≈ **11 KiB**

Inlining critical CSS would provide only marginal gains.

Source: performance audit reconstruction. fileciteturn0file0

---

# 4. Carbon Design System governance audit

Carbon design system documentation is the source of truth:

- https://carbondesignsystem.com
- https://carbondesignsystem.com/components/ui-shell-header/usage/
- https://carbondesignsystem.com/components/side-nav/usage/
- https://carbondesignsystem.com/guidelines/spacing/overview/
- https://carbondesignsystem.com/guidelines/typography/overview/
- https://carbondesignsystem.com/guidelines/layout/overview/
- https://carbondesignsystem.com/guidelines/accessibility/overview/

These documents define the expected component structure and design tokens.

---

## Governance strengths

Evidence of real design-system thinking:

- token naming inspired by Carbon spacing tokens\
  Carbon guideline: https://carbondesignsystem.com/guidelines/spacing/overview/

- IBM Plex typography usage\
  Carbon typography guideline:\
  https://carbondesignsystem.com/guidelines/typography/overview/

- shell architecture inspired by Carbon UI shell\
  Carbon UI shell reference:\
  https://carbondesignsystem.com/components/ui-shell-header/usage/

- semantic color tokens aligned with Carbon color roles\
  https://carbondesignsystem.com/guidelines/color/overview/

---

## Governance weaknesses

### Carbon class names used for custom components

Examples:

```
bx--header
bx--side-nav
bx--breadcrumb
bx--tag
```

However the CSS does not fully replicate the Carbon component anatomy defined
in:

https://carbondesignsystem.com/components/

This creates a **false equivalence risk**.

---

### Mixed token vocabulary

Tokens combine:

Carbon-like:

```
--cds-spacing-*
--cds-background
--cds-layer
```

Custom:

```
--space-m
--measure
--text-base
```

Carbon token architecture guidance:

https://carbondesignsystem.com/guidelines/tokens/overview/

---

# 5. UI shell audit

Reference documentation:

https://carbondesignsystem.com/components/ui-shell-header/usage/

Expected features:

- global header
- side navigation
- header actions
- panels
- overlay behavior

---

## Strengths

The shell includes:

- fixed header
- side navigation
- overlay
- language selector
- search panel
- theme toggle

These align conceptually with the Carbon application shell.

---

## Deviations

### Panels incorrectly marked as modal

Panels contain:

```
aria-modal="true"
```

But they are not implemented as dialogs.

Carbon accessibility guidance:

https://carbondesignsystem.com/guidelines/accessibility/overview/

Dialog requirements include:

- `role="dialog"`
- focus trapping
- labelled dialog

---

### Header panel structure differs

Carbon header panels follow specific anatomy documented here:

https://carbondesignsystem.com/components/ui-shell-header/usage/

Current implementation uses generic div panels.

---

# 6. Component audit

## Header

Reference:

https://carbondesignsystem.com/components/ui-shell-header/usage/

Strengths:

- consistent action buttons
- `aria-expanded` used correctly
- `aria-controls` used

Issues:

- icon rotation on menu toggle is not a Carbon pattern
- header actions trigger custom panels

---

## Side navigation

Reference:

https://carbondesignsystem.com/components/side-nav/usage/

Strengths:

- hidden by default
- overlay behavior exists
- active link uses `aria-current="page"`

Issues:

- no focus trap
- scroll not locked when open

---

## Breadcrumb

Reference:

https://carbondesignsystem.com/components/breadcrumb/usage/

Issues observed:

- inconsistent separator model
- CSS pseudo separators and HTML separators both used

---

## Tags

Reference:

https://carbondesignsystem.com/components/tag/usage/

Issues:

```
cursor: pointer
```

applied to non-interactive tags.

Carbon tags are interactive only when used as filters or dismissible controls.

---

# 7. Typography audit

Reference:

https://carbondesignsystem.com/guidelines/typography/overview/

Strengths:

- IBM Plex loaded locally
- heading hierarchy respected
- readable measure

Issues:

- hybrid typography tokens
- editorial rather than Carbon productive type scale

---

# 8. Layout system

Reference:

https://carbondesignsystem.com/guidelines/layout/overview/

Strengths:

- constrained content width
- clear visual rhythm

Issues:

- grid system not clearly implemented
- layouts custom rather than Carbon grid‑driven

---

# 9. Accessibility audit

Reference:

https://carbondesignsystem.com/guidelines/accessibility/overview/

Positive:

- skip link present
- `aria-current`
- focus-visible styles

Issues:

### incorrect modal semantics

`aria-modal=true` without dialog semantics.

### missing focus trap

Open surfaces allow tab escape.

### 404 page missing heading

No `<h1>` element.

---

# 10. Interaction behavior

Interaction scripts:

```
disclosure-controls
theme-toggle
pagefind-lazy-init
archive-year-nav
```

Strengths:

- modular scripts
- Escape closes disclosures
- outside click handling

Issues:

- mixed state model (`hidden`, `expanded`, `aria-expanded`)
- no scroll locking
- overly broad selector for disclosure controls

---

# 11. Page analysis

## Homepage

Strong editorial hierarchy.

Carbon influence limited to shell.

---

## Archive

Strong information architecture.

Breadcrumb implementation inconsistent.

---

## Post page

Readable editorial layout.

Tags appear interactive when not always actionable.

---

## About page

Simple content page.

Carbon influence minimal.

---

## Offline page

Acceptable fallback.

Could use Carbon empty state pattern.

Reference:

https://carbondesignsystem.com/components/empty-states/usage/

---

## 404 page

Major issue:

missing `h1`.

---

# 12. Identified issues

## Critical

- incorrect modal semantics
- missing focus trap
- missing 404 heading

## Important

- breadcrumb inconsistency
- pointer cursor misuse
- no scroll locking
- fragile interaction state model

## Minor

- token duplication
- hybrid layout system

---

# 13. Remediation roadmap

## Critical fixes

1. Correct dialog semantics
2. Add focus trapping
3. Add `h1` to 404
4. label search dialog

---

## Important improvements

5. unify token architecture
6. normalize breadcrumb markup
7. add scroll locking

---

## Nice improvements

8. formalize design-system documentation
9. define component contracts
10. add visual regression tests

---

# 14. Tasks for AI coding agents

Target agents:

- Claude Code
- Codex
- Cursor
- GitHub Copilot

---

## Shell accessibility refactor

Files likely involved:

```
Header.tsx
base.tsx
disclosure-controls.ts
```

Tasks:

- normalize dialog semantics
- add focus trap
- unify state model

---

## Token system cleanup

Audit all tokens:

```
--space-*
--text-*
--measure
```

Align them with:

https://carbondesignsystem.com/guidelines/tokens/overview/

---

## Component documentation

Update:

```
AGENTS.md
CLAUDE.md
ARCHITECTURE.md
```

Clarify:

- which components are Carbon-compliant
- which are custom

---

# Final conclusion

The project demonstrates:

- **excellent performance**
- **strong design discipline**
- **solid Carbon inspiration**

However it **cannot be certified as a strict Carbon v11 implementation**.

The accurate description is:

> A custom lightweight design system strongly inspired by IBM Carbon Design
> System v11.

Performance, however, is **near optimal for a static site architecture**.
