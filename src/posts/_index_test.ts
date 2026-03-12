import {
  assert,
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker } from "npm/faker-js";

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
type MockPost = {
  title: string;
  url: string;
  date: unknown;
  readingInfo?: { minutes?: number };
};

function makeData(
  posts: MockPost[],
): Lume.Data {
  return {
    search: {
      pages: (_query: string, _sort: string) => posts,
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
    title: faker.lorem.sentence({ min: 2, max: 5 }),
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
      const postA = makePost(501, {
        date: new Date("2026-01-01"),
        readingInfo: { minutes: 1 },
      });
      const postB = makePost(502, {
        date: new Date("2025-06-01"),
        readingInfo: { minutes: 2 },
      });
      const posts = [
        postA,
        postB,
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "2026");
      assertStringIncludes(html, "2025");
      assertStringIncludes(html, postA.title);
      assertStringIncludes(html, postB.title);
    });

    it("lists the most recent year first", () => {
      const posts = [
        makePost(503, {
          date: new Date("2024-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(504, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
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
    it("renders reading time when reading info is present", () => {
      const posts = [
        makePost(505, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 4 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "4 min");
    });

    it("omits the reading-time markup when minutes are absent", () => {
      const { readingInfo: _unusedReadingInfo, ...postWithoutReadingInfo } =
        makePost(506, { date: new Date("2026-01-01") });
      const posts = [
        postWithoutReadingInfo,
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertNotMatch(html, /archive-reading-time/);
      assertNotMatch(html, /<span><\/span>/);
    });
  });

  describe("archive list structure", () => {
    it("wraps each post in an li.archive-item", () => {
      const posts = [
        makePost(507, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="archive-item"');
    });

    it("renders a time element with the ISO datetime attribute", () => {
      const posts = [
        makePost(508, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "<time");
      assertStringIncludes(html, 'class="archive-date"');
    });
  });

  describe("archive year-nav script", () => {
    it("loads the external year-nav script when multiple years are present", () => {
      const posts = [
        makePost(509, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(510, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(
        html,
        '<script src="/scripts/archive-year-nav.js" defer></script>',
      );
    });

    it("does not render the year-nav script when a single year is present", () => {
      const posts = [
        makePost(511, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(512, {
          date: new Date("2026-03-05"),
          readingInfo: { minutes: 3 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);

      assertNotMatch(html, /archive-year-nav\.js/);
      assertStringIncludes(html, 'aria-current="location"');
    });

    it("does not render the year-nav script when no posts are available", () => {
      const html = postsIndexPage(makeData([]), MOCK_HELPERS);
      assertNotMatch(html, /archive-year-nav\.js/);
    });

    it("renders year-nav links as hash anchors required by the runtime selector", () => {
      const posts = [
        makePost(513, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(514, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ];
      const html = postsIndexPage(makeData(posts), MOCK_HELPERS);
      const hrefMatches = [...html.matchAll(
        /class="archive-year-nav-link"[\s\S]*?href="([^"]+)"/g,
      )];

      assert(hrefMatches.length > 0);

      for (const match of hrefMatches) {
        const href = match[1];
        assert(href !== undefined);
        assertMatch(href, /^#archive-year-\d{4}$/);
      }
    });
  });
});
