import { type Data, Page as LumePage } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";
import {
  resolvePostCreatedDate,
  resolvePostUpdatedDate,
  resolveReadingMinutes,
} from "../src/posts/post-metadata.ts";
import { formatRfc3339Instant } from "../src/utils/date-time.ts";
import {
  DEFAULT_LANGUAGE,
  getLanguageDataCode,
  getLocalizedUrl,
  LANGUAGE_DATA_CODE,
  type SiteLanguage,
  tryResolveSiteLanguage,
} from "../src/utils/i18n.ts";
import {
  isDocumentLike,
  resolveOptionalStringArray,
} from "../src/utils/type-guards.ts";
import {
  APP_CONTRACT_VERSION,
  APP_MANIFEST_API_PATH,
  getPostDetailApiPath,
  POSTS_INDEX_API_PATH,
} from "../src/utils/mobile-content-contract.ts";
import {
  type ContentBlock,
  parsePostContent,
} from "../src/utils/post-content-blocks.ts";
import { FEED_VARIANTS, type FeedVariant } from "./feeds.ts";

export {
  APP_CONTRACT_VERSION,
  APP_MANIFEST_API_PATH,
  POSTS_INDEX_API_PATH,
} from "../src/utils/mobile-content-contract.ts";

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

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function describePage(page: Data): string {
  return getOptionalString(page.url) ?? "(unknown post)";
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
  const publishedAt = resolvePostCreatedDate(page, fallback);

  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(
      `Cannot generate mobile content contract for ${
        describePage(page)
      }: invalid "date"`,
    );
  }

  return formatRfc3339Instant(publishedAt);
}

function resolveUpdatedAt(page: Data): string | undefined {
  const fallback = new Date(NaN);
  const updatedAt = resolvePostUpdatedDate(page, fallback);
  return Number.isNaN(updatedAt.getTime())
    ? undefined
    : formatRfc3339Instant(updatedAt);
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

function createPostsIndexItem(
  site: SiteUrlResolver,
  page: Data,
  language: SiteLanguage,
): PostsIndexItem {
  const slug = requireString(page, "basename", page.basename);
  const id = getOptionalString(page.id) ?? slug;
  const webPath = requireString(page, "url", page.url);
  const title = requireString(page, "title", page.title);
  const summary = requireString(page, "description", page.description);
  const publishedAt = resolvePublishedAt(page);
  const updatedAt = resolveUpdatedAt(page);
  const readingTime = resolveReadingMinutes(page.readingInfo);
  const tags = resolveOptionalStringArray(page.tags);

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

function isPostPage(page: LumePage): page is PostPage {
  return page.data.type === "post" &&
    typeof page.outputPath === "string" &&
    page.outputPath.endsWith(".html") &&
    isDocumentLike(page.document);
}

function isGeneratedMobileApiPage(page: LumePage): boolean {
  return page.sourcePath === "(generated)" &&
    GENERATED_MOBILE_API_PATH.test(page.data.url);
}

function sortPostPagesByDateDesc(
  pages: ReadonlyArray<PostPage>,
): ReadonlyArray<PostPage> {
  return [...pages].sort((left, right) => {
    const leftDate = resolvePostCreatedDate(left.data, new Date(0)).getTime();
    const rightDate = resolvePostCreatedDate(right.data, new Date(0)).getTime();

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    const leftSlug = getOptionalString(left.data.basename) ?? "";
    const rightSlug = getOptionalString(right.data.basename) ?? "";
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
  const slug = requireString(
    currentPage.data,
    "basename",
    currentPage.data.basename,
  );

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
  const slug = requireString(page.data, "basename", page.data.basename);
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
  const tags = resolveOptionalStringArray(page.data.tags);

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
    const slug = requireString(page.data, "basename", page.data.basename);
    map.getOrInsertComputed(slug, () => []).push(page);
  }

  return map;
}

export function createAppManifestDocument(
  generatedAt: Date = new Date(),
): AppManifestDocument {
  return {
    version: APP_CONTRACT_VERSION,
    generatedAt: formatRfc3339Instant(generatedAt),
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
): LumePage {
  const slug = requireString(page.data, "basename", page.data.basename);
  const language = resolvePageLanguage(page.data);

  return LumePage.create({
    url: getPostDetailApiPath(slug, language),
    content: stringifyJson(createPostDetailDocument(site, page, siblingPages)),
  });
}

export function createAppManifestPage(
  generatedAt: Date = new Date(),
): LumePage {
  return LumePage.create({
    url: APP_MANIFEST_API_PATH,
    content: stringifyJson(createAppManifestDocument(generatedAt)),
  });
}

export function createPostsIndexPage(
  site: SiteUrlResolver,
  variant: FeedVariant,
  pages: ReadonlyArray<Data>,
): LumePage {
  return LumePage.create({
    url: getLocalizedUrl(POSTS_INDEX_API_PATH, variant.language),
    content: stringifyJson(
      createPostsIndexDocument(site, variant.language, pages),
    ),
  });
}

export function createMobileContentApiPages(
  site: SiteUrlResolver,
  postPages: ReadonlyArray<PostPage>,
  generatedAt: Date = new Date(),
): ReadonlyArray<LumePage> {
  const postPagesBySlug = createPostPagesBySlugMap(postPages);
  const generatedPages: LumePage[] = [createAppManifestPage(generatedAt)];

  for (const variant of FEED_VARIANTS) {
    const localizedPostPages = sortPostPagesByDateDesc(
      postPages.filter((page) =>
        getLanguageDataCode(resolvePageLanguage(page.data)) ===
          LANGUAGE_DATA_CODE[variant.language]
      ),
    );

    generatedPages.push(
      createPostsIndexPage(
        site,
        variant,
        localizedPostPages.map((page) => page.data),
      ),
    );

    for (const page of localizedPostPages) {
      const slug = requireString(page.data, "basename", page.data.basename);

      generatedPages.push(
        createPostDetailPage(site, page, postPagesBySlug.get(slug) ?? [page]),
      );
    }
  }

  return generatedPages;
}

function replaceGeneratedMobileApiPages(
  allPages: LumePage[],
  generatedPages: ReadonlyArray<LumePage>,
): void {
  for (let index = allPages.length - 1; index >= 0; index--) {
    const page = allPages[index];

    if (page !== undefined && isGeneratedMobileApiPage(page)) {
      allPages.splice(index, 1);
    }
  }

  allPages.push(...generatedPages);
}

export function registerMobileContentApi(site: Site): void {
  site.process(function processMobileContentApi() {
    const allPages = site.pages;
    const postPages = allPages.filter(isPostPage);
    const generatedPages = createMobileContentApiPages(
      site,
      postPages,
      new Date(),
    );

    replaceGeneratedMobileApiPages(allPages, generatedPages);
  });
}
