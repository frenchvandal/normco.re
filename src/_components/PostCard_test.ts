import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker } from "npm/faker-js";

import PostCard from "./PostCard.tsx";

/** Builds deterministic test props with realistic randomized values. */
function makeBase(seed: number) {
  faker.seed(seed);
  const slug = faker.lorem.slug(3);
  const postDate = faker.date.anytime();

  return {
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    url: `/posts/${slug}/`,
    dateStr: faker.date.month(),
    dateIso: postDate.toISOString(),
  } as const;
}

describe("PostCard()", () => {
  describe("with readingLabel", () => {
    it("renders reading time in .post-card-meta", () => {
      const base = makeBase(301);
      const html = PostCard({ ...base, readingLabel: "3 min read" });
      assertStringIncludes(html, "3 min read");
      assertStringIncludes(html, 'class="post-card-meta"');
    });

    it("renders the provided reading label value", () => {
      const base = makeBase(302);
      const html = PostCard({ ...base, readingLabel: "7 min read" });
      assertStringIncludes(html, "7 min read");
    });
  });

  describe("without readingLabel", () => {
    it("renders no .post-card-meta element", () => {
      const base = makeBase(303);
      const html = PostCard({ ...base });
      assertNotMatch(html, /post-card-meta/);
      assertNotMatch(html, /min read/);
    });
  });

  describe("structure", () => {
    it("wraps content in article.post-card", () => {
      const base = makeBase(304);
      const html = PostCard({ ...base });
      assertStringIncludes(html, '<article class="post-card">');
    });

    it("renders a time element with the ISO datetime attribute", () => {
      const base = makeBase(305);
      const html = PostCard({ ...base });
      assertStringIncludes(html, `datetime="${base.dateIso}"`);
      assertStringIncludes(html, base.dateStr);
    });

    it("renders the title in an h3 linked to url", () => {
      const base = makeBase(306);
      const html = PostCard({ ...base });
      assertStringIncludes(html, `href="${base.url}"`);
      assertStringIncludes(html, base.title);
      assertStringIncludes(html, "<h3");
    });

    it("escapes title and URL values before interpolation", () => {
      const html = PostCard({
        title: `<hello "world">`,
        url: `/posts/"unsafe"/`,
        dateStr: "Mar 5",
        dateIso: "2026-03-05T00:00:00Z",
      });
      assertStringIncludes(html, '&lt;hello "world"&gt;');
      assertStringIncludes(html, 'href="/posts/&quot;unsafe&quot;/"');
    });
  });
});
