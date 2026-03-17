import { assertEquals, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  getLocalizedAuthorHCard,
  getLocalizedHFeedUrl,
  MF2_HTML_CONTENT_TYPE,
  renderHiddenHCard,
  renderHiddenUrl,
} from "./microformats.ts";

describe("microformats.ts", () => {
  it("resolves the localized canonical h-feed URL", () => {
    assertEquals(getLocalizedHFeedUrl("en"), "/posts/");
    assertEquals(getLocalizedHFeedUrl("fr"), "/fr/posts/");
  });

  it("resolves a localized author h-card pointing to the about page", () => {
    assertEquals(getLocalizedAuthorHCard("zhHans", "Phiphi"), {
      name: "Phiphi",
      url: "/zh-hans/about/",
    });
  });

  it("renders hidden discovery fragments for URLs and authors", () => {
    assertEquals(MF2_HTML_CONTENT_TYPE, "text/mf2+html");
    assertStringIncludes(renderHiddenUrl("/posts/"), 'class="u-url sr-only"');
    assertStringIncludes(
      renderHiddenHCard({ name: "Phiphi", url: "/about/" }),
      'class="p-author h-card sr-only"',
    );
  });
});
