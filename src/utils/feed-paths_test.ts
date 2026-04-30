import { assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  ATOM_FEED_PATH,
  FEED_STYLESHEET_PATH,
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
  JSON_FEED_PATH,
  RSS_FEED_PATH,
} from "./feed-paths.ts";

describe("feed-paths", () => {
  it("exposes the canonical feed paths", () => {
    assertStrictEquals(RSS_FEED_PATH, "/feed.xml");
    assertStrictEquals(ATOM_FEED_PATH, "/feed.atom");
    assertStrictEquals(JSON_FEED_PATH, "/feed.json");
    assertStrictEquals(FEED_STYLESHEET_PATH, "/feed.xsl");
  });

  it("localizes feed URLs through the shared URL helper", () => {
    assertStrictEquals(getLocalizedRssFeedUrl("en"), "/feed.xml");
    assertStrictEquals(getLocalizedAtomFeedUrl("fr"), "/fr/feed.atom");
    assertStrictEquals(
      getLocalizedJsonFeedUrl("zhHans"),
      "/zh-hans/feed.json",
    );
  });
});
