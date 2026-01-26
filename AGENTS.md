# AGENTS.md

## Quick rules (read first)

**Do**

- Follow this file as the source of truth for all changes.
- Use Deno + Lume only, as configured in this repository.
- Write English that is fluent, natural, and respects typographic conventions.
- Run `deno fmt` first, `deno lint` second, and `deno test` third before
  finalizing changes; if Deno is not installed on the environment, install it if
  technically possible for the agent. If `deno test` fails, treat it as
  non-blocking but detail the failures in the pull request description.
- If `deno lint` reports errors, fix them when technically possible.
- Only commit `deno.lock` when the same commit explicitly updates dependencies
  in `deno.json`.
- Set `DENO_TLS_CA_STORE=system` before every Deno CLI command.
- Before running `deno task build` or `deno task serve` commands, set
  `DENO_TLS_CA_STORE=system` in the environment.
- Run `deno task build` when changes affect rendering or structure.
- After running `deno task build`, capture a browser screenshot of at least the
  home page and, if possible, the component impacted by the code change to
  provide a visual preview and present it to the user.
- At the start of a task, run `deno task serve` and capture a browser screenshot
  of the current state before making changes so there is a baseline visual
  reference.
- When modifying or creating JavaScript or TypeScript code, ensure JSDoc
  comments include testable code examples that serve as documentation tests.
- Keep code, comments, commit messages, and PR/MR titles in English.

**Don’t**

- Never proactively create documentation files (`*.md`) or README files unless
  explicitly requested by the user. If documentation files (`*.md`) or README
  files already exist, treat them as relevant and do not modify or delete them
  unless explicitly requested by the user.
- Do not introduce JSX, Preact, React, Nunjucks, Vento, or other templating
  engines.
- Do not add new dependencies unless explicitly requested.
- Do not introduce Markdown content outside the existing posts/pages conventions
  unless otherwise instructed.
- Do not modify generated artifacts or build outputs.
- Do not over-engineer solutions.

If a command cannot be run, clearly state which command would be run and why.

---

## Project context

- Personal blog maintained by Phiphi (FR), based in Chengdu, China.
- Documentation and comments are in English by default unless explicitly stated
  otherwise.
- Project URLs:
  - Production: https://normco.re
  - GitHub: https://github.com/frenchvandal/normco.re

---

## Stack & tooling

- Runtime: **Deno**.
- SSG: **Lume**.
- Templating: **ESM + TypeScript** for layouts and components (no JSX/Preact, no
  Nunjucks/Vento).
- Styling: **SCSS** (or modern CSS if appropriate).
- Content: **Markdown** for posts and static pages (`*.md`), with dynamic pages
  in `*.page.ts` when needed.
- References: Lume docs https://lume.land/ and Deno runtime docs
  https://docs.deno.com/runtime/ (use these when in doubt about Lume or Deno
  behavior).
- The currently used Deno version is defined in `.tool-versions`.
- Lume plugins list: https://lume.land/plugins/?status=all (official plugins
  only; no community plugins).
- Do not write custom code when an official Lume plugin already solves the same
  goal; prefer adding the plugin instead of reinventing the wheel.

---

## 1) TypeScript — best practices

### Principles

- **Strict type safety**: enable and follow strict options.
- **Clarity over magic**: avoid opaque helpers unless strictly necessary.
- **Immutability by default**: prefer `const` and pure functions.
- **No `any`** unless explicitly justified with a comment.
- **Domain-first modeling**: express business data with explicit types or
  interfaces.
- **DOM-first JavaScript**: prioritize the DOM API for any JavaScript work.

### Types & structure

- Use `interface` for public or stable object shapes.
- Use `type` for unions and composition.
- Avoid deep generics; prefer readable and maintainable types.
- Centralize shared types when reused across modules.

### Imports

Recommended order:

1. Deno / Lume.
2. External dependencies.
3. Local modules.

Separate groups with a blank line. Centralize all external module imports in
`deno.json` using a readable, unique, explicit alias, and use that alias in
TypeScript import statements.

#### Naming conventions for `deno.json` imports

When adding new remapped specifiers in `deno.json`:

