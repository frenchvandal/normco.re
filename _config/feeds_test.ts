import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { createFeedOptions, FEED_ITEMS, FEED_VARIANTS } from "./feeds.ts";

describe("_config/feeds.ts", () => {
  it("maps feed content to rendered HTML children", () => {
    assertEquals(FEED_ITEMS.content, "=children");
  });

  it("defines one localized feed variant per supported language", () => {
    assertEquals(
      FEED_VARIANTS.map((variant) => variant.language),
      ["en", "fr", "zhHans", "zhHant"],
    );
  });

  it("builds the expected feed outputs and metadata for each variant", () => {
    assertEquals(
      FEED_VARIANTS.map((variant) => createFeedOptions(variant)),
      [
        {
          output: ["/feed.xml", "/feed.json"],
          query: "type=post lang=en",
          info: {
            title: "normco.re",
            description: "Personal blog by Phiphi, based in Chengdu, China.",
            lang: "en",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/fr/feed.xml", "/fr/feed.json"],
          query: "type=post lang=fr",
          info: {
            title: "normco.re (fr)",
            description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
            lang: "fr",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/zh-hans/feed.xml", "/zh-hans/feed.json"],
          query: "type=post lang=zh-hans",
          info: {
            title: "normco.re (简体中文)",
            description: "Phiphi 的个人博客，写于中国成都。",
            lang: "zh-Hans",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/zh-hant/feed.xml", "/zh-hant/feed.json"],
          query: "type=post lang=zh-hant",
          info: {
            title: "normco.re (繁體中文)",
            description: "Phiphi 的個人部落格，寫於中國成都。",
            lang: "zh-Hant",
            generator: false,
          },
          items: FEED_ITEMS,
        },
      ],
    );
  });
});
