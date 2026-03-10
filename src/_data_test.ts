import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { fr, jsonLd, lang, layout, metas } from "./_data.ts";

describe("src/_data.ts", () => {
  it("exports global language and base layout", () => {
    assertEquals(lang, "en");
    assertEquals(layout, "layouts/base.tsx");
  });

  it("exports baseline WebSite structured data", () => {
    assert(jsonLd && typeof jsonLd === "object");
    const data = jsonLd as unknown as Record<string, unknown>;
    assertEquals(data["@type"], "WebSite");
    assertEquals(data.url, "/");
  });

  it("keeps metas aligned with the site identity", () => {
    assertEquals(metas.site, "normco.re");
    assertEquals(fr.metas.lang, "fr");
  });
});
