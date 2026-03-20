import { type Data, Page, type Page as LumePage } from "lume/core/file.ts";
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
  tryResolveSiteLanguage,
} from "../src/utils/i18n.ts";
import {
  type ContentBlock,
  parsePostContent,
} from "../plugins/content-contract.ts";
import { FEED_VARIANTS, type FeedVariant } from "./feeds.ts";

export const APP_CONTRACT_VERSION = "1" as const;
export const APP_MANIFEST_API_PATH = "/api/app-manifest.json" as const;
export const POSTS_INDEX_API_PATH = "/api/posts/index.json" as const;

const GENERATED_MOBILE_API_PATH =
  /^\/(?:(?:fr|zh-hans|zh-hant)\/)?api\/(?:app-manifest\.json|posts\/(?:index|[^/]+)\.json)$/;

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

type PostDetailAlternate = {
  readonly lang: string;
  readonly apiUrl: string;
  readonly webUrl: string;
};

export type PostDetailDocument = {
  readonly version: typeof APP_CONTRACT_VERSION;
  readonly id: string;
  readonly slug: string;
  readonly lang: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly readingTime?: number;
  readonly tags?: ReadonlyArray<string>;
  readonly alternates: ReadonlyArray<PostDetailAlternate>;
  readonly heroImage?: RemoteImage | null;
  readonly webUrl: string;
  readonly blocks: ReadonlyArray<ContentBlock>;
};

type SiteUrlResolver = Pick<Site, "url">;

type PostPage = LumePage & {
  readonly data: Data;
  readonly document?: unknown;
};

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

function resolvePageLanguage(page: Data): SiteLanguage {
  const language = tryResolveSiteLanguage(page.lang);

  if (language === undefined) {
    throw new Error(
      `Cannot generate mobile content contract for ${
        describePage(page)
      }: invalid "lang"`,
    );
  }

  return language;
}

function getPostDetailApiPath(slug: string, language: SiteLanguage): string {
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
    detailApiUrl: getPostDetailApiPath(slug, language),
    webUrl: site.url(webPath, true),
  };
}

function isDocumentLike(value: unknown): value is Document {
  return typeof value === "object" &&
    value !== null &&
    "querySelector" in value &&
    typeof value.querySelector === "function";
}

function isPostPage(page: LumePage): page is PostPage {
  return page.data.type === "post";
}

function isGeneratedMobileApiPage(page: LumePage): boolean {
  return page.sourcePath === "(generated)" &&
    GENERATED_MOBILE_API_PATH.test(page.data.url);
}

function sortPostPagesByDateDesc(
  pages: ReadonlyArray<PostPage>,
): ReadonlyArray<PostPage> {
  return [...pages].sort((left, right) => {
    const leftDate = resolvePostDate(left.data.date, new Date(0)).getTime();
    const rightDate = resolvePostDate(right.data.date, new Date(0)).getTime();

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    const leftSlug = getOptionalString(left.data.slug) ?? "";
    const rightSlug = getOptionalString(right.data.slug) ?? "";
    return leftSlug.localeCompare(rightSlug);
  });
}

function createPostDetailAlternates(
  site: SiteUrlResolver,
  currentPage: PostPage,
  siblingPages: ReadonlyArray<PostPage>,
): ReadonlyArray<PostDetailAlternate> {
  const currentLanguageDataCode = getLanguageDataCode(
    resolvePageLanguage(currentPage.data),
  );
  const siblingPagesByLang = new Map(
    siblingPages.map((page) => [
      getLanguageDataCode(resolvePageLanguage(page.data)),
      page,
    ]),
  );
  const slug = requireString(currentPage.data, "slug", currentPage.data.slug);

  return FEED_VARIANTS.flatMap((variant) => {
    const languageDataCode = LANGUAGE_DATA_CODE[variant.language];

    if (languageDataCode === currentLanguageDataCode) {
      return [];
    }

    const siblingPage = siblingPagesByLang.get(languageDataCode);

    if (siblingPage === undefined) {
      return [];
    }

    return [{
      lang: languageDataCode,
      apiUrl: getPostDetailApiPath(slug, variant.language),
      webUrl: site.url(
        requireString(siblingPage.data, "url", siblingPage.data.url),
        true,
      ),
    }];
  });
}

