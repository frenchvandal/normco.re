# UI_COMPONENT_REGISTRY.md

Project: frenchvandal.com / normco.re\
Design system posture: Carbon-aligned lightweight system\
Primary reference: https://carbondesignsystem.com/

This registry is the operational inventory of UI components used or expected in
the repository.

It is intended for:

- maintainers
- designers
- AI coding agents

For each component, this document records:

- probable source file
- Carbon equivalent
- current status
- expected rules
- remaining debt
- migration priority

---

# 1. Status legend

| Status            | Meaning                                                   |
| ----------------- | --------------------------------------------------------- |
| Carbon-aligned    | Close to Carbon guidance, with limited deviations         |
| Carbon-inspired   | Influenced by Carbon, but custom in structure or behavior |
| Custom            | No direct Carbon equivalent, or intentionally bespoke     |
| Needs remediation | Known issues block compliance or accessibility quality    |

---

# 2. Global references

Carbon component library\
https://carbondesignsystem.com/components/

Carbon guidelines\
https://carbondesignsystem.com/guidelines/

Accessibility\
https://carbondesignsystem.com/guidelines/accessibility/overview/

Tokens\
https://carbondesignsystem.com/guidelines/tokens/overview/

Layout\
https://carbondesignsystem.com/guidelines/layout/overview/

Typography\
https://carbondesignsystem.com/guidelines/typography/overview/

---

# 3. Component registry

## 3.1 Header

**Probable source files**

- `src/_components/Header.tsx`
- `src/_includes/base.tsx`

**Carbon equivalent**\
UI Shell Header\
https://carbondesignsystem.com/components/ui-shell-header/usage/

**Status**\
Carbon-aligned with deviations

**Expected contract**

- global header structure
- menu toggle
- action buttons
- active navigation state
- accessible keyboard behavior

**Known debt**

- custom action panel behavior
- menu icon rotation on toggle diverges from Carbon

**Priority**\
Critical

**Notes for AI agents**

- verify `aria-expanded`
- verify `aria-controls`
- verify active state with `aria-current="page"`
- do not assume header panels are valid dialogs unless explicitly implemented as
  such

---

## 3.2 Side navigation

**Probable source files**

- `src/_components/Header.tsx`
- `src/_includes/layouts/base.tsx`
- `src/scripts/disclosure-controls.js`

**Carbon equivalent**\
Side nav\
https://carbondesignsystem.com/components/side-nav/usage/

**Status**\
Carbon-aligned

**Expected contract**

- hidden by default
- open/close synchronization
- overlay support
- active nav state
- keyboard support
- focus trap when open
- scroll locking when open
- focus return on close

**Known debt**

- none critical remaining

**Priority**\
Critical

**Notes for AI agents**

- if treated as modal on small screens, implement proper modal behavior
- confirm focus return when closing

---

## 3.3 Search panel

**Probable source files**

- `src/_components/Header.tsx`
- `src/scripts/pagefind-lazy-init.js`
- `src/scripts/disclosure-controls.js`

**Carbon equivalent**\
Search / header search pattern\
https://carbondesignsystem.com/components/search/usage/

**Status**\
Carbon-aligned

**Expected contract**

- labeled search surface (`role="search"`)
- input focus on open
- accessible close behavior
- focus trap when open
- scroll locking when open
- focus return on close

**Known debt**

- none critical remaining

**Priority**\
Critical

**Notes for AI agents**

- either convert to proper dialog
- or downgrade to non-modal disclosure with correct semantics

---

## 3.4 Language selector

**Probable source files**

- `src/_components/Header.tsx`
- `src/scripts/disclosure-controls.js`

**Carbon equivalent**\
No exact one-to-one Carbon component\
Closest patterns:

- header panel
- switcher-like disclosure
  https://carbondesignsystem.com/components/ui-shell-header/usage/

**Status**\
Custom

**Expected contract**

- explicit current language state
- clear keyboard navigation
- appropriate disclosure semantics

**Known debt**

