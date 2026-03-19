import { assertEquals, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { scanStyleSources } from "./design-token-guard.ts";

describe("scanStyleSources()", () => {
  it("accepts bridge and allowlisted syntax-highlighting literals", () => {
    const issues = scanStyleSources([
      {
        filePath: "src/styles/carbon/_theme-tokens.scss",
        source:
          "--site-link-underline-thickness: max(1px, 0.08em);\n--site-search-field-size: 2.25rem;\n--site-inline-copy-control-size: 2.375rem;\n--site-tag-blue-bg: oklch(50% 0.1 240 / 20%);",
      },
      {
        filePath: "src/styles/components/_prism.scss",
        source: "color: light-dark(oklch(50% 0.01 240), oklch(55% 0.01 240));",
      },
    ]);

    assertEquals(issues.length, 0);
  });

  it("flags legacy underline literals in component styles", () => {
    const issues = scanStyleSources([
      {
        filePath: "src/styles/components/_hero.scss",
        source:
          "text-decoration-thickness: max(1px, 0.08em);\ntext-underline-offset: 0.15em;",
      },
    ]);

    assertEquals(issues.length, 2);
    assertEquals(issues[0]?.rule, "legacy-link-underline-literals");
  });

  it("flags color literals outside the theme bridge allowlist", () => {
    const issues = scanStyleSources([
      {
        filePath: "src/styles/components/_tag.scss",
        source: "background-color: oklch(55.65% 0.243 262 / 10%);",
      },
    ]);

    assertEquals(issues.length, 1);
    assertEquals(issues[0]?.rule, "oklch-outside-allowlist");
    assertStringIncludes(issues[0]?.message ?? "", "theme bridge");
  });
});
