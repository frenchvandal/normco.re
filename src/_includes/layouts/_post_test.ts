import {
  assertEquals,
  assertExists,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../../test/faker.ts";
import { getJSDOM } from "../../../test/jsdom.ts";
import {
  asLumeData,
  asLumeHelpers,
  asOptionalLumeData,
} from "../../../test/lume.ts";
import themeTokens from "../../styles/antd/theme-tokens.css" with {
  type: "text",
};
import featureStyles from "../../styles/components/feature.css" with {
  type: "text",
};
import postStyles from "../../styles/components/post.css" with {
  type: "text",
};
import { POST_MOBILE_TOOLS_MEDIA_QUERY } from "../../utils/layout-breakpoints.ts";
import {
  resolvePostTitleViewTransitionName,
  VIEW_TRANSITION_NAME_ATTRIBUTE,
} from "../../utils/view-transitions.ts";

import postLayout, { renderAfterMainContent } from "./post.tsx";

const JSDOM = await getJSDOM();

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
    git_created?: string;
    git?: {
      lastCommit?: {
        sha?: string;
        shortSha?: string;
        url?: string;
        commitUrl?: string;
      };
    };
    update_date?: string;
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
    git_created: undefined,
    git: undefined,
    update_date: undefined,
    ...overrides,
  });
}

