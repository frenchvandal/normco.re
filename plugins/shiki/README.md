# Shiki plugin

Internal workspace version of the Shiki plugin for Lume, kept in this repository
until it is extracted into a dedicated repo.

## Internal usage

```ts
import shiki from "../plugins/shiki/mod.ts";

site.use(
  shiki({
    highlighter: {
      langs: ["bash", "ts", "yaml"],
    },
    render: {
      defaultColor: false,
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
  }),
);
```

## Intended public API

- `highlighter`: options passed to `createHighlighter()`
- `render`: options passed to `highlighter.codeToHtml()`
- `cssSelector`: selector used to find code blocks to transform
- `resolveLanguage`: custom language extraction from the DOM
- `extensions`: Lume extensions to process
- `concurrency`: rendering parallelism
- `onError`: `warn` or `ignore`

## Future extraction

When the dedicated repo is ready to be published, the intended path is to move
the contents of this directory to the root of the new repository and expose
`mod.ts` through jsDelivr with a URL like:

```ts
import shiki from "https://cdn.jsdelivr.net/gh/<owner>/<repo>@v0.1.0/mod.ts";
```

## CSS note

The plugin does not ship theme CSS. The stylesheet
[src/styles/components/_shiki.scss](/Users/normcore/Code/normco.re/src/styles/components/_shiki.scss)
is intentionally site-specific.
