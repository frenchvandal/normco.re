# CLAUDE.md — Guidelines (TypeScript, CSS, UX/UI, Architecture, Deno, Lume)

## Project context

- Personal blog maintained by Phiphi (FR), based in Chengdu, China.
- Documentation and comments are in English by default unless explicitly stated
  otherwise.
- Project URLs:
  - Production: https://normco.re
  - GitHub: https://github.com/frenchvandal/normco.re

## Stack & tooling

- Runtime: **Deno**
- SSG: **Lume**
- Templating: **ESM + TypeScript** (no JSX/Preact, no Nunjucks/Vento)
- Styling: **SCSS** (or modern CSS if appropriate)
- Content: **TypeScript pages** (`*.page.ts`) rather than Markdown

---

## 1) TypeScript — best practices

### Principles

- **Strict type safety**: enable and follow strict options.
- **Clarity > magic**: avoid opaque helpers unless necessary.
- **Immutability by default**: prefer `const` and pure functions.
- **No `any`** unless explicitly justified in context (comment + reason).
- **Domain-first**: model business data with explicit types/interfaces.

### Types & structure

- Use `interface` for public/stable object shapes; use `type` for
  unions/composition.
- Limit deep generics; prefer simple, readable types.
- Centralize shared types if reused across modules.

### Imports

- Recommended order:
  1. Deno/Lume
  2. External dependencies
  3. Local modules
- Separate groups with a blank line.

### Functions

- Small, single-responsibility functions.
- Prefer explicit returns over hidden side effects.

### Example Lume page (TypeScript)

```ts
export const title = "Page Title";
export const layout = "layouts/main.ts";

export default (data: Lume.Data, helpers: Lume.Helpers) =>
  `<h1>${data.title}</h1>`;
```

---

## 2) CSS/SCSS — best practices

### CSS architecture

- **Mobile-first** and responsive.
- Prefer **CSS custom properties** for theming.
- Avoid specificity wars; keep selectors predictable.
- Avoid `!important` unless documented.

### Accessibility

- Support `prefers-reduced-motion` for animations.
- Support `prefers-contrast: more / high` where feasible.
- Always include `:focus-visible` for keyboard navigation.

### Performance & modern CSS

- Prefer modern layout tools (flex/grid).
- Avoid costly animations on `width/height/top/left`; prefer `transform`.
- Minimize reflows with simple, targeted rules.

### SCSS

- Keep partials (`_*.scss`) well organized.
- Limit SCSS variables; prefer **CSS variables** at runtime.

---

## 3) UX/UI design — best practices

- **Readability**: adequate font sizes and WCAG-compliant contrast.
- **Visual hierarchy**: clear headings, consistent spacing.
- **Consistency**: reusable components and consistent styles.
- **User feedback**: visible hover/active/focus states.
- **Clarity**: fewer elements, higher impact ("less is more").
- **Accessibility**: semantic HTML structure, ARIA when needed.

---

## 4) Architecture — DRY, elegant, readable, maintainable

- **Reasonable DRY**: avoid duplication without harming clarity.
- **KISS**: keep solutions simple; avoid over-engineering.
- **Composition** over inheritance.
- **Clear responsibilities**: one module, one primary role.
- **Precise naming**: a good name beats a comment.

---

## 5) Naming — conventions

### Files

- **Components / Classes**: `PascalCase.ts` (e.g., `GlobalHeader.ts`).
- **Utilities / modules**: `kebab-case.ts` (e.g., `date-utils.ts`).
- **Styles**: `kebab-case.scss` or `_kebab-case.scss` for partials.
- **Pages**: `kebab-case.page.ts`.
- **Directories**: `kebab-case`.

### Code

- **Functions**: camelCase, verb-based (`formatDate`).
- **Constants**: UPPER_SNAKE_CASE for global values.
- **Types/Interfaces**: PascalCase.
- **Booleans**: prefix with `is`, `has`, `can`, `should`.

---

## 6) Deno — best practices

- Use `deno.json` for configuration and tasks.
- Prefer **stable, version-pinned URL imports**.
- Avoid excessive dependencies (Deno favors lean code).
- Keep code compliant with `deno lint` and `deno fmt`.
- If `deno.lock` is versioned, keep it updated to ensure reproducible builds.

### Useful commands

```bash
deno task serve  # Local dev server
deno task build  # Static build
deno lint        # Lint

deno fmt         # Format
```

---

## 7) Lume — best practices

### Conventions

- `_config.ts`: global configuration.
- `_data.ts` or `_data/*.ts`: shared data.
- `_includes/`: layouts (TS functions).
- `_components/`: reusable components (TS functions).
- `*.page.ts`: pages.

### Approach

- Prefer simple, composable layouts.
- Keep rendering logic close to content.
- Avoid unnecessary templating engines.

---

## Notes for Claude

- Prioritize simplicity, maintainability, and reasonable DRY.
- Always account for accessibility.
- Avoid JSX/Preact and non-approved templating engines.
- Stay concise and aligned with the site’s minimalist identity.
- Respond in French by default for discussions; keep code, code comments, commit
  titles, commit descriptions, merge request titles, merge request comments in
  English.
- Adhere to Conventional Commits speficiation