- Use the `imports` field in `deno.json` (do **not** use `import_map.json` or
  the `importMap` field/`--import-map` option).
- Prefer short, readable specifiers that reflect the origin and avoid
  collisions.

Suggested naming options (pick one and apply consistently):

1. **Direct package name** (simplest, most common)
   - JSR: `"@luca/cases": "jsr:@luca/cases@^1.0.0"`
   - npm: `"cowsay": "npm:cowsay@^1.6.0"`
   - URL: `"oak": "https://deno.land/x/oak/mod.ts"`

2. **Registry-prefixed** (avoids collisions across registries)
   - JSR: `"jsr:@luca/cases": "jsr:@luca/cases@^1.0.0"`
   - npm: `"npm:cowsay": "npm:cowsay@^1.6.0"`
   - URL: `"url:oak": "https://deno.land/x/oak/mod.ts"`

3. **Namespace by source** (readable and explicit without protocols)
   - JSR: `"jsr/cases": "jsr:@luca/cases@^1.0.0"`
   - npm: `"npm/cowsay": "npm:cowsay@^1.6.0"`
   - URL: `"x/oak": "https://deno.land/x/oak/mod.ts"`
   - CDN: `"cdn/esmsh/react": "https://esm.sh/react@18.3.1"`

Trailing slash note (for clarity):

- In `deno.json`, you only need the non-slashed specifier (for example,
  `"@std/async": "jsr:@std/async@^1.0.0"`). Deno handles subpath resolution.
- Trailing-slash pairs are only required when using a standalone import map file
  with `--import-map` (which we do not use here).

### Functions

- Small, single-responsibility functions.
- Prefer explicit returns over hidden side effects.

### Example Lume page

```ts
export const title = "Page Title";
export const layout = "layouts/main.ts";

export default (data: Lume.Data, helpers: Lume.Helpers) =>
  `<h1>${data.title}</h1>`;
```

---

## 2) CSS / SCSS — best practices

### Architecture

- Mobile-first and responsive.
- Prefer CSS custom properties for theming.
- Keep selector specificity low and predictable.
- Avoid `!important` unless clearly documented.

### Accessibility

- Support `prefers-reduced-motion`.
- Support `prefers-contrast: more` or `high` when feasible.
- Always include `:focus-visible` for keyboard navigation.

### Performance

- Prefer Flexbox and Grid.
- Avoid animations on `width`, `height`, `top`, `left`.
- Prefer `transform` and `opacity`.
- Keep rules simple to minimize reflows.

### SCSS

- Organize partials (`_*.scss`) clearly.
- Avoid overusing SCSS variables; prefer runtime CSS variables.

---

## 3) UX / UI design

- **Readability**: adequate font sizes and WCAG-compliant contrast.
- **Visual hierarchy**: clear headings and spacing.
- **Consistency**: reusable components and patterns.
- **Feedback**: visible hover, active, and focus states.
- **Clarity**: fewer elements, higher impact.
- **Accessibility**: semantic HTML and ARIA when necessary.

---

## 4) Architecture principles

- Reasonable DRY without sacrificing clarity.
- KISS: keep solutions simple.
- Prefer composition over inheritance.
- One module, one primary responsibility.
- Prefer precise naming over explanatory comments.

---

## 5) Naming conventions

### Files

- Components / Classes: `PascalCase.ts`.
- Utilities / modules: `kebab-case.ts`.
- Styles: `kebab-case.scss` or `_kebab-case.scss`.
- Pages: `kebab-case.page.ts`.
- Directories: `kebab-case`.

### Code

- Functions: `camelCase`, verb-based.
- Constants: `UPPER_SNAKE_CASE`.
- Types / Interfaces: `PascalCase`.
- Booleans: prefix with `is`, `has`, `can`, `should`.

---

## 6) Deno — best practices

- Use `deno.json` for configuration and tasks.
- Prefer stable, version-pinned URL imports.
- Avoid unnecessary dependencies.
- Keep code compliant with `deno lint` and `deno fmt`.

### Common commands

```bash
deno task serve
deno task build
deno lint
deno fmt
deno test
```

