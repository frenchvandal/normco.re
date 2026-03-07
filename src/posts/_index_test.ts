import { assertEquals, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import postsIndexPage from "./index.page.tsx";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {
  date: (_value: unknown, _format: string): string => "Mar 5",
} as unknown as Lume.Helpers;

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

/** Builds a Lume.Data mock for the posts archive page. */
function makeData(
  posts: Array<{
    title: string;
    url: string;
    date: unknown;
    readingTime?: number;
  }>,
): Lume.Data {
  return {
    search: {
      pages: (_query: string, _sort: string) => posts,
    },
  } as unknown as Lume.Data;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("posts/index.page.tsx", () => {
  describe("page title", () => {
    it('renders the "Writing" heading', () => {
      const html = postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, "Writing");
    });
  });

  describe("empty state", () => {
    it("renders no year sections when there are no posts", () => {
      const html = postsIndexPage(makeData([]), MOCK_HELPERS);
      assertNotMatch(html, /archive-year/);
    });
  });

  describe("year grouping", () => {
    it("groups posts by year", () => {
      const posts = [
        {
          title: "Post A",
          url: "/posts/a/",
          date: new Date("2026-01-01"),
          readingTime: 1,
        },
        {
          title: "Post B",
          url: "/posts/b/",
          date: new Date("2025-06-01"),
          readingTime: 2,
        },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "2026");
      assertStringIncludes(html, "2025");
      assertStringIncludes(html, "Post A");
      assertStringIncludes(html, "Post B");
    });

    it("lists the most recent year first", () => {
      const posts = [
        {
          title: "Old",
          url: "/posts/old/",
          date: new Date("2024-01-01"),
          readingTime: 1,
        },
        {
          title: "New",
          url: "/posts/new/",
          date: new Date("2026-01-01"),
          readingTime: 1,
        },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      const idx2026 = html.indexOf("2026");
      const idx2024 = html.indexOf("2024");
      assertEquals(idx2026 < idx2024, true);
    });

    it("falls back to the current year when post.date is not a Date instance", () => {
      const posts = [
        { title: "Strange", url: "/posts/s/", date: "not-a-date" },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      const currentYear = new Date().getFullYear().toString();
      assertStringIncludes(html, currentYear);
    });
  });

  describe("reading time", () => {
    it("renders reading time when present", () => {
      const posts = [
        {
          title: "Post",
          url: "/posts/p/",
          date: new Date("2026-01-01"),
          readingTime: 4,
        },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "4 min");
    });

    it("renders an empty span when reading time is absent", () => {
      const posts = [
        { title: "Post", url: "/posts/p/", date: new Date("2026-01-01") },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "<span></span>");
    });
  });

  describe("archive list structure", () => {
    it("wraps each post in an li.archive-item", () => {
      const posts = [
        {
          title: "Post",
          url: "/posts/p/",
          date: new Date("2026-01-01"),
          readingTime: 1,
        },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="archive-item"');
    });

    it("renders a time element with the ISO datetime attribute", () => {
      const posts = [
        {
          title: "Post",
          url: "/posts/p/",
          date: new Date("2026-01-01"),
          readingTime: 1,
        },
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "<time");
      assertStringIncludes(html, 'class="archive-date"');
    });
  });
});
