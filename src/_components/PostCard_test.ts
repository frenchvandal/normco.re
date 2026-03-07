import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import PostCard from "./PostCard.tsx";

/** Shared base props used across all PostCard tests. */
const BASE = {
  title: "My Test Post",
  url: "/posts/my-test-post/",
  dateStr: "Mar 5",
  dateIso: "2026-03-05T00:00:00Z",
} as const;

describe("PostCard()", () => {
  describe("with readingMinutes", () => {
    it("renders reading time in .post-card-meta", () => {
      const html = PostCard({ ...BASE, readingMinutes: 3 });
      assertStringIncludes(html, "3 min read");
      assertStringIncludes(html, 'class="post-card-meta"');
    });

    it("renders the provided reading minutes value", () => {
      const html = PostCard({ ...BASE, readingMinutes: 7 });
      assertStringIncludes(html, "7 min read");
    });
  });

  describe("without readingMinutes", () => {
    it("renders no .post-card-meta element", () => {
      const html = PostCard({ ...BASE });
      assertNotMatch(html, /post-card-meta/);
      assertNotMatch(html, /min read/);
    });
  });

  describe("structure", () => {
    it("wraps content in article.post-card", () => {
      const html = PostCard({ ...BASE });
      assertStringIncludes(html, '<article class="post-card">');
    });

    it("renders a time element with the ISO datetime attribute", () => {
      const html = PostCard({ ...BASE });
      assertStringIncludes(html, `datetime="${BASE.dateIso}"`);
      assertStringIncludes(html, BASE.dateStr);
    });

    it("renders the title in an h3 linked to url", () => {
      const html = PostCard({ ...BASE });
      assertStringIncludes(html, `href="${BASE.url}"`);
      assertStringIncludes(html, BASE.title);
      assertStringIncludes(html, "<h3");
    });
  });
});
