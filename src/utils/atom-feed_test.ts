import {
  assertEquals,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  absolutizeHtmlUrls,
  type AtomFeedData,
  generateAtomXml,
} from "./atom-feed.ts";
import { escapeXml } from "./html.ts";

describe("escapeXml()", () => {
  it("escapes XML-special characters", () => {
    assertEquals(
      escapeXml(`A & B <C> "D" 'E'`),
      "A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos;",
    );
  });
});

describe("absolutizeHtmlUrls()", () => {
  it("rewrites relative href and src attributes to absolute URLs", () => {
    assertEquals(
      absolutizeHtmlUrls(
        "https://normco.re/posts/hello/",
        '<p><a href="/about/">About</a><img src="hero.png" alt=""></p>',
      ),
      '<p><a href="https://normco.re/about/">About</a><img src="https://normco.re/posts/hello/hero.png" alt=""></p>',
    );
  });
});

describe("generateAtomXml()", () => {
  const baseFeed: AtomFeedData = {
    id: "https://normco.re/atom.xml",
    title: "PhiPhi’s Bizarre Aventure",
    subtitle: "Feed subtitle",
    siteUrl: "https://normco.re/",
    feedUrl: "https://normco.re/atom.xml",
    language: "en",
    complete: true,
    updated: new Date("2026-03-11T00:00:00Z"),
    author: { name: "Phiphi" },
    stylesheetHref: "/feed.xsl",
    entries: [
      {
        id: "https://normco.re/posts/hello/",
        title: "Hello",
        url: "https://normco.re/posts/hello/",
        updated: new Date("2026-03-11T00:00:00Z"),
        published: new Date("2026-03-10T00:00:00Z"),
        summary: "Summary",
        contentHtml: "<p>Hello</p>",
      },
    ],
  };

  it("emits the required Atom metadata and stylesheet PI", () => {
    const xml = generateAtomXml(baseFeed);

    assertStringIncludes(xml, '<?xml version="1.0" encoding="UTF-8"?>');
    assertStringIncludes(
      xml,
      '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    );
    assertStringIncludes(
      xml,
      '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:fh="http://purl.org/syndication/history/1.0" xml:lang="en">',
    );
    assertStringIncludes(xml, "<id>https://normco.re/atom.xml</id>");
    assertStringIncludes(xml, "<title>PhiPhi’s Bizarre Aventure</title>");
    assertStringIncludes(xml, "<fh:complete/>");
    assertStringIncludes(xml, "<name>Phiphi</name>");
  });

  it("escapes HTML content instead of embedding raw markup", () => {
    const xml = generateAtomXml(baseFeed);

    assertStringIncludes(
      xml,
      '<content type="html">&lt;p&gt;Hello&lt;/p&gt;</content>',
    );
    assertNotMatch(xml, /<!\[CDATA\[/);
  });
});
