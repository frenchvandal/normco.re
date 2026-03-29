import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  createPurgeCssOptions,
  PURGECSS_CONTENT_EXTENSIONS,
} from "./purgecss.ts";

describe("createPurgeCssOptions()", () => {
  it("loads rendered HTML, JS, XML, and XSL outputs as PurgeCSS content", () => {
    const options = createPurgeCssOptions();

    assertEquals(options.contentExtensions, [...PURGECSS_CONTENT_EXTENSIONS]);
  });

  it("safelists dynamic state selectors without pinning unrelated Ant classes", () => {
    const standardSafelist = optionsStandardSafelist(createPurgeCssOptions());

    for (
      const selector of [
        '.site-header__action[aria-expanded="true"]',
        'html[data-post-mobile-tools-ready="true"] .post-mobile-tools-trigger',
        '.site-search-notification[data-search-notification-tone="warning"]',
        '.feeds-copy-notice[data-copy-notice-state="copied"]',
        ':root[data-theme-preference="dark"]',
        ".feed-copy-control--copied .feeds-endpoint-copy-button",
        ".pagefind-ui__hidden",
        ".site-popover-container.site-popover--open",
      ]
    ) {
      assert(matchesSafelist(standardSafelist, selector), selector);
    }

    assert(matchesSafelist(standardSafelist, ".ant-card") === false);
  });

  it("returns fresh arrays so plugin mutation cannot leak across builds", () => {
    const first = createPurgeCssOptions();
    const second = createPurgeCssOptions();
    const firstStandardSafelist = optionsStandardSafelist(first);
    const secondStandardSafelist = optionsStandardSafelist(second);

    assert(first !== second);
    assert(first.contentExtensions !== second.contentExtensions);
    assert(firstStandardSafelist !== secondStandardSafelist);
  });
});

function optionsStandardSafelist(
  options: ReturnType<typeof createPurgeCssOptions>,
): ReadonlyArray<string | RegExp> {
  const safelist = options.options?.safelist;

  if (safelist === undefined || Array.isArray(safelist)) {
    return [];
  }

  return safelist.standard ?? [];
}

function matchesSafelist(
  patterns: ReadonlyArray<string | RegExp>,
  selector: string,
): boolean {
  return patterns.some((pattern) =>
    typeof pattern === "string" ? pattern === selector : pattern.test(selector)
  );
}
