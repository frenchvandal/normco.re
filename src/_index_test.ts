import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { faker, seedTestFaker } from "../test/faker.ts";
import { asLumeData, asLumeHelpers } from "../test/lume.ts";

import indexPage, { searchIndexed } from "./index.page.tsx";

const MOCK_HELPERS = asLumeHelpers({
  date: (_value: unknown, _format: string): string => "Mar 5",
});

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
        `<article class="post-card ${
          props["className"] ?? ""
        }"><time class="post-card-date" datetime="${props["dateIso"]}">${
          props["dateStr"]
        }</time><h3 class="post-card-title"><a class="post-card-link" href="${
          props["url"]
        }">${props["title"]}</a></h3></article>`,
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

describe("index.page.tsx", () => {
  describe("hero section", () => {
    it("wraps the page in the editorial shell", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertMatch(
        html,
        /class="[^"]*\bsite-page-shell\b[^"]*\bsite-page-shell--editorial\b[^"]*\bhome-page\b[^"]*\bhome-page--editorial\b[^"]*"/,
      );
    });

    it("renders the editorial intro section", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="editorial-home-intro"',
      );
      assertStringIncludes(
        html,
        'class="editorial-home-intro__grid"',
      );
      assertStringIncludes(
        html,
        'class="editorial-home-intro__links"',
      );
      assertStringIncludes(
        html,
        'class="editorial-home-inline-link editorial-home-inline-link--primary"',
      );
      assertStringIncludes(html, 'class="editorial-home-intro__aside"');
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, 'href="/about/"');
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

      assertStringIncludes(html, 'class="editorial-home-topics"');
      assertStringIncludes(html, 'class="editorial-home-topic-link"');
      assertStringIncludes(html, 'href="/tags/design/"');
      assertStringIncludes(html, 'href="/tags/writing/"');
      assertStringIncludes(html, 'href="/tags/life/"');
    });

    it("opts the home page out of the Pagefind body region", () => {
      assertEquals(searchIndexed, false);
    });
  });

  describe("recent posts", () => {
    it("renders the recent-writing section chrome", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="home-recent home-recent--editorial"',
      );
      assertStringIncludes(html, 'class="editorial-home-section-title"');
      assertNotMatch(html, /h-feed|p-name|h-card|u-url sr-only/);
    });

    it("renders a link to the full archive", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'href="/posts/"');
    });

    it("surfaces the newest post as the editorial featured story", async () => {
      const posts = [
        makePost(410, {
          title: "Featured story",
          readingInfo: { minutes: 4 },
        }),
        makePost(411, { title: "Secondary story" }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);

      assertStringIncludes(
        html,
        'class="editorial-home-ledger"',
      );
      assertStringIncludes(html, 'class="editorial-home-featured-story"');
      assertStringIncludes(html, "Featured story");
      assertStringIncludes(html, "Secondary story");
    });

    it("uses the editorial ledger layout hooks for recent posts", async () => {
      const posts = [
        makePost(413, { title: "Top story" }),
        makePost(414, { title: "Follow-up story" }),
        makePost(415, { title: "Third story" }),
        makePost(416, { title: "Fourth story" }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);

      assertStringIncludes(html, 'class="editorial-home-ledger"');
      assertStringIncludes(html, 'class="home-posts home-posts--ledger"');
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
        makePost(417, { readingInfo: { minutes: 7 } }),
        makePost(418, { readingInfo: { minutes: 9 } }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="home-posts-item"');
      assertStringIncludes(
        html,
        'class="post-card editorial-home-post editorial-home-post--ledger"',
      );
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
      const posts = [
        makePost(405, { title: "Feature", readingInfo: { minutes: 2 } }),
        makePost(406, { title: "Spotlight one" }),
        makePost(419, { title: "Spotlight two" }),
        makePost(420, { title: "Grid card" }),
      ];
      const html = await indexPage(
        asLumeData({
          search: {
            pages: () => posts,
          },
          comp: {
            PostCard: (props: Record<string, unknown>) =>
              `<article class="post-card ${props["className"] ?? ""}"><h3>${
                props["title"]
              }</h3></article>`,
          },
        }),
        MOCK_HELPERS,
      );

      assertStringIncludes(html, "Grid card");
      assertStringIncludes(
        html,
        'class="post-card editorial-home-post editorial-home-post--ledger"',
      );
    });

    it("does not render images or quotation blocks in the home feature", async () => {
      const posts = [
        makePost(421, { title: "Feature only" }),
      ];
      const html = await indexPage(makeData(posts), MOCK_HELPERS);

      assertEquals(html.includes("<img"), false);
      assertEquals(html.includes("<figure"), false);
      assertEquals(html.includes("<blockquote"), false);
    });

    it("renders the recent-writing section even when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="home-recent home-recent--editorial"',
      );
    });

    it("renders the editorial empty state when no posts exist", async () => {
      const html = await indexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="editorial-home-empty-state"');
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
