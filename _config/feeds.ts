/** Multilingual RSS and JSON Feed configurations. */

import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";
import { getLanguageTag } from "../src/utils/i18n.ts";

/** Shared item mapping for all feed variants. */
const FEED_ITEMS = {
  title: "=title",
  description: "=description",
  published: "=date",
  content: "=content",
} as const;

/** Register all multilingual feed outputs. */
export function registerFeeds(site: Site): void {
  site.use(
    feed({
      output: ["/feed.xml", "/feed.json"],
      query: "type=post lang=en",
      info: {
        title: "normco.re",
        description: "Personal blog by Phiphi, based in Chengdu, China.",
        lang: getLanguageTag("en"),
        generator: false,
      },
      items: FEED_ITEMS,
    }),
  );

  site.use(
    feed({
      output: ["/fr/feed.xml", "/fr/feed.json"],
      query: "type=post lang=fr",
      info: {
        title: "normco.re (fr)",
        description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
        lang: getLanguageTag("fr"),
        generator: false,
      },
      items: FEED_ITEMS,
    }),
  );

  site.use(
    feed({
      output: ["/zh-hans/feed.xml", "/zh-hans/feed.json"],
      query: "type=post lang=zh-hans",
      info: {
        title: "normco.re (简体中文)",
        description: "Phiphi 的个人博客，写于中国成都。",
        lang: getLanguageTag("zhHans"),
        generator: false,
      },
      items: FEED_ITEMS,
    }),
  );

  site.use(
    feed({
      output: ["/zh-hant/feed.xml", "/zh-hant/feed.json"],
      query: "type=post lang=zh-hant",
      info: {
        title: "normco.re (繁體中文)",
        description: "Phiphi 的個人部落格，寫於中國成都。",
        lang: getLanguageTag("zhHant"),
        generator: false,
      },
      items: FEED_ITEMS,
    }),
  );
}
