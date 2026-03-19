import { assert, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import feedStylesheetSource from "../feed.xsl" with { type: "text" };
import sitemapStylesheetSource from "../sitemap.xsl" with { type: "text" };

import { HEADER_IDS, HEADER_LANGUAGE_OPTIONS } from "./header-language-menu.ts";

function assertLanguageMenuContract(source: string): void {
  assertStringIncludes(source, `id="${HEADER_IDS.languagePanel}"`);
  assertStringIncludes(source, 'data-language-panel=""');
  assertStringIncludes(source, 'data-language-menu=""');

  let previousOptionIndex = -1;

  for (const option of HEADER_LANGUAGE_OPTIONS) {
    const optionIndex = source.indexOf(
      `data-language-option="${option.language}"`,
    );
    assert(
      optionIndex > previousOptionIndex,
      `Expected ${option.language} to appear in canonical language-menu order`,
    );
    previousOptionIndex = optionIndex;

    assertStringIncludes(source, `data-language-option="${option.language}"`);
    assertStringIncludes(source, `hreflang="${option.tag}"`);
    assertStringIncludes(source, `lang="${option.tag}"`);
    assertStringIncludes(
      source,
      `<span class="cds--header__language-label">${option.label}</span>`,
    );
  }
}

describe("header language menu contract", () => {
  it("keeps feed.xsl aligned with the shared language menu data", () => {
    assertLanguageMenuContract(feedStylesheetSource);
  });

  it("keeps sitemap.xsl aligned with the shared language menu data", () => {
    assertLanguageMenuContract(sitemapStylesheetSource);
  });
});
