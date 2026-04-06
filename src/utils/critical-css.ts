// Critical CSS bundle inlined into every HTML document by `base.tsx`.
//
// Goal: keep `style.css` off the render-blocking path without introducing
// FOUC on the first paint, while preserving the invariants that the
// `@chenglou/pretext` integration relies on. Concretely:
//
//   1. The full token layer (`src/styles/antd/theme-tokens.css`) is inlined
//      verbatim. Pretext hooks read `--ph-font-measure` from computed style
//      to feed Canvas-based text measurements; if that token is not yet
//      resolved on the first run, the cache fills with measurements taken
//      against the wrong font and never recovers. Inlining the token layer
//      guarantees the measurement font is available before any React tree
//      mounts.
//
//   2. The reset layer is tiny and 100% above the fold, so we ship it whole.
//
//   3. A hand-curated subset of the base and layout layers covers the
//      page chrome that the editorial routes paint before `style.css`
//      resolves: html/body typography, background, the skip-link, the
//      site wrapper, the main content shell. Anything beyond that keeps
//      rendering correctly once the deferred stylesheet swaps in.
//
// The `@layer tokens, reset, base, layout, utilities;` declaration is
// repeated here so the cascade order matches the one declared at the top
// of `src/style.css`. When `style.css` finally resolves, its rules land in
// the same named layers and override the inlined ones with identical
// values, so there is no visual jump.

import THEME_TOKENS_CSS from "../styles/antd/theme-tokens.css" with {
  type: "text",
};
import RESET_CSS from "../styles/reset.css" with { type: "text" };

const LAYER_DECLARATION = "@layer tokens, reset, base, layout, utilities;";

// Hand-curated base + layout-shell slice. Only rules that the editorial
// routes need on the first paint live here. Keep this list intentionally
// short - the deferred `/style.css` carries everything else.
const BASE_AND_SHELL_CSS = `
@layer base {
  html {
    font-family: var(--ph-font-sans);
    font-size: 100%;
    line-height: var(--ph-lh-base);
    color: var(--ph-color-fg-default);
    background: linear-gradient(
      180deg,
      color-mix(
        in oklch,
        var(--ph-color-canvas-subtle) 58%,
        var(--ph-color-canvas-default)
      ) 0,
      var(--ph-color-canvas-default) 14rem
    );
    text-rendering: optimizeLegibility;
  }

  body {
    min-block-size: 100dvh;
    font-family: var(--ph-font-sans);
    font-size: var(--ph-text-base);
    line-height: var(--ph-lh-base);
    color: var(--ph-color-fg-default);
  }

  ::selection {
    background: var(--ph-color-selection-bg);
    color: var(--ph-color-fg-default);
  }
}

@layer layout {
  .skip-link {
    position: fixed;
    inset-block-start: var(--ph-space-4);
    inset-inline-start: var(--ph-space-4);
    z-index: 1000;
    transform: translateY(calc(-100% - var(--ph-space-4)));
  }

  .skip-link:focus-visible {
    transform: translateY(0);
  }

  .site-wrapper {
    min-block-size: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  .site-main {
    display: grid;
    gap: var(--ph-space-7);
    padding-block: var(--ph-space-6) var(--ph-space-8);
  }

  .site-page-shell {
    inline-size: min(100%, var(--ph-site-max));
    margin-inline: auto;
    padding-inline: var(--ph-shell-gutter);
    container-type: inline-size;
  }
}
`;

// Naive but safe minifier: strips block comments and collapses whitespace
// around CSS structural punctuation. Intentionally conservative - it leaves
// values like `1px solid currentColor` alone and never touches strings,
// because the only goal here is to shave bytes from the inline payload, not
// to compete with LightningCSS.
function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,>])\s*/g, "$1")
    .replace(/;\s*}/g, "}")
    .trim();
}

const RAW_CRITICAL_CSS = [
  LAYER_DECLARATION,
  THEME_TOKENS_CSS,
  RESET_CSS,
  BASE_AND_SHELL_CSS,
].join("\n");

export const CRITICAL_CSS: string = minifyCss(RAW_CRITICAL_CSS);
