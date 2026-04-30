import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type Site from "lume/core/site.ts";

import {
  createFeedOptions,
  FEED_AUTHOR_FALLBACK,
  FEED_ITEMS,
  FEED_LIMIT,
  FEED_SORT,
  FEED_STYLESHEET,
  FEED_VARIANTS,
  resolveFeedAuthorName,
} from "./feeds.ts";

describe("plugins/feeds.ts", () => {
  it("maps feed content to rendered HTML children and update_date", () => {
    assertEquals(FEED_ITEMS.content, "=children");
    assertEquals(FEED_ITEMS.published, "=date");
    assertEquals(FEED_ITEMS.updated, "=update_date");
  });

  it("defines one localized feed variant per supported language", () => {
    assertEquals(
      FEED_VARIANTS.map((variant) => variant.language),
      ["en", "fr", "zhHans", "zhHant"],
    );
  });

  it("builds the expected feed outputs and metadata for each variant", () => {
    assertEquals(
      FEED_VARIANTS.map((variant) =>
        createFeedOptions(variant, FEED_AUTHOR_FALLBACK)
      ),
      [
        {
          output: ["/feed.xml", "/feed.json", "/feed.atom"],
          query: "type=post lang=en",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi’s Bizarre Aventure",
            description: "Personal blog by Phiphi, based in Chengdu, China.",
            lang: "en",
            authorName: FEED_AUTHOR_FALLBACK,
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/fr/feed.xml", "/fr/feed.json", "/fr/feed.atom"],
          query: "type=post lang=fr",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi’s Bizarre Aventure (fr)",
            description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
            lang: "fr",
            authorName: FEED_AUTHOR_FALLBACK,
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: [
            "/zh-hans/feed.xml",
            "/zh-hans/feed.json",
            "/zh-hans/feed.atom",
          ],
          query: "type=post lang=zh-hans",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi的奇妙冒险 (简体中文)",
            description: "Phiphi 的个人博客，写于中国成都。",
            lang: "zh-Hans",
            authorName: FEED_AUTHOR_FALLBACK,
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: [
            "/zh-hant/feed.xml",
            "/zh-hant/feed.json",
            "/zh-hant/feed.atom",
          ],
          query: "type=post lang=zh-hant",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi的奇妙冒險 (繁體中文)",
            description: "Phiphi 的個人部落格，寫於中國成都。",
            lang: "zh-Hant",
            authorName: FEED_AUTHOR_FALLBACK,
            generator: false,
          },
          items: FEED_ITEMS,
        },
      ],
    );
  });

  it("falls back to the default author name when site root data omits it", () => {
    const site = {
      source: {
        data: {
          get(path: string) {
            return path === "/" ? {} : undefined;
          },
        },
      },
    } as unknown as Site;

    assertEquals(resolveFeedAuthorName(site), FEED_AUTHOR_FALLBACK);
  });

  it("uses the configured author name when site root data provides one", () => {
    const site = {
      source: {
        data: {
          get(path: string) {
            return path === "/" ? { author: "Some Author" } : undefined;
          },
        },
      },
    } as unknown as Site;

    assertEquals(resolveFeedAuthorName(site), "Some Author");
  });
});
