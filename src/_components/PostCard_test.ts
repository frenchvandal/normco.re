import { assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";
import featureStyles from "../styles/components/feature.css" with {
  type: "text",
};

import PostCard from "./PostCard.tsx";

const POST_CARD_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

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
      assertStringIncludes(html, 'class="post-card-meta"');
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

  describe("content", () => {
    it("renders the native title, link, and time structure", async () => {
      const base = makeBase(307);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, 'class="post-card-title"');
      assertStringIncludes(html, 'class="post-card-link"');
      assertStringIncludes(html, 'class="post-card-date"');
    });

    it("keeps the card clean when summary rendering is not requested", async () => {
      const base = makeBase(308);
      const html = await renderComponent(
        PostCard({
          ...base,
          summary: "Summary copy",
        }),
      );

      assertNotMatch(html, /p-summary|p-author|h-card|p-name/);
      assertNotMatch(html, /Summary copy/);
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
      assertStringIncludes(html, "post-card");
      assertStringIncludes(html, "site-panel");
    });

    it("renders a time element with the ISO datetime attribute", async () => {
      const base = makeBase(305);
      const html = await renderComponent(PostCard({ ...base }));
      assertStringIncludes(html, 'class="post-card-meta"');
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

    it("merges optional variant classes onto the article root", async () => {
      const base = makeBase(311);
      const html = await renderComponent(
        PostCard({ ...base, className: "custom-post-card" }),
      );

      assertStringIncludes(html, "custom-post-card");
      assertStringIncludes(html, "site-panel");
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
    it("defines hover and focus feedback on the primary title link", () => {
      assertStringIncludes(featureStyles, ".post-card:hover .post-card-link");
      assertStringIncludes(
        featureStyles,
        ".post-card:focus-within .post-card-link",
      );
      assertStringIncludes(featureStyles, "var(--ph-color-accent-fg)");
    });

    it("keeps a dedicated class on the primary title link for shared styling", () => {
      assertStringIncludes(featureStyles, ".post-card-link");
      assertStringIncludes(featureStyles, ".post-card-title {");
    });

    it("groups post metadata in a shared inline row", () => {
      assertStringIncludes(featureStyles, ".post-card-meta");
      assertStringIncludes(
        featureStyles,
        ".post-card-meta > * + *::before",
      );
    });

    it("defines a dedicated summary block for editorial variants", () => {
      assertStringIncludes(featureStyles, ".post-card-summary");
      assertStringIncludes(featureStyles, "max-inline-size: 52ch;");
    });
  });
});