describe("post.tsx layout", () => {
  describe("reading time", () => {
    it("renders reading time when present", async () => {
      const html = await renderComponent(
        postLayout(makeData({ readingInfo: { minutes: 5 } }), MOCK_HELPERS),
      );
      const readingTimeMatches = html.match(/5 min read/g) ?? [];

      assertStringIncludes(html, "5 min read");
      assertStringIncludes(html, "post-meta-separator");
      assertEquals(readingTimeMatches.length, 1);
      assertNotMatch(html, /<dt class="post-summary-term">Reading time<\/dt>/);
      assertNotMatch(html, /<dt class="post-details-term">Reading time<\/dt>/);
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
      assertStringIncludes(
        html,
        `${VIEW_TRANSITION_NAME_ATTRIBUTE}="${
          resolvePostTitleViewTransitionName(prevUrl)
        }"`,
      );
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
      assertStringIncludes(
        html,
        `${VIEW_TRANSITION_NAME_ATTRIBUTE}="${
          resolvePostTitleViewTransitionName(nextUrl)
        }"`,
      );
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
        `${VIEW_TRANSITION_NAME_ATTRIBUTE}="${
          resolvePostTitleViewTransitionName("/posts/entry-title/")
        }"`,
      );
      assertStringIncludes(
        html,
        'class="post-content" lang="en" aria-labelledby="post-title"',
      );
    });

    it("renders git-created and last-commit metadata when available", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            git_created: "2026-03-14T08:00:00+08:00",
            update_date: "2026-03-27T10:09:39+08:00",
            git: {
              lastCommit: {
                sha: "515315d176f8c4bd88ae71d4860b676ab1b2366b",
                shortSha: "515315d",
                url:
                  "https://github.com/frenchvandal/normco.re/commits/master/src/posts/example-post/en.md",
              },
            },
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, "Last updated");
      assertStringIncludes(html, "Commit");
      assertStringIncludes(html, "515315d");
      assertNotMatch(html, /<dt class="post-details-term">Created<\/dt>/);
      assertStringIncludes(
        html,
        'href="https://github.com/frenchvandal/normco.re/commits/master/src/posts/example-post/en.md"',
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
      assertStringIncludes(html, '<nav class="site-breadcrumb"');
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Home");
      assertStringIncludes(html, "Articles");
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

    it("renders the integrated post shell with outline and publication details", async () => {
      const html = await renderComponent(
        postLayout(
          makeData({
            description: "Context paragraph.",
            tags: ["design"],
            children: {
              __html:
                "<h2>First section</h2><p>Alpha.</p><h3>Second section</h3><p>Beta.</p>",
            },
          }),
          MOCK_HELPERS,
        ),
      );
      const afterMainHtml = await renderComponent(
        renderAfterMainContent(
          makeData({
            description: "Context paragraph.",
            tags: ["design"],
            children: {
              __html:
                "<h2>First section</h2><p>Alpha.</p><h3>Second section</h3><p>Beta.</p>",
            },
          }),
          MOCK_HELPERS,
        ),
      );

      assertStringIncludes(html, 'class="post-pagehead-grid"');
      assertStringIncludes(html, 'class="post-pagehead-context"');
      assertStringIncludes(html, 'class="post-pagehead-summary pagehead-lead"');
      assertStringIncludes(html, "Context paragraph.");
      assertStringIncludes(html, 'class="post-summary-meta"');
      assertStringIncludes(html, 'class="post-inline-anchor"');
      assertStringIncludes(
        html,
        'class="post-outline-nav post-outline-nav--inline"',
      );
      assertStringIncludes(html, 'href="#first-section"');
      assertStringIncludes(html, 'href="#second-section"');
      assertStringIncludes(html, 'id="first-section"');
      assertStringIncludes(html, 'id="second-section"');
      assertStringIncludes(html, 'class="post-details-section"');
      assertStringIncludes(
        afterMainHtml,
        'data-post-mobile-tools-open=""',
      );
      assertStringIncludes(
        afterMainHtml,
        'data-post-mobile-tools=""',
      );
      assertStringIncludes(
        afterMainHtml,
        `class="post-mobile-tools" aria-label="Post tools"`,
      );
      assertStringIncludes(afterMainHtml, "Reading tools");
      assertStringIncludes(
        afterMainHtml,
        "Tags, backlinks, and what to read next.",
      );
      assertStringIncludes(
        afterMainHtml,
        'class="post-mobile-tools-head-copy"',
      );
      assertStringIncludes(
        afterMainHtml,
        'class="post-mobile-tools-description"',
      );
      assertStringIncludes(html, 'src="/scripts/post-mobile-tools-loader.js"');
      assertStringIncludes(
        html,
        `data-media-query="${POST_MOBILE_TOOLS_MEDIA_QUERY}"`,
      );
      assertStringIncludes(html, "Publication details");
      assertStringIncludes(afterMainHtml, 'class="post-reading-progress"');
      assertStringIncludes(afterMainHtml, 'class="post-backtop"');

      const dom = new JSDOM(afterMainHtml);
      const document = dom.window.document;
      const postReadingProgress = document.querySelector(
        ".post-reading-progress",
      );
      const postMobileTools = document.querySelector(".post-mobile-tools");
      const postBackToTop = document.querySelector(".post-backtop");
      assertExists(postReadingProgress);
      assertExists(postMobileTools);
      assertExists(postBackToTop);
      assertEquals(postReadingProgress.closest(".site-page-shell"), null);
      assertEquals(postMobileTools.closest(".site-page-shell"), null);
      assertEquals(postBackToTop.closest(".site-page-shell"), null);
      assertEquals(postReadingProgress.closest("main.site-main"), null);
      assertEquals(postMobileTools.closest("main.site-main"), null);
      assertEquals(postBackToTop.closest("main.site-main"), null);
      assertNotMatch(html, /data-blog-antd-root/);
      assertNotMatch(html, /blog-antd-post\.js/);
      assertNotMatch(html, /post-summary-callout/);
    });

    it("keeps the outline above the article body on mobile without loading the tools sheet when it is the only helper", async () => {
      const data = makeData({
        children: {
          __html:
            "<h2>Section one</h2><p>Alpha.</p><h3>Section two</h3><p>Beta.</p>",
        },
      });
      const html = await renderComponent(
        postLayout(data, MOCK_HELPERS),
      );
      const afterMainHtml = await renderComponent(
        renderAfterMainContent(data, MOCK_HELPERS),
      );

      assertStringIncludes(html, 'class="post-inline-anchor"');
      assertStringIncludes(
        html,
        'class="post-outline-nav post-outline-nav--inline"',
      );
      assertStringIncludes(
        html,
        'class="feature-rail post-rail post-rail--outline-only"',
      );
      assertStringIncludes(afterMainHtml, 'class="post-backtop"');
      assertNotMatch(html, /post-mobile-tools-loader\.js/);
      assertNotMatch(html, /data-post-mobile-tools-open=""/);
      assertNotMatch(afterMainHtml, /data-post-mobile-tools-open=""/);
    });

    it("omits the summary copy when a post has no editorial summary", async () => {
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
      assertNotMatch(html, /post-mobile-tools-loader\.js/);
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
  it("keeps navigational tag links distinct while using a restrained accent surface", () => {
    assertStringIncludes(featureStyles, ".tag-link::after");
    assertStringIncludes(
      featureStyles,
      "font-size: var(--ph-text-xs);",
    );
    assertStringIncludes(featureStyles, ".tag-link:hover .tag-link__label");
    assertStringIncludes(featureStyles, ".tag-link--blue");
    assertStringIncludes(
      featureStyles,
      "--ph-tag-tone: var(--ph-tag-preset-blue);",
    );
    assertStringIncludes(featureStyles, "var(--ph-tag-tone) 12%");
    assertStringIncludes(featureStyles, "var(--ph-tag-tone) 18%");
    assertNotMatch(featureStyles, /var\(--site-tag-/);
  });
});

describe("tag preset token contracts", () => {
  it("keeps preset tag tones color-scheme aware", () => {
    const tagPresetMatches = themeTokens.match(
      /--ph-tag-preset-[a-z]+:\s*light-dark\(/g,
    ) ?? [];
    const oklchPresetMatches = themeTokens.match(
      /--ph-tag-preset-[a-z]+:\s*light-dark\(\s*oklch\([^)]*\),\s*oklch\([^)]*\)\s*\);/g,
    ) ?? [];

    assertEquals(tagPresetMatches.length, 10);
    assertEquals(oklchPresetMatches.length, 10);
    assertStringIncludes(themeTokens, "--ph-tag-preset-blue:");
    assertStringIncludes(themeTokens, "--ph-tag-preset-gray:");
  });
});

describe("post mobile visual contracts", () => {
  it("keeps inline code sizing bound to the shared token layer", () => {
    assertStringIncludes(postStyles, "font-size: var(--ph-text-code-inline);");
  });

  it("defines the mobile nav offset token as a length for calc() usage", () => {
    assertStringIncludes(themeTokens, "--ph-mobile-nav-offset: 0px;");
  });

  it("keeps the mobile tools sheet safe-area aware and rail-aware", () => {
    assertStringIncludes(postStyles, ".post-mobile-tools-dialog");
    assertStringIncludes(postStyles, ".post-reading-progress {");
    assertStringIncludes(postStyles, "animation-timeline: scroll();");
    assertStringIncludes(postStyles, ".post-inline-anchor");
    assertStringIncludes(postStyles, ".post-outline-nav--inline");
    assertStringIncludes(postStyles, ".post-outline-nav--rail");
    assertStringIncludes(postStyles, ".post-backtop");
    assertStringIncludes(postStyles, ".post-backtop__button");
    assertStringIncludes(postStyles, ".post-backtop__icon");
    assertStringIncludes(
      postStyles,
      "inset-inline-start: max(var(--ph-shell-gutter), env(safe-area-inset-left));",
    );
    assertStringIncludes(
      postStyles,
      "inset-inline-end: max(var(--ph-shell-gutter), env(safe-area-inset-right));",
    );
    assertStringIncludes(
      postStyles,
      "padding-block-end: calc(env(safe-area-inset-bottom) + var(--ph-space-4));",
    );
    assertStringIncludes(postStyles, ".post-mobile-tools-handle");
    assertStringIncludes(postStyles, ".post-mobile-tools-head-copy");
    assertStringIncludes(postStyles, ".post-mobile-tools-description");
    assertStringIncludes(postStyles, ".post-mobile-tools-trigger__icon");
    assertStringIncludes(postStyles, ".post-mobile-tools-trigger__hint");
    assertStringIncludes(postStyles, ".post-mobile-tools-trigger__count");
    assertStringIncludes(postStyles, ".post-mobile-tools-section__count");
    assertStringIncludes(
      postStyles,
      "var(--ph-mobile-nav-offset)",
    );
    assertStringIncludes(
      postStyles,
      "inset-inline-start: calc(",
    );
    assertStringIncludes(postStyles, "transition-behavior: allow-discrete;");
    assertStringIncludes(
      postStyles,
      'html[data-post-mobile-tools-ready="true"] .post-rail',
    );
  });
});
