/** Multilingual RSS and JSON Feed configurations. */

import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";
import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";

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

/** Register all multilingual feed outputs. */
export function registerFeeds(site: Site): void {
  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant)));
  }
}
