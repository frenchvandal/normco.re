import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  APP_MANIFEST_MIME_TYPE,
  ATOM_FEED_MIME_TYPE,
  HTML_CONTENT_TYPE,
  HTML_MIME_TYPE,
  JSON_FEED_MIME_TYPE,
  PLAIN_TEXT_CONTENT_TYPE,
  RSS_FEED_MIME_TYPE,
  SVG_MIME_TYPE,
  XML_MIME_TYPE,
} from "./media-types.ts";

describe("src/utils/media-types.ts", () => {
  it("exports canonical public MIME types for site outputs", () => {
    assertEquals(HTML_MIME_TYPE, "text/html");
    assertEquals(SVG_MIME_TYPE, "image/svg+xml");
    assertEquals(XML_MIME_TYPE, "application/xml");
    assertEquals(APP_MANIFEST_MIME_TYPE, "application/manifest+json");
    assertEquals(RSS_FEED_MIME_TYPE, "application/rss+xml");
    assertEquals(ATOM_FEED_MIME_TYPE, "application/atom+xml");
    assertEquals(JSON_FEED_MIME_TYPE, "application/feed+json");
  });

  it("exports canonical header-ready content types for text responses", () => {
    assertEquals(HTML_CONTENT_TYPE, "text/html; charset=UTF-8");
    assertEquals(PLAIN_TEXT_CONTENT_TYPE, "text/plain; charset=UTF-8");
  });
});
