# CARBON_COMPLIANCE_REPORT_TEMPLATE

Use this template when an AI agent or reviewer audits the repository manually.

## 1. Executive summary

- Compliance score:
- Carbon posture:
  - Carbon strict
  - Carbon-aligned with deviations
  - Carbon-inspired custom system

## 2. Governance

- Content model:
  - TSX pages/layouts/components
  - Markdown post bodies in `src/posts/<slug>/{lang}.md`
- Token policy:
- Component policy:
- Documented deviations:
- Source of truth:
  - https://carbondesignsystem.com/
  - https://carbondesignsystem.com/components/
  - https://carbondesignsystem.com/guidelines/

## 3. UI shell

Reference:

- https://carbondesignsystem.com/components/ui-shell-header/usage/
- https://carbondesignsystem.com/components/side-nav/usage/

Checklist:

- header structure
- side nav
- overlay
- global actions
- search panel
- language selector
- keyboard behavior
- focus return
- scroll lock

## 4. Components

- Header
- Side nav
- Breadcrumb
  - https://carbondesignsystem.com/components/breadcrumb/usage/
- Tag
  - https://carbondesignsystem.com/components/tag/usage/
- Search
  - https://carbondesignsystem.com/components/search/usage/
- Empty states
  - https://carbondesignsystem.com/components/empty-states/usage/

For each component record:

- Carbon equivalent
- Structural compliance
- Accessibility
- Token usage
- State behavior
- Deviations

## 5. Tokens

Reference:

- https://carbondesignsystem.com/guidelines/tokens/overview/
- https://carbondesignsystem.com/elements/spacing/overview/
- https://carbondesignsystem.com/elements/color/overview/

Audit:

- raw colors
- raw spacing
- theme model
- semantic token layer
- editorial token layer

## 6. Typography

Reference:

- https://carbondesignsystem.com/elements/typography/overview/

Audit:

- IBM Plex usage
- productive vs expressive choices
- heading hierarchy
- body rhythm
- code typography

## 7. Layout

Reference:

- https://carbondesignsystem.com/elements/2x-grid/overview/
- https://carbondesignsystem.com/elements/2x-grid/overview/

Audit:

- page width
- grid behavior
- spacing rhythm
- responsive patterns

## 8. Accessibility

Reference:

- https://carbondesignsystem.com/guidelines/accessibility/overview/

Audit:

- skip link
- landmarks
- aria-expanded / aria-controls
- aria-current
- dialogs
- focus trap
- focus-visible
- heading outline

## 9. Performance

Audit:

- blocking CSS
- blocking JS
- theme flash mitigation
- defer strategy
- LCP element
- CSS size
- script count

## 10. Findings

### Critical

### Important

### Minor

## 11. Roadmap

### Phase 1

### Phase 2

### Phase 3

## 12. AI implementation tasks

- files to modify
- exact refactors
- testing steps
- validation steps
