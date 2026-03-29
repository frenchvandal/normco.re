import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildArchiveMonthNavModel,
  buildArchiveTimelineItemModels,
  buildArchiveViewModel,
} from "./archive-view-model.ts";
import { groupArchiveMonths } from "./archive-common.ts";
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

describe("buildArchiveMonthNavModel()", () => {
  it("builds shared range and year/month counts for both archive renderers", () => {
    const months = groupArchiveMonths([
      makeStory("latest", "2026-03-20T08:00:00.000Z"),
      makeStory("middle", "2026-03-01T08:00:00.000Z"),
      makeStory("older", "2026-02-10T08:00:00.000Z"),
    ], "en");

    const model = buildArchiveMonthNavModel(months);

    assertStrictEquals(model?.newestMonthAnchorId, "archive-month-2026-03");
    assertStrictEquals(model?.newestMonthLabel, "March 2026");
    assertStrictEquals(model?.oldestMonthLabel, "February 2026");
    assertEquals(model?.years[0]?.yearCountLabel, "03");
    assertEquals(
      model?.years[0]?.months.map((month) => ({
        key: month.key,
        countLabel: month.countLabel,
      })),
      [
        { key: "2026-03", countLabel: "02" },
        { key: "2026-02", countLabel: "01" },
      ],
    );
  });
});

describe("buildArchiveTimelineItemModels()", () => {
  it("builds stable timeline labels and keys from the shared archive entries", () => {
    const months = groupArchiveMonths([
      makeStory("latest", "2026-03-20T08:00:00.000Z"),
      makeStory("older-same-month", "2026-03-01T08:00:00.000Z"),
      makeStory("older", "2026-02-10T08:00:00.000Z"),
    ], "en");

    const items = buildArchiveTimelineItemModels(months);

    assertEquals(
      items.map((item) => ({
        indexLabel: item.indexLabel,
        key: item.key,
        monthKey: item.month?.key,
        title: item.story.title,
      })),
      [
        {
          indexLabel: "01",
          key: "/posts/latest/",
          monthKey: "2026-03",
          title: "latest",
        },
        {
          indexLabel: "02",
          key: "/posts/older-same-month/",
          monthKey: undefined,
          title: "older-same-month",
        },
        {
          indexLabel: "03",
          key: "/posts/older/",
          monthKey: "2026-02",
          title: "older",
        },
      ],
    );
  });
});

describe("buildArchiveViewModel()", () => {
  it("shares the archive layout decision and month nav gating", () => {
    const stories = [
      makeStory("latest", "2026-03-20T08:00:00.000Z"),
      makeStory("older", "2025-02-10T08:00:00.000Z"),
    ] as const;

    const model = buildArchiveViewModel(stories, "en");

    assertStrictEquals(model.hasPosts, true);
    assertStrictEquals(
      model.layoutClassName,
      "blog-antd-archive-layout blog-antd-archive-layout--with-nav",
    );
    assertStrictEquals(
      model.monthNav?.newestMonthAnchorId,
      "archive-month-2026-03",
    );
    assertEquals(
      model.timelineItems.map((item) => item.story.title),
      ["latest", "older"],
    );
  });

  it("keeps single-month archives on the simpler layout without nav", () => {
    const model = buildArchiveViewModel([
      makeStory("only", "2026-03-20T08:00:00.000Z"),
    ], "en");

    assertStrictEquals(model.hasPosts, true);
    assertStrictEquals(model.layoutClassName, "blog-antd-archive-layout");
    assertStrictEquals(model.monthNav, undefined);
    assertEquals(model.timelineItems.length, 1);
  });

  it("returns an empty archive model when no stories exist", () => {
    const model = buildArchiveViewModel([], "en");

    assertStrictEquals(model.hasPosts, false);
    assertStrictEquals(model.layoutClassName, "blog-antd-archive-layout");
    assertStrictEquals(model.monthNav, undefined);
    assertEquals(model.timelineItems, []);
  });
});
