import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import indexPage from "./index.page.tsx";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {
  date: (_value: unknown, _format: string): string => "Mar 5",
} as unknown as Lume.Helpers;

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

/** Builds a Lume.Data mock for the home page, with an optional post list. */
function makeData(
  posts: Array<{
    title: string;
    url: string;
    date: Date;
    readingTime?: number;
  }>,
): Lume.Data {
  return {
    search: {
      pages: (
        _query: string,
        _sort: string,
        _limit: number,
      ) => posts,
    },
    comp: {
      PostCard: (props: Record<string, unknown>) =>
        Promise.resolve(
          `<article class="post-card"><h3>${props["title"]}</h3></article>`,
        ),
    },
  } as unknown as Lume.Data;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("index.page.tsx", () => {
  describe("hero section", () => {
    it("renders the hero section", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="hero"');
    });

    it("renders an h1 in the hero", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, "<h1");
    });
  });

  describe("recent posts", () => {
    it("renders a link to the full archive", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'href="/posts/"');
    });

    it("renders each post via PostCard", async () => {
      const posts = [
        {
          title: "First Post",
          url: "/posts/first/",
          date: new Date("2026-01-01"),
          readingTime: 2,
        },
        {
          title: "Second Post",
          url: "/posts/second/",
          date: new Date("2026-02-01"),
          readingTime: 3,
        },
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "First Post");
      assertStringIncludes(html, "Second Post");
    });

    it("handles posts that lack a readingTime", async () => {
      const posts = [
        {
          title: "No Time",
          url: "/posts/no-time/",
          date: new Date("2026-01-01"),
        },
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "No Time");
    });

    it("renders the home-posts container even when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-posts"');
    });
  });
});
