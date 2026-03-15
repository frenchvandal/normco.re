# AGENTS.md

This repository contains a static site using:

Deno + Lume + TSX layouts/pages + Markdown posts + Carbon Sass.

Content model:

- site pages, layouts, and UI components stay in TSX
- blog posts live in `src/posts/<slug>/`
- shared post metadata lives in `src/posts/<slug>/_data.yml`
- per-language post bodies live in `src/posts/<slug>/{en,fr,zh-hans,zh-hant}.md`

The UI follows the **Carbon Design System v11** using `@carbon/styles` Sass
modules as the single source of truth for tokens. Prefix: `cds--` (classes),
`--cds-` (CSS custom properties).

Before modifying UI code, agents must read:

docs/tokens/CARBON_TOKEN_MAP.json\
docs/migration/CARBON_GUIDELINE_INDEX.md

Carbon documentation is the authoritative reference:

https://carbondesignsystem.com\
https://carbondesignsystem.com/components/\
https://carbondesignsystem.com/guidelines/

---

# Development rules

## Tokens

Do not introduce raw values.

Forbidden examples

color:#000\
margin:17px

Use Carbon tokens via `var(--cds-*)` custom properties or
`@use '@carbon/styles/scss/*'` Sass modules.

Token source of truth: `src/styles/carbon/_theme-tokens.scss`

Reference

https://carbondesignsystem.com/guidelines/tokens/overview/

---

## Accessibility

All interactive components must implement:

aria-expanded\
aria-controls\
aria-current

Dialogs must include:

role="dialog"\
aria-labelledby\
focus trap

Reference

https://carbondesignsystem.com/guidelines/accessibility/overview/

---

# Automated scanning

Use the Carbon scanner.

Run:

deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .

It generates:

CARBON_COMPLIANCE_REPORT.md

---

# Component references

Header\
https://carbondesignsystem.com/components/ui-shell-header/usage/

Side navigation\
https://carbondesignsystem.com/components/side-nav/usage/

Breadcrumb\
https://carbondesignsystem.com/components/breadcrumb/usage/

Tag\
https://carbondesignsystem.com/components/tag/usage/

Search\
https://carbondesignsystem.com/components/search/usage/
