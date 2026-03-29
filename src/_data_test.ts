import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  fr,
  jsonLd,
  lang,
  layout,
  metas,
  siteChrome,
  siteManifest,
  siteName,
  siteOrigin,
  unmatchedLangUrl,
  zhHans,
} from "./_data.ts";

describe("src/_data.ts", () => {
  it("exports global language and base layout", () => {
    assertEquals(lang, "en");
    assertEquals(layout, "layouts/base.tsx");
    assertEquals(unmatchedLangUrl, "en");
  });

  it("exports baseline WebSite structured data", () => {
    assert(jsonLd && typeof jsonLd === "object");
    const data = jsonLd as unknown as Record<string, unknown>;
    assertEquals(data["@type"], "WebSite");
    assertEquals(data.url, "/");
  });

  it("keeps metas aligned with the site identity", () => {
    assertEquals(siteName, "PhiPhi’s Bizarre Aventure");
    assertEquals(siteOrigin, "https://normco.re");
    assertEquals(metas.site, "PhiPhi’s Bizarre Aventure");
    assertEquals(fr.metas.lang, "fr");
    assertEquals(zhHans.metas.site, "PhiPhi的奇妙冒险");
  });

  it("defines shared browser chrome and manifest metadata", () => {
    assertEquals(siteChrome.faviconIcoUrl, "/favicon.ico");
    assertEquals(siteChrome.appleTouchIconUrl, "/apple-touch-icon.png");
    assertEquals(siteManifest.name, "PhiPhi’s Bizarre Aventure");
    assertEquals(siteManifest.shortName, "PhiPhi");
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
