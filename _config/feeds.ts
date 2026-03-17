/** Multilingual RSS, JSON Feed, and Atom feed configurations. */

import feed from "lume/plugins/feed.ts";
import { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";
import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";
import {
  type AtomFeedData,
  type AtomFeedEntry,
  generateAtomXml,
} from "../src/utils/atom-feed.ts";

/** Maximum number of items per feed. */
const FEED_LIMIT = 10;

/** Sort order for feed items. */
const FEED_SORT = "date=desc";

/** Shared item mapping for all feed variants. */
export const FEED_ITEMS = {
  title: "=title",
  description: "=description",
  published: "=date",
  content: "=children",
} as const;

export type FeedVariant = {
  readonly language: SiteLanguage;
  readonly pathPrefix: string;
  readonly title: string;
  readonly description: string;
};

/** Shared feed metadata for each localized output. */
export const FEED_VARIANTS = [
  {
    language: "en",
    pathPrefix: "",
    title: "normco.re",
    description: "Personal blog by Phiphi, based in Chengdu, China.",
  },
  {
    language: "fr",
    pathPrefix: "/fr",
    title: "normco.re (fr)",
    description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
  },
  {
    language: "zhHans",
    pathPrefix: "/zh-hans",
    title: "normco.re (简体中文)",
    description: "Phiphi 的个人博客，写于中国成都。",
  },
  {
    language: "zhHant",
    pathPrefix: "/zh-hant",
    title: "normco.re (繁體中文)",
    description: "Phiphi 的個人部落格，寫於中國成都。",
  },
] as const satisfies ReadonlyArray<FeedVariant>;

/** Builds the feed plugin options for a single language variant. */
export function createFeedOptions(variant: FeedVariant) {
  return {
    output: [
      `${variant.pathPrefix}/feed.xml`,
      `${variant.pathPrefix}/feed.json`,
    ],
    query: `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
    info: {
      title: variant.title,
      description: variant.description,
      lang: getLanguageTag(variant.language),
      generator: false,
    },
    items: FEED_ITEMS,
  };
}

/** Converts a page data date field to a Date instance. */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

/** Builds an Atom feed entry from a Lume page's data. */
export function buildAtomEntry(
  data: Record<string, unknown>,
  siteUrl: (path: string, absolute: boolean) => string,
): AtomFeedEntry | undefined {
  const title = typeof data.title === "string" ? data.title : undefined;
  const url = typeof data.url === "string" ? data.url : undefined;
  const published = toDate(data.date);

  if (!title || !url) return undefined;

  const absoluteUrl = siteUrl(url, true);

  return {
    id: absoluteUrl,
    title,
    url: absoluteUrl,
    ...(published ? { published } : {}),
    ...(typeof data.description === "string"
      ? { summary: data.description }
      : {}),
    ...(typeof data.children === "string"
      ? { contentHtml: data.children }
      : {}),
  };
}

/** Builds an Atom feed data object for a variant and its matching posts. */
export function buildAtomFeedData(
  variant: FeedVariant,
  entries: ReadonlyArray<AtomFeedEntry>,
  siteUrl: string,
  feedUrl: string,
): AtomFeedData {
  const langTag = getLanguageTag(variant.language);
  const latestDate = entries.reduce<Date | undefined>(
    (latest, entry) => {
      if (!entry.published) return latest;
      if (!latest || entry.published > latest) return entry.published;
      return latest;
    },
    undefined,
  );

  return {
    id: feedUrl,
    title: variant.title,
    description: variant.description,
    siteUrl,
    feedUrl,
    language: langTag,
    updated: latestDate ?? new Date(),
    entries,
  };
}

/** Register all multilingual feed outputs. */
export function registerFeeds(site: Site): void {
  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant)));
  }

  // Generate Atom feeds after all HTML pages have been rendered so that
  // post content (children) is available for <content type="html">.
  site.process([".html"], (_pages: Page[], allPages: Page[]) => {
    for (const variant of FEED_VARIANTS) {
      const query = `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`;
      const posts = site.search.pages(query, FEED_SORT, FEED_LIMIT);

      const entries: AtomFeedEntry[] = [];

      for (const post of posts) {
        const entry = buildAtomEntry(
          post as Record<string, unknown>,
          (path, abs) => site.url(path, abs),
        );

        if (entry) {
          entries.push(entry);
        }
      }

      const atomUrl = `${variant.pathPrefix}/atom.xml`;
      const absoluteAtomUrl = site.url(atomUrl, true);
      const absoluteSiteUrl = site.url(
        variant.pathPrefix ? `${variant.pathPrefix}/` : "/",
        true,
      );

      const feedData = buildAtomFeedData(
        variant,
        entries,
        absoluteSiteUrl,
        absoluteAtomUrl,
      );

      allPages.push(Page.create({
        url: atomUrl,
        content: generateAtomXml(feedData),
      }));
    }
  });
}
