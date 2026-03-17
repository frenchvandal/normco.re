import { assertEquals, assertMatch } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  createAtomFeedContent,
  createFeedOptions,
  FEED_ITEMS,
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

  it("renders Atom 1.0 compliant metadata and entries", () => {
    const siteStub = {
      url(path: string, _absolute: boolean): string {
        return `https://normco.re${path}`;
      },
    };

    const xml = createAtomFeedContent(
      siteStub as never,
      FEED_VARIANTS[0],
      [
        {
          url: "/posts/hello/",
          title: "Hello",
          description: "Summary",
          children: "<p>Body</p>",
          date: new Date("2026-03-11T00:00:00Z"),
          update_date: new Date("2026-03-12T00:00:00Z"),
        } as unknown as import("lume/core/file.ts").Data,
      ],
    );

    assertMatch(
      xml,
      /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom" xml:lang="en">/,
    );
    assertMatch(xml, /<id>https:\/\/normco\.re\/atom\.xml<\/id>/);
    assertMatch(xml, /<updated>2026-03-12T00:00:00\.000Z<\/updated>/);
    assertMatch(
      xml,
      /<link rel="self" href="https:\/\/normco\.re\/atom\.xml" type="application\/atom\+xml" \/>/,
    );
    assertMatch(
      xml,
      /<entry>[\s\S]*<published>2026-03-11T00:00:00\.000Z<\/published>/,
    );
    assertMatch(
      xml,
      /<content type="html">&lt;p&gt;Body&lt;\/p&gt;<\/content>/,
    );
  });
});
