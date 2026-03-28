import { assert, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { HEADER_IDS, HEADER_LANGUAGE_OPTIONS } from "./header-language-menu.ts";
import {
  renderFeedStylesheet,
  renderSitemapStylesheet,
} from "./xsl-stylesheets.ts";

const feedStylesheetSource = renderFeedStylesheet();
const sitemapStylesheetSource = renderSitemapStylesheet();

function assertLanguageMenuContract(source: string): void {
  assert(!source.includes("__HEADER_LANGUAGE_PANEL_ID__"));
  assert(!source.includes("<!--__HEADER_LANGUAGE_MENU_PANEL__-->"));
  assert(!source.includes("__SUPPORTED_LANGUAGES__"));
  assert(!source.includes("data-carbon-icon"));
  assertStringIncludes(source, `id="${HEADER_IDS.languagePanel}"`);
  assertStringIncludes(source, 'data-language-panel=""');
  assertStringIncludes(source, 'data-language-menu=""');
  assertStringIncludes(source, 'data-icon="three-bars"');
  assertStringIncludes(source, 'data-icon="search"');
  assertStringIncludes(source, 'data-icon="translation"');
  assertStringIncludes(source, 'data-icon="sun"');
  assertStringIncludes(source, 'data-icon="moon"');
  assertStringIncludes(source, 'data-icon="device-desktop"');
  assertStringIncludes(source, 'data-icon="github"');

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
