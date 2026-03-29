import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  createAtomFeedContent,
  createFeedOptions,
  FEED_ITEMS,
  FEED_LIMIT,
  FEED_SORT,
  FEED_STYLESHEET,
  FEED_VARIANTS,
} from "./feeds.ts";

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
          output: ["/rss.xml", "/feed.json"],
          query: "type=post lang=en",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi’s Bizarre Aventure",
            description: "Personal blog by Phiphi, based in Chengdu, China.",
            lang: "en",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/fr/rss.xml", "/fr/feed.json"],
          query: "type=post lang=fr",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi’s Bizarre Aventure (fr)",
            description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
            lang: "fr",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/zh-hans/rss.xml", "/zh-hans/feed.json"],
          query: "type=post lang=zh-hans",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi的奇妙冒險 (简体中文)",
            description: "Phiphi 的个人博客，写于中国成都。",
            lang: "zh-Hans",
            generator: false,
          },
          items: FEED_ITEMS,
        },
        {
          output: ["/zh-hant/rss.xml", "/zh-hant/feed.json"],
          query: "type=post lang=zh-hant",
          sort: FEED_SORT,
          limit: FEED_LIMIT,
          stylesheet: FEED_STYLESHEET,
          info: {
            title: "PhiPhi的奇妙冒險 (繁體中文)",
            description: "Phiphi 的個人部落格，寫於中國成都。",
            lang: "zh-Hant",
            generator: false,
          },
          items: FEED_ITEMS,
        },
      ],
    );
  });

  it("renders Atom 1.0 output with a stylesheet, author, and escaped HTML", () => {
    const siteStub = {
      url(path: string, _absolute: boolean): string {
        return `https://normco.re${path}`;
      },
      source: {
        data: {
          get(path: string) {
            return path === "/" ? { author: "Phiphi" } : undefined;
          },
        },
      },
    };

    const xml = createAtomFeedContent(
      siteStub as unknown as import("lume/core/site.ts").default,
      FEED_VARIANTS[0],
      [
        {
          url: "/posts/hello/",
          title: "Hello",
          description: "Summary",
          children: '<p><a href="/about/">Body</a></p>',
          date: new Date("2026-03-11T00:00:00Z"),
          update_date: "2026-03-27T10:09:39+08:00",
        } as unknown as import("lume/core/file.ts").Data,
      ],
      true,
    );

    assertStringIncludes(
      xml,
      '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    );
    assertMatch(
      xml,
      /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom" xmlns:fh="http:\/\/purl\.org\/syndication\/history\/1\.0" xml:lang="en">/,
    );
    assertStringIncludes(xml, "<fh:complete/>");
    assertStringIncludes(xml, "<name>Phiphi</name>");
    assertStringIncludes(
      xml,
      '<link rel="self" type="application/atom+xml" href="https://normco.re/atom.xml"/>',
    );
    assertStringIncludes(
      xml,
      '<content type="html">&lt;p&gt;&lt;a href=&quot;https://normco.re/about/&quot;&gt;Body&lt;/a&gt;&lt;/p&gt;</content>',
    );
    assertStringIncludes(xml, "<updated>2026-03-27T02:09:39Z</updated>");
  });
});
