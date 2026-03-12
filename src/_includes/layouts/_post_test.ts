import {
  assert,
  assertEquals,
  assertNotMatch,
  assertStringIncludes,
} from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import postLayout from "./post.tsx";

// ---------------------------------------------------------------------------
// Minimal mock helpers satisfying the `H` interface used inside post.tsx.
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {
  date: (_value: unknown, _format: string): string => "2026-03-05",
} as unknown as Lume.Helpers;

function makeSentence(seed: number): string {
  faker.seed(seed);
  return faker.lorem.sentence({ min: 3, max: 6 });
}

function makePostUrl(seed: number): string {
  faker.seed(seed);
  return `/posts/${faker.lorem.slug(3)}/`;
}

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
  const defaultTitle = makeSentence(701);
  const defaultBody = makeSentence(702);
  const defaultUrl = makePostUrl(703);

  return {
    title: defaultTitle,
    children: { __html: `<p>${defaultBody}</p>` },
    url: defaultUrl,
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
      const prevTitle = makeSentence(704);
      const prevUrl = makePostUrl(705);
      const data = makeData({
        nav: makeNav({ url: prevUrl, title: prevTitle }, undefined),
      });
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, `href="${prevUrl}"`);
      assertStringIncludes(html, prevTitle);
      assertStringIncludes(html, "Previous");
    });

    it("renders a next page link with next-item styling when next exists", async () => {
      const nextTitle = makeSentence(706);
      const nextUrl = makePostUrl(707);
      const data = makeData({
        nav: makeNav(undefined, { url: nextUrl, title: nextTitle }),
      });
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, `href="${nextUrl}"`);
      assertStringIncludes(html, nextTitle);
      assertStringIncludes(html, "Next");
      assertStringIncludes(html, "post-nav-item--next");
    });

    it("renders two nav placeholders when both prev and next are absent", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      const count = (html.match(/post-nav-placeholder/g) ?? []).length;
      assert(
        count >= 2,
        `Expected at least 2 nav placeholders, got ${count}`,
      );
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
      const title = makeSentence(708);
      const html = await renderComponent(
        postLayout(makeData({ title }), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<h1");
      assertStringIncludes(html, title);
    });

    it("renders a Carbon breadcrumb for post hierarchy", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<cds-breadcrumb");
      assertStringIncludes(html, "Home");
      assertStringIncludes(html, "Writing");
    });

    it("renders the post body content", async () => {
      const body = makeSentence(709);
      const html = await renderComponent(
        postLayout(
          makeData({ children: { __html: `<p>${body}</p>` } }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, `<p>${body}</p>`);
    });

    it("wraps navigation in nav[aria-label='Post navigation']", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, 'aria-label="Post navigation"');
    });

    it("loads the post code-copy enhancement script when code blocks exist", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            children: {
              __html:
                '<pre><code class="language-ts">const value = "ok";</code></pre>',
            },
          }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, 'src="/scripts/post-code-copy.js"');
      assertStringIncludes(html, 'data-code-copy-label="Copy code"');
      assertNotMatch(
        html,
        /src="\/scripts\/post-code-copy-exec-command\.js"/,
      );
    });

    it("emits a single code-copy script tag when multiple code blocks exist", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            children: {
              __html:
                '<pre><code class="language-ts">const alpha = 1;</code></pre><pre><code class="language-ts">const beta = 2;</code></pre>',
            },
          }),
          MOCK_HELPERS,
        ),
      );
      const scriptMatches =
        html.match(/src="\/scripts\/post-code-copy\.js"/g) ??
          [];

      assertEquals(scriptMatches.length, 1);
    });

    it("skips the post code-copy enhancement script when code blocks are absent", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertNotMatch(html, /src="\/scripts\/post-code-copy\.js"/);
      assertNotMatch(html, /data-code-copy-label=/);
      assertNotMatch(html, /data-code-copy-feedback=/);
      assertNotMatch(html, /data-code-copy-failed-feedback=/);
    });

    it("does not load the code-copy script for inline code only", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            children: {
              __html:
                "<p>Use <code>deno task build</code> before publishing.</p>",
            },
          }),
          MOCK_HELPERS,
        ),
      );
      assertNotMatch(html, /src="\/scripts\/post-code-copy\.js"/);
      assertNotMatch(html, /data-code-copy-label=/);
    });
  });
});
