import { assert, assertEquals, assertStringIncludes } from "jsr/assert";
import baseLayoutSource from "../_includes/layouts/base.tsx" with {
  type: "text",
};
import feedStylesheetSource from "../feed.xsl" with { type: "text" };
import sitemapStylesheetSource from "../sitemap.xsl" with { type: "text" };
import { describe, it } from "jsr/testing-bdd";

import { THEME_BOOTSTRAP_SCRIPT } from "./theme-bootstrap.ts";

function extractFirstInlineScript(source: string): string {
  const match = source.match(/<script>([\s\S]*?)<\/script>/u);
  assert(match !== null);
  return match[1] ?? "";
}

describe("theme bootstrap script", () => {
  it("keeps the layout wired to the shared bootstrap constant", () => {
    assertStringIncludes(baseLayoutSource, "THEME_BOOTSTRAP_SCRIPT");
  });

  it("keeps feed.xsl synchronized with the shared bootstrap source", () => {
    assertEquals(
      extractFirstInlineScript(feedStylesheetSource),
      THEME_BOOTSTRAP_SCRIPT,
    );
  });

  it("keeps sitemap.xsl synchronized with the shared bootstrap source", () => {
    assertEquals(
      extractFirstInlineScript(sitemapStylesheetSource),
      THEME_BOOTSTRAP_SCRIPT,
    );
  });
});
