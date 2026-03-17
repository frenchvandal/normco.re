import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  type AtomFeedData,
  escapeXml,
  generateAtomXml,
} from "./atom-feed.ts";

describe("escapeXml()", () => {
  it("escapes ampersands", () => {
    assertEquals(escapeXml("A & B"), "A &amp; B");
  });

  it("escapes angle brackets", () => {
    assertEquals(escapeXml("<tag>"), "&lt;tag&gt;");
  });

  it("escapes quotes", () => {
    assertEquals(escapeXml('"hello"'), "&quot;hello&quot;");
  });

  it("passes through plain text", () => {
    assertEquals(escapeXml("hello world"), "hello world");
  });
});

describe("generateAtomXml()", () => {
  const baseFeed: AtomFeedData = {
    id: "https://normco.re/atom.xml",
    title: "Test Feed",
    siteUrl: "https://normco.re/",
    feedUrl: "https://normco.re/atom.xml",
    updated: new Date("2024-06-15T12:00:00Z"),
    entries: [],
  };

  it("produces valid Atom XML with required elements", () => {
    const xml = generateAtomXml(baseFeed);
    assertEquals(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'), true);
    assertEquals(xml.includes('<feed xmlns="http://www.w3.org/2005/Atom">'), true);
    assertEquals(xml.includes("<id>https://normco.re/atom.xml</id>"), true);
    assertEquals(xml.includes("<title>Test Feed</title>"), true);
    assertEquals(xml.includes("<updated>2024-06-15T12:00:00.000Z</updated>"), true);
    assertEquals(xml.includes('rel="self"'), true);
    assertEquals(xml.includes('type="application/atom+xml"'), true);
    assertEquals(xml.includes('rel="alternate"'), true);
    assertEquals(xml.includes("</feed>"), true);
  });

  it("includes xml:lang when language is provided", () => {
    const xml = generateAtomXml({ ...baseFeed, language: "fr" });
    assertEquals(xml.includes('xml:lang="fr"'), true);
  });

  it("omits xml:lang when language is not provided", () => {
    const xml = generateAtomXml(baseFeed);
    assertEquals(xml.includes("xml:lang"), false);
  });

  it("includes subtitle when description is provided", () => {
    const xml = generateAtomXml({ ...baseFeed, description: "A test blog" });
    assertEquals(xml.includes("<subtitle>A test blog</subtitle>"), true);
  });

  it("includes author element", () => {
    const xml = generateAtomXml({
      ...baseFeed,
      author: { name: "Alice", uri: "https://example.com" },
    });
    assertEquals(xml.includes("<author>"), true);
    assertEquals(xml.includes("<name>Alice</name>"), true);
    assertEquals(xml.includes("<uri>https://example.com</uri>"), true);
  });

  it("renders entries with all fields", () => {
    const xml = generateAtomXml({
      ...baseFeed,
      entries: [
        {
          id: "https://normco.re/posts/hello/",
          title: "Hello World",
          url: "https://normco.re/posts/hello/",
          published: new Date("2024-06-01T10:00:00Z"),
          summary: "A first post",
          contentHtml: "<p>Hello!</p>",
        },
      ],
    });
    assertEquals(xml.includes("<entry>"), true);
    assertEquals(xml.includes("<id>https://normco.re/posts/hello/</id>"), true);
    assertEquals(xml.includes("<title>Hello World</title>"), true);
    assertEquals(
      xml.includes("<published>2024-06-01T10:00:00.000Z</published>"),
      true,
    );
    assertEquals(xml.includes("<summary>A first post</summary>"), true);
    assertEquals(
      xml.includes('<content type="html"><![CDATA[<p>Hello!</p>]]></content>'),
      true,
    );
    assertEquals(xml.includes("</entry>"), true);
  });

  it("uses published date as updated when no updated is set", () => {
    const xml = generateAtomXml({
      ...baseFeed,
      entries: [
        {
          id: "urn:test:1",
          title: "Post",
          url: "https://normco.re/posts/post/",
          published: new Date("2024-03-01T00:00:00Z"),
        },
      ],
    });
    assertEquals(
      xml.includes("<updated>2024-03-01T00:00:00.000Z</updated>"),
      true,
    );
  });

  it("escapes special characters in entry titles", () => {
    const xml = generateAtomXml({
      ...baseFeed,
      entries: [
        {
          id: "urn:test:2",
          title: "A & B <C>",
          url: "https://normco.re/posts/test/",
        },
      ],
    });
    assertEquals(xml.includes("<title>A &amp; B &lt;C&gt;</title>"), true);
  });
});
