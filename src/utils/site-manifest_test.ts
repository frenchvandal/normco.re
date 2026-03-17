import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { buildSiteManifest, stringifySiteManifest } from "./site-manifest.ts";

describe("src/utils/site-manifest.ts", () => {
  it("serializes core manifest members with snake_case output keys", () => {
    const serialized = buildSiteManifest({
      dir: "ltr",
      lang: "en",
      name: "normco.re",
      shortName: "normco.re",
      startUrl: "/",
      id: "/",
      scope: "/",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
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
    });

    assertEquals(serialized, {
      dir: "ltr",
      lang: "en",
      name: "normco.re",
      short_name: "normco.re",
      start_url: "/",
      id: "/",
      scope: "/",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
      shortcuts: [
        {
          name: "Posts",
          short_name: "Posts",
          description: "Browse the post archive.",
          url: "/posts/",
        },
      ],
    });
  });

  it("writes a trailing newline and omits non-core top-level metadata", () => {
    const manifest = stringifySiteManifest({
      name: "normco.re",
      shortName: "normco.re",
      startUrl: "/",
      id: "/",
      scope: "/",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });

    assertEquals(manifest.endsWith("\n"), true);
    assertEquals(
      "description" in (JSON.parse(manifest) as Record<string, unknown>),
      false,
    );
  });
});
