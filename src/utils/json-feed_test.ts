import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  isJsonFeedDocument,
  JSON_FEED_PATH_PATTERN,
  JSON_FEED_VERSION,
  normalizeJsonFeed,
  parseJsonFeedDocument,
  toRfc3339,
} from "./json-feed.ts";

describe("toRfc3339()", () => {
  it("converts RFC 2822 dates to RFC 3339", () => {
    assertEquals(
      toRfc3339("Tue, 10 Mar 2026 00:00:00 GMT"),
      "2026-03-10T00:00:00Z",
    );
  });

  it("preserves unparseable strings", () => {
    assertEquals(toRfc3339("not-a-date"), "not-a-date");
  });
});

describe("normalizeJsonFeed()", () => {
  it("upgrades feeds to JSON Feed 1.1 and adds language", () => {
    const normalized = normalizeJsonFeed(
      {
        version: "https://jsonfeed.org/version/1",
        title: "PhiPhi’s Bizarre Aventure",
        items: [
          {
            id: "https://normco.re/posts/hello/",
            content_html: "<p>Hello</p>",
            date_published: "Tue, 10 Mar 2026 00:00:00 GMT",
          },
        ],
      },
      "fr",
    );

    assertEquals(normalized.version, JSON_FEED_VERSION);
    assertEquals(normalized.language, "fr");
    assertEquals(
      normalized.items?.[0]?.date_published,
      "2026-03-10T00:00:00Z",
    );
  });
});

describe("isJsonFeedDocument()", () => {
  it("accepts object feeds with object items", () => {
    assertEquals(
      isJsonFeedDocument({
        version: "https://jsonfeed.org/version/1.1",
        language: "en",
        items: [{ id: "post-1", date_published: "2026-03-10" }],
      }),
      true,
    );
  });

  it("rejects arrays and malformed items", () => {
    assertEquals(isJsonFeedDocument([]), false);
    assertEquals(
      isJsonFeedDocument({
        items: [{ date_published: 42 }],
      }),
      false,
    );
  });
});

describe("parseJsonFeedDocument()", () => {
  it("parses valid JSON feed objects", () => {
    assertEquals(
      parseJsonFeedDocument(
        '{"version":"https://jsonfeed.org/version/1.1","items":[{"id":"post-1"}]}',
      ).items?.[0]?.id,
      "post-1",
    );
  });

  it("preserves special characters in titles and HTML payload fields", () => {
    const document = parseJsonFeedDocument(
      JSON.stringify({
        title: 'Post avec <script> et "quotes"',
        items: [
          {
            id: "https://normco.re/posts/special/",
            content_html: '<p>Bonjour <strong>"monde"</strong></p>',
          },
        ],
      }),
    );

    assertEquals(document.title, 'Post avec <script> et "quotes"');
    assertEquals(
      document.items?.[0]?.content_html,
      '<p>Bonjour <strong>"monde"</strong></p>',
    );
  });

  it("throws precise errors for non-object payloads and malformed item shapes", () => {
    const rootError = assertThrows<TypeError>(
      () => parseJsonFeedDocument('["not","a","feed"]'),
      TypeError,
    );
    const itemError = assertThrows<TypeError>(
      () =>
        parseJsonFeedDocument(
          '{"items":[{"id":"https://normco.re/posts/broken/","title":"Broken post","date_published":42}]}',
        ),
      TypeError,
    );

    assertStringIncludes(rootError.message, "top-level JSON object");
    assertStringIncludes(itemError.message, "items[0].date_published");
    assertStringIncludes(
      itemError.message,
      '"https://normco.re/posts/broken/"',
    );
    assertStringIncludes(itemError.message, '"Broken post"');
  });
});

describe("JSON_FEED_PATH_PATTERN", () => {
  it("matches default and localized feed JSON routes", () => {
    assertEquals(JSON_FEED_PATH_PATTERN.test("/feed.json"), true);
    assertEquals(JSON_FEED_PATH_PATTERN.test("/fr/feed.json"), true);
    assertEquals(JSON_FEED_PATH_PATTERN.test("/zh-hant/feed.json"), true);
  });

  it("ignores unrelated JSON files", () => {
    assertEquals(JSON_FEED_PATH_PATTERN.test("/api/posts/demo.json"), false);
  });
});
