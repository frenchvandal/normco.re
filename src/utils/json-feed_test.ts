import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  JSON_FEED_PATH_PATTERN,
  JSON_FEED_VERSION,
  normalizeJsonFeed,
  toRfc3339,
} from "./json-feed.ts";

describe("toRfc3339()", () => {
  it("converts RFC 2822 dates to RFC 3339", () => {
    assertEquals(
      toRfc3339("Tue, 10 Mar 2026 00:00:00 GMT"),
      "2026-03-10T00:00:00.000Z",
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
        title: "normco.re",
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
      "2026-03-10T00:00:00.000Z",
    );
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
