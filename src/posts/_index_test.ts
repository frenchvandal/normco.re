import {
  assertEquals,
  assertExists,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";
import { getJSDOM } from "../../test/jsdom.ts";
import { asLumeData, asLumeHelpers } from "../../test/lume.ts";
import blogAntdStyles from "../styles/blog-antd.css" with { type: "text" };

import postsIndexPage, {
  renderAfterMainContent,
  searchIndexed,
} from "./index.page.tsx";

const JSDOM = await getJSDOM();

const MOCK_HELPERS = asLumeHelpers({
  date: (value: unknown, format: string): string => {
    if (format === "ATOM" && value instanceof Date) {
      return value.toISOString();
    }

    return "Mar 5";
  },
});

type MockPost = {
  title: string;
  url: string;
  date: unknown;
  readingInfo?: { minutes?: number };
  description?: string;
  tags?: readonly string[];
};

function makeData(posts: readonly MockPost[]): Lume.Data {
  return asLumeData({
    search: {
      pages: (_query: string, _sort: string) => posts,
    },
    comp: {
      PostCard: (props: Record<string, unknown>) =>
        `<article class="post-card ${
          props["className"] ?? ""
        }"><time class="post-card-date" datetime="${props["dateIso"]}">${
          props["dateStr"]
        }</time><h3 class="post-card-title"><a class="post-card-link" href="${
          props["url"]
        }">${props["title"]}</a></h3>${
          props["summary"]
            ? `<p class="post-card-summary">${props["summary"]}</p>`
            : ""
        }${
          props["readingLabel"]
            ? `<span class="post-card-reading-time">${
              props["readingLabel"]
            }</span>`
            : ""
        }</article>`,
    },
  });
}

function makePost(
  seed: number,
  overrides: Partial<MockPost> = {},
): MockPost {
  seedTestFaker(seed);
  const includeReadingInfo = faker.datatype.boolean();

  return {
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    url: `/posts/${faker.lorem.slug(3)}/`,
    date: faker.date.past(),
    description: faker.lorem.sentence({ min: 4, max: 10 }),
    ...(includeReadingInfo
      ? { readingInfo: { minutes: faker.number.int({ min: 1, max: 12 }) } }
      : {}),
    ...overrides,
  };
}

describe("posts/index.page.tsx", () => {
  describe("shell", () => {
    it("wraps the listing in the wide shell and feature main region", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive"',
      );
      assertStringIncludes(html, 'class="feature-main"');
    });

    it("keeps the archive fully static without a mobile bootstrap payload", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertNotMatch(html, /data-blog-antd-root/);
      assertNotMatch(html, /id="blog-antd-data"/);
      assertNotMatch(html, /blog-antd-archive\.js/);
      assertNotMatch(html, /window\.matchMedia/);
    });

    it("opts the articles page out of the Pagefind body region", () => {
      assertEquals(searchIndexed, false);
    });

    it('renders the "Articles" heading', async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, "Articles");
    });
  });

  describe("empty state", () => {
    it("renders the shared inline state panel when no posts exist", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);
      assertStringIncludes(html, 'class="state-panel state-panel--inline"');
      assertStringIncludes(html, "No articles yet.");
      assertStringIncludes(html, 'href="/"');
      assertNotMatch(html, /class="archive-list"/);
    });
  });

  describe("breadcrumb", () => {
    it("omits the redundant breadcrumb on the top-level archive page", async () => {
      const html = await postsIndexPage(makeData([]), MOCK_HELPERS);

      assertNotMatch(html, /aria-current="page"/);
    });

    it("does not render a localized archive breadcrumb in French", async () => {
      const html = await postsIndexPage(
        asLumeData({ ...makeData([]), lang: "fr" }),
        MOCK_HELPERS,
      );
      assertNotMatch(html, /Fil d’Ariane des articles/);
    });
  });

  describe("post listing", () => {
    it("renders a chronological archive timeline with month navigation", async () => {
      const posts = [
        makePost(507, {
          date: new Date("2026-01-01"),
          readingInfo: { minutes: 1 },
        }),
        makePost(508, {
          date: new Date("2025-01-01"),
          readingInfo: { minutes: 2 },
        }),
      ] as const;
      const [firstPost, secondPost] = posts;
      const html = await postsIndexPage(makeData(posts), MOCK_HELPERS);
      assertStringIncludes(
        html,
        'class="blog-antd-archive-layout blog-antd-archive-layout--with-nav"',
      );
      assertStringIncludes(html, 'class="blog-antd-archive-timeline"');
      assertStringIncludes(html, 'class="blog-antd-archive-anchor-list"');
      assertStringIncludes(
        html,
        'class="blog-antd-archive-month-group__year-count"',
      );
      assertStringIncludes(html, 'class="blog-antd-archive-nav__hint"');
      assertStringIncludes(html, 'class="blog-antd-archive-nav__latest"');
      assertStringIncludes(
        html,
        "Jump by month or return to the latest entries.",
      );
      assertStringIncludes(html, "Latest");
      assertStringIncludes(html, firstPost.title);
      assertStringIncludes(html, secondPost.title);
      assertStringIncludes(html, "2 posts published");
      assertStringIncludes(html, 'class="blog-antd-archive-timeline__link"');
    });

    it("renders reading time when available", async () => {
      const html = await postsIndexPage(
        makeData([
          makePost(509, {
            date: new Date("2026-01-01"),
            readingInfo: { minutes: 4 },
            tags: ["design"],
          }),
        ]),
        MOCK_HELPERS,
      );
      assertNotMatch(html, /blog-antd-archive-layout--with-nav/);
      assertStringIncludes(html, "4 min");
      assertStringIncludes(html, 'class="tag-link tag-link--blue"');
      assertStringIncludes(
        html,
        'class="blog-antd-archive-timeline__separator" aria-hidden="true">·</span>',
      );
    });

    it("renders a static back-to-top jump link for long archive sessions", async () => {
      const html = await postsIndexPage(
        makeData([
          makePost(511, {
            date: new Date("2026-02-01"),
          }),
        ]),
        MOCK_HELPERS,
      );
      const afterMainHtml = await renderComponent(
        renderAfterMainContent(
          makeData([
            makePost(511, {
              date: new Date("2026-02-01"),
            }),
          ]),
          MOCK_HELPERS,
        ),
      );

      assertNotMatch(html, /blog-antd-archive-backtop/);
      assertStringIncludes(afterMainHtml, "blog-antd-archive-backtop");
      assertStringIncludes(afterMainHtml, 'href="#archive-title"');
      assertStringIncludes(
        afterMainHtml,
        'class="blog-antd-backtop__button blog-antd-archive-backtop__button"',
      );
      assertStringIncludes(
        afterMainHtml,
        'class="sr-only blog-antd-archive-backtop__label">Back to top</span>',
      );

      const dom = new JSDOM(afterMainHtml);
      const backToTop = dom.window.document.querySelector(
        ".blog-antd-archive-backtop",
      );
      assertExists(backToTop);
      assertEquals(backToTop.closest(".site-page-shell"), null);
      assertEquals(backToTop.closest("main.site-main"), null);
    });

    it("omits reading-time markup when minutes are absent", async () => {
      const { readingInfo: _unusedReadingInfo, ...postWithoutReadingInfo } =
        makePost(510, {
          date: new Date("2026-01-01"),
          title: "Quiet article",
          description: "Plain summary copy.",
        });
      const html = await postsIndexPage(
        makeData([postWithoutReadingInfo]),
        MOCK_HELPERS,
      );
      assertNotMatch(html, /\d+\smin/u);
    });

    it("escapes unsafe archive data before interpolating it into the timeline", async () => {
      seedTestFaker(520);
      const unsafeDate = faker.date.anytime();
      const html = await postsIndexPage(
        asLumeData({
          search: {
            pages: () => [{
              title: "Unsafe <title>",
              url: '/posts/"unsafe"/',
              date: unsafeDate,
            }],
          },
        }),
        MOCK_HELPERS,
      );

      assertStringIncludes(html, "Unsafe &lt;title&gt;");
      assertStringIncludes(html, 'href="/posts/&quot;unsafe&quot;/"');
      assertStringIncludes(html, 'class="blog-antd-archive-timeline__title"');
      assertStringIncludes(html, 'class="blog-antd-archive-timeline__link"');
    });
  });

  describe("archive CSS contracts", () => {
    it("keeps the timeline lane full width instead of shrinking to its content", () => {
      assertStringIncludes(
        blogAntdStyles,
        "grid-template-columns: minmax(0, 1fr);",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-layout--with-nav",
      );
      assertStringIncludes(blogAntdStyles, "inline-size: 100%;");
      assertStringIncludes(blogAntdStyles, "min-inline-size: 0;");
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-timeline__separator",
      );
      assertStringIncludes(blogAntdStyles, ".blog-antd-story-card__meta {");
      assertStringIncludes(
        blogAntdStyles,
        "font-variant-numeric: tabular-nums;",
      );
    });

    it("keeps the mobile archive nav sticky and safe-area aware", () => {
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-nav",
      );
      assertStringIncludes(
        blogAntdStyles,
        "top: calc(var(--ph-header-height) + var(--ph-space-2));",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-page--archive",
      );
      assertStringIncludes(
        blogAntdStyles,
        "env(safe-area-inset-bottom)",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-backtop",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-backtop__button",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-month-group__year-count",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-nav__latest",
      );
      assertStringIncludes(
        blogAntdStyles,
        ".blog-antd-archive-timeline__link",
      );
      assertStringIncludes(
        blogAntdStyles,
        "scroll-snap-type: x proximity;",
      );
      assertStringIncludes(blogAntdStyles, "var(--ph-mobile-nav-offset)");
    });
  });
});
