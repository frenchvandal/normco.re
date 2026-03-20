import { type Data, Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../src/posts/post-metadata.ts";
import {
  DEFAULT_LANGUAGE,
  getLanguageDataCode,
  getLocalizedUrl,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
} from "../src/utils/i18n.ts";
import { FEED_SORT, FEED_VARIANTS, type FeedVariant } from "./feeds.ts";

export const APP_CONTRACT_VERSION = "1" as const;
export const APP_MANIFEST_API_PATH = "/api/app-manifest.json" as const;
export const POSTS_INDEX_API_PATH = "/api/posts/index.json" as const;

type AppManifestPointer = {
  readonly lang: string;
  readonly apiUrl: string;
};

export type AppManifestDocument = {
  readonly version: typeof APP_CONTRACT_VERSION;
  readonly generatedAt: string;
  readonly defaultLanguage: string;
  readonly languages: ReadonlyArray<string>;
  readonly postsIndex: ReadonlyArray<AppManifestPointer>;
};

type RemoteImage = {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
};

export type PostsIndexItem = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly readingTime?: number;
  readonly tags?: ReadonlyArray<string>;
  readonly heroImage?: RemoteImage | null;
  readonly detailApiUrl: string;
  readonly webUrl: string;
};

export type PostsIndexDocument = {
  readonly version: typeof APP_CONTRACT_VERSION;
  readonly lang: string;
  readonly items: ReadonlyArray<PostsIndexItem>;
};

type SiteUrlResolver = Pick<Site, "url">;

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace(".000Z", "Z");
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function getOptionalStringArray(
  value: unknown,
): ReadonlyArray<string> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter((item): item is string =>
    typeof item === "string"
  );
  return strings.length > 0 ? strings : undefined;
}

function toValidDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
}

function describePage(page: Data): string {
  return getOptionalString(page.url) ?? getOptionalString(page.slug) ??
    "(unknown post)";
}

function requireString(
  page: Data,
  field: string,
  value: unknown,
): string {
  const resolved = getOptionalString(value);

  if (resolved !== undefined) {
    return resolved;
  }

  throw new Error(
    `Cannot generate mobile content contract for ${
      describePage(page)
    }: missing "${field}"`,
  );
}

function resolvePublishedAt(page: Data): string {
  const fallback = new Date(NaN);
  const publishedAt = resolvePostDate(page.date, fallback);

  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(
      `Cannot generate mobile content contract for ${
        describePage(page)
      }: invalid "date"`,
    );
  }

  return formatDateTime(publishedAt);
}

function resolveUpdatedAt(page: Data): string | undefined {
  const updatedAt = toValidDate(page.update_date);
  return updatedAt ? formatDateTime(updatedAt) : undefined;
}

function getPostDetailApiUrl(slug: string, language: SiteLanguage): string {
  return getLocalizedUrl(`/api/posts/${slug}.json`, language);
}

function createPostsIndexItem(
  site: SiteUrlResolver,
  page: Data,
  language: SiteLanguage,
): PostsIndexItem {
  const slug = requireString(page, "slug", page.slug);
  const id = getOptionalString(page.id) ?? slug;
  const webPath = requireString(page, "url", page.url);
  const title = requireString(page, "title", page.title);
  const summary = requireString(page, "description", page.description);
  const publishedAt = resolvePublishedAt(page);
  const updatedAt = resolveUpdatedAt(page);
  const readingTime = resolveReadingMinutes(page.readingInfo);
  const tags = getOptionalStringArray(page.tags);

  return {
    id,
    slug,
    title,
    summary,
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    ...(readingTime !== undefined ? { readingTime } : {}),
    ...(tags ? { tags } : {}),
    detailApiUrl: getPostDetailApiUrl(slug, language),
    webUrl: site.url(webPath, true),
  };
}

export function createAppManifestDocument(
  generatedAt: Date = new Date(),
): AppManifestDocument {
  return {
    version: APP_CONTRACT_VERSION,
    generatedAt: formatDateTime(generatedAt),
    defaultLanguage: LANGUAGE_DATA_CODE[DEFAULT_LANGUAGE],
    languages: FEED_VARIANTS.map((variant) =>
      LANGUAGE_DATA_CODE[variant.language]
    ),
    postsIndex: FEED_VARIANTS.map((variant) => ({
      lang: LANGUAGE_DATA_CODE[variant.language],
      apiUrl: getLocalizedUrl(POSTS_INDEX_API_PATH, variant.language),
    })),
  };
}

export function createPostsIndexDocument(
  site: SiteUrlResolver,
  language: SiteLanguage,
  pages: ReadonlyArray<Data>,
): PostsIndexDocument {
  return {
    version: APP_CONTRACT_VERSION,
    lang: getLanguageDataCode(language),
    items: pages.map((page) => createPostsIndexItem(site, page, language)),
  };
}

export function createAppManifestPage(generatedAt: Date = new Date()): Page {
  return Page.create({
    url: APP_MANIFEST_API_PATH,
    content: stringifyJson(createAppManifestDocument(generatedAt)),
  });
}

export function createPostsIndexPage(
  site: SiteUrlResolver,
  variant: FeedVariant,
  pages: ReadonlyArray<Data>,
): Page {
  return Page.create({
    url: getLocalizedUrl(POSTS_INDEX_API_PATH, variant.language),
    content: stringifyJson(
      createPostsIndexDocument(site, variant.language, pages),
    ),
  });
}

export function registerMobileContentApi(site: Site): void {
  site.process(function processMobileContentApi() {
    const generatedAt = new Date();

    site.pages.push(createAppManifestPage(generatedAt));

    for (const variant of FEED_VARIANTS) {
      const pages = site.search.pages(
        `type=post lang=${LANGUAGE_DATA_CODE[variant.language]}`,
        FEED_SORT,
      ) as Data[];

      site.pages.push(createPostsIndexPage(site, variant, pages));
    }
  });
}
