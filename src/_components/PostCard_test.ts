import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";
import postCardStyles from "../styles/components/_post-card.scss" with {
  type: "text",
};

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

  describe("microformats2", () => {
    it("renders an h-entry root with canonical name and URL properties", async () => {
      const base = makeBase(307);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, "post-card h-entry");
      assertStringIncludes(html, 'class="post-card-title p-name"');
      assertStringIncludes(html, 'class="post-card-link u-url u-uid"');
      assertStringIncludes(html, 'class="post-card-date dt-published"');
    });

    it("renders hidden summary and author data when provided", async () => {
      const base = makeBase(308);
      const html = await renderComponent(
        PostCard({
          ...base,
          summary: "Summary copy",
          authorName: "Phiphi",
          authorUrl: "/about/",
        }),
      );

      assertStringIncludes(html, 'class="p-summary sr-only"');
      assertStringIncludes(html, "Summary copy");
      assertStringIncludes(html, 'class="p-author h-card sr-only"');
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, '<span class="p-name">Phiphi</span>');
    });

    it("renders a visible summary only when explicitly requested", async () => {
      const base = makeBase(310);
      const html = await renderComponent(
        PostCard({
          ...base,
          summary: "Visible summary copy",
          showSummary: true,
        }),
      );

      assertStringIncludes(html, 'class="post-card-summary"');
      assertStringIncludes(html, "Visible summary copy");
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
      assertStringIncludes(html, "post-card h-entry");
      assertStringIncludes(html, "cds--tile");
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
      assertStringIncludes(html, 'class="post-card-link u-url u-uid"');
    });

    it("escapes title and URL values before interpolation", async () => {
      seedTestFaker(309);
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
    it("defines Carbon-like hover and focus feedback on the card container", () => {
      assertStringIncludes(postCardStyles, ".post-card:hover");
      assertStringIncludes(postCardStyles, ".post-card:focus-within");
      assertStringIncludes(postCardStyles, "var(--cds-layer-hover)");
      assertStringIncludes(postCardStyles, "var(--cds-focus)");
    });

    it("keeps a dedicated class on the primary title link for shared styling", () => {
      assertStringIncludes(postCardStyles, ".post-card-link");
      assertStringIncludes(postCardStyles, ".post-card-link:focus-visible");
    });

    it("defines a dedicated summary block for editorial variants", () => {
      assertStringIncludes(postCardStyles, ".post-card-summary");
      assertStringIncludes(postCardStyles, "max-inline-size: 42ch;");
    });
  });
});
