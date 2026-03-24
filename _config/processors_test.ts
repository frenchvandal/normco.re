import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  applyMultilanguageDataAliases,
  assignMissingPostId,
  decodePageContent,
  getPostIdScopeKey,
} from "./processors.ts";

describe("decodePageContent", () => {
  it("returns string inputs unchanged", () => {
    assertEquals(
      decodePageContent('<?xml version="1.0"?><feed />'),
      '<?xml version="1.0"?><feed />',
    );
  });

  it("decodes Uint8Array inputs as UTF-8 text", () => {
    const bytes = new TextEncoder().encode('<?xml version="1.0"?><feed />');

    assertEquals(
      decodePageContent(bytes),
      '<?xml version="1.0"?><feed />',
    );
  });

  it("decodes typed array views without stringifying the backing buffer", () => {
    const bytes = new TextEncoder().encode("prefix<?xml?><feed />suffix");
    const view = new DataView(bytes.buffer, 6, 15);

    assertEquals(decodePageContent(view), "<?xml?><feed />");
  });
});

describe("applyMultilanguageDataAliases", () => {
  it("copies camelCase multilingual exports to their hyphenated keys", () => {
    const pageData: Record<string, unknown> = {
      zhHans: { title: "简体" },
      zhHant: { title: "繁體" },
    };

    applyMultilanguageDataAliases(pageData);

    assertEquals(pageData["zh-hans"], { title: "简体" });
    assertEquals(pageData["zh-hant"], { title: "繁體" });
  });

  it("does not overwrite existing hyphenated values", () => {
    const pageData: Record<string, unknown> = {
      zhHans: { title: "ignored" },
      "zh-hans": { title: "kept" },
    };

    applyMultilanguageDataAliases(pageData);

    assertEquals(pageData["zh-hans"], { title: "kept" });
  });

  it("ignores non-record page data values", () => {
    applyMultilanguageDataAliases(null);
    applyMultilanguageDataAliases("not-an-object");
    applyMultilanguageDataAliases(42);

    assertEquals(true, true);
  });
});

describe("getPostIdScopeKey", () => {
  it("returns the shared post directory for localized sources", () => {
    assertEquals(
      getPostIdScopeKey("/src/posts/example-post/en.md"),
      "/src/posts/example-post",
    );
  });

  it("normalizes Windows separators before extracting the scope", () => {
    assertEquals(
      getPostIdScopeKey("C:\\repo\\src\\posts\\example-post\\fr.md"),
      "C:/repo/src/posts/example-post",
    );
  });

  it("returns undefined for paths without a post slug segment", () => {
    assertEquals(getPostIdScopeKey("/src/posts/en.md"), undefined);
    assertEquals(getPostIdScopeKey("(generated)"), undefined);
  });
});

describe("assignMissingPostId", () => {
  it("generates one id per post source directory and reuses it across locales", () => {
    const generatedIdsByScope = new Map<string, string>();
    const englishPageData: Record<string, unknown> = { type: "post" };
    const frenchPageData: Record<string, unknown> = { type: "post" };
    let calls = 0;

    assignMissingPostId(
      englishPageData,
      "/src/posts/example-post/en.md",
      generatedIdsByScope,
      () => `generated-${++calls}`,
    );
    assignMissingPostId(
      frenchPageData,
      "/src/posts/example-post/fr.md",
      generatedIdsByScope,
      () => `generated-${++calls}`,
    );

    assertEquals(englishPageData.id, "generated-1");
    assertEquals(frenchPageData.id, "generated-1");
  });

  it("reuses an explicit post id for later localized pages in the same scope", () => {
    const generatedIdsByScope = new Map<string, string>();
    const englishPageData: Record<string, unknown> = {
      type: "post",
      id: "existing-id",
    };
    const frenchPageData: Record<string, unknown> = { type: "post" };

    assignMissingPostId(
      englishPageData,
      "/src/posts/example-post/en.md",
      generatedIdsByScope,
      () => "ignored",
    );
    assignMissingPostId(
      frenchPageData,
      "/src/posts/example-post/fr.md",
      generatedIdsByScope,
      () => "generated-id",
    );

    assertEquals(frenchPageData.id, "existing-id");
  });

  it("treats blank ids as missing and ignores non-post page data", () => {
    const generatedIdsByScope = new Map<string, string>();
    const postPageData: Record<string, unknown> = {
      type: "post",
      id: "   ",
      basename: "example-post",
    };
    const otherPageData: Record<string, unknown> = { type: "page" };

    assignMissingPostId(
      postPageData,
      undefined,
      generatedIdsByScope,
      () => "generated-id",
    );
    assignMissingPostId(
      otherPageData,
      "/src/posts/ignored/en.md",
      generatedIdsByScope,
      () => "ignored",
    );

    assertEquals(postPageData.id, "generated-id");
    assertEquals(otherPageData.id, undefined);
  });
});
