# CLAUDE.md

> Source of truth for all AI agent work on this repository. Code, comments,
> commits, and PR/MR titles: **English**. Discussions and explanations:
> **French** (unless instructed otherwise).

---

## 1. Environment setup

- **Runtime:** Deno (version pinned in `.tool-versions`). Install it before any
  Deno command if it is not already present.
- **TLS note:** if you encounter TLS or certificate errors (corporate proxy,
  custom CA, etc.), set `DENO_TLS_CA_STORE=system` before the Deno CLI command.
  On most personal setups this is not required.
- **SSG:** Lume. Prefer official plugins over custom code
  (<https://lume.land/plugins/?status=all>).
- **References:** Lume docs (<https://lume.land/>), Deno docs
  (<https://docs.deno.com/runtime/>).

- **OpenTelemetry (local):** keep the `plugins/otel.ts` plugin enabled, and
  activate telemetry only via environment variables. Use
  `OTEL_EXPORTER_OTLP_PROTOCOL=http/json` for local development to inspect
  structured records directly in the terminal (`console.table` + JSON). Console
  verbosity for local diagnostics must use Lume's native `LUME_LOGS` entry point
  (`debug`, `info`, `warning`, `error`, `critical`) through
  `plugins/console_debug.ts`; do not introduce feature-specific debug env vars.

---

## 2. Mandatory workflow

Before finalizing a change (opening a PR or merging), run the following commands
**in order**:

1. `deno fmt`
1. `deno lint` — fix reported errors when technically possible.
1. `deno task check` — type-check the entire project; fix all type errors.
1. `deno task lint:doc` — lint JSDoc comments; fix reported errors when
   technically possible.
1. `deno test` — tests **should pass** before merge. Known flaky or pre-existing
   failures may be treated as non-blocking, but must be documented in the PR
   description (current status and proposed fix).
1. `deno task build` — run when changes affect rendering or structure.

### Commit message validation

Validate every commit message against the Conventional Commits specification
before pushing:

```sh
DENO_TLS_CA_STORE=system deno task lint-commit
```

The script reads `.git/COMMIT_EDITMSG` by default. Pass an explicit path as the
first argument to validate an arbitrary file.

### Screenshots

- **For changes that affect rendering (HTML, CSS, layouts, components):**
  - Before starting work, run `deno task serve`, capture the home page (and the
    affected component or page if applicable) as a baseline.
  - After building, capture the same views for a visual diff.
  - Attach all captures to the pull request.
- For purely internal or tooling-only changes (scripts, tests, data with no
  visual impact), screenshots are optional but welcome if they help
  documentation.

### Dependency and lock file rules

- Commit `deno.lock` **only** when `deno.json` dependencies change in the same
  commit; run `deno task update-deps` before staging the lock file.
- Do not add new dependencies unless explicitly requested.
- During experimentation, you may install additional dependencies locally. Only
  commit them — along with the updated `deno.lock` — when they are part of an
  intentional design decision and documented in the PR.

---

## 3. Do / Don’t quick reference

### Do

- Follow this file as the single source of truth.
- Write fluent, natural English that respects the Chicago Manual of Style.
- Follow the Conventional Commits specification for commit messages.
- Include JSDoc comments with testable code examples (documentation tests).

### Don’t

- **For AI agents:** never create new documentation files (`*.md`) or READMEs
  unless explicitly requested, and do not modify or delete existing
  documentation files without explicit instruction. Human contributors are free
  to evolve documentation as needed, following the project's tone and structure.
- Always prefer ESM + TypeScript for everything: pages, layouts, data files, and
  components. Another engine (Vento, Nunjucks, JSX, etc.) may be used only as a
  fallback when ESM + TypeScript cannot achieve the goal (e.g., a plugin that
  requires a specific template engine). Document the reason in a code comment.
- Do not use Markdown (`.md`) for new content. All new posts and pages must be
  TypeScript (`*.page.ts`).
- Do not modify generated artifacts or build outputs.
- Do not over-engineer solutions.

If a command cannot be run, state which command would be needed and why.

---

## 4. Project context

- Personal, minimalist blog maintained by Phiphi (FR), based in Chengdu, China.
- Production: <https://normco.re>
- GitHub: <https://github.com/frenchvandal/normco.re>

### Stack summary

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Runtime    | Deno (version in `.tool-versions`)                                |
| SSG        | Lume (official plugins only)                                      |
| Templating | ESM + TypeScript (all pages, layouts, data, components)           |
| Styling    | Modern CSS (SCSS only when native CSS cannot achieve the goal)    |
| Content    | TypeScript (`*.page.ts`) for all posts and pages                  |
| Fallback   | Other template engines only when ESM+TS is technically impossible |

---

## 5. TypeScript & JavaScript best practices

> Conventions drawn from the Google TypeScript Style Guide, typescript-eslint
> recommended/strict configs, Matt Pocock’s Total TypeScript, Airbnb JavaScript
> Style Guide, and modern Deno/ESM ecosystem practices.

### 5.1. Compiler strictness

Deno enables `strict: true` by default. Add these “beyond strict” flags in
`deno.json` `compilerOptions` for maximum safety:

- **`noUncheckedIndexedAccess`** — adds `| undefined` to every indexed access,
  catching an entire category of runtime crashes at compile time.
- **`exactOptionalPropertyTypes`** — distinguishes “property missing” from
  “property set to `undefined`”.
- **`verbatimModuleSyntax`** — forces `import type` for type-only imports,
  ensuring clean erasable output.
- **`noFallthroughCasesInSwitch`**, **`noImplicitOverride`**,
  **`noImplicitReturns`** — catch common logic errors.

### 5.2. Core principles

- **Zero `any`** — use `unknown` plus custom type guards. If unavoidable,
  suppress with `deno-lint-ignore no-explicit-any` and a justification comment.
  Use `@ts-expect-error` (never `@ts-ignore`) — it fails if the suppressed line
  has no error, catching stale suppressions.
- **Immutability by default** — `readonly` properties, `ReadonlyArray<T>`,
  `as const` for static objects.
- **No non-null assertions (`!`)** — handle `null`/`undefined` explicitly with
  early returns or fallback values.
- **Clarity over magic** — meta-programming (including `Proxy`) is discouraged.
  Be explicit, even when it means more code.
- **Prefer TypeScript** — all new code should be `.ts`.
- **ESM only** — no CommonJS, no `require()`. Use `import`/`export` everywhere.
- **Use `globalThis` for web globals** — in browser/client scripts, prefer
  `globalThis.document`, `globalThis.localStorage`, `globalThis.matchMedia`,
  etc., over implicit globals.

### 5.3. Modern TypeScript patterns

#### `as const satisfies Type`

The gold standard for module-level configuration objects and lookup tables.
Combines compile-time validation, literal type inference, and deep immutability:

```ts
const ROUTES = {
  home: "/",
  about: "/about",
  blog: "/blog",
} as const satisfies Record<string, string>;
```

#### When to use each typing approach

| Pattern                   | Use when                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| `: Type` annotation       | Function params, return types, variables where you want the broad type       |
| `satisfies Type`          | You need validation AND narrow inference (config, lookup tables)             |
| `as const`                | Value should never change; narrow to literal types                           |
| `as const satisfies Type` | **Default for module-level config objects** — immutable + validated + narrow |
| `as Type` assertion       | Last resort only — DOM casting, loosely-typed library boundaries             |

#### Discriminated unions

Use a literal `kind` or `type` field as the discriminant to model variant data
instead of optional chaining spaghetti.

#### Branded types

Use phantom `__brand` properties at zero runtime cost to distinguish
structurally identical types (`UserId` vs. `PostId`).

#### `using` keyword (explicit resource management)

For disposable resources (file handles, connections). Objects implementing
`[Symbol.dispose]()` get automatic cleanup at scope exit:

```ts
using file = openFile("template.vto"); // auto-disposed at scope exit
```

#### Native collection methods

Prefer the native `Map` and `WeakMap` methods from the TC39 `upsert` proposal
(`getOrInsert`, `getOrInsertComputed`) over manual check-then-set idioms that
require non-null assertions or redundant `has` + `get` pairs:

```ts
// Avoid:
if (!map.has(key)) map.set(key, computeDefault());
const value = map.get(key)!;

// Prefer — single atomic operation, no non-null assertion needed:
const value = map.getOrInsert(key, defaultValue);

// Prefer — lazy default for expensive computations:
const value = map.getOrInsertComputed(key, () => computeDefault());
```

Both methods are available on `Map` and `WeakMap`.

### 5.4. Patterns to avoid

| Deprecated pattern          | Replacement                            | Rationale                                                                                                                                |
| --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `enum`                      | `as const` object + derived union type | Non-erasable syntax; `erasableSyntaxOnly` blocks it. Strongly discouraged — use only in exceptional cases with a comment explaining why. |
| `namespace`                 | ES modules (`import`/`export`)         | Non-erasable; replaced by module system                                                                                                  |
| `any`                       | `unknown` + narrowing                  | Disables type checking entirely                                                                                                          |
| `@ts-ignore`                | `@ts-expect-error`                     | Catches stale suppressions                                                                                                               |
| Default exports             | Named exports (Lume exception: see §9) | Better IDE support, auto-import, discoverability                                                                                         |
| `interface IFoo` (I-prefix) | `interface Foo`                        | Hungarian notation — universally discouraged                                                                                             |
| `deps.ts` (Deno v1 pattern) | Import maps in `deno.json`             | Superseded by import maps standard                                                                                                       |
| Barrel files (`index.ts`)   | Direct imports                         | Breaks tree-shaking, causes circular deps, slows builds                                                                                  |

The `as const` object pattern that replaces enums:

```ts
const HttpStatus = { Ok: 200, NotFound: 404, ServerError: 500 } as const;
type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus]; // 200 | 404 | 500
```

### 5.5. Domain modeling

- Use `interface` for structural contracts (page data, component props). Use
  `type` for unions, intersections, and discriminated unions. Be consistent
  within the project — `type` is generally more versatile for a Lume project.
- No `I-` prefix on interfaces.
- Export all interfaces used as parameters or return types of exported members.

### 5.6. Architecture

- **Functional core, imperative shell:** keep business logic (data transforms,
  formatting, sorting) as pure functions without side effects.
- **Separation of concerns:** `*.page.ts` and `_component.ts` files contain
  rendering logic only; extract complex data manipulation into pure utility
  functions.
- **Composition over inheritance:** build complex HTML by composing smaller,
  pure template functions.
- **Prefer `#` private fields over the `private` keyword** — `#` fields are
  private at runtime, not just at compile time. Use `protected` sparingly.

### 5.7. Functions and API design

- **Prefer `function` for top-level functions**, and reserve arrow functions for
  closures and inline callbacks. **Exception (and requirement) for Lume render
  files:** pages (`*.page.ts`), layouts, and components use `export default`
  with an arrow function as the render entry point — this is a hard framework
  requirement, not a style choice (see §9 for examples).
- **1–2 params → positional; 3+ → destructured options object.** Multiple
  boolean params always use an options object regardless of count.
- **Prefer union types over function overloads** unless the return type changes
  based on input.
- Use `Readonly<T>` and `ReadonlyArray<T>` for function parameters to enforce
  immutability at the type level.

### 5.8. Error handling

- Do not use generic `try/catch` that swallows errors or types them as `any`.
- Type caught errors (`if (error instanceof Error)`).
- Prefer returning discriminated union result types from internal functions:

```ts
type ParseResult =
  | { ok: true; data: Config }
  | { ok: false; error: { kind: string; message: string } };
```

- Reserve `try/catch` for application boundaries and third-party code.
- **Error message style** (for user-facing errors): sentence case, no trailing
  period, no contractions, active voice, colon for additional context. Example:
  `"Cannot parse config: unexpected token at line 42"`

### 5.9. JSDoc

- **Every exported symbol** should have a JSDoc comment, except trivial cases
  where the intent is completely obvious from the name and type (very small
  helpers, simple types). When in doubt, prefer documenting.
- Use **single-line JSDoc** when possible:
  `/** Formats a date as ISO string. */`
- Use **markdown** in JSDoc for rich text; **HTML tags are forbidden**.
- Use back-ticks for code literals.
- **`@param`** only for parameters whose intent is non-obvious — omit the type
  (TypeScript already provides it).
- **Code examples** in JSDoc use markdown fenced blocks, contain no extra
  comments, and are not indented. Deno runs them as documentation tests
  (`deno test --doc`). It is acceptable to mark examples as `ignore` when they
  would be too heavy or difficult to stabilize (e.g., network or time-dependent
  examples).

### 5.10. Imports and dependencies

Order: (1) Deno / Lume → (2) external dependencies → (3) local modules. Separate
groups with a blank line. Use `import type` for type-only imports (enforced by
`verbatimModuleSyntax`).

All external imports must be aliased in the `imports` field of `deno.json`
(never `import_map.json`). Use `jsr:` for Deno packages, `npm:` for Node
packages, `node:` for Node built-ins. Naming convention for aliases:

- JSR: `"jsr/cases": "jsr:@luca/cases@^1.0.0"`
- npm: `"npm/cowsay": "npm:cowsay@^1.6.0"`

**Minimize dependencies; never introduce circular imports.** Avoid barrel files
in application code — prefer direct imports. A `mod.ts` that exposes a narrow
public API for a self-contained module is acceptable; a `mod.ts` that
indiscriminately re-exports everything is not (see §8). Extract shared types
into dedicated `types.ts` files to break potential cycles.

### 5.11. TODO and FIXME comments

Always include an issue number or author handle:

```ts
// TODO(phiphi): Add pagination support.
// TODO(#42): Handle edge case for empty tags.
// FIXME(#17): Breaks when date is undefined.
```

---

## 6. CSS best practices

> Design paradigm: **Refined Minimalism / Swiss Design.** Focus on typography,
> whitespace, and content readability. No superfluous borders, shadows, or
> background noise.

### 6.1. Modern CSS first, SCSS as fallback, CSS-in-JS prohibited

Native CSS now covers nesting, custom properties, `oklch()` color functions,
`@layer` cascade layers, `:has()`, container queries, and `@scope`. Use SCSS
only for features that still require a preprocessor (maps, loops, complex
mixins). When SCSS is used, organize partials clearly (`_*.scss`) and prefer
runtime CSS custom properties over SCSS variables.

**CSS-in-JS is prohibited.** Libraries such as Emotion, styled-components, or
any runtime style injection add significant performance overhead (forced style
recalculations, hydration costs, bloated JS bundles) and are incompatible with
the site's zero-JavaScript philosophy.

**Component style encapsulation via `@scope`:** use the native `@scope` at-rule
to restrict styles to a component's subtree without resorting to verbose
BEM-style class chains or CSS Modules. The `to (…)` donut scope limits
inheritance leakage to inner components:

```css
@scope (.card) to (.card *[data-scope]) {
  h2 {
    font-size: 1.25rem;
  }
  p {
    color: var(--color-text-muted);
  }
}
```

This eliminates specificity conflicts at zero runtime cost and keeps selectors
short and readable.

### 6.2. Design tokens via custom properties (W3C DTCG 2025.10)

Define all colors, typography scales, and spacing at `:root` as CSS custom
properties following the **W3C Design Token Community Group (DTCG) 2025.10**
naming standard. Use a strict three-level hierarchical convention:
`category-property-modifier`.

| Level    | Purpose                                 | Example                  |
| -------- | --------------------------------------- | ------------------------ |
| Category | Token domain (`color`, `space`, `font`) | `color`                  |
| Property | Semantic role (`background`, `text`)    | `color-background`       |
| Modifier | State or variant (`default`, `hover`)   | `color-background-hover` |

Use `oklch()` for all color tokens — perceptually uniform, wide-gamut, and
trivially adjustable for lightness, chroma, and hue in a single edit:

```css
:root {
  /* Colors — W3C DTCG category-property-modifier naming */
  --color-background-default: oklch(97% 0.005 264);
  --color-background-hover: oklch(93% 0.008 264);
  --color-text-default: oklch(15% 0.010 264);
  --color-text-muted: oklch(45% 0.010 264);
  --color-accent-default: oklch(55% 0.130 264);
  --color-accent-hover: oklch(50% 0.130 264);
  --color-border-default: oklch(80% 0.005 264);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-s: 0.5rem;
  --space-m: 1rem;
  --space-l: 2rem;
  --space-xl: 4rem;

  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background-default: oklch(15% 0.010 264);
    --color-text-default: oklch(92% 0.005 264);
    --color-text-muted: oklch(60% 0.010 264);
    --color-border-default: oklch(30% 0.005 264);
  }
}
```

- **Light mode:** off-white background, near-black text, subtle gray for
  metadata.
- **Dark mode:** deep charcoal background, soft off-white text.
- **Accent:** a single muted, elegant color for interactive states.
- Declare `color-scheme: light dark;` on `:root` to inform the browser. Use
  `light-dark()` for concise inline theme switching when appropriate.

### 6.3. Typography

- **System fonts only** — no external web fonts. Use
  `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
- **Fluid typography** with `clamp()`:
  `font-size: clamp(1rem, 0.8rem + 1vw, 1.25rem);`
- **Hierarchy** through font weight (`600`–`700` for headings, `400` for body),
  fluid size, and letter-spacing — not through different font families.
- **Text wrapping:** `text-wrap: balance;` for headings (prevents orphans),
  `text-wrap: pretty;` for body paragraphs.
- **Reading measure:** strict max-width in `ch` units (`65ch`–`70ch`) for
  optimal reading ergonomics.
- **Line height:** generous — `1.6` to `1.8` for body text.

### 6.4. Layout

- **CSS Grid** for macro-layouts (e.g., centering content:
  `grid-template-columns: 1fr min(65ch, 100%) 1fr;`).
- **Flexbox** for micro-layouts (navigation, inline elements).
- **CSS subgrid** when child elements must align to a parent grid.
- **Container queries** (`@container`) for component-level responsive design
  when appropriate.
- **Scroll-state container queries** (`container-type: scroll-state`) — replace
  JavaScript scroll event listeners for scroll-position-dependent styling (e.g.,
  sticky header elevation, back-to-top button visibility). Zero JS overhead, no
  layout thrashing:

  ```css
  .site-header {
    container-type: scroll-state;
    container-name: site-header;
  }

  @container site-header scroll-state(stuck: top) {
    .site-header__inner {
      box-shadow: 0 1px 4px oklch(0% 0 0 / 10%);
    }
  }
  ```

- **Logical properties** (`inline-start`/`block-end` instead of `left`/`bottom`)
  for future internationalization readiness.

### 6.5. Spacing

Base-4 or Base-8 `rem` scaling system. Generous margins and padding to let
content breathe. Define spacing tokens as custom properties (`--space-xs`,
`--space-s`, `--space-m`, `--space-l`, `--space-xl`).

### 6.6. Interactions and animations

- **View Transitions API** (`@view-transition { navigation: auto; }`) for
  seamless page-to-page transitions.
- Animate only `transform` and `opacity` — never layout properties (`width`,
  `height`, `top`, `left`).
- Use `@starting-style` for entry animations when appropriate.
- Scroll-driven animations via `animation-timeline: scroll()` for subtle
  scroll-linked effects.
- `will-change` only when measurably needed — never as a blanket optimization.

### 6.7. Accessibility

- **`:focus-visible`** on all interactive elements — custom, clear, elegant
  (e.g., offset outline matching the accent color).
- **`prefers-reduced-motion: reduce`** — disable or simplify all animations and
  transitions.
- **`prefers-contrast: more`** — increase contrast ratios when requested.
- **`prefers-color-scheme`** — support light and dark modes.
- **`forced-colors`** media query — ensure usability in Windows High Contrast
  mode.
- **WCAG 2.2 AA** minimum for color contrast. Use APCA (Accessible Perceptual
  Contrast Algorithm) when targeting WCAG 3.0 readiness.
- **`prefers-reduced-transparency`** — reduce or remove transparency effects.

### 6.8. Performance

- **Aim for zero layout shifts** — explicit dimensions on images/embeds, CLS as
  close to 0 as reasonably possible.
- **`content-visibility: auto`** on off-screen sections for rendering
  performance.
- **Critical CSS** above the fold when applicable.
- **`@property`** for typed custom properties that enable hardware-accelerated
  animations on custom properties.
- **Font loading:** `font-display: swap` (if web fonts are ever added),
  `size-adjust` for fallback font metric matching.
- Optimize for Core Web Vitals: LCP, CLS, INP.

### 6.9. Cascade management

- Use **`@layer`** to organize cascade precedence:
  `@layer reset, base, layout, components, utilities;`
- Keep selector specificity low and predictable.
- Avoid `!important` unless clearly documented.
- Use **`:where()`** to zero out specificity when needed.

### 6.10. Native form styling

Style native `<select>` elements using **`appearance: base-select`** and the
**`::picker(select)`** pseudo-element. This preserves native accessibility
semantics, works with the browser's built-in picker, and requires zero
JavaScript — never build fake selectors from `<div>` or `<ul>` elements:

```css
select {
  appearance: base-select;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding-inline: var(--space-s);
  padding-block: var(--space-xs);
  color: var(--color-text-default);
  background: var(--color-background-default);
}

::picker(select) {
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding-block: var(--space-xs);
  background: var(--color-background-default);
}
```

Custom `<div>`-based dropdowns cannot replicate native keyboard navigation,
screen reader announcements, or OS-level picker behavior. Use the native
`<select>` and style it with `appearance: base-select`.

---

## 7. UX / UI design principles

### 7.1. Core philosophy

Fewer elements, higher impact. The site’s identity is defined by typography,
whitespace, and content quality — not by decorative elements.

### 7.2. Semantic HTML

- Use `<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`,
  `<time>`, `<aside>` semantically.
- ARIA attributes only when native semantics are insufficient.
- Proper heading hierarchy (`h1`–`h6`) — one `h1` per page.
- Skip links for keyboard navigation.
- Landmark roles via semantic elements (no redundant `role` attributes on
  elements that already convey the role).

### 7.3. Visual hierarchy

- Clear differentiation between headings, body, and metadata through weight,
  size, and spacing — not color or decoration.
- WCAG-compliant contrast ratios on all text.
- Generous whitespace (negative space) as a design element.

### 7.4. Interactive states

- Visible, distinct `:hover`, `:active`, and `:focus-visible` states on all
  interactive elements.
- Smooth, fast CSS transitions for hover effects (e.g., color shift, underline
  animation expanding from the left).
- All interactive states must be accessible via keyboard.

### 7.5. Page specifications

- **Homepage (`/`):** minimalist nav, punchy hero statement (H1), 3–5 recent
  post titles (date + title + reading time, no excerpts), footer with RSS/JSON
  feed links.
- **Post list / Archive (`/posts/`):** chronological, grouped by year, clean
  flush-left list.
- **Individual post (`/posts/slug/`):** title (H1), date, reading time, body at
  `65ch`–`70ch` max-width, syntax-highlighted code blocks with “Copy” button,
  previous/next navigation.
- **About (`/about/`):** prose-heavy, optional grayscale portrait.
- **Search:** Lume `pagefind` plugin, large borderless input with auto-focus,
  instant client-side results, term highlighting.

### 7.6. Feeds

- **RSS (`/feed.xml`):** RSS 2.0 or Atom, full HTML content, author metadata,
  correct dates.
- **JSON Feed (`/feed.json`):** JSON Feed 1.1 compliant.

### 7.7. Performance as UX

- Instantaneous perceived load times.
- CLS as close to 0 as reasonably possible.
- Fully accessible keyboard navigation.
- `prefers-reduced-motion` and `prefers-color-scheme` respected everywhere.

---

## 8. Naming conventions

### Files and directories

| Kind                | Convention                  | Example                 |
| ------------------- | --------------------------- | ----------------------- |
| Component / Class   | `PascalCase.ts`             | `PostCard.ts`           |
| Utility / module    | `kebab-case.ts`             | `date-helpers.ts`       |
| Styles              | `kebab-case.css` or `.scss` | `_post-card.css`        |
| Page                | `kebab-case`                | `about.page.ts`         |
| Directory           | `kebab-case`                | `blog-posts/`           |
| Default entry point | `mod.ts`                    | `utils/mod.ts`          |
| Internal module     | `_kebab-case.ts`            | `_parse-frontmatter.ts` |

- **Never use `index.ts` / `index.js`** — Deno does not resolve them implicitly.
  Use `mod.ts` when a directory needs a default entry point.
- **Never use barrel files** (`index.ts` re-exporting everything) in application
  code — they break tree-shaking, cause circular deps, and slow builds. A
  `mod.ts` is acceptable only when it exposes a narrow, intentional public API
  for a self-contained module; it must not blindly re-export every symbol from
  every file in the directory.
- **Files prefixed with `_`** are internal: only files in the same directory
  should import them.

### Code identifiers

| Kind                                                     | Convention                 | Example         |
| -------------------------------------------------------- | -------------------------- | --------------- |
| Function / method                                        | `camelCase` (verb)         | `formatDate()`  |
| Local variable                                           | `camelCase`                | `currentPage`   |
| Module-level constant (primitive, RegExp, frozen object) | `UPPER_SNAKE_CASE`         | `MAX_PAGE_SIZE` |
| Type / Interface                                         | `PascalCase`               | `PostData`      |
| Class                                                    | `PascalCase`               | `HttpClient`    |
| Boolean                                                  | `is/has/can/should` prefix | `isVisible`     |

`UPPER_SNAKE_CASE` is reserved for truly static, module-level, immutable
primitives and frozen objects. Regular `const` bindings that happen to be
immutable use standard `camelCase`.

### Acronyms in identifiers

Acronyms follow `camelCase` / `PascalCase` rules — **do not uppercase entire
acronyms**:

- `HttpServer`, not `HTTPServer`.
- `convertUrl()`, not `convertURL()`.
- `parseHtmlFragment()`, not `parseHTMLFragment()`.

---

## 9. Lume conventions

### Content model: TypeScript everywhere

All content — posts, pages, layouts, data, and components — is authored in ESM
TypeScript. Markdown is not used for new content.

| File type     | Extension                  | Example                     |
| ------------- | -------------------------- | --------------------------- |
| Post / Page   | `*.page.ts`                | `posts/my-article.page.ts`  |
| Layout        | `*.ts` in `_includes/`     | `_includes/layouts/main.ts` |
| Data (shared) | `_data.ts` or `_data/*.ts` | `_data/site.ts`             |
| Component     | `*.ts` in `_components/`   | `_components/PostCard.ts`   |
| Config        | `_config.ts`               | `_config.ts`                |

### Page structure

A `*.page.ts` file exports named variables for metadata and a default export for
the content (string or render function):

```ts
export const title = "My Article";
export const date = new Date("2026-01-15");
export const layout = "layouts/post.ts";
export const tags = ["essay", "literature"];

export default (data: Lume.Data, helpers: Lume.Helpers) =>
  `<article>
    <h1>${data.title}</h1>
    <p>This is the article content.</p>
  </article>`;
```

### Layout structure

Layouts are TypeScript functions in `_includes/` that receive page data and
helpers:

```ts
export default ({ title, content }: Lume.Data, helpers: Lume.Helpers) =>
  `<!doctype html>
  <html lang="en">
    <head><title>${title}</title></head>
    <body><main>${content}</main></body>
  </html>`;
```

### Component rules

Components live in `_components/` and are consumed via the `comp` variable
(never via direct `import` — Deno cannot hot-reload imported modules without
restarting the process):

```ts
// _components/Button.ts
export default function ({ content }: { readonly content: string }) {
  return `<button class="btn">${content}</button>`;
}

// In a page or layout — use comp, not import:
// comp.Button({ content: "Click me" })
```

### Guidelines

- All rendering logic uses TypeScript template literals.
- Keep layouts simple and composable; extract shared HTML fragments into
  components.
- Data files (`_data.ts`) export typed constants — prefer `as const satisfies`
  for static configuration.
- Avoid unnecessary abstractions or indirection layers.

---

## 10. Testing

Tests use **Deno’s built-in test runner** (`deno test`). During local iteration,
running the full suite is optional; **before opening a PR or merging, tests are
expected to pass** (see §2).

### File placement

- **Unit tests:** alongside the code (e.g.,
  `src/_components/Component_test.ts`).
- **Integration tests and fixtures:** in `tests/` (e.g., `tests/integration/`,
  `tests/fixtures/`).

### Strategy by code type

- **Pure utilities:** BDD-style `describe`/`it`; cover edge cases and real-world
  examples.
- **Components:** BDD-style; validate structure, accessibility, variants, and
  edge cases using `tests/fixtures/dom.ts`.
- **Client-side JS:** BDD-style describing user-visible behavior; use
  “given/when/then” comments for complex flows.
- **Pages and data:** BDD-style; validate rendered output and data shape.
- **JSDoc examples:** keep them minimal, realistic, and runnable as
  documentation tests (`deno test --doc`).
- **Type-level assertions:** use `assertType` with `IsExact`, `IsNever`, etc.
  from `@std/testing/types` to verify type correctness at compile time when
  strict typing is critical.

### Writing tests

Use `Deno.test()` for standalone cases and `t.step()` for sub-steps. For
BDD-style grouping, use `describe`/`it` from `@std/testing/bdd` (preferred in
this project). Both `@std/assert` (`assertEquals`, `assertThrows`, etc.) and
`@std/expect` (`expect(x).toBe(y)`) are available.

### Native test hooks

Deno provides built-in hooks directly on `Deno.test`:

- `Deno.test.beforeAll(fn)` / `Deno.test.afterAll(fn)` — run once for the entire
  scope.
- `Deno.test.beforeEach(fn)` / `Deno.test.afterEach(fn)` — run around each test.

`beforeAll`/`beforeEach` execute in FIFO order; `afterEach`/`afterAll` execute
in LIFO order. These are in addition to the BDD hooks (`beforeAll`, `afterEach`,
etc.) from `@std/testing/bdd`, which work the same way inside `describe` blocks.

### Ignoring and focusing tests

- **Ignore:** `Deno.test.ignore("name", fn)` or `{ ignore: true }` in the test
  definition. BDD equivalent: `it.ignore()` / `describe.ignore()`.
- **Focus:** `Deno.test.only("name", fn)` or `{ only: true }`. BDD equivalent:
  `it.only()` / `describe.only()`. Using `only` will cause the overall test run
  to fail — it is intended as a temporary debugging aid only.

### Sanitizers

Deno enables three sanitizers by default. Disable them per test only when
strictly necessary:

- **`sanitizeResources`** — ensures all I/O resources (files, connections, fetch
  bodies) are closed. Disable with `sanitizeResources: false`.
- **`sanitizeOps`** — ensures all async operations are awaited. Disable with
  `sanitizeOps: false`.
- **`sanitizeExit`** — prevents `Deno.exit()` from signaling false success.
  Disable with `sanitizeExit: false`.

### Test permissions

Tests can restrict (but not grant) permissions via the `permissions` property:

```ts
Deno.test({
  name: "fallback without read access",
  permissions: { read: false },
  fn() {
    // test fallback behavior
  },
});
```

Permissions must still be provided on the command line (`--allow-read`, etc.).

### Mocking, spying, stubbing, and faking time

Use `@std/testing/mock` for spies and stubs, and `@std/testing/time` for
`FakeTime`.

#### Spies

Spies track calls without changing behavior. Two forms:

- **Function spy:** `const mySpy = spy(fn)` — wraps a standalone function.
- **Method spy:** `using mySpy = spy(obj, "method")` — wraps a method on an
  object; supports `restore()` and the `using` keyword for auto-cleanup.

#### Stubs

Stubs replace a method’s implementation entirely:

```ts
using myStub = stub(obj, "method", returnsNext([val1, val2]));
```

Stub helpers from `@std/testing/mock`:

- `returnsNext(values)` — returns values sequentially; errors in the array are
  thrown.
- `resolvesNext(values)` — same as `returnsNext` but returns `Promise`s.
- `returnsArg(index)` — returns the argument at the given index.
- `returnsArgs(start?, end?)` — returns a slice of the arguments.
- `returnsThis()` — returns `this`.

Common stubbing patterns:

- **Environment variables:**
  `using envStub = stub(Deno.env, "get", (k) => k === "KEY" ? "value" : undefined);`
- **Fetch:**
  `using fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(...)));`

#### FakeTime

Replaces `Date`, `setTimeout`, `setInterval` with controllable versions:

```ts
using time = new FakeTime(startDate?);
time.tick(ms);       // advance by ms, fire due timers
time.next();         // advance to the next scheduled timer
time.runAll();       // advance until no pending timers remain
time.tickAsync(ms);  // like tick, but runs pending microtasks first
time.runAllAsync();  // like runAll, but runs microtasks between timers
```

Options: `advanceRate` (auto-tick relative to real time) and `advanceFrequency`
(update interval in ms when `advanceRate` is set).

#### Auto-restore with `using`

The `using` keyword auto-restores spies, stubs, and `FakeTime` when they go out
of scope — **always prefer it** over manual `try/finally` + `restore()`.

#### Mock sessions

For tests with many mocks, `mockSession()` and `restore(id?)` from
`@std/testing/mock` let you batch-restore all mocks registered in a session.
`mockSessionAsync(fn)` wraps an async callback.

#### Assertion helpers

- `assertSpyCall(spy, callIndex, expected?)` — assert details of a specific
  call.
- `assertSpyCalls(spy, count)` — assert total call count.
- `assertSpyCallAsync(spy, callIndex, expected?)` — same for async spies.
- `assertSpyCallArg(spy, callIndex, argIndex, expected)` — assert a single
  argument.
- `assertSpyCallArgs(spy, callIndex, start?, end?, expected)` — assert a range
  of arguments.

### Snapshot testing

- Use `assertSnapshot` from `@std/testing/snapshot` for HTML output to reduce
  brittle assertions.
- Use `assertInlineSnapshot` from `@std/testing/unstable-snapshot` for small,
  self-contained snapshots that live directly in the test file.
- Use `createAssertSnapshot({ dir, serializer, ... })` to define project-wide
  snapshot defaults (custom output directory, custom serializer, etc.).
- Keep snapshots focused, deterministic (fixed dates, IDs, ordering), and stored
  in `__snapshots__/` alongside tests.
- Update:
  `DENO_TLS_CA_STORE=system deno test --allow-read --allow-write -- --update`
  (short flag: `-u`). For inline snapshots, add `--no-format` to skip
  auto-formatting.
- Verify: `DENO_TLS_CA_STORE=system deno test --allow-read`

### Test style conventions

- **Explicit test names:** test names should read as a sentence describing the
  expected behavior, e.g., `"formatDate() returns ISO string for valid input"`.
- All general TypeScript conventions from §5 (function style, API design, JSDoc,
  error handling, naming) apply equally to test code.

### Documentation tests

Deno extracts and runs code blocks from JSDoc comments (`deno test --doc`).
Exported items from the documented module are **automatically imported** into
the generated test — you do not need to re-import them in the example.

Supported language identifiers: `js`, `javascript`, `mjs`, `cjs`, `jsx`, `ts`,
`typescript`, `mts`, `cts`, `tsx`. Add the `ignore` attribute to skip a block
(e.g., ````ts ignore`).

````ts
/**
 * Adds two numbers together.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns The sum of a and b.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const sum = add(1, 2);
 * assertEquals(sum, 3);
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
````

### Coverage

Generate and view coverage with:

```bash
deno test --coverage
deno coverage              # default Deno format
deno coverage --lcov --output=cov.lcov   # lcov export
deno coverage --html       # HTML report
```

Use coverage ignore comments to exclude code from reports:

- `// deno-coverage-ignore-file` at the top of a file.
- `// deno-coverage-ignore` on the line above a single line.
- `// deno-coverage-ignore-start` / `// deno-coverage-ignore-stop` around a
  block.

### Testing references

- <https://docs.deno.com/runtime/fundamentals/testing/>
- <https://docs.deno.com/runtime/reference/cli/test/>
- <https://docs.deno.com/runtime/reference/cli/coverage/>
- <https://docs.deno.com/runtime/reference/documentation/>
- <https://jsr.io/@std/assert>
- <https://jsr.io/@std/testing>
- <https://jsr.io/@std/expect>

---

## 11. Developer tooling

### 11.1. Commit linting (`deno task lint-commit`)

Validates the commit message against the Conventional Commits specification,
mirroring the rules of `@commitlint/config-conventional`.

**Script location:** `scripts/lint-commit.ts`

**Allowed types:** `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`,
`refactor`, `revert`, `style`, `test`

**Usage:**

```sh
# Validate the last commit message (default — reads .git/COMMIT_EDITMSG):
DENO_TLS_CA_STORE=system deno task lint-commit

# Validate an explicit file (e.g., from a Lefthook commit-msg hook):
DENO_TLS_CA_STORE=system deno task lint-commit .git/COMMIT_EDITMSG
```

Exit code `0` = valid; exit code `1` = one or more errors.

### 11.2. Git hooks — Lefthook (`lefthook.yml`)

Lefthook manages Git hooks and runs checks automatically on `pre-commit` and
`commit-msg` events.

**Installation via Deno (recommended):**

```sh
deno install --global --allow-all --name lefthook npm:lefthook
lefthook install
```

**Alternative installations:** Homebrew (`brew install lefthook`) or Go
(`go install github.com/evilmartians/lefthook@latest`).

**Configured hooks:**

| Hook         | Task                               | File glob               |
| ------------ | ---------------------------------- | ----------------------- |
| `pre-commit` | `deno fmt --check` (parallel)      | `*.{ts,tsx,js,jsx,...}` |
| `pre-commit` | `deno lint` (parallel)             | `*.{ts,tsx,js,jsx}`     |
| `commit-msg` | `deno task lint-commit <msg-file>` | —                       |

---

## 12. Lume API cheat sheet

> Informational reference only — does not override instructions above.

<details>
<summary>Site instantiation defaults</summary>

```js
const site = lume(
  {
    src: "./",
    dest: "./_site",
    emptyDest: true,
    includes: "_includes",
    cssFile: "/style.css",
    jsFile: "/script.js",
    fontsFolder: "/fonts",
    location: new URL("http://localhost"),
    prettyUrls: true,
    caseSensitiveUrls: true,
    server: {
      port: 3000,
      hostname: "localhost",
      open: false,
      page404: "/404.html",
      debugBar: true,
      middlewares: [],
      root: ".",
    },
    watcher: {
      ignore: ["/.git", (path) => path.endsWith("/.DS_Store")],
      debounce: 100,
      include: [],
      dependencies: {},
    },
    components: {
      cssFile: "/style.css",
      jsFile: "/script.js",
      placeholder: "",
    },
  },
  {
    url: undefined,
    json: undefined,
    markdown: undefined,
    modules: undefined,
    nunjucks: undefined,
    search: undefined,
    paginate: undefined,
    yaml: undefined,
  },
);
```

</details>

<details>
<summary>Site configuration API</summary>

```js
site.addEventListener(eventType, fn);
site.use(plugin);
site.loadData(extensions, loader);
site.loadPages(extensions, loader);
site.loadPages(extensions, options);
site.preprocess(extensions, fn);
site.process(extensions, fn);
site.filter(name, fn, async = false);
site.helper(name, fn, options);
site.data(name, value, scope = "/");
site.page(pageData, scope = "/");
site.component(context, component, scope = "/");
site.mergeKey(key, merge, scope = "/");
site.add(from, to);
site.ignore(...paths);
site.scopedUpdates(...scopes);
site.remote(filename, url);
site.remote(baseLocal, baseUrl, globOrFilenames);
```

</details>

<details>
<summary>Site utility functions</summary>

```js
site.root(...subdirs);
site.src(...subdirs);
site.dest(...subdirs);
site.dispatchEvent(event);
site.clear();
site.build();
site.update(changedFiles);
site.url(path, absolute = false);
site.getContent(file, loader);
site.getOrCreatePage(url);
```

</details>

## 13. Pre-commit checklist

Before considering a task complete, use this checklist as a target. Not every
item will apply to every change, but **all relevant items** should be satisfied
before merging.

### Scope

- [ ] Changes stay within the Deno + Lume ecosystem; no unnecessary abstractions
      were introduced.
- [ ] The result aligns with the site’s minimalist identity.

### Code quality

- [ ] TypeScript is strictly typed; no unjustified `any`; no `namespace`; `enum`
      used only with a justifying comment (§5.4).
- [ ] Functions are small, readable, and single-responsibility.
- [ ] Function signatures follow the 1–2 positional + options object rule
      (§5.7).
- [ ] Top-level functions prefer the `function` keyword over arrow syntax
      (§5.7).
- [ ] Named exports only; `export default` used only in Lume render files
      (`*.page.ts`, layouts, components) as required by the framework (§9). No
      barrel files; `mod.ts` allowed only for narrow public APIs (§8).
- [ ] JSDoc is present on all exported symbols, following §5.9 conventions.
- [ ] Imports are grouped and ordered per §5.10; `import type` for type-only; no
      circular imports.
- [ ] Error handling uses discriminated union results for internal logic,
      `try/catch` only at boundaries (§5.8).
- [ ] `deno fmt`, `deno lint`, and `deno test` pass (or failures are
      documented).
- [ ] `deno task check` passes — no type errors.
- [ ] `deno task lint:doc` passes — JSDoc comments are valid.
- [ ] `deno task build` succeeds when rendering or structure is affected.
- [ ] `deno task lint-commit` validates the commit message (Conventional
      Commits, run automatically by Lefthook `commit-msg` hook).

### Styles and accessibility

- [ ] Modern CSS first; SCSS only when native CSS is insufficient; no CSS-in-JS
      (§6.1).
- [ ] Component styles use `@scope` for encapsulation instead of BEM chains or
      CSS Modules (§6.1).
- [ ] Design tokens follow the W3C DTCG 2025.10 `category-property-modifier`
      naming convention; all colors use `oklch()` (§6.2).
- [ ] System fonts only; fluid typography with `clamp()` (§6.3).
- [ ] Scroll-position-dependent styles use `container-type: scroll-state`
      instead of JavaScript scroll event listeners (§6.4).
- [ ] Native `<select>` elements styled with `appearance: base-select` and
      `::picker(select)`; no custom `<div>`-based dropdowns (§6.10).
- [ ] `:focus-visible`, `prefers-reduced-motion`, `prefers-contrast`,
      `prefers-color-scheme`, and `forced-colors` are handled (§6.7).
- [ ] Semantic HTML with proper heading hierarchy and landmarks (§7.2).
- [ ] Zero layout shifts; Core Web Vitals optimized (§6.8).

### Deliverables

- [ ] All new content uses `*.page.ts`; no new Markdown files.
- [ ] Components use `comp` variable, not direct `import`.
- [ ] File and directory names follow the conventions in §8.
- [ ] Commit messages follow Conventional Commits.
- [ ] Screenshots (before/after) are attached to the PR.
- [ ] Code, comments, and PR content are in English.
