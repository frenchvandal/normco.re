import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type Site from "lume/core/site.ts";
import type { Data, Page } from "lume/core/file.ts";

import {
  createAtomFeedContent,
  createAtomFeedPage,
  createAtomFeedPages,
  createFeedOptions,
  FEED_ITEMS,
  FEED_LIMIT,
  FEED_SORT,
  FEED_STYLESHEET,
  FEED_VARIANTS,
  registerFeeds,
} from "./feeds.ts";

describe("plugins/feeds.ts", () => {
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
            title: "PhiPhi的奇妙冒险 (简体中文)",
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

  it("creates localized Atom feed pages from the shared serializer", () => {
    const page = createAtomFeedPage(
      {
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
      } as unknown as import("lume/core/site.ts").default,
      FEED_VARIANTS[1],
      [
        {
          url: "/fr/posts/bonjour/",
          title: "Bonjour",
          description: "Résumé",
          children: "<p>Salut</p>",
          date: new Date("2026-03-16T00:00:00Z"),
        } as unknown as Data,
      ],
      true,
    );

    assertEquals(page.data.url, "/fr/atom.xml");
  });

  it("creates one Atom page per configured language variant", () => {
    const searchQueries: string[] = [];
    const pages = createAtomFeedPages({
      pages: [],
      search: {
        pages(query: string): Data[] {
          searchQueries.push(query);
          return [];
        },
      },
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
    } as unknown as Site);

    assertEquals(
      pages.map((page) => page.data.url),
      ["/atom.xml", "/fr/atom.xml", "/zh-hans/atom.xml", "/zh-hant/atom.xml"],
    );
    assertEquals(searchQueries, [
      "type=post lang=en",
      "type=post lang=fr",
      "type=post lang=zh-hans",
      "type=post lang=zh-hant",
    ]);
  });

  it("replaces stale generated Atom pages on subsequent runs", () => {
    type Processor = () => void;

    const state = { pages: [] as Page[] };
    let processor: Processor | undefined;

    const site = {
      get pages(): Page[] {
        return state.pages;
      },
      use(): void {
        // Feed plugin registration is covered by createFeedOptions assertions.
      },
      process(callback: Processor): void {
        processor = callback;
      },
      search: {
        pages(query: string): Data[] {
          if (query === "type=post lang=en") {
            return [{
              url: "/posts/hello/",
              title: "Hello",
              description: "Summary",
              children: "<p>Body</p>",
              date: new Date("2026-03-16T00:00:00Z"),
            } as unknown as Data];
          }

          return [];
        },
      },
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
    } as unknown as Site;

    registerFeeds(site);
    if (processor === undefined) {
      throw new Error("Expected feed processor to be registered");
    }

    processor();
    const firstRun = [...state.pages];

    state.pages = [...firstRun];
    processor();

    const atomUrls = state.pages.filter((page) =>
      String(page.data.url).endsWith("/atom.xml") ||
      page.data.url === "/atom.xml"
    ).map((page) => page.data.url).sort();

    assertEquals(atomUrls, [
      "/atom.xml",
      "/fr/atom.xml",
      "/zh-hans/atom.xml",
      "/zh-hant/atom.xml",
    ]);
  });
});
