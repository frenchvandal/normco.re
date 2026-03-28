import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeData } from "../../test/lume.ts";

import { renderPostListItem, toStoryData } from "./story-data.ts";

describe("toStoryData()", () => {
  it("normalizes a Lume post into story card data", () => {
    const story = toStoryData(
      asLumeData({
        title: "Archive entry",
        url: "/posts/archive-entry/",
        description: "A compact summary.",
        tags: ["design", "", 3],
        date: new Date("2026-03-28T10:00:00.000Z"),
        readingInfo: { minutes: 4 },
      }),
      "en",
      () => "2026-03-28T10:00:00.000Z",
    );

    assertEquals(story, {
      title: "Archive entry",
      url: "/posts/archive-entry/",
      summary: "A compact summary.",
      tags: ["design"],
      dateIso: "2026-03-28T10:00:00.000Z",
      dateLabel: "Mar 28",
      readingLabel: "4 min read",
    });
  });

  it("falls back safely when optional fields are absent", () => {
    const story = toStoryData(
      asLumeData({
        date: new Date("2026-03-28T10:00:00.000Z"),
      }),
      "fr",
      () => undefined,
    );

    assertStrictEquals(story.title, "");
    assertStrictEquals(story.url, "");
    assertEquals(story.tags, []);
    assertStrictEquals(story.summary, undefined);
    assertStrictEquals(story.readingLabel, undefined);
    assertStrictEquals(story.dateIso, "2026-03-28T10:00:00Z");
  });
});

describe("renderPostListItem()", () => {
  it("wraps the rendered post card in an archive list item", async () => {
    const html = await renderPostListItem(
      (props) =>
        Promise.resolve(
          `<article data-title="${props.title}" data-url="${props.url}"></article>`,
        ),
      {
        title: "Rendered story",
        url: "/posts/rendered-story/",
        dateIso: "2026-03-28T10:00:00.000Z",
        dateLabel: "Mar 28",
        tags: [],
      },
      { className: "post-card--archive" },
    );

    assertStrictEquals(
      html,
      '<li class="archive-list-item"><article data-title="Rendered story" data-url="/posts/rendered-story/"></article></li>',
    );
  });
});