- role is a `region` with `aria-labelledby` — clear disclosure semantics
- `aria-haspopup` on trigger may need review

**Priority**\
Important

**Notes for AI agents**

- keep it custom if needed
- but make the accessibility model explicit and internally consistent

---

## 3.5 Theme toggle

**Probable source files**

- `src/_components/Header.tsx`
- `src/scripts/theme-toggle.ts`

**Carbon equivalent**\
No direct Carbon core component equivalent as implemented here

**Status**\
Custom

**Expected contract**

- obvious state change
- keyboard operable
- no flash of incorrect theme
- accessible label

**Known debt**

- verify persistent state handling
- verify initial theme script does not create blocking overhead beyond necessity

**Priority**\
Important

**Notes for AI agents**

- keep lightweight
- preserve strong performance characteristics

---

## 3.6 Breadcrumb

**Probable source files**

- `src/_includes/layouts/post.tsx`

**Carbon equivalent**\
Breadcrumb\
https://carbondesignsystem.com/components/breadcrumb/usage/

**Status**\
Carbon-aligned

**Expected contract**

- semantic breadcrumb navigation (`<nav>` + `<ol>`)
- clear current page item with `aria-current="page"`
- single CSS pseudo-element separator model

**Known debt**

- none critical remaining

**Priority**\
Important

**Notes for AI agents**

- normalize markup first
- then align CSS

---

## 3.7 Tag

**Probable source files**

- `src/_components/PostCard.tsx`
- post templates
- archive templates
- global styles

**Carbon equivalent**\
Tag\
https://carbondesignsystem.com/components/tag/usage/

**Status**\
Carbon-aligned

**Expected contract**

- visual label role
- only show pointer affordance if actually interactive
- consistent spacing and type treatment

**Known debt**

- `cursor:pointer` now correctly limited to interactive tags only
- all color variants migrated from hex/rgb to oklch() using Carbon palette
  values

**Priority**\
Important

**Notes for AI agents**

- split static tags and interactive tags into different styles if needed

---

## 3.8 PostCard

**Probable source files**

- `src/_components/PostCard.tsx`

**Carbon equivalent**\
No exact one-to-one Carbon component\
Closest inspirations:

- tile
- structured content grouping https://carbondesignsystem.com/components/

**Status**\
Custom editorial

**Expected contract**

- readable hierarchy
- metadata clarity
- tokenized spacing
- predictable hover/focus state if clickable

**Known debt**

- not directly mappable to a standard Carbon component
- may use custom spacing/radius conventions

**Priority**\
Important

**Notes for AI agents**

- keep custom if it supports editorial goals better
- ensure it consumes token layers correctly

---

## 3.9 Archive timeline / year navigation

**Probable source files**

- archive template
- `src/scripts/archive-year-nav.ts`

**Carbon equivalent**\
No direct Carbon equivalent

**Status**\
Custom

**Expected contract**

- current year state visible
- anchor navigation reliable
- keyboard and hash behavior stable

**Known debt**

- custom interaction logic must remain accessible
- ensure section headings and nav relationship are explicit

**Priority**\
Important

**Notes for AI agents**

- treat as custom component with Carbon spacing/type discipline

---

## 3.10 Footer

**Probable source files**

- `src/_components/Footer.tsx`

**Carbon equivalent**\
No strict Carbon equivalent

**Status**\
Custom

**Expected contract**

- semantic footer
- accessible external links
- clear label for icon-only links

**Known debt**

- verify icon-only links always have robust accessible names

**Priority**\
Minor

---

## 3.11 Article layout

**Probable source files**

- `src/_includes/post.tsx`
- `src/styles/style.css`

**Carbon equivalent**\
No direct component\
Guidelines relevant:

- typography
- layout https://carbondesignsystem.com/guidelines/typography/overview/
  https://carbondesignsystem.com/guidelines/layout/overview/

**Status**\
Carbon-inspired editorial layout

**Expected contract**

- readable measure
- proper heading outline
- tokenized rhythm
- code block consistency

