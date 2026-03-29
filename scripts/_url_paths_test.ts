import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  getUrlBasename,
  getUrlDirectory,
  toOutputPath,
  toRelativeUrlPath,
  toSiteUrl,
} from "./_url_paths.ts";

describe("scripts/_url_paths.ts", () => {
  it("maps site URLs to output paths without manual segment splitting", () => {
    assertEquals(
      toOutputPath("_site", "/scripts/header-client.js"),
      "_site/scripts/header-client.js",
    );
    assertEquals(
      toOutputPath("_site", "feed.json"),
      "_site/feed.json",
    );
  });

  it("maps output paths back to rooted site URLs", () => {
    assertEquals(
      toSiteUrl("_site", "_site/scripts/header-client.js"),
      "/scripts/header-client.js",
    );
    assertEquals(toSiteUrl("_site", "_site/index.html"), "/index.html");
  });

  it("derives URL directories and basenames with POSIX semantics", () => {
    assertEquals(getUrlDirectory("/scripts/header-client.js"), "/scripts");
    assertEquals(getUrlDirectory("/style.css"), "/");
    assertEquals(
      getUrlBasename("/pagefind/pagefind-highlight.js"),
      "pagefind-highlight.js",
    );
  });

  it("computes browser-friendly relative URL paths", () => {
    assertEquals(
      toRelativeUrlPath("/scripts", "/scripts/header-client.js"),
      "./header-client.js",
    );
    assertEquals(
      toRelativeUrlPath("/scripts/header-client", "/scripts/feed-copy.js"),
      "../feed-copy.js",
    );
    assertEquals(toRelativeUrlPath("/", "/style.css"), "./style.css");
  });
});
