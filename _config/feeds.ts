/** Multilingual RSS, Atom, and JSON Feed configurations. */

import { mapNotNullish } from "@std/collections";
import { type Data, Page } from "lume/core/file.ts";
import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";
import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";
import { parseDateValue } from "../src/utils/date-time.ts";
import {
  absolutizeHtmlUrls,
  type AtomFeedData,
  type AtomFeedEntry,
  generateAtomXml,
} from "../src/utils/atom-feed.ts";
import {
  ATOM_FEED_PATH,
  FEED_STYLESHEET_PATH,
  JSON_FEED_PATH,
  RSS_FEED_PATH,
} from "../src/utils/feed-paths.ts";

/** Sort order shared by all feed outputs. */
export const FEED_SORT = "date=desc";
/** Maximum number of items emitted per feed. */
export const FEED_LIMIT = 10;
/** Browser stylesheet applied to XML feed outputs. */
export const FEED_STYLESHEET = FEED_STYLESHEET_PATH;

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
      `${variant.pathPrefix}${RSS_FEED_PATH}`,
      `${variant.pathPrefix}${JSON_FEED_PATH}`,
    ],
    query: `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
    sort: FEED_SORT,
    limit: FEED_LIMIT,
    stylesheet: FEED_STYLESHEET,
    info: {
      title: variant.title,
      description: variant.description,
      lang: getLanguageTag(variant.language),
      generator: false,
    },
    items: FEED_ITEMS,
  };
}

function toDate(value: unknown): Date | undefined {
  return parseDateValue(value);
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getAtomAuthor(site: Site) {
  const rootData = site.source.data.get("/") ?? {};
  const authorName = getStringValue(rootData.author) ?? "Phiphi";

  return {
    name: authorName,
  };
}

function buildAtomEntry(
  site: Site,
  page: Data,
  fallbackDate: Date,
): AtomFeedEntry | undefined {
  const pagePath = getStringValue(page.url);
  const title = getStringValue(page.title);

  if (!pagePath || !title) {
    return undefined;
  }

  const absoluteUrl = site.url(pagePath, true);
  const published = toDate(page.date);
  const updated = toDate(page.update_date) ?? published ?? fallbackDate;
  const summary = getStringValue(page.description);
  const contentHtml = getStringValue(page.children);

  return {
    id: absoluteUrl,
    title,
    url: absoluteUrl,
    updated,
    ...(published ? { published } : {}),
    ...(summary ? { summary } : {}),
    ...(contentHtml
      ? { contentHtml: absolutizeHtmlUrls(absoluteUrl, contentHtml) }
      : {}),
  };
}

/** Generates the Atom XML content for a localized feed variant. */
export function createAtomFeedContent(
  site: Site,
  variant: FeedVariant,
  pages: ReadonlyArray<Data>,
  isComplete: boolean = false,
): string {
  const fallbackDate = new Date();
  const entries = mapNotNullish(
    pages,
    (page): AtomFeedEntry | undefined =>
      buildAtomEntry(site, page, fallbackDate),
  );
  const atomPath = `${variant.pathPrefix}${ATOM_FEED_PATH}`;
  const updated = entries.reduce<Date>(
    (latest, entry) => entry.updated > latest ? entry.updated : latest,
    fallbackDate,
  );

  const atomFeed: AtomFeedData = {
    id: site.url(atomPath, true),
    title: variant.title,
    subtitle: variant.description,
    siteUrl: site.url(
      variant.pathPrefix ? `${variant.pathPrefix}/` : "/",
      true,
    ),
    feedUrl: site.url(atomPath, true),
    language: getLanguageTag(variant.language),
    complete: isComplete,
    updated,
    author: getAtomAuthor(site),
    entries,
    stylesheetHref: FEED_STYLESHEET,
  };

  return generateAtomXml(atomFeed);
}

/** Register all multilingual feed outputs. */
export function registerFeeds(site: Site): void {
  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant)));
  }

  site.process(function processAtomFeeds() {
    for (const variant of FEED_VARIANTS) {
      const allPages = site.search.pages(
        `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
        FEED_SORT,
      ) as Data[];
      const pages = allPages.slice(0, FEED_LIMIT);

      site.pages.push(
        Page.create({
          url: `${variant.pathPrefix}${ATOM_FEED_PATH}`,
          content: createAtomFeedContent(
            site,
            variant,
            pages,
            allPages.length <= FEED_LIMIT,
          ),
        }),
      );
    }
  });
}
