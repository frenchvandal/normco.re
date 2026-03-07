import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import feedsPage from "./feeds.page.tsx";

describe("feeds.page.tsx", () => {
  describe("structure", () => {
    it("renders the feeds-page section", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'class="feeds-page"');
    });

    it("renders an h1 heading", () => {
      const html = feedsPage();
      assertStringIncludes(html, "<h1");
      assertStringIncludes(html, "Feeds");
    });

    it("renders a feeds-list", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'class="feeds-list"');
    });
  });

  describe("feed entries", () => {
    it("renders an Atom feed entry", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'href="/feed.xml"');
      assertStringIncludes(html, "Atom Feed");
      assertStringIncludes(html, "application/atom+xml");
    });

    it("renders a JSON feed entry", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'href="/feed.json"');
      assertStringIncludes(html, "JSON Feed");
      assertStringIncludes(html, "application/feed+json");
    });

    it("renders a sitemap entry", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'href="/sitemap.xml"');
      assertStringIncludes(html, "Sitemap");
      assertStringIncludes(html, "application/xml");
    });

    it("wraps each feed entry in article.feeds-entry", () => {
      const html = feedsPage();
      assertStringIncludes(html, 'class="feeds-entry"');
    });

    it("displays the MIME type in a code element", () => {
      const html = feedsPage();
      assertStringIncludes(html, "<code>application/atom+xml</code>");
    });
  });
});
