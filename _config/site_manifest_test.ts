import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { createSiteManifestPage } from "./site_manifest.ts";
import {
  APP_MANIFEST_PATH,
  type SiteManifestData,
  stringifySiteManifest,
} from "../src/utils/site-manifest.ts";

const SITE_MANIFEST: SiteManifestData = {
  dir: "ltr",
  lang: "en",
  name: "normco.re",
  shortName: "normco.re",
  startUrl: "/",
  id: "/",
  scope: "/",
  display: "standalone",
  themeColor: "#ffffff",
  backgroundColor: "#ffffff",
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
  shortcuts: [
    {
      name: "Posts",
      shortName: "Posts",
      description: "Browse the post archive.",
      url: "/posts/",
    },
  ],
};

describe("_config/site_manifest.ts", () => {
  it("creates a root page at /manifest.webmanifest", () => {
    const page = createSiteManifestPage(SITE_MANIFEST);

    assertEquals(page.data.url, APP_MANIFEST_PATH);
    assertEquals(page.outputPath, APP_MANIFEST_PATH);
    assertEquals(page.content, stringifySiteManifest(SITE_MANIFEST));
  });
});
