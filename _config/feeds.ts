import { mapNotNullish } from "@std/collections";
import { type Data, Page } from "lume/core/file.ts";
import feed from "lume/plugins/feed.ts";
import type Site from "lume/core/site.ts";
import {
  getLanguageTag,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";
import {
  resolvePostCreatedDate,
  resolvePostUpdatedDate,
} from "../src/posts/post-metadata.ts";
import { resolveOptionalString } from "../src/utils/type-guards.ts";
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
import { getSiteName } from "../src/utils/site-identity.ts";

export const FEED_SORT = "date=desc";
export const FEED_LIMIT = 10;
export const FEED_STYLESHEET = FEED_STYLESHEET_PATH;

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
const GENERATED_ATOM_FEED_PATH = /^\/(?:(?:fr|zh-hans|zh-hant)\/)?atom\.xml$/;

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

function getAtomAuthor(site: Site) {
  const rootData = site.source.data.get("/") ?? {};
  const authorName = resolveOptionalString(rootData.author) ?? "Phiphi";

  return {
    name: authorName,
  };
}

function buildAtomEntry(
  site: Site,
  page: Data,
  fallbackDate: Date,
): AtomFeedEntry | undefined {
  const pagePath = resolveOptionalString(page.url);
  const title = resolveOptionalString(page.title);

  if (!pagePath || !title) {
    return undefined;
  }

  const absoluteUrl = site.url(pagePath, true);
  const published = resolvePostCreatedDate(page, fallbackDate);
  const updated = resolvePostUpdatedDate(page, published);
  const summary = resolveOptionalString(page.description);
  const contentHtml = resolveOptionalString(page.children);

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

export function createAtomFeedPage(
  site: Site,
  variant: FeedVariant,
  pages: ReadonlyArray<Data>,
  isComplete: boolean = false,
): Page {
  return Page.create({
    url: `${variant.pathPrefix}${ATOM_FEED_PATH}`,
    content: createAtomFeedContent(site, variant, pages, isComplete),
  });
}

function isGeneratedAtomFeedPage(page: Page): boolean {
  return page.sourcePath === "(generated)" &&
    GENERATED_ATOM_FEED_PATH.test(String(page.data.url ?? ""));
}

export function createAtomFeedPages(site: Site): ReadonlyArray<Page> {
  return FEED_VARIANTS.map((variant) => {
    const allPages = site.search.pages(
      `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
      FEED_SORT,
    ) as Data[];
    const pages = allPages.slice(0, FEED_LIMIT);

    return createAtomFeedPage(
      site,
      variant,
      pages,
      allPages.length <= FEED_LIMIT,
    );
  });
}

function replaceGeneratedAtomFeedPages(
  allPages: Page[],
  generatedPages: ReadonlyArray<Page>,
): void {
  for (let index = allPages.length - 1; index >= 0; index--) {
    const page = allPages[index];

    if (page !== undefined && isGeneratedAtomFeedPage(page)) {
      allPages.splice(index, 1);
    }
  }

  allPages.push(...generatedPages);
}

export function registerFeeds(site: Site): void {
  for (const variant of FEED_VARIANTS) {
    site.use(feed(createFeedOptions(variant)));
  }

  site.process(function processAtomFeeds() {
    replaceGeneratedAtomFeedPages(site.pages, createAtomFeedPages(site));
  });
}