function createPostDetailBlocks(page: PostPage): ReadonlyArray<ContentBlock> {
  if (!isDocumentLike(page.document)) {
    throw new Error(
      `Cannot generate mobile content contract for ${
        describePage(page.data)
      }: missing renderable document`,
    );
  }

  const blocks = parsePostContent(page.document);

  if (blocks.length === 0) {
    throw new Error(
      `Cannot generate mobile content contract for ${
        describePage(page.data)
      }: no content blocks extracted`,
    );
  }

  return blocks;
}

function createPostDetailDocument(
  site: SiteUrlResolver,
  page: PostPage,
  siblingPages: ReadonlyArray<PostPage>,
): PostDetailDocument {
  const language = resolvePageLanguage(page.data);
  const slug = requireString(page.data, "slug", page.data.slug);
  const id = getOptionalString(page.data.id) ?? slug;
  const webPath = requireString(page.data, "url", page.data.url);
  const title = requireString(page.data, "title", page.data.title);
  const summary = requireString(
    page.data,
    "description",
    page.data.description,
  );
  const publishedAt = resolvePublishedAt(page.data);
  const updatedAt = resolveUpdatedAt(page.data);
  const readingTime = resolveReadingMinutes(page.data.readingInfo);
  const tags = getOptionalStringArray(page.data.tags);

  return {
    version: APP_CONTRACT_VERSION,
    id,
    slug,
    lang: getLanguageDataCode(language),
    title,
    summary,
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    ...(readingTime !== undefined ? { readingTime } : {}),
    ...(tags ? { tags } : {}),
    alternates: createPostDetailAlternates(site, page, siblingPages),
    heroImage: null,
    webUrl: site.url(webPath, true),
    blocks: createPostDetailBlocks(page),
  };
}

function createPostPagesBySlugMap(
  postPages: ReadonlyArray<PostPage>,
): ReadonlyMap<string, ReadonlyArray<PostPage>> {
  const map = new Map<string, PostPage[]>();

  for (const page of postPages) {
    const slug = requireString(page.data, "slug", page.data.slug);
    const existing = map.get(slug);

    if (existing) {
      existing.push(page);
      continue;
    }

    map.set(slug, [page]);
  }

  return map;
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

export function createPostDetailPage(
  site: SiteUrlResolver,
  page: PostPage,
  siblingPages: ReadonlyArray<PostPage>,
): Page {
  const slug = requireString(page.data, "slug", page.data.slug);
  const language = resolvePageLanguage(page.data);

  return Page.create({
    url: getPostDetailApiPath(slug, language),
    content: stringifyJson(createPostDetailDocument(site, page, siblingPages)),
  });
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
  site.process([".html"], function processMobileContentApi(
    pages: LumePage[],
    allPages: LumePage[],
  ) {
    for (let index = allPages.length - 1; index >= 0; index--) {
      const page = allPages[index];

      if (page !== undefined && isGeneratedMobileApiPage(page)) {
        allPages.splice(index, 1);
      }
    }

    const generatedAt = new Date();
    const postPages = pages.filter(isPostPage);
    const postPagesBySlug = createPostPagesBySlugMap(postPages);

    allPages.push(createAppManifestPage(generatedAt));

    for (const variant of FEED_VARIANTS) {
      const localizedPostPages = sortPostPagesByDateDesc(
        postPages.filter((page) =>
          getLanguageDataCode(resolvePageLanguage(page.data)) ===
            LANGUAGE_DATA_CODE[variant.language]
        ),
      );

      allPages.push(
        createPostsIndexPage(
          site,
          variant,
          localizedPostPages.map((page) => page.data),
        ),
      );

      for (const page of localizedPostPages) {
        const slug = requireString(page.data, "slug", page.data.slug);

        allPages.push(
          createPostDetailPage(site, page, postPagesBySlug.get(slug) ?? [page]),
        );
      }
    }
  });
}
