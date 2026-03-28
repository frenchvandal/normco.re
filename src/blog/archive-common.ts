import type { BlogStoryCard } from "./view-data.ts";

export type ArchiveMonthGroup = Readonly<{
  key: string;
  year: number;
  label: string;
  shortLabel: string;
  anchorId: string;
  posts: readonly BlogStoryCard[];
}>;

export type ArchiveYearGroup = Readonly<{
  year: number;
  months: readonly ArchiveMonthGroup[];
}>;

export type ArchiveTimelineEntry = Readonly<{
  index: number;
  isLead: boolean;
  month?: ArchiveMonthGroup | undefined;
  story: BlogStoryCard;
}>;

function formatArchiveMonth(
  monthKey: string,
  locale: string,
): Pick<ArchiveMonthGroup, "label" | "shortLabel" | "year"> {
  const [yearText = "0", monthText = "1"] = monthKey.split("-");
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return {
    year,
    label: new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
    shortLabel: new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    }).format(date),
  };
}

export function formatArchiveIndex(index: number): string {
  return index.toString().padStart(2, "0");
}

export function resolveArchiveLocale(languageTag?: string): string {
  const normalizedLanguage = languageTag?.trim().toLowerCase() ?? "";

  switch (normalizedLanguage) {
    case "zh-hans":
      return "zh-CN";
    case "zh-hant":
      return "zh-TW";
    default:
      return normalizedLanguage || "en";
  }
}

export function resolveArchiveLocaleFromDocument(): string {
  if (typeof document === "undefined") {
    return "en";
  }

  return resolveArchiveLocale(document.documentElement.lang);
}

export function groupArchiveMonths(
  posts: readonly BlogStoryCard[],
  locale: string,
): readonly ArchiveMonthGroup[] {
  const months = new Map<string, {
    year: number;
    label: string;
    shortLabel: string;
    anchorId: string;
    posts: BlogStoryCard[];
  }>();

  for (const story of posts) {
    const key = story.dateIso.slice(0, 7);
    const existingMonth = months.get(key);

    if (existingMonth) {
      existingMonth.posts.push(story);
      continue;
    }

    const { year, label, shortLabel } = formatArchiveMonth(key, locale);
    months.set(key, {
      year,
      label,
      shortLabel,
      anchorId: `archive-month-${key}`,
      posts: [story],
    });
  }

  return Array.from(months, ([key, month]) => ({
    key,
    year: month.year,
    label: month.label,
    shortLabel: month.shortLabel,
    anchorId: month.anchorId,
    posts: month.posts,
  }));
}

export function groupArchiveYears(
  months: readonly ArchiveMonthGroup[],
): readonly ArchiveYearGroup[] {
  const yearGroups = new Map<number, ArchiveMonthGroup[]>();

  for (const month of months) {
    const existingYear = yearGroups.get(month.year) ?? [];
    existingYear.push(month);
    yearGroups.set(month.year, existingYear);
  }

  return Array.from(yearGroups, ([year, groupedMonths]) => ({
    year,
    months: groupedMonths,
  }));
}

export function buildArchiveTimelineEntries(
  months: readonly ArchiveMonthGroup[],
): readonly ArchiveTimelineEntry[] {
  return months.flatMap((month) =>
    month.posts.map((story, monthIndex) => ({
      month,
      monthIndex,
      story,
    }))
  ).map(({ month, monthIndex, story }, index) => ({
    index,
    isLead: index === 0,
    month: monthIndex === 0 ? month : undefined,
    story,
  }));
}
