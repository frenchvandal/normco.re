import {
  type ArchiveMonthGroup,
  type ArchiveTimelineEntry,
  buildArchiveTimelineEntries,
  formatArchiveIndex,
  groupArchiveMonths,
  groupArchiveYears,
} from "./archive-common.ts";
import type { BlogStoryCard } from "./view-data.ts";

export type ArchiveMonthNavItemModel = Readonly<{
  anchorId: string;
  countLabel: string;
  key: string;
  shortLabel: string;
  title: string;
}>;

export type ArchiveMonthNavYearModel = Readonly<{
  labelId: string;
  months: readonly ArchiveMonthNavItemModel[];
  year: number;
  yearCountLabel: string;
}>;

export type ArchiveMonthNavModel = Readonly<{
  newestMonthAnchorId: string;
  newestMonthLabel: string;
  oldestMonthLabel: string;
  years: readonly ArchiveMonthNavYearModel[];
}>;

export type ArchiveTimelineItemModel = Readonly<{
  indexLabel: string;
  isLead: boolean;
  key: string;
  month?: ArchiveMonthGroup | undefined;
  story: ArchiveTimelineEntry["story"];
}>;

export type ArchiveViewModel = Readonly<{
  hasPosts: boolean;
  layoutClassName: string;
  monthNav?: ArchiveMonthNavModel | undefined;
  timelineItems: readonly ArchiveTimelineItemModel[];
}>;

const ARCHIVE_LAYOUT_CLASS = "blog-antd-archive-layout";
const ARCHIVE_LAYOUT_WITH_NAV_CLASS =
  `${ARCHIVE_LAYOUT_CLASS} blog-antd-archive-layout--with-nav`;

export function buildArchiveMonthNavModel(
  months: readonly ArchiveMonthGroup[],
): ArchiveMonthNavModel | undefined {
  const newestMonth = months[0];
  const oldestMonth = months[months.length - 1];

  if (!newestMonth || !oldestMonth) {
    return undefined;
  }

  return {
    newestMonthAnchorId: newestMonth.anchorId,
    newestMonthLabel: newestMonth.label,
    oldestMonthLabel: oldestMonth.label,
    years: groupArchiveYears(months).map(({ year, months: yearMonths }) => ({
      labelId: `archive-year-${year}`,
      months: yearMonths.map((month) => ({
        anchorId: month.anchorId,
        countLabel: formatArchiveIndex(month.posts.length),
        key: month.key,
        shortLabel: month.shortLabel,
        title: `${month.label} • ${formatArchiveIndex(month.posts.length)}`,
      })),
      year,
      yearCountLabel: formatArchiveIndex(
        yearMonths.reduce((sum, month) => sum + month.posts.length, 0),
      ),
    })),
  };
}

export function buildArchiveTimelineItemModels(
  months: readonly ArchiveMonthGroup[],
): readonly ArchiveTimelineItemModel[] {
  return buildArchiveTimelineEntries(months).map((entry) => ({
    indexLabel: formatArchiveIndex(entry.index + 1),
    isLead: entry.isLead,
    key: entry.story.url,
    month: entry.month,
    story: entry.story,
  }));
}

export function buildArchiveViewModel(
  posts: readonly BlogStoryCard[],
  locale: string,
): ArchiveViewModel {
  const months = groupArchiveMonths(posts, locale);
  const monthNav = months.length > 1
    ? buildArchiveMonthNavModel(months)
    : undefined;

  return {
    hasPosts: posts.length > 0,
    layoutClassName: monthNav
      ? ARCHIVE_LAYOUT_WITH_NAV_CLASS
      : ARCHIVE_LAYOUT_CLASS,
    monthNav,
    timelineItems: buildArchiveTimelineItemModels(months),
  };
}
