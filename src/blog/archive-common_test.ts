import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildArchiveTimelineEntries,
  formatArchiveIndex,
  groupArchiveMonths,
  groupArchiveYears,
  resolveArchiveLocale,
} from "./archive-common.ts";
import type { BlogStoryCard } from "./view-data.ts";

function makeStory(
  slug: string,
  dateIso: string,
): BlogStoryCard {
  return {
    title: slug,
    url: `/posts/${slug}/`,
    dateIso,
    dateLabel: dateIso,
  };
}

describe("resolveArchiveLocale()", () => {
  it("maps document language tags to archive locales", () => {
    assertStrictEquals(resolveArchiveLocale("zh-hans"), "zh-CN");
    assertStrictEquals(resolveArchiveLocale("zh-hant"), "zh-TW");
    assertStrictEquals(resolveArchiveLocale("fr"), "fr");
    assertStrictEquals(resolveArchiveLocale(undefined), "en");
  });
});

describe("groupArchiveMonths()", () => {
  it("groups stories by month while preserving chronological order", () => {
    const stories = [
      makeStory("latest", "2026-03-20T08:00:00.000Z"),
      makeStory("middle", "2026-03-01T08:00:00.000Z"),
      makeStory("older", "2026-02-10T08:00:00.000Z"),
    ] as const;

    const months = groupArchiveMonths(stories, "en");

    assertEquals(months.map((month) => month.key), ["2026-03", "2026-02"]);
    assertEquals(months[0]?.posts.map((story) => story.title), [
      "latest",
      "middle",
    ]);
    assertStrictEquals(months[0]?.anchorId, "archive-month-2026-03");
  });
});

describe("groupArchiveYears()", () => {
  it("collapses months into insertion-ordered year groups", () => {
    const months = groupArchiveMonths([
      makeStory("march", "2026-03-20T08:00:00.000Z"),
      makeStory("january", "2026-01-20T08:00:00.000Z"),
      makeStory("older", "2025-12-20T08:00:00.000Z"),
    ], "en");

    const years = groupArchiveYears(months);

    assertEquals(
      years.map((group) => ({
        year: group.year,
        months: group.months.map((month) => month.key),
      })),
      [
        { year: 2026, months: ["2026-03", "2026-01"] },
        { year: 2025, months: ["2025-12"] },
      ],
    );
  });
});

describe("buildArchiveTimelineEntries()", () => {
  it("builds stable archive timeline entries without a mutable counter", () => {
    const months = groupArchiveMonths([
      makeStory("latest", "2026-03-20T08:00:00.000Z"),
      makeStory("older-same-month", "2026-03-01T08:00:00.000Z"),
      makeStory("older", "2026-02-10T08:00:00.000Z"),
    ], "en");

    const entries = buildArchiveTimelineEntries(months);

    assertEquals(
      entries.map((entry) => ({
        index: entry.index,
        isLead: entry.isLead,
        monthKey: entry.month?.key,
        title: entry.story.title,
      })),
      [
        {
          index: 0,
          isLead: true,
          monthKey: "2026-03",
          title: "latest",
        },
        {
          index: 1,
          isLead: false,
          monthKey: undefined,
          title: "older-same-month",
        },
        {
          index: 2,
          isLead: false,
          monthKey: "2026-02",
          title: "older",
        },
      ],
    );
  });
});

describe("formatArchiveIndex()", () => {
  it("pads indices to two digits", () => {
    assertStrictEquals(formatArchiveIndex(1), "01");
    assertStrictEquals(formatArchiveIndex(12), "12");
  });
});
