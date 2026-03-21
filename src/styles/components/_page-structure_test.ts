import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import pageStructureStyles from "./_page-structure.scss" with { type: "text" };

describe("_page-structure.scss", () => {
  it("keeps the shared pagehead eyebrow on the editorial text-and-rule pattern", () => {
    assertStringIncludes(pageStructureStyles, ".pagehead {");
    assertStringIncludes(pageStructureStyles, "display: grid;");
    assertStringIncludes(pageStructureStyles, ".pagehead-eyebrow::after");
    assertStringIncludes(
      pageStructureStyles,
      "inline-size: clamp(2rem, 8vw, 3.5rem);",
    );
    assertStringIncludes(pageStructureStyles, "text-wrap: pretty;");
  });

  it("gives rail cards and empty states a shared editorial surface treatment", () => {
    assertStringIncludes(
      pageStructureStyles,
      ":where(.feature-rail) .feature-card",
    );
    assertStringIncludes(
      pageStructureStyles,
      "@include editorial.accent-rail;",
    );
    assertStringIncludes(pageStructureStyles, ".blankslate {");
    assertStringIncludes(pageStructureStyles, "display: grid;");
    assertStringIncludes(
      pageStructureStyles,
      "border: 1px dashed var(--cds-border-subtle);",
    );
  });
});