### Testing reference

The repository uses **Deno's documentation tests** as the primary testing
approach. Code examples in JSDoc comments are automatically extracted and
executed as tests using `deno test --doc`.

#### Documentation tests

Deno can evaluate code snippets written in JSDoc comments. This ensures the
examples in your documentation are up-to-date and functional.

**Example:**

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

**Supported language identifiers:** `js`, `javascript`, `mjs`, `cjs`, `jsx`,
`ts`, `typescript`, `mts`, `cts`, `tsx`.

**Running documentation tests:**

```bash
deno test --doc src/  # Test all documentation in src/ directory
deno test --doc       # Test all documentation in the project
```

Running tests is not systematic and only happens on explicit user request.

Reference documentation that agents can consult when setting up tests:

- https://docs.deno.com/runtime/fundamentals/testing/#documentation-tests
- https://docs.deno.com/runtime/fundamentals/testing/
- https://docs.deno.com/runtime/reference/documentation/

---

## 7) Lume — best practices

### Conventions

- `_config.ts`: global configuration.
- `_data.ts` or `_data/*.ts`: shared data.
- `_includes/`: layouts (TypeScript functions).
- `_components/`: reusable components.
- `*.page.ts`: pages.

### Approach

- Prefer simple, composable layouts.
- Keep rendering logic close to content.
- Avoid unnecessary abstractions or templating layers.

---
## Lume cheat sheet (informational, not prescriptive)

Use this section as a time-saving reference only. It is **not** a strict
guideline and should not override the instructions above.

### Lume instantiation

These are all the available options (and their default values) when creating a
new site:

```js
const site = lume(
  {
    /** Where the site's source is stored */
    src: "./",

    /** Where the built site will go */
    dest: "./_site",

    /** Whether the destination folder (defined in `dest`) should be emptied before the build */
    emptyDest: true,

    /** The default includes path, relative to the `src` folder */
    includes: "_includes",

    /** The default css file */
    cssFile: "/style.css",

    /** The default js file */
    jsFile: "/script.js",

    /** The default folder for fonts */
    fontsFolder: "/fonts",

    /** The site location (used to generate final urls) */
    location: new URL("http://localhost"),

    /** Set true to generate pretty urls (`/about-me/`) */
    prettyUrls: true,

    /** To consider two urls the equal if the only difference is the case */
    caseSensitiveUrls: true,

    /** Local server options (when using `lume --serve`) */
    server: {
      /** The port to listen on */
      port: 3000,

      /** The hostname to listen on */
      hostname: "localhost",

      /** Open the server in a browser after starting the server */
      open: false,

      /** The file to serve when getting a 404 error */
      page404: "/404.html",

      /** Whether to use the debug bar or not */
      debugBar: true,

      /** Optional middleware for the server */
      middlewares: [],
    },

    /** Local file watcher options */
    watcher: {
      /** Paths to ignore */
      ignore: [
        "/.git",
        (path) => path.endsWith("/.DS_Store"),
      ],

      /** The interval in milliseconds to check for changes */
      debounce: 100,

      /** Extra files and folders to watch (outside the src folder) */
      include: [],
    },

    /** Component options */
    components: {
      /** The name of the file to save component css code to */
      cssFile: "/style.css",

      /** The name of the file to save component javascript code to */
      jsFile: "/script.js",

      /** Placeholder used to replace with the final content */
      placeholder: "",
    },
  },
  {
    /** Options for the url plugin, which is loaded by default */
    url: undefined,

    /** Options for the json plugin, which is loaded by default */
    json: undefined,

    /** Options for the markdown plugin, which is loaded by default */
    markdown: undefined,

    /** Options for the modules plugin, which is loaded by default */
    modules: undefined,

    /** Options for the nunjucks plugin, which is loaded by default */
    nunjucks: undefined,

    /** Options for the search plugin, which is loaded by default */
    search: undefined,

    /** Options for the paginate plugin, which is loaded by default */
    paginate: undefined,

    /** Options for the yaml plugin, which is loaded by default */
    yaml: undefined,
  },
);
```

### Lume site configuration

All available functions for configuring the site build:

