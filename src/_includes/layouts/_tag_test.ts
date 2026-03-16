import { assertMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";

import tagLayout from "./tag.tsx";

const MOCK_HELPERS = {
  date: (_value: unknown, _format: string): string => "2026-03-05",
} as unknown as Lume.Helpers;

function makePost(seed: number, overrides: Partial<Lume.Data> = {}): Lume.Data {
  return {
    title: `Post ${seed}`,
    url: `/posts/post-${seed}/`,
    date: new Date(`2026-03-${String(seed).padStart(2, "0")}`),
    readingInfo: { minutes: seed },
    ...overrides,
  } as unknown as Lume.Data;
}

describe("tag.tsx layout", () => {
  it("wraps the tag page in the wide shell and feature rail layout", async () => {
    const html = await renderComponent(
      tagLayout(
        {
          lang: "en",
          tagName: "design",
          posts: [makePost(1)],
          comp: {
            PostCard: ({ title, url }: { title: string; url: string }) =>
              `<article class="post-card"><h3><a href="${url}">${title}</a></h3></article>`,
          },
        } as unknown as Lume.Data,
        MOCK_HELPERS,
      ),
    );

    assertStringIncludes(html, 'class="site-page-shell site-page-shell--wide"');
    assertStringIncludes(
      html,
      'class="feature-layout feature-layout--with-rail"',
    );
    assertStringIncludes(html, 'class="feature-rail tag-page-rail"');
  });

  it("renders breadcrumb, post list, and archive return link", async () => {
    const html = await renderComponent(
      tagLayout(
        {
          lang: "fr",
          tagName: "design",
          posts: [makePost(2)],
          comp: {
            PostCard: ({ title, url }: { title: string; url: string }) =>
              `<article class="post-card"><h3><a href="${url}">${title}</a></h3></article>`,
          },
        } as unknown as Lume.Data,
        MOCK_HELPERS,
      ),
    );

    assertStringIncludes(html, 'href="/fr/"');
    assertStringIncludes(html, 'href="/fr/posts/"');
    assertStringIncludes(html, "design");
    assertStringIncludes(html, 'href="/fr/posts/" class="feature-link"');
    assertStringIncludes(html, 'class="archive-list"');
    assertStringIncludes(html, 'href="/posts/post-2/"');
    assertMatch(html, /class="cds--tag cds--tag--[a-z]+ tag-page-current-tag"/);
  });
});
