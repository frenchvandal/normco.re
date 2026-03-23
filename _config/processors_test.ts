import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  applyMultilanguageDataAliases,
  decodePageContent,
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
