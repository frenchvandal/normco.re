import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { resolvePageSetup } from "./page-setup.ts";

describe("resolvePageSetup()", () => {
  it("returns a complete localized page setup for known languages", () => {
    assertEquals(resolvePageSetup("fr"), {
      language: "fr",
      languageDataCode: "fr",
      languageTag: "fr",
      translations: resolvePageSetup("fr").translations,
      homeUrl: "/fr/",
      archiveUrl: "/fr/posts/",
      tagsUrl: "/fr/tags/",
      aboutUrl: "/fr/about/",
      syndicationPageUrl: "/fr/syndication/",
    });
  });

  it("falls back to English when the input language is unknown", () => {
    assertEquals(resolvePageSetup("de"), {
      language: "en",
      languageDataCode: "en",
      languageTag: "en",
      translations: resolvePageSetup("en").translations,
      homeUrl: "/",
      archiveUrl: "/posts/",
      tagsUrl: "/tags/",
      aboutUrl: "/about/",
      syndicationPageUrl: "/syndication/",
    });
  });
});
