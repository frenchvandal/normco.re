import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import headerStyles from "./_header.scss" with { type: "text" };

describe("_header.scss", () => {
  it("keeps the search status region visible and structured inside the header panel", () => {
    assertStringIncludes(headerStyles, ".cds--header__search-status {");
    assertStringIncludes(
      headerStyles,
      "border-block-end: 1px solid var(--cds-border-subtle);",
    );
    assertStringIncludes(
      headerStyles,
      '.cds--header__search-status[data-search-status-state="results"]',
    );
  });

  it("styles search results as editorial rows instead of boxed utility items", () => {
    assertStringIncludes(headerStyles, ".pagefind-ui__drawer");
    assertStringIncludes(
      headerStyles,
      "border-block-start: 1px solid var(--cds-border-subtle);",
    );
    assertStringIncludes(headerStyles, ".pagefind-ui__result-title");
    assertStringIncludes(headerStyles, ".pagefind-ui__result:first-child");
    assertStringIncludes(
      headerStyles,
      "font: var(--cds-productive-heading-02);",
    );
  });
});
