# Lume issue draft: Sass plugin cannot resolve transitive npm package Sass imports in clean Deno environments

Hi,

I ran into what looks like a Sass resolution issue when using Lume with Deno npm
packages in a clean environment such as GitHub Actions.

## Environment

- Lume 3.2.1
- Deno 2.7.5
- Dart Sass via `lume/plugins/sass.ts`
- GitHub Actions runner: macOS
- Sass dependency: `@carbon/styles`

## Lume Sass configuration

```ts
import sass from "lume/plugins/sass.ts";

site.use(
  sass({
    options: {
      loadPaths: ["node_modules"],
    },
  }),
);
```

## Sass entrypoint

My stylesheet imports Carbon Sass modules like this:

```scss
@use "@carbon/styles/scss/config" with (
  $prefix: "cds",
  $css--font-face: false,
  $css--body: false,
  $css--reset: false,
  $css--default-type: false,
);
```

## Failure in clean environments

In a clean checkout, the build fails with:

```text
Error: Can't find stylesheet to import.
   ╷
82 │ ┌ @forward '@carbon/grid/scss/config' hide $prefix,
83 │ │   $flex-grid-columns with (
84 │ │     $prefix: $prefix,
85 │ │     $flex-grid-columns: $flex-grid-columns
86 │ │   );
   │ └───^
   ╵
  @carbon/styles/scss/_config.scss 82:1
  src/styles/carbon/_config.scss 6:1
  src/styles/carbon/_theme-tokens.scss 12:1
  src/style.scss 12:1
```

## What seems to be happening

- `@carbon/styles` is resolvable from top-level `node_modules`
- but its transitive Sass dependency `@carbon/grid` is not always materialized
  by Deno in a location that Dart Sass can resolve from
  `loadPaths: ["node_modules"]`
- in local development this can be masked if the workspace has already
  materialized more npm symlinks
- in CI or other fresh environments, it fails consistently

## Current workaround

I was able to work around this by forcing Deno to materialize the Carbon package
graph before the Sass plugin runs, by importing the relevant npm `package.json`
files from TypeScript. After that, `loadPaths: ["node_modules"]` works again.

That workaround fixes the build, but it feels brittle and tied to Deno npm
internals rather than something Lume users should rely on.

## Questions

1. Is this a known limitation of the Lume Sass plugin with Deno npm packages?
2. Is there a recommended way for Lume to resolve transitive npm Sass imports in
   Deno projects?
3. Would it make sense for the Sass plugin to support a Deno-aware npm
   resolution mode, or at least document a canonical workaround?

If helpful, I can provide a minimal reproduction repository.

Thanks.
