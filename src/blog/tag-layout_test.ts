import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { resolveTagStorySections } from "./tag-layout.ts";
import type { BlogStoryCard } from "./view-data.ts";

function makeStory(index: number): BlogStoryCard {
  const day = String(index).padStart(2, "0");

  return {
    title: `Story ${index}`,
    url: `/posts/story-${index}/`,
    dateIso: `2026-03-${day}T08:00:00.000Z`,
    dateLabel: `2026-03-${day}`,
  };
}

describe("resolveTagStorySections()", () => {
  it("partitions tag stories without repeating the same post across sections", () => {
    const sections = resolveTagStorySections([1, 2, 3, 4, 5, 6].map(makeStory));

    assertStrictEquals(sections.featuredStory?.title, "Story 1");
    assertStrictEquals(sections.latestStory?.title, "Story 2");
    assertEquals(
      sections.secondaryStories.map((story) => story.title),
      ["Story 3", "Story 4", "Story 5"],
    );
    assertEquals(
      sections.gridStories.map((story) => story.title),
      ["Story 6"],
    );
    assertStrictEquals(sections.gridStartIndex, 6);
  });

  it("keeps the grid start index aligned when fewer secondary stories exist", () => {
    const sections = resolveTagStorySections([1, 2, 3, 4].map(makeStory));

    assertEquals(
      sections.secondaryStories.map((story) => story.title),
      ["Story 3", "Story 4"],
    );
    assertEquals(sections.gridStories, []);
    assertStrictEquals(sections.gridStartIndex, 5);
  });
});
