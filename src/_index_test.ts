import { assertMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker } from "npm/faker-js";

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
type MockPost = {
  title: string;
  url: string;
  date: Date;
  readingInfo?: { minutes?: number };
};

function makeData(
  posts: MockPost[],
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
        `<article class="post-card"><h3>${props["title"]}</h3></article>`,
    },
  } as unknown as Lume.Data;
}

function makePost(
  seed: number,
  overrides: Partial<MockPost> = {},
): MockPost {
  faker.seed(seed);
  const includeReadingInfo = faker.datatype.boolean();
  const basePost: MockPost = {
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    url: `/posts/${faker.lorem.slug(3)}/`,
    date: faker.date.past(),
    ...(includeReadingInfo
      ? { readingInfo: { minutes: faker.number.int({ min: 1, max: 12 }) } }
      : {}),
  };

  return { ...basePost, ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("index.page.tsx", () => {
  describe("hero section", () => {
    it("wraps the page in the wide desktop shell", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="site-page-shell site-page-shell--wide"',
      );
    });

    it("renders the hero section", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertMatch(html, /class="[^"]*\bhero\b[^"]*"/);
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
      const firstPost = makePost(401, { readingInfo: { minutes: 2 } });
      const secondPost = makePost(402, { readingInfo: { minutes: 3 } });
      const posts = [
        firstPost,
        secondPost,
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, firstPost.title);
      assertStringIncludes(html, secondPost.title);
    });

    it("wraps each rendered card in a home-posts-item list item", async () => {
      const posts = [
        makePost(404, { readingInfo: { minutes: 2 } }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-posts-item"');
      assertStringIncludes(html, 'class="post-card"');
    });

    it("handles posts that lack reading info", async () => {
      const { readingInfo: _unusedReadingInfo, ...postWithoutReadingInfo } =
        makePost(403);
      const posts = [
        postWithoutReadingInfo,
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, postWithoutReadingInfo.title);
    });

    it("renders the home-posts container even when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-posts"');
    });

    it("renders the shared inline state panel when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="state-panel state-panel--inline"');
      assertStringIncludes(html, "Nothing published yet.");
      assertStringIncludes(html, 'href="/about/"');
    });
  });
});
