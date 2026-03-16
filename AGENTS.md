# AGENTS.md

This repository contains a static site built with Deno, Lume, TSX layouts and
pages, Markdown posts, and Carbon Sass.

## Content Model

- Pages, layouts, and shared UI components remain in TSX.
- Blog posts live in `src/posts/<slug>/`.
- Shared post metadata lives in `src/posts/<slug>/_data.yml`.
- Localized post bodies live in `src/posts/<slug>/{en,fr,zh-hans,zh-hant}.md`.

## Design-System Guidance

The UI is built on Carbon Design System v11 through the official Carbon npm
packages, especially `@carbon/styles`.

- Official Carbon documentation is the primary reference.
- The installed Carbon npm packages are the implementation reference.
- `src/styles/carbon/_theme-tokens.scss` is the local bridge that exposes the
  Carbon-backed custom properties used by this site.
- No exported Figma token file or historical migration document should be
  treated as authoritative.

Primary references:

- https://carbondesignsystem.com/
- https://carbondesignsystem.com/components/
- https://carbondesignsystem.com/guidelines/
- https://carbondesignsystem.com/guidelines/tokens/overview/
- https://carbondesignsystem.com/guidelines/accessibility/overview/

Before modifying UI code, review the existing implementation and consult the
relevant Carbon documentation for the pattern you are touching.

## Development Rules

### Tokens

Do not introduce new hard-coded UI values when a Carbon token already exists.

Avoid examples such as:

- `color: #000`
- `margin: 17px`

Prefer:

- `var(--cds-*)` custom properties already exposed by the theme layer
- Carbon Sass modules imported from `@carbon/styles/scss/*`

If a needed Carbon token is not yet exposed locally, add it intentionally in
`src/styles/carbon/_theme-tokens.scss` rather than inventing a parallel local
token source.

### Accessibility

Interactive controls should preserve clear, valid semantics.

- Disclosure controls should use `aria-expanded` and `aria-controls`.
- Navigation should use `aria-current` where appropriate.
- Dialog-like surfaces should use `role="dialog"`, an accessible label, and a
  focus trap when the interaction is truly modal.
- Visible focus states are required.
- Important dynamic feedback should be announced through an explicit live region
  when needed.

## Recommended Validation

For a meaningful change, run:

```sh
deno task check
deno task test
deno task build
```

Run `deno task validate-contracts` when your changes affect feeds or generated
JSON outputs.

## Component References

- Header: https://carbondesignsystem.com/components/ui-shell-header/usage/
- Side navigation: https://carbondesignsystem.com/components/side-nav/usage/
- Breadcrumb: https://carbondesignsystem.com/components/breadcrumb/usage/
- Tag: https://carbondesignsystem.com/components/tag/usage/
- Search: https://carbondesignsystem.com/components/search/usage/
