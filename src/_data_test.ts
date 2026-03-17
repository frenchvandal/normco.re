import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  fr,
  jsonLd,
  lang,
  layout,
  metas,
  siteChrome,
  siteManifest,
} from "./_data.ts";

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

  it("defines shared browser chrome and manifest metadata", () => {
    assertEquals(siteChrome.faviconIcoUrl, "/favicon.ico");
    assertEquals(siteChrome.appleTouchIconLinks?.map((icon) => icon.sizes), [
      "120x120",
      "152x152",
      "167x167",
      "180x180",
    ]);
    assertEquals(siteManifest.startUrl, "/");
    assertEquals(siteManifest.id, "/");
    assertEquals(siteManifest.scope, "/");
    assertEquals(siteManifest.themeColor, siteChrome.themeColorLight);
    assertEquals(siteManifest.icons.map((icon) => icon.src), [
      "/android-chrome-192x192.png",
      "/android-chrome-512x512.png",
    ]);
    assertEquals(siteManifest.shortcuts?.map((item) => item.url), [
      "/posts/",
      "/about/",
    ]);
  });
});
