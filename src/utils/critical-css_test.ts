import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { CRITICAL_CSS } from "./critical-css.ts";

// Hard ceiling on the inline payload. The bundle is shipped on every HTML
// document, so it has to stay tight. The current measured size is well
// under this budget; bumping the limit deserves an explicit conversation.
const CRITICAL_CSS_BUDGET_BYTES = 14_000;

describe("critical CSS bundle", () => {
  it("declares the same layer order as src/style.css", () => {
    // The cascade order has to match `style.css` so that the deferred
    // stylesheet lands in the right named layers when it eventually
    // resolves. The declaration must come first, before any layer body.
    assert(
      CRITICAL_CSS.startsWith("@layer tokens,reset,base,layout,utilities;"),
      `expected layer declaration at offset 0, got: ${
        CRITICAL_CSS.slice(0, 60)
      }`,
    );
  });

  it("inlines the --ph-font-measure token Pretext relies on", () => {
    // `usePretextTextStyle` reads `--ph-font-measure` from computed style
    // before the first Canvas measurement. If the token is not present in
    // the inlined critical bundle, Pretext caches measurements taken
    // against the wrong fallback font on the first paint.
    assert(
      CRITICAL_CSS.includes("--ph-font-measure"),
      "expected --ph-font-measure to be present in the inlined token layer",
    );
  });

  it("inlines the skip-link layout so keyboard users get a visible target", () => {
    // The skip link is the first focusable element in `<body>`. It must
    // be styled before the deferred stylesheet swaps in, otherwise it
    // flashes as plain text in the top-left corner during page load.
    assert(CRITICAL_CSS.includes(".skip-link"));
    assert(CRITICAL_CSS.includes(".site-wrapper"));
    assert(CRITICAL_CSS.includes(".site-main"));
  });

  it("stays under the inline payload budget", () => {
    const sizeBytes = new TextEncoder().encode(CRITICAL_CSS).byteLength;
    assert(
      sizeBytes <= CRITICAL_CSS_BUDGET_BYTES,
      `critical CSS bundle is ${sizeBytes} bytes, budget is ${CRITICAL_CSS_BUDGET_BYTES}`,
    );
  });

  it("strips block comments and collapses whitespace", () => {
    assertEquals(CRITICAL_CSS.includes("/*"), false);
    assertEquals(CRITICAL_CSS.includes("\n"), false);
    assertEquals(CRITICAL_CSS.includes("  "), false);
  });
});
