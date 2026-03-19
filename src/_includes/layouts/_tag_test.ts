import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../../test/faker.ts";
import { asLumeData, asLumeHelpers } from "../../../test/lume.ts";

import tagLayout from "./tag.tsx";

const MOCK_HELPERS = asLumeHelpers({
  date: (_value: unknown, _format: string): string => "2026-03-05",
});

function makePost(seed: number, overrides: Partial<Lume.Data> = {}): Lume.Data {
  seedTestFaker(seed);
  const slug = faker.lorem.slug(3);
  return asLumeData({
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    url: `/posts/${slug}/`,
    date: faker.date.past(),
    readingInfo: { minutes: faker.number.int({ min: 1, max: 12 }) },
    ...overrides,
  });
}

describe("tag.tsx layout", () => {
  it("wraps the tag page in the wide shell and feature rail layout", async () => {
    const html = await renderComponent(
      tagLayout(
        asLumeData({
          lang: "en",
          tagName: "design",
          posts: [makePost(1)],
          comp: {
            PostCard: ({ title, url }: { title: string; url: string }) =>
              `<article class="post-card h-entry"><h3 class="p-name"><a class="u-url u-uid" href="${url}">${title}</a></h3></article>`,
          },
        }),
        MOCK_HELPERS,
      ),
    );

    assertStringIncludes(html, 'class="site-page-shell site-page-shell--wide"');
    assertStringIncludes(
      html,
      'class="feature-layout feature-layout--with-rail"',
    );
    assertStringIncludes(html, 'class="feature-main h-feed"');
    assertStringIncludes(html, 'class="feature-rail tag-page-rail"');
    assertStringIncludes(html, 'class="u-url sr-only" href="/posts/"');
    assertStringIncludes(html, 'class="p-author h-card sr-only"');
  });

  it("renders breadcrumb, post list, and archive return link", async () => {
    const post = makePost(2);
    const html = await renderComponent(
      tagLayout(
        asLumeData({
          lang: "fr",
          tagName: "design",
          posts: [post],
          comp: {
            PostCard: ({ title, url }: { title: string; url: string }) =>
              `<article class="post-card h-entry"><h3 class="p-name"><a class="u-url u-uid" href="${url}">${title}</a></h3></article>`,
          },
        }),
        MOCK_HELPERS,
      ),
    );

    assertStringIncludes(html, 'href="/fr/"');
    assertStringIncludes(html, 'href="/fr/posts/"');
    assertStringIncludes(html, 'class="cds--tile pagehead tag-pagehead"');
    assertStringIncludes(html, "design");
    assertStringIncludes(html, 'href="/fr/posts/" class="feature-link"');
    assertStringIncludes(html, 'class="archive-list"');
    assertStringIncludes(html, `href="${post.url}"`);
    assertMatch(html, /class="cds--tag cds--tag--[a-z]+ tag-page-current-tag"/);
    assertStringIncludes(html, 'title="design"');
  });

  it("escapes tag labels before interpolating them into the page shell", async () => {
    const html = await renderComponent(
      tagLayout(
        asLumeData({
          lang: "en",
          tagName: '<script>alert("xss")</script>',
          posts: [],
          comp: {
            PostCard: ({ title, url }: { title: string; url: string }) =>
              `<article class="post-card h-entry"><h3 class="p-name"><a class="u-url u-uid" href="${url}">${title}</a></h3></article>`,
          },
        }),
        MOCK_HELPERS,
      ),
    );

    assertStringIncludes(
      html,
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
    assertNotMatch(html, /<script>alert\("xss"\)<\/script>/);
  });

  it("falls back to a safe default PostCard renderer and ignores invalid post entries", async () => {
    const invalidDate = makePost(3).date as Date;
    const html = await renderComponent(
      tagLayout(
        asLumeData({
          lang: "en",
          tagName: "devops",
          posts: [
            asLumeData({
              date: invalidDate,
              readingInfo: { minutes: 3 },
              title: 42,
              url: 99,
            }),
            null,
            "not-a-post",
          ],
        }),
        asLumeHelpers({}),
      ),
    );

    assertStringIncludes(html, 'class="archive-list"');
    assertStringIncludes(html, "post-card h-entry");
    assertStringIncludes(html, 'class="u-url u-uid" href=""');
    assertNotMatch(html, /not-a-post/);
    assertNotMatch(html, />42</);
  });
});