```js
/** Register an event listener */
site.addEventListener(eventType, fn);

/** Register a plugin */
site.use(plugin);

/** Register a data loader */
site.loadData(extensions, loader);

/** Register a HTML page loader and other options */
site.loadPages(extensions, loader);
site.loadPages(extensions, options);

/** Register a preprocessor */
site.preprocess(extensions, fn);

/** Register a processor */
site.process(extensions, fn);

/** Register a template filter */
site.filter(name, fn, async = false);

/** Register a template helper */
site.helper(name, fn, options);

/** Register a data variable */
site.data(name, value, scope = "/");

/** Register a page */
site.page(pageData, scope = "/");

/** Register a component */
site.component(context, component, scope = "/");

/** Configure the strategy for merging a specfic key in the data cascade */
site.mergeKey(key, merge, scope = "/");

/** Add a file/folder */
site.add(from, to);

/** Ignore files or folder */
site.ignore(...paths);

/** Configure independent scopes to optimize builds when source files update */
site.scopedUpdates(...scopes);

/** Define remote files */
site.remote(filename, url);
site.remote(baseLocal, baseUrl, globOrFilenames);
```

### Lume functions

Other useful functions in the `site` instance:

```js
/** Returns the absolute path to the root directory */
site.root(...subdirs);

/** Returns the absolute path to the src directory */
site.src(...subdirs);

/** Returns the absolute path to the dest directory */
site.dest(...subdirs);

/** Dispatch an event */
site.dispatchEvent(event);

/** Clear the dest directory */
site.clear();

/** Build the site */
site.build();

/** Rebuild the site reloading the changed files */
site.update(changedFiles);

/** Returns the final URL of any page/file */
site.url(path, absolute = false);

/** Get the content of any file */
site.getContent(file, loader);
```
---

## Agent check-list (before final output)

Before considering the task complete, ensure all applicable points below are
satisfied.

### Understanding & scope

- [ ] I understand this is a **personal, minimalist blog**.
- [ ] I did not introduce abstractions or features beyond the explicit request.
- [ ] I stayed within the Deno + Lume ecosystem defined in this repository.

### Content & structure

- [ ] All new pages are implemented as `*.page.ts` files.
- [ ] No JSX, Preact, React, Nunjucks, Vento, or other templating engines were
      introduced.
- [ ] File and directory names follow the documented naming conventions.
- [ ] Rendering logic is simple and colocated with content when possible.

### TypeScript and JavaScript quality

- [ ] TypeScript is strictly typed; no `any` without justification.
- [ ] Functions are small, readable, and single-responsibility.
- [ ] Types and interfaces are explicit and domain-oriented.
- [ ] Imports are grouped and ordered as specified.
- [ ] Code must be fully documented with JSDoc best practices.

### CSS / SCSS & accessibility

- [ ] Styles are mobile-first and responsive.
- [ ] No unnecessary selector specificity or `!important`.
- [ ] Interactive elements include `:focus-visible`.
- [ ] `prefers-reduced-motion` is respected if applicable.
- [ ] Contrast and readability are preserved.

### Architecture & design intent

- [ ] KISS and reasonable DRY principles are respected.
- [ ] No over-engineering or premature generalization.
- [ ] The result aligns with the site’s minimalist identity.

### Tooling & validation

- [ ] `deno fmt` would pass.
- [ ] `deno lint` would pass.
- [ ] `deno test` would pass (if it failed, it is documented in the PR
      description).
- [ ] `deno task build` would succeed if run.
- [ ] If commands were not run, this is explicitly stated.

### Communication & output

- [ ] Code, comments, commits, and PR/MR content are in English.
- [ ] Explanations and discussions are in French unless instructed otherwise.
- [ ] Commit messages follow the Conventional Commits specification.

Only when all relevant boxes are checked should the work be considered complete.

---

## Agent behavior notes

- Prioritize simplicity, maintainability, and accessibility.
- Stay aligned with the site’s minimalist identity.
- Respond in French for discussions unless instructed otherwise.
- Use English for code, comments, commits, and PR/MR content.
- Follow the Conventional Commits specification.
