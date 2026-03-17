/** Multilingual RSS, Atom, and JSON Feed configurations. */

import { type Data, Page } from "lume/core/file.ts";
import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";
import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";

const ATOM_XMLNS = "http://www.w3.org/2005/Atom";
const ATOM_CONTENT_TYPE = "html";
const DEFAULT_FEED_SORT = "date=desc";
const DEFAULT_FEED_LIMIT = 10;

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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

function buildAtomEntryXml(site: Site, page: Data): string {
  const entryUrl = site.url(getStringValue(page.url) ?? "", true);
  const entryTitle = getStringValue(page.title) ?? entryUrl;
  const entrySummary = getStringValue(page.description);
  const entryContent = getStringValue(page.children) ?? "";
  const publishedDate = getDateValue(page.date) ?? new Date();
  const updatedDate = getDateValue(page.update_date) ?? publishedDate;

  return [
    "    <entry>",
    `      <id>${escapeXml(entryUrl)}</id>`,
    `      <title>${escapeXml(entryTitle)}</title>`,
    `      <link rel=\"alternate\" href=\"${escapeXml(entryUrl)}\" />`,
    `      <published>${publishedDate.toISOString()}</published>`,
    `      <updated>${updatedDate.toISOString()}</updated>`,
    entrySummary !== undefined
      ? `      <summary type=\"text\">${escapeXml(entrySummary)}</summary>`
      : undefined,
    `      <content type=\"${ATOM_CONTENT_TYPE}\">${
      escapeXml(entryContent)
    }</content>`,
    "    </entry>",
  ].filter((line): line is string => line !== undefined).join("\n");
}

export function createAtomFeedContent(
  site: Site,
  variant: FeedVariant,
  pages: ReadonlyArray<Data>,
): string {
  const feedPath = `${variant.pathPrefix}/atom.xml`;
  const languageTag = getLanguageTag(variant.language);
  const feedUrl = site.url(feedPath, true);
  const homeUrl = site.url(`${variant.pathPrefix}/`, true);

  const updatedDate = pages
    .map((page) => getDateValue(page.update_date) ?? getDateValue(page.date))
    .find((date): date is Date => date !== undefined) ?? new Date();

  const entryXml = pages.map((page) => buildAtomEntryXml(site, page)).join(
    "\n",
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<feed xmlns=\"${ATOM_XMLNS}\" xml:lang=\"${escapeXml(languageTag)}\">`,
    `  <id>${escapeXml(feedUrl)}</id>`,
    `  <title>${escapeXml(variant.title)}</title>`,
    `  <subtitle>${escapeXml(variant.description)}</subtitle>`,
    `  <updated>${updatedDate.toISOString()}</updated>`,
    `  <link rel=\"self\" href=\"${
      escapeXml(feedUrl)
    }\" type=\"application/atom+xml\" />`,
    `  <link rel=\"alternate\" href=\"${
      escapeXml(homeUrl)
    }\" type=\"text/html\" />`,
    entryXml,
    "</feed>",
  ].join("\n");
}

/** Register all multilingual feed outputs. */
export function registerFeeds(site: Site): void {
  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant)));
  }

  site.process(function processAtomFeeds() {
    for (const variant of FEED_VARIANTS) {
      const pages = site.search.pages(
        `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
        DEFAULT_FEED_SORT,
        DEFAULT_FEED_LIMIT,
      ) as Data[];

      site.pages.push(
        Page.create({
          url: `${variant.pathPrefix}/atom.xml`,
          content: createAtomFeedContent(site, variant, pages),
        }),
      );
    }
  });
}
