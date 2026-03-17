import {
  assert,
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker, seedTestFaker } from "../../test/faker.ts";

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
    comp: {
      PostCard: (props: Record<string, unknown>) =>
        `<article class="post-card"><time class="post-card-date">${
          props["dateStr"]
        }</time><h3 class="post-card-title"><a href="${props["url"]}">${
          props["title"]
        }</a></h3>${
          props["readingLabel"]
            ? `<span class="post-card-reading-time">${
              props["readingLabel"]
            }</span>`
            : ""
        }</article>`,
    },
  } as unknown as Lume.Data;
}

function makePost(
  seed: number,
  overrides: Partial<MockPost> = {},
): MockPost {
  seedTestFaker(seed);
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
  describe("shell", () => {
    it("wraps the archive in the wide listing shell", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="site-page-shell site-page-shell--wide"',
      );
    });
  });

  describe("page title", () => {
    it('renders the "Writing" heading', async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, "Writing");
    });
  });

  describe("empty state", () => {
    it("renders no year sections when there are no posts", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertNotMatch(html, /archive-year/);
    });

    it("renders the shared inline state panel when no posts exist", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="state-panel state-panel--inline"');
      assertStringIncludes(html, "Archive is empty.");
      assertStringIncludes(html, 'href="/"');
    });
  });

  describe("breadcrumb", () => {
    it("uses the shared ordered-list Carbon breadcrumb structure", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="cds--breadcrumb-list"');
      assertStringIncludes(html, 'class="cds--breadcrumb-link"');
      assertStringIncludes(html, 'class="cds--breadcrumb-current"');
      assertNotMatch(html, /cds--breadcrumb-separator/);
    });

    it("escapes localized apostrophes in French archive chrome", async () => {
      const posts = [
        makePost(901, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(902, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ];
      const html = await postsIndexPage(
        { ...makeData(posts), lang: "fr" } as Lume.Data,
        MOCK_HELPERS,
      );

      assertStringIncludes(html, "Fil d&#39;Ariane des archives");
      assertStringIncludes(html, "Années d&#39;archives");
      assertNotMatch(html, /Fil d'Ariane des archives/);
    });
  });

  describe("year grouping", () => {
    it("groups posts by year", async () => {
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
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "2026");
      assertStringIncludes(html, "2025");
      assertStringIncludes(html, postA.title);
      assertStringIncludes(html, postB.title);
    });

    it("lists the most recent year first", async () => {
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
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      const idx2026 = html.indexOf("2026");
      const idx2024 = html.indexOf("2024");
      assertEquals(idx2026 < idx2024, true);
    });

    it("falls back to the current year when post.date is not a Date instance", async () => {
      const posts = [
        { title: "Strange", url: "/posts/s/", date: "not-a-date" },
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      const currentYear = new Date().getFullYear().toString();
      assertStringIncludes(html, currentYear);
    });
  });

  describe("reading time", () => {
    it("renders reading time when reading info is present", async () => {
      const posts = [
        makePost(505, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 4 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "4 min");
    });

    it("omits the reading-time markup when minutes are absent", async () => {
      const { readingInfo: _unusedReadingInfo, ...postWithoutReadingInfo } =
        makePost(506, { date: new Date("2026-01-01") });
      const posts = [
        postWithoutReadingInfo,
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertNotMatch(html, /post-card-reading-time/);
      assertNotMatch(html, /<span><\/span>/);
    });
  });

  describe("archive list structure", () => {
    it("wraps each post in an li.archive-list-item", async () => {
      const posts = [
        makePost(507, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, 'class="archive-list-item"');
      assertStringIncludes(html, 'class="post-card"');
    });

    it("renders a time element with the post-card date class", async () => {
      const posts = [
        makePost(508, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(html, "<time");
      assertStringIncludes(html, 'class="post-card-date"');
    });

    it("falls back to a safe card renderer when PostCard is unavailable", async () => {
      seedTestFaker(520);
      const unsafeDate = faker.date.anytime();
      const html = await postsIndexPage({
        search: {
          pages: () => [{
            title: "Unsafe <title>",
            url: '/posts/"unsafe"/',
            date: unsafeDate,
          }],
        },
        comp: {},
      } as unknown as Lume.Data, MOCK_HELPERS);

      assertStringIncludes(html, "Unsafe &lt;title&gt;");
      assertStringIncludes(html, 'href="/posts/&quot;unsafe&quot;/"');
    });
  });

  describe("archive year navigation", () => {
    it("renders year jump links when multiple years are present", async () => {
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
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="feature-layout feature-layout--with-rail"',
      );
      assertStringIncludes(html, 'class="feature-rail archive-rail"');
      assertStringIncludes(html, 'class="feature-card archive-year-card"');
      assertStringIncludes(html, 'class="archive-year-nav"');
      assertStringIncludes(html, 'href="#archive-year-2026"');
      assertStringIncludes(html, 'href="#archive-year-2025"');
      assertMatch(html, /class="archive-year-nav-link"/);
      assertStringIncludes(html, 'class="archive-year-nav-link-label"');
      assertStringIncludes(html, 'class="archive-year-nav-link-meta"');
      assertNotMatch(
        html,
        /class="[^"]*cds--tag[^"]*archive-year-nav-link[^"]*"/,
      );
    });

    it("does not render a runtime script for year navigation", async () => {
      const posts = [
        makePost(515, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(516, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertNotMatch(html, /archive-year-nav\.js/);
    });

    it("hides the year jump navigation when a single year is present", async () => {
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
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);

      assertNotMatch(html, /class="archive-year-nav"/);
    });

    it("does not render the year jump navigation when no posts are available", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertNotMatch(html, /class="archive-year-nav"/);
    });

    it("renders year jump links as hash anchors", async () => {
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
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      const hrefMatches = [...html.matchAll(
        /<a[^>]*href="([^"]+)"[^>]*class="[^"]*archive-year-nav-link[^"]*"/g,
      )];

      assert(hrefMatches.length > 0);

      for (const match of hrefMatches) {
        const href = match[1];
        assert(href !== undefined);
        assertMatch(href, /^#archive-year-\d{4}$/);
      }
    });

    it("renders the year summary as a Carbon tag instead of plain recap text", async () => {
      const posts = [
        makePost(517, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);

      assertMatch(html, /class="cds--tag cds--tag--gray archive-year-summary"/);
      assertNotMatch(html, /archive-year-nav-count/);
    });

    it("keeps year navigation distinct from article taxonomy tags", async () => {
      const posts = [
        makePost(518, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(519, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ];
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);

      assertMatch(
        html,
        /<span class="archive-year-nav-link-meta">1 post published<\/span>/,
      );
      assertNotMatch(
        html,
        /<a[^>]*class="[^"]*archive-year-nav-link[^"]*cds--tag/,
      );
    });
  });

  describe("pagination", () => {
    it("does not render placeholder pagination controls before routing exists", async () => {
      const posts = Array.from(
        { length: 12 },
        (_, index) =>
          makePost(700 + index, {
            date: new Date(`2026-03-${String(index + 1).padStart(2, "0")}`),
            readingInfo: { minutes: 3 },
          }),
      );
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);

      assertNotMatch(html, /class="cds--pagination"/);
    });
  });
});
