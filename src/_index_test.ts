import { assertEquals, assertMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker, seedTestFaker } from "../test/faker.ts";
import { asLumeData, asLumeHelpers } from "../test/lume.ts";

import indexPage, { searchIndexed } from "./index.page.tsx";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
const MOCK_HELPERS = asLumeHelpers({
  date: (_value: unknown, _format: string): string => "Mar 5",
});

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

/** Builds a Lume.Data mock for the home page, with an optional post list. */
type MockPost = {
  title: string;
  url: string;
  date: Date;
  readingInfo?: { minutes?: number };
  tags?: string[];
};

function makeData(
  posts: MockPost[],
): Lume.Data {
  return asLumeData({
    search: {
      pages: (
        _query: string,
        _sort: string,
        _limit: number,
      ) => posts,
    },
    comp: {
      PostCard: (props: Record<string, unknown>) =>
        `<article class="post-card h-entry"><time class="post-card-date dt-published" datetime="${
          props["dateIso"]
        }">${props["dateStr"]}</time><h3 class="p-name">${
          props["title"]
        }</h3></article>`,
    },
  });
}

function makePost(
  seed: number,
  overrides: Partial<MockPost> = {},
): MockPost {
  seedTestFaker(seed);
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
      assertStringIncludes(
        html,
        'class="pagehead hero home-pagehead"',
      );
      assertStringIncludes(html, 'class="home-hero-grid"');
      assertStringIncludes(
        html,
        'class="cds--tile feature-card home-hero-card"',
      );
    });

    it("renders an h1 in the hero", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, "<h1");
    });

    it("renders featured topic links when recent posts provide tags", async () => {
      const posts = [
        makePost(407, { tags: ["design", "writing"] }),
        makePost(408, { tags: ["design", "life"] }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);

      assertStringIncludes(html, 'class="home-topics home-topics--compact"');
      assertStringIncludes(html, 'href="/tags/design/"');
      assertStringIncludes(html, 'title="design"');
      assertStringIncludes(html, 'href="/tags/writing/"');
      assertStringIncludes(html, 'href="/tags/life/"');
    });

    it("opts the home page out of the Pagefind body region", () => {
      assertEquals(searchIndexed, false);
    });
  });

  describe("recent posts", () => {
    it("marks the recent-writing section as an h-feed", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-recent h-feed"');
      assertStringIncludes(html, 'class="subhead-heading p-name"');
      assertStringIncludes(html, 'class="u-url sr-only" href="/"');
      assertStringIncludes(html, 'class="p-author h-card sr-only"');
      assertStringIncludes(html, 'href="/about/"');
    });

    it("renders a link to the full archive", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'href="/posts/"');
    });

    it("surfaces the newest post as a featured card", async () => {
      const posts = [
        makePost(410, {
          title: "Featured story",
          readingInfo: { minutes: 4 },
        }),
        makePost(411, { title: "Secondary story" }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);

      assertStringIncludes(html, 'class="home-featured"');
      assertStringIncludes(html, "Featured story");
      assertStringIncludes(html, "Secondary story");
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
        makePost(412, { readingInfo: { minutes: 5 } }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-posts-item"');
      assertStringIncludes(html, 'class="post-card h-entry"');
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

    it("renders async PostCard components", async () => {
      const post = makePost(405, { readingInfo: { minutes: 2 } });
      const html = await indexPage(
        asLumeData({
          search: {
            pages: () => [post],
          },
          comp: {
            PostCard: (props: Record<string, unknown>) =>
              `<article class="post-card h-entry"><h3 class="p-name">${
                props["title"]
              }</h3></article>`,
          },
        }),
        MOCK_HELPERS,
      );

      assertStringIncludes(html, post.title);
      assertStringIncludes(html, 'class="post-card h-entry"');
    });

    it("renders the recent-writing section even when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-recent h-feed"');
    });

    it("renders the shared inline state panel when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="state-panel state-panel--inline"');
      assertStringIncludes(html, "Nothing published yet.");
      assertStringIncludes(html, 'href="/about/"');
    });

    it("falls back to a safe card renderer when PostCard is unavailable", async () => {
      seedTestFaker(406);
      const unsafeDate = faker.date.anytime();
      const html = await indexPage(
        asLumeData({
          search: {
            pages: () => [{
              title: "Unsafe <title>",
              url: '/posts/"unsafe"/',
              date: unsafeDate,
            }],
          },
          comp: {},
        }),
        MOCK_HELPERS,
      );

      assertStringIncludes(html, "Unsafe &lt;title&gt;");
      assertStringIncludes(html, 'href="/posts/&quot;unsafe&quot;/"');
    });
  });
});
