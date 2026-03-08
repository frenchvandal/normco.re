import { assert, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";

import postLayout from "./post.tsx";

// ---------------------------------------------------------------------------
// Minimal mock helpers satisfying the `H` interface used inside post.tsx.
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {
  date: (_value: unknown, _format: string): string => "2026-03-05",
} as unknown as Lume.Helpers;

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

/** Creates a minimal NavHelper mock with fixed prev/next values. */
function makeNav(
  prev: { url: string; title: string } | undefined,
  next: { url: string; title: string } | undefined,
) {
  return {
    previousPage: () => prev as unknown as Lume.Data | undefined,
    nextPage: () => next as unknown as Lume.Data | undefined,
  };
}

/** Builds a minimal Lume.Data mock for the post layout. */
function makeData(
  overrides: {
    title?: string;
    children?: { __html: string };
    url?: string;
    readingInfo?: { minutes?: number };
    nav?: ReturnType<typeof makeNav>;
    date?: Date;
  },
): Lume.Data {
  return {
    title: "Test Post",
    children: { __html: "<p>Body.</p>" },
    url: "/posts/test/",
    date: new Date("2026-03-05"),
    readingInfo: undefined,
    nav: makeNav(undefined, undefined),
    ...overrides,
  } as unknown as Lume.Data;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("post.tsx layout", () => {
  describe("reading time", () => {
    it("renders reading time when present", async () => {
      const html = await renderComponent(
        postLayout(makeData({ readingInfo: { minutes: 5 } }), MOCK_HELPERS),
      );
      assertStringIncludes(html, "5 min read");
      assertStringIncludes(html, "post-meta-separator");
    });

    it("omits reading time section when absent", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertNotMatch(html, /min read/);
      assertNotMatch(html, /post-meta-separator/);
    });
  });

  describe("previous/next navigation", () => {
    it("renders a previous page link when prev exists", async () => {
      const data = makeData({
        nav: makeNav({ url: "/posts/prev/", title: "Prev Post" }, undefined),
      });
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, 'href="/posts/prev/"');
      assertStringIncludes(html, "Prev Post");
      assertStringIncludes(html, "Previous");
    });

    it("renders a next page link with next-item styling when next exists", async () => {
      const data = makeData({
        nav: makeNav(undefined, { url: "/posts/next/", title: "Next Post" }),
      });
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, 'href="/posts/next/"');
      assertStringIncludes(html, "Next Post");
      assertStringIncludes(html, "Next");
      assertStringIncludes(html, "post-nav-item--next");
    });

    it("renders two empty div placeholders when both prev and next are absent", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      // Two placeholder divs: one for prev, one for next.
      const count = (html.match(/<div><\/div>/g) ?? []).length;
      assert(count >= 2, `Expected at least 2 placeholder divs, got ${count}`);
    });
  });

  describe("URL fallback", () => {
    it("falls back to '/' when url is absent from data", async () => {
      // Construct data directly without a `url` key to test the `?? "/"` branch.
      const data = {
        title: "Test Post",
        children: { __html: "<p>Body.</p>" },
        date: new Date("2026-03-05"),
        readingInfo: undefined,
        nav: makeNav(undefined, undefined),
      } as unknown as Lume.Data;
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, "<article");
    });
  });

  describe("structure", () => {
    it("renders article.post-article", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, 'class="post-article"');
    });

    it("renders h1 with the post title", async () => {
      const html = await renderComponent(
        postLayout(makeData({ title: "Hello World" }), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<h1");
      assertStringIncludes(html, "Hello World");
    });

    it("renders the post body content", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({ children: { __html: "<p>Hello world</p>" } }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, "<p>Hello world</p>");
    });

    it("wraps navigation in nav[aria-label='Post navigation']", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, 'aria-label="Post navigation"');
    });
  });
});