**Known debt**

- typography scale may be hybrid
- layout may rely on custom editorial tokens not clearly documented

**Priority**\
Important

---

## 3.12 Hero section

**Probable source files**

- home template
- `src/styles/style.css`

**Carbon equivalent**\
No direct Carbon equivalent

**Status**\
Custom editorial

**Expected contract**

- clear page-level hierarchy
- controlled spacing
- no ad hoc typography values

**Known debt**

- may diverge from Carbon productive scale
- should be documented as editorial layer, not Carbon component

**Priority**\
Minor

---

## 3.13 Empty / offline / error states

**Probable source files**

- `src/404.page.tsx`
- `src/offline.page.tsx`

**Carbon equivalent**\
Empty states\
https://carbondesignsystem.com/components/empty-states/usage/

**Status**\
Carbon-aligned

**Expected contract**

- clear `<h1>` heading on all error pages
- clear recovery action
- accessible structure
- Carbon tokens for spacing and typography

**Known debt**

- none critical remaining

**Priority**\
Minor (resolved)

**Notes for AI agents**

- fix semantics before refining visuals

---

## 3.14 Skip link

**Probable source files**

- base layout
- header template

**Carbon equivalent**\
Accessibility pattern\
https://carbondesignsystem.com/guidelines/accessibility/overview/

**Status**\
Carbon-aligned

**Expected contract**

- visible on focus
- points to main landmark

**Known debt**

- confirm it exists in all layouts and not only selected templates

**Priority**\
Important

---

## 3.15 Overlay

**Probable source files**

- `src/_includes/layouts/base.tsx`
- `src/scripts/disclosure-controls.js`
- `src/styles/layout-carbon.css`

**Carbon equivalent**\
Shell overlay behavior\
https://carbondesignsystem.com/components/side-nav/usage/

**Status**\
Carbon-aligned

**Expected contract**

- appears consistently when side nav opens on mobile
- click outside behavior closes panels and restores focus
- scroll locking prevents background interaction

**Known debt**

- overlay used for side nav; panels use focus trap instead

**Priority**\
Minor (resolved)

---

# 4. Cross-component rules

## 4.1 Token rules

All components must use:

- Carbon base tokens
- semantic tokens
- editorial tokens only where justified

Reference\
https://carbondesignsystem.com/guidelines/tokens/overview/

## 4.2 Spacing rules

All spacing should align with Carbon spacing rhythm.

Reference\
https://carbondesignsystem.com/guidelines/spacing/overview/

## 4.3 Typography rules

Typography must follow:

- IBM Plex fonts
- productive or expressive scale
- explicit editorial deviations only

Reference\
https://carbondesignsystem.com/guidelines/typography/overview/

## 4.4 Accessibility rules

All interactive components must verify:

- `aria-expanded`
- `aria-controls`
- `aria-current`
- keyboard operability
- focus-visible states

Dialog-like surfaces must also verify:

- `role="dialog"`
- `aria-labelledby`
- focus trap
- focus return

Reference\
https://carbondesignsystem.com/guidelines/accessibility/overview/

---

# 5. Recommended file placement

Place this document here:

`docs/design-system/UI_COMPONENT_REGISTRY.md`

This location is recommended because it sits next to:

- `docs/design-system/DESIGN_SYSTEM_CONTRACT.md`
- `docs/migration/CARBON_MIGRATION_PLAN.md`

This makes it easy for AI agents to discover:

1. the design contract
2. the component inventory
3. the migration plan

---

# 6. Maintenance workflow

Update this registry when:

- a new UI component is added
- a custom component is promoted to Carbon-aligned
- accessibility status changes
- file locations move
- Carbon guideline mappings change

Suggested workflow:

1. update component code
2. update this registry
3. run `tools/carbon_repo_scanner.ts`
4. refresh audit documentation if the change is structural

---

# 7. Summary for maintainers

This file is the practical bridge between:

- Carbon documentation
- the repository implementation
- AI agent execution

It should be treated as the UI inventory of record.
