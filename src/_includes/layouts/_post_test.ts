import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../../test/faker.ts";
import {
  asLumeData,
  asLumeHelpers,
  asOptionalLumeData,
} from "../../../test/lume.ts";
import layoutStyles from "../../styles/layout.css" with { type: "text" };

import postLayout from "./post.tsx";

const MOCK_HELPERS = asLumeHelpers({
  date: (_value: unknown, _format: string): string => "2026-03-05",
});

function makeSentence(seed: number): string {
  seedTestFaker(seed);
  return faker.lorem.sentence({ min: 3, max: 6 });
}

function makePostUrl(seed: number): string {
  seedTestFaker(seed);
  return `/posts/${faker.lorem.slug(3)}/`;
}

function makePostDate(seed: number): Date {
  seedTestFaker(seed);
  return faker.date.anytime();
}

function makeNav(
  prev: { url: string; title: string } | undefined,
  next: { url: string; title: string } | undefined,
) {
  return {
    previousPage: () => asOptionalLumeData(prev),
    nextPage: () => asOptionalLumeData(next),
  };
}

function makeData(
  overrides: {
    title?: string;
    description?: string;
    children?: { __html: string };
    url?: string;
    lang?: string;
    tags?: unknown;
    backlinks?: unknown;
    readingInfo?: { minutes?: number };
    nav?: ReturnType<typeof makeNav>;
    date?: Date;
  },
): Lume.Data {
  const defaultTitle = makeSentence(701);
  const defaultBody = makeSentence(702);
  const defaultUrl = makePostUrl(703);

  return asLumeData({
    title: defaultTitle,
    description: undefined,
    children: { __html: `<p>${defaultBody}</p>` },
    url: defaultUrl,
    date: makePostDate(712),
    readingInfo: undefined,
    backlinks: undefined,
    nav: makeNav(undefined, undefined),
    ...overrides,
  });
}

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

    it("omits the rail navigation when both prev and next are absent", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertNotMatch(html, /class="post-nav post-nav--rail"/);
    });
  });

  describe("URL fallback", () => {
    it("falls back to '/' when url is absent from data", async () => {
      // Construct data directly without a `url` key to test the `?? "/"` branch.
      const data = asLumeData({
        title: "Test Post",
        children: { __html: "<p>Body.</p>" },
        date: makePostDate(713),
        readingInfo: undefined,
        nav: makeNav(undefined, undefined),
      });
      const html = await renderComponent(postLayout(data, MOCK_HELPERS));
      assertStringIncludes(html, "<article");
    });
  });

  describe("structure", () => {
    it("wraps the post article in the wide shell", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(
        html,
        'class="site-page-shell site-page-shell--wide"',
      );
    });

    it("renders article.post-article", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertMatch(html, /class="[^"]*\bpost-article\b[^"]*"/);
    });

    it("renders the article heading, publication time, permalink, and body", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            title: "Entry title",
            description: "Entry summary",
            tags: ["design", "systems"],
            url: "/posts/entry-title/",
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, 'class="post-title"');
      assertStringIncludes(html, 'id="post-title"');
      assertStringIncludes(html, 'datetime="');
      assertStringIncludes(html, 'href="/posts/entry-title/"');
      assertStringIncludes(html, "Entry summary");
      assertStringIncludes(
        html,
        'class="post-content" lang="en" aria-labelledby="post-title"',
      );
    });

    it("uses BCP 47 language tags on localized post content", async () => {
      const html = await renderComponent(
        postLayout(makeData({ lang: "zh-hans" }), MOCK_HELPERS),
      );

      assertStringIncludes(
        html,
        'class="post-content" lang="zh-Hans" aria-labelledby="post-title"',
      );
      assertNotMatch(html, /lang="zhHans"/);
    });

    it("renders the post rail when tags are present", async () => {
      const html = await renderComponent(
        postLayout(makeData({ tags: ["devops", "cdn"] }), MOCK_HELPERS),
      );
      assertStringIncludes(
        html,
        'class="feature-layout feature-layout--with-rail"',
      );
      assertStringIncludes(html, 'class="feature-rail post-rail"');
      assertStringIncludes(html, 'class="post-tags post-tags--rail"');
      assertStringIncludes(html, 'href="/tags/devops/"');
      assertStringIncludes(html, 'href="/tags/cdn/"');
      assertStringIncludes(html, 'rel="tag"');
      assertStringIncludes(html, 'title="devops"');
      assertStringIncludes(html, 'title="cdn"');
      assertStringIncludes(html, 'class="tag-link tag-link--');
      assertNotMatch(html, /class="cds--tag cds--tag--/);
    });

    it("renders backlinks in the post rail when present", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            backlinks: [
              { title: "Earlier post", url: "/posts/earlier-post/" },
              { title: "Later post", url: "/posts/later-post/" },
            ],
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, "Referenced by");
      assertStringIncludes(html, 'class="post-backlinks-list"');
      assertStringIncludes(html, 'href="/posts/earlier-post/"');
      assertStringIncludes(html, 'href="/posts/later-post/"');
      assertStringIncludes(html, "Earlier post");
      assertStringIncludes(html, "Later post");
    });

    it("does not emit Pagefind filter or sort metadata for posts", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            date: new Date("2026-03-05T12:34:56.000Z"),
            tags: ["devops", "cdn"],
          }),
          MOCK_HELPERS,
        ),
      );

      assertNotMatch(html, /data-pagefind-filter="/);
      assertNotMatch(html, /data-pagefind-sort="/);
      assertNotMatch(html, /data-pagefind-ignore/);
    });

    it("ignores non-string tag entries before rendering the rail", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({ tags: ["devops", 42, { label: "ignored" }] }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, 'href="/tags/devops/"');
      assertNotMatch(html, /href="\/tags\/42\/"/);
      assertNotMatch(html, /ignored/);
    });

    it("renders h1 with the post title", async () => {
      const title = makeSentence(708);
      const html = await renderComponent(
        postLayout(makeData({ title }), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<h1");
      assertStringIncludes(html, title);
    });

    it("renders a semantic breadcrumb trail for post hierarchy", async () => {
      const html = await renderComponent(
        postLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, '<nav class="cds--breadcrumb"');
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Home");
      assertStringIncludes(html, "Articles");
      assertNotMatch(html, /cds--breadcrumb-current/);
      assertNotMatch(html, /aria-current="page"/);
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

    it("renders an integrated pagehead context, table of contents, and publication accordion for longform posts", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            description: "Context paragraph.",
            children: {
              __html:
                "<h2>First section</h2><p>Alpha.</p><h3>Second section</h3><p>Beta.</p>",
            },
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(
        html,
        'class="post-pagehead-grid"',
      );
      assertStringIncludes(html, 'class="post-pagehead-context"');
      assertStringIncludes(html, 'class="post-pagehead-summary pagehead-lead"');
      assertStringIncludes(html, "Context paragraph.");
      assertStringIncludes(html, 'class="post-summary-meta"');
      assertStringIncludes(html, 'href="#first-section"');
      assertStringIncludes(html, 'href="#second-section"');
      assertStringIncludes(html, 'id="first-section"');
      assertStringIncludes(html, 'id="second-section"');
      assertStringIncludes(html, 'class="post-details-section"');
      assertStringIncludes(html, "Publication details");
      assertStringIncludes(html, "data-blog-antd-root");
      assertStringIncludes(html, 'id="blog-antd-data"');
      assertStringIncludes(html, 'src="/scripts/blog-antd-post.js"');
      assertNotMatch(html, /post-summary-callout/);
    });

    it("keeps the pagehead compact when a post has no summary or outline", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            readingInfo: { minutes: 5 },
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, 'class="post-pagehead-grid"');
      assertNotMatch(html, /post-pagehead-context/);
    });

    it("wraps navigation in nav[aria-label='Post navigation']", async () => {
      const prevTitle = makeSentence(710);
      const prevUrl = makePostUrl(711);
      const html = await renderComponent(
        postLayout(
          makeData({
            nav: makeNav({ url: prevUrl, title: prevTitle }, undefined),
          }),
          MOCK_HELPERS,
        ),
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
      assertNotMatch(html, /post-code-copy-target/);
      assertNotMatch(html, /data-code-copy-label=/);
      // Legacy execCommand fallback was removed — clipboard API is universally supported.
    });

    it("emits localized code-copy dataset values only when they differ from defaults", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            lang: "fr",
            children: {
              __html:
                '<pre><code class="language-ts">const valeur = "ok";</code></pre>',
            },
          }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, 'data-code-copy-label="Copier le code"');
      assertStringIncludes(html, 'data-code-copy-feedback="Code copié"');
      assertStringIncludes(
        html,
        'data-code-copy-failed-feedback="Impossible de copier le code"',
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

describe("tag-link CSS contracts", () => {
  it("keeps navigational tag links distinct and monochrome", () => {
    assertStringIncludes(layoutStyles, ".tag-link::after");
    assertStringIncludes(
      layoutStyles,
      "font-size: var(--ph-text-xs);",
    );
    assertStringIncludes(layoutStyles, ".tag-link:hover .tag-link__label");
    assertStringIncludes(layoutStyles, "var(--ph-color-accent-fg)");
    assertNotMatch(layoutStyles, /var\(--site-tag-/);
  });
});
