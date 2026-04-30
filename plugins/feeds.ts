import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";

import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";
import { resolveOptionalString } from "../src/utils/type-guards.ts";
import {
  ATOM_FEED_PATH,
  FEED_STYLESHEET_PATH,
  JSON_FEED_PATH,
  RSS_FEED_PATH,
} from "../src/utils/feed-paths.ts";
import { getSiteName } from "../src/utils/site-identity.ts";

export const FEED_SORT = "date=desc";
export const FEED_LIMIT = 10;
export const FEED_STYLESHEET = FEED_STYLESHEET_PATH;
export const FEED_AUTHOR_FALLBACK = "Phiphi";

export const FEED_ITEMS = {
  title: "=title",
  description: "=description",
  published: "=date",
  updated: "=update_date",
  content: "=children",
} as const;

export type FeedVariant = {
  readonly language: SiteLanguage;
  readonly pathPrefix: string;
  readonly title: string;
  readonly description: string;
};

function resolveFeedTitle(language: SiteLanguage): string {
  switch (language) {
    case "fr":
      return `${getSiteName(language)} (fr)`;
    case "zhHans":
      return `${getSiteName(language)} (简体中文)`;
    case "zhHant":
      return `${getSiteName(language)} (繁體中文)`;
    default:
      return getSiteName(language);
  }
}

export const FEED_VARIANTS = [
  {
    language: "en",
    pathPrefix: "",
    title: resolveFeedTitle("en"),
    description: "Personal blog by Phiphi, based in Chengdu, China.",
  },
  {
    language: "fr",
    pathPrefix: "/fr",
    title: resolveFeedTitle("fr"),
    description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
  },
  {
    language: "zhHans",
    pathPrefix: "/zh-hans",
    title: resolveFeedTitle("zhHans"),
    description: "Phiphi 的个人博客，写于中国成都。",
  },
  {
    language: "zhHant",
    pathPrefix: "/zh-hant",
    title: resolveFeedTitle("zhHant"),
    description: "Phiphi 的個人部落格，寫於中國成都。",
  },
] as const satisfies ReadonlyArray<FeedVariant>;

export function createFeedOptions(variant: FeedVariant, authorName: string) {
  return {
    output: [
      `${variant.pathPrefix}${RSS_FEED_PATH}`,
      `${variant.pathPrefix}${JSON_FEED_PATH}`,
      `${variant.pathPrefix}${ATOM_FEED_PATH}`,
    ],
    query: `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
    sort: FEED_SORT,
    limit: FEED_LIMIT,
    stylesheet: FEED_STYLESHEET,
    info: {
      title: variant.title,
      description: variant.description,
      lang: getLanguageTag(variant.language),
      authorName,
      generator: false,
    },
    items: FEED_ITEMS,
  };
}

export function resolveFeedAuthorName(site: Site): string {
  const rootData = site.source.data.get("/") ?? {};
  return resolveOptionalString(rootData.author) ?? FEED_AUTHOR_FALLBACK;
}

export function registerFeeds(site: Site): void {
  const authorName = resolveFeedAuthorName(site);

  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant, authorName)));
  }
}
