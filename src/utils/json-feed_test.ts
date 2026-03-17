import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  JSON_FEED_PATH_PATTERN,
  JSON_FEED_VERSION,
  normalizeJsonFeed,
  toRfc3339,
} from "./json-feed.ts";

describe("toRfc3339()", () => {
  it("converts an RFC 2822 UTC date string to RFC 3339", () => {
    assertEquals(
      toRfc3339("Mon, 01 Jan 2024 00:00:00 GMT"),
      "2024-01-01T00:00:00.000Z",
    );
  });

  it("preserves an already-valid ISO 8601 string", () => {
    assertEquals(
      toRfc3339("2024-06-15T12:30:00.000Z"),
      "2024-06-15T12:30:00.000Z",
    );
  });

  it("returns the original string when the date is unparseable", () => {
    assertEquals(toRfc3339("not-a-date"), "not-a-date");
  });
});

describe("normalizeJsonFeed()", () => {
  it("upgrades version to JSON Feed 1.1", () => {
    const feed = { version: "https://jsonfeed.org/version/1", title: "Test" };
    assertEquals(normalizeJsonFeed(feed).version, JSON_FEED_VERSION);
  });

  it("converts item date_published from RFC 2822 to RFC 3339", () => {
    const feed = {
      version: "https://jsonfeed.org/version/1",
      title: "Test",
      items: [
        { id: "1", title: "Post", date_published: "Sat, 15 Jun 2024 12:30:00 GMT" },
      ],
    };
    const result = normalizeJsonFeed(feed);
    assertEquals(result.items, [
      { id: "1", title: "Post", date_published: "2024-06-15T12:30:00.000Z" },
    ]);
  });

  it("converts item date_modified from RFC 2822 to RFC 3339", () => {
    const feed = {
      version: "https://jsonfeed.org/version/1",
      title: "Test",
      items: [
        {
          id: "1",
          title: "Post",
          date_published: "Sat, 15 Jun 2024 12:30:00 GMT",
          date_modified: "Sun, 16 Jun 2024 08:00:00 GMT",
        },
      ],
    };
    const result = normalizeJsonFeed(feed);
    assertEquals(result.items, [
      {
        id: "1",
        title: "Post",
        date_published: "2024-06-15T12:30:00.000Z",
        date_modified: "2024-06-16T08:00:00.000Z",
      },
    ]);
  });

  it("adds language when provided and not already present", () => {
    const feed = { version: "https://jsonfeed.org/version/1", title: "Test" };
    assertEquals(normalizeJsonFeed(feed, "fr").language, "fr");
  });

  it("does not overwrite an existing language field", () => {
    const feed = {
      version: "https://jsonfeed.org/version/1",
      title: "Test",
      language: "en",
    };
    assertEquals(normalizeJsonFeed(feed, "fr").language, "en");
  });

  it("omits language when none is provided", () => {
    const feed = { version: "https://jsonfeed.org/version/1", title: "Test" };
    assertEquals(normalizeJsonFeed(feed).language, undefined);
  });
});

describe("JSON_FEED_PATH_PATTERN", () => {
  it("matches the default feed path", () => {
    assertEquals(JSON_FEED_PATH_PATTERN.test("/feed.json"), true);
  });

  it("matches localized feed paths", () => {
    assertEquals(JSON_FEED_PATH_PATTERN.test("/fr/feed.json"), true);
    assertEquals(JSON_FEED_PATH_PATTERN.test("/zh-hans/feed.json"), true);
  });

  it("does not match unrelated JSON files", () => {
    assertEquals(JSON_FEED_PATH_PATTERN.test("/api/posts/foo.json"), false);
    assertEquals(JSON_FEED_PATH_PATTERN.test("/data.json"), false);
  });
});
