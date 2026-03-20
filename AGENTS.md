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

### Deno Utilities

When touching build scripts or repository utilities:

- Prefer Deno's built-in primitives for low-level work such as `Deno.Command`,
  `Deno.readTextFile`, `Deno.writeTextFile`, `Deno.readDir`, `Deno.stat`,
  `Deno.errors.NotFound`, and `import.meta.main`.
- Prefer Deno std helpers over ad-hoc implementations for common higher-level
  tasks such as CLI parsing, recursive filesystem traversal, HTML escaping,
  Markdown frontmatter parsing, and targeted test stubs.
- For repo-local files read by scripts, resolve from `import.meta.url` or
  `import.meta.dirname` instead of assuming the current working directory.

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

### TypeScript Tests And Faker

Use `faker` in TypeScript tests when fixture values are incidental to the
behavior under test and hand-written literals would add noise, repetition, or
accidental coupling to arbitrary values.

Recommended cases:

- Realistic but deterministic placeholder data such as names, titles, slugs,
  URLs, emails, IDs, labels, body text, numeric ranges, booleans, arrays, and
  dates.
- Fixture factories that need multiple variants of the same shape without
  repeating hard-coded strings.
- Tests that benefit from domain-shaped values from Faker modules such as
  `person`, `internet`, `location`, `company`, `lorem`, `number`, `string`,
  `helpers`, and `date`.

Prefer explicit literals instead of Faker when the exact value is the point of
the test, for example:

- Boundary conditions and regression inputs.
- Stable protocol or contract values.
- User-facing copy, localized strings, enum members, and route constants.
- Specific dates or years that are part of the assertion itself.

Required practices:

- Import Faker via the local alias: `import { faker } from "npm/faker-js";`
- Seed Faker in each test or shared test helper before generating values:
  `faker.seed(1234)`.
- Keep seeds stable and local to the file or helper so failures are
  reproducible.
- Constrain generators to the range the test actually needs instead of using
  broad random values by default.
- Do not let randomness decide which branch is under test; use explicit
  overrides for required edge cases.

Date-specific rules:

- For relative date helpers such as `faker.date.past()`, `faker.date.future()`,
  `faker.date.anytime()`, `faker.date.recent()`, and `faker.date.soon()`, also
  fix the reference date with `faker.setDefaultRefDate(...)` or pass `refDate`
  explicitly. A seed alone is not enough because these helpers otherwise depend
  on the current clock.
- When a test exposes the same date in multiple forms, derive every related
  field from one generated `Date` instance instead of making independent Faker
  calls. For example, generate one `Date`, then format its ISO string and human
  label from that value.

Reference:

- https://fakerjs.dev/api/

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
