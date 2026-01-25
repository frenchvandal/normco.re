# CLAUDE.md — Guidelines (TypeScript, CSS, UX/UI, Architecture, Deno, Lume)

## Project context

- Personal blog maintained by Phiphi (FR), based in Chengdu, China.
- Documentation and comments are in English by default unless explicitly stated
  otherwise.
- Project URLs:
  - Production: https://normco.re
  - GitHub: https://github.com/frenchvandal/normco.re

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
- **Clarity > magic**: avoid opaque helpers unless necessary.
- **Immutability by default**: prefer `const` and pure functions.
- **No `any`** unless explicitly justified in context (comment + reason).
- **Domain-first**: model business data with explicit types/interfaces.
- **DOM-first JavaScript**: prioritize the DOM API for any JavaScript work.

### Types & structure

- Use `interface` for public/stable object shapes; use `type` for
  unions/composition.
- Limit deep generics; prefer simple, readable types.
- Centralize shared types if reused across modules.

### Imports

- Recommended order:
  1. Deno/Lume.
  2. External dependencies.
  3. Local modules.
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
- Before running `deno task build` or `deno task serve` commands, set
  `DENO_TLS_CA_STORE=system` in the environment.
- Keep code compliant with `deno fmt` then `deno lint`; if Deno is not installed
  on the environment, install it if technically possible for Claude.
- If `deno lint` reports errors, fix them when technically possible.
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

## Notes for Claude

- Prioritize simplicity, maintainability, and reasonable DRY.
- Always account for accessibility.
- Avoid JSX/Preact and non-approved templating engines.
- Stay concise and aligned with the site’s minimalist identity.
- Respond in French by default for discussions; keep code, code comments, commit
  titles, commit descriptions, merge request titles, merge request comments in
  English.
- Follow the Conventional Commits specification.
- Use Deno + Lume only, as configured in this repository.
- Run `deno fmt` and `deno lint` before finalizing changes.
- Run `deno task build` when changes affect rendering or structure.
- After running `deno task build`, capture a browser screenshot of at least the
  home page and, if possible, the component impacted by the code change to
  provide a visual preview.
- Do not introduce JSX, Preact, React, Nunjucks, Vento, or other templating
  engines.
- Do not add new dependencies unless explicitly requested.
- Do not introduce Markdown content pages unless explicitly requested.
- Do not modify generated artifacts or build outputs.
- Do not over-engineer solutions.
