import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  applyMultilanguageDataAliases,
  decodePageContent,
  normalizeJsonFeedDocument,
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


describe("normalizeJsonFeedDocument", () => {
  it("upgrades feeds to JSON Feed 1.1 with language and ISO dates", () => {
    const input = JSON.stringify({
      version: "https://jsonfeed.org/version/1",
      title: "normco.re",
      items: [{
        id: "https://normco.re/posts/demo/",
        date_published: "Tue, 10 Mar 2026 00:00:00 GMT",
      }],
    });

    const output = JSON.parse(
      normalizeJsonFeedDocument(input, "/zh-hans/feed.json"),
    ) as Record<string, unknown>;

    assertEquals(output.version, "https://jsonfeed.org/version/1.1");
    assertEquals(output.language, "zh-Hans");

    const items = output.items as Array<Record<string, unknown>>;
    assertEquals(items[0]?.date_published, "2026-03-10T00:00:00.000Z");
  });
});
