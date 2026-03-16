import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";

import PostCard from "./PostCard.tsx";

const POST_CARD_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Builds deterministic test props with realistic randomized values. */
function makeBase(seed: number) {
  seedTestFaker(seed);
  const slug = faker.lorem.slug(3);
  const postDate = faker.date.anytime();

  return {
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    url: `/posts/${slug}/`,
    dateStr: POST_CARD_DATE_FORMATTER.format(postDate),
    dateIso: postDate.toISOString(),
  } as const;
}

describe("PostCard()", () => {
  describe("with readingLabel", () => {
    it("renders reading time in a native metadata badge", async () => {
      const base = makeBase(301);
      const html = await renderComponent(
        PostCard({ ...base, readingLabel: "3 min read" }),
      );
      assertStringIncludes(html, "3 min read");
      assertStringIncludes(html, 'class="post-card-reading-time"');
      assertStringIncludes(html, "<span");
    });

    it("renders the provided reading label value", async () => {
      const base = makeBase(302);
      const html = await renderComponent(
        PostCard({ ...base, readingLabel: "7 min read" }),
      );
      assertStringIncludes(html, "7 min read");
    });
  });

  describe("without readingLabel", () => {
    it("renders no reading-time badge", async () => {
      const base = makeBase(303);
      const html = await renderComponent(PostCard({ ...base }));
      assertNotMatch(html, /post-card-reading-time/);
      assertNotMatch(html, /<span class="post-card-reading-time"/);
      assertNotMatch(html, /min read/);
    });
  });

  describe("structure", () => {
    it("wraps content in article.post-card", async () => {
      const base = makeBase(304);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, '<article class="post-card">');
    });

    it("renders a time element with the ISO datetime attribute", async () => {
      const base = makeBase(305);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, `datetime="${base.dateIso}"`);
      assertStringIncludes(html, base.dateStr);
    });

    it("renders the title in an h3 with a native link", async () => {
      const base = makeBase(306);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, `href="${base.url}"`);
      assertStringIncludes(html, base.title);
      assertStringIncludes(html, "<h3");
      assertStringIncludes(html, "<a");
      assertStringIncludes(html, 'class="post-card-link"');
    });

    it("escapes title and URL values before interpolation", async () => {
      seedTestFaker(307);
      const unsafeDate = faker.date.anytime();
      const html = await renderComponent(
        PostCard({
          title: `<hello "world">`,
          url: `/posts/"unsafe"/`,
          dateStr: POST_CARD_DATE_FORMATTER.format(unsafeDate),
          dateIso: unsafeDate.toISOString(),
        }),
      );
      assertStringIncludes(html, '&lt;hello "world"&gt;');
      assertStringIncludes(html, 'href="/posts/&quot;unsafe&quot;/"');
    });
  });

  describe("CSS contracts", () => {
    it("defines Carbon-like hover and focus feedback on the card container", async () => {
      const cssContent = await Deno.readTextFile(
        new URL("../styles/components/_post-card.scss", import.meta.url),
      );
      assertStringIncludes(cssContent, ".post-card:hover");
      assertStringIncludes(cssContent, ".post-card:focus-within");
      assertStringIncludes(cssContent, "var(--cds-layer-hover)");
      assertStringIncludes(cssContent, "var(--cds-focus)");
    });

    it("keeps a dedicated class on the primary title link for shared styling", async () => {
      const cssContent = await Deno.readTextFile(
        new URL("../styles/components/_post-card.scss", import.meta.url),
      );
      assertStringIncludes(cssContent, ".post-card-link");
      assertStringIncludes(cssContent, ".post-card-link:focus-visible");
    });
  });
});
