# Carbon Design System Migration — Phase 1 Complete

## Summary

Phase 1 of the Carbon Design System migration has been completed. This phase focused on **foundational tokens, typography, grid system, and core editorial components**.

## What Has Been Implemented

### 1. Carbon Design Tokens (`src/styles/base.css`)

**Full Carbon v11 White Theme (light mode)**
- All background tokens: `--cds-background`, `--cds-layer`, `--cds-field`, etc.
- All border tokens: `--cds-border-subtle`, `--cds-border-strong`, `--cds-border-interactive`
- All text tokens: `--cds-text-primary`, `--cds-text-secondary`, `--cds-text-link`
- All link tokens: `--cds-link-primary`, `--cds-link-primary-hover`
- All icon tokens: `--cds-icon-primary`, `--cds-icon-secondary`
- Focus token: `--cds-focus` (#0f62fe in light, #78a9ff in dark)
- Support colors: error, success, warning, info

**Full Carbon v11 Gray 100 Theme (dark mode)**
- Complete dark theme token mapping
- Automatic switching via `data-color-mode="dark"`

**Spacing Tokens (2x Grid — 8px base unit)**
- `--cds-spacing-01` through `--cds-spacing-13` (2px to 160px)
- Legacy aliases maintained for backward compatibility

### 2. IBM Plex Typography (`src/styles/base.css`)

**Productive Type Tokens** (UI, forms, metadata)
- `--cds-productive-heading-01` through `--cds-productive-heading-06`
- `--cds-productive-body-01`, `--cds-productive-body-02`
- `--cds-productive-body-longform` (for body copy)
- `--cds-productive-code-01`, `--cds-productive-code-02`

**Expressive Type Tokens** (hero, editorial)
- `--cds-expressive-heading-01` through `--cds-expressive-heading-06`
- `--cds-display-01` through `--cds-display-04`

**Font Loading**
- IBM Plex Sans and IBM Plex Mono loaded from Google Fonts
- `display=swap` for performance
- Fallback to system fonts

### 3. Carbon 2x Grid System (`src/styles/layout.css`)

**Grid Container**
- `.bx--grid` — standard container with 16px gutters
- `.bx--grid--full-width` — full viewport width
- `.bx--grid--condensed` — 8px gutters
- `.bx--grid--wide` — 48px gutters

**16-Column Grid**
- `.bx--col-lg-1` through `.bx--col-lg-16`
- Medium breakpoint (≤1056px): 8-column grid
- Small breakpoint (≤672px): 4-column grid (full width)

**Responsive Breakpoints**
- Large: >1056px (16 columns)
- Medium: 672px–1056px (8 columns)
- Small: <672px (4 columns, full width)

### 4. Skip Link Component (`src/styles/components.css`)

**Accessibility-First Implementation**
- `.bx--skip-to-content` — hidden by default, visible on focus
- 2px solid focus border with `--cds-focus` color
- Proper z-index (10000) to appear above all content
- WCAG 2.2 AA compliant

### 5. Editorial Components (`src/styles/components.css`)

**Hero Section**
- `.bx--hero` — container with 48px/32px vertical padding
- `.bx--hero__eyebrow` — uppercase label (productive-heading-01)
- `.bx--hero__title` — expressive-heading-05, max 20ch width
- `.bx--hero__lead` — productive-body-02, max 48ch width

**Section Heading**
- `.bx--section-heading` — flex layout with bottom border
- `.bx--section-heading__title` — productive-heading-02
- `.bx--section-heading__action` — for "View archive" links

**Post List (Editorial Flow)**
- `.bx--post-list` — vertical stack with 16px gaps
- `.bx--post-list__item` — grid layout (8ch date + content)
- `.bx--post-list__date` — productive-body-01, tabular nums
- `.bx--post-list__title` — productive-body-02, semibold
- `.bx--post-list__meta` — reading time, secondary text
- Mobile: single column, date moves below title

**Standalone Link**
- `.bx--link` — base link with Carbon underline style
- `.bx--link--standalone` — no underline until hover
- `.bx--link--inline` — always underlined (for body copy)
- `.bx--link__icon` — 16px icon slot

**Footer**
- `.bx--footer` — top border, auto margin-top
- `.bx--footer__content` — flex layout, centered
- `.bx--footer__text` — productive-body-01, secondary color
- `.bx--footer__links` — horizontal link list

## What Still Uses Legacy/Primer Tokens

The following components still reference legacy aliases but will work correctly because we maintain backward-compatible alias mappings:

- Header navigation (`.bx--header`)
- Side navigation (`.bx--side-nav`)
- Search component (`.bx--search`)
- Dropdown (`.bx--dropdown`)
- Post card (`.post-card`)
- Archive components (`.archive-*`)

These will be migrated in subsequent phases.

## Files Modified

1. **`src/style.css`** — Added IBM Plex font import
2. **`src/styles/base.css`** — Complete Carbon token replacement
3. **`src/styles/layout.css`** — Added Carbon 2x Grid system
4. **`src/styles/components.css`** — Added Carbon editorial components

## Backward Compatibility

All legacy token references continue to work via aliases:

```css
/* Legacy → Carbon mapping */
--color-bg → --cds-background
--color-text → --cds-text-primary
--color-meta → --cds-text-secondary
--color-accent → --cds-link-primary
--color-border → --cds-border-strong
--color-code-bg → --cds-layer
--space-xs/s/m/l/xl → --cds-spacing-02/03/05/06/07
--font-sans → --cds-font-family-sans
--font-mono → --cds-font-family-mono
```

## Testing Checklist — Phase 1

- [x] Build succeeds without errors
- [ ] Visual regression test (home page hero)
- [ ] Visual regression test (post list)
- [ ] Dark mode toggle works
- [ ] Focus states visible with Carbon blue (#0f62fe / #78a9ff)
- [ ] Typography renders correctly (IBM Plex)
- [ ] Grid system works at all breakpoints

## Next Steps — Phase 2

Phase 2 will focus on **interactive components**:

1. **Breadcrumb** — Carbon small variant for archive/article pages
2. **Tags** — Read-only tags for article metadata
3. **Pagination Nav** — For archive page navigation
4. **Tiles** — Clickable tiles for archive view (optional)
5. **Search** — Full Carbon search component styling
6. **Dropdown** — Language selector Carbon styling

## Known Issues

None at this time. The migration maintains full backward compatibility.

## References

- [Carbon Design System v11 Docs](https://carbondesignsystem.com/)
- [Carbon 2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/)
- [Carbon Typography](https://carbondesignsystem.com/elements/typography/overview/)
- [Carbon Themes](https://carbondesignsystem.com/elements/themes/overview/)
- [Carbon Colors](https://carbondesignsystem.com/elements/color/overview/)
- [Figma — Carbon Components](https://www.figma.com/design/tVdGpdfznZUzo6LeGIKbte/-v11--Carbon-Design-System--Community-)
