import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import { generate as generateUuidV7 } from "@std/uuid/v7";
import {
  dirname as posixDirname,
  normalize as normalizePosix,
} from "@std/path/posix";
import {
  imageDimensionsFromData,
  imageDimensionsFromStream,
} from "lume/deps/image_dimmensions.ts";
import {
  assertEditorialImageDimensions,
  type EditorialImagePageSnapshot,
} from "../src/utils/editorial-image-dimensions.ts";
import {
  JSON_FEED_PATH_PATTERN,
  normalizeJsonFeed,
  parseJsonFeedDocument,
} from "../src/utils/json-feed.ts";
import { FEED_VARIANTS } from "../plugins/feeds.ts";
import { getLanguageTag, type SiteLanguage } from "../src/utils/i18n.ts";
import {
  isMutableRecord,
  resolveOptionalTrimmedString,
} from "../src/utils/type-guards.ts";
import {
  tryResolvePostCreatedDate,
  tryResolvePostUpdatedDate,
} from "../src/posts/post-metadata.ts";
import { registerContentInvariants } from "../plugins/content_invariants.ts";
import { registerPostLinkGraph } from "../plugins/post_link_graph.ts";
import { createGitFileHistoryResolver, type GitFileHistory } from "./git.ts";

const REMOTE_IMAGE_SOURCE_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const TEXT_DECODER = new TextDecoder();

// Maps hyphenated Lume data keys (URL-style) to their camelCase TypeScript
// equivalents used throughout the codebase. The multilanguage plugin resolves
// "zh-hans" as "zh" then "hans" (two separate segments), so page data exported
// as `zhHans` must be copied to the "zh-hans" key at preprocess time.
const MULTILANGUAGE_DATA_ALIASES = {
  "zh-hans": "zhHans",
  "zh-hant": "zhHant",
} as const;
const POSTS_SOURCE_SEGMENT = "/posts/";
type ImageDimensions = Readonly<{
  width: number;
  height: number;
  type: string;
}>;

function parseGeneratedJsonFeed(
  pageUrl: string,
  content: unknown,
): ReturnType<typeof parseJsonFeedDocument> {
  try {
    return parseJsonFeedDocument(decodePageContent(content));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(`Invalid JSON feed emitted for ${pageUrl}: ${reason}`);
  }
}

function normalizeSourcePath(sourcePath: string): string {
  return normalizePosix(sourcePath.replaceAll("\\", "/"));
}

export function resolveLocalAssetUrl(
  pageOutputPath: string,
  src: string,
): string | undefined {
  if (!src || REMOTE_IMAGE_SOURCE_PATTERN.test(src)) {
    return undefined;
  }

  try {
    return new URL(src, `https://normco.re${pageOutputPath}`).pathname;
  } catch {
    return undefined;
  }
}

async function getLocalImageDimensions(
  site: Site,
  assetUrl: string,
  cache: Map<string, ImageDimensions | undefined>,
): Promise<ImageDimensions | undefined> {
  if (cache.has(assetUrl)) {
    return cache.get(assetUrl);
  }

  const page = site.pages.find((candidate) => candidate.data.url === assetUrl);
  if (page) {
    const dimensions = imageDimensionsFromData(page.bytes);
    cache.set(assetUrl, dimensions);
    return dimensions;
  }

  const file = site.files.find((candidate) => candidate.data.url === assetUrl);
  if (!file || file.src.entry.flags.has("remote")) {
    cache.set(assetUrl, undefined);
    return undefined;
  }

  using stream = await Deno.open(file.src.entry.src, {
    read: true,
    write: false,
  });
  const dimensions = await imageDimensionsFromStream(stream.readable);
  cache.set(assetUrl, dimensions);
  return dimensions;
}

async function applyEditorialImageDimensions(
  site: Site,
  pages: Page[],
): Promise<void> {
  const cache = new Map<string, ImageDimensions | undefined>();

  for (const page of pages) {
    for (
      const image of page.document.querySelectorAll(
        "main[data-pagefind-body] img",
      )
    ) {
      const width = image.getAttribute("width");
      const height = image.getAttribute("height");

      if (width?.trim() && height?.trim()) {
        continue;
      }

      const src = image.getAttribute("src");
      const assetUrl = resolveLocalAssetUrl(page.outputPath, src ?? "");

      if (!assetUrl) {
        continue;
      }

      const dimensions = await getLocalImageDimensions(site, assetUrl, cache);

      if (!dimensions) {
        continue;
      }

      image.setAttribute("width", String(dimensions.width));
      image.setAttribute("height", String(dimensions.height));
    }
  }
}

export function getPostIdScopeKey(sourcePath: string): string | undefined {
  if (sourcePath.length === 0 || sourcePath === "(generated)") {
    return undefined;
  }

  const normalizedSourcePath = normalizeSourcePath(sourcePath);
  const postsSegmentIndex = normalizedSourcePath.indexOf(POSTS_SOURCE_SEGMENT);

  if (postsSegmentIndex === -1) {
    return undefined;
  }

  const scopeDir = posixDirname(normalizedSourcePath);
  if (scopeDir.length <= postsSegmentIndex + POSTS_SOURCE_SEGMENT.length - 1) {
    return undefined;
  }

  return scopeDir;
}

export function assignMissingPostId(
  pageData: unknown,
  sourcePath: string | undefined,
  postIdsByScope: Map<string, string>,
  generateId: () => string = generateUuidV7,
): void {
  if (!isMutableRecord(pageData) || pageData.type !== "post") {
    return;
  }

  const basename = resolveOptionalTrimmedString(pageData.basename);
  const scopeKey = (sourcePath ? getPostIdScopeKey(sourcePath) : undefined) ??
    (basename ? `basename:${basename}` : undefined);
  const existingId = resolveOptionalTrimmedString(pageData.id);

  if (existingId !== undefined) {
    if (scopeKey !== undefined) {
      postIdsByScope.set(scopeKey, existingId);
    }
    return;
  }

  const scopedId = scopeKey !== undefined
    ? postIdsByScope.get(scopeKey)
    : undefined;

  if (scopedId !== undefined) {
    pageData.id = scopedId;
    return;
  }

  const generatedId = generateId();

  if (scopeKey !== undefined) {
    postIdsByScope.set(scopeKey, generatedId);
  }

  pageData.id = generatedId;
}

type PostGitMetadata = Readonly<{
  createdAt?: string;
  lastCommit?: Readonly<{
    sha: string;
    shortSha: string;
    date: string;
    path: string;
    url?: string;
    commitUrl?: string;
  }>;
}>;

export function applyPostGitMetadata(
  pageData: unknown,
  sourcePath: string | undefined,
  resolveGitHistory: (sourcePath: string) => GitFileHistory,
): void {
  if (
    !isMutableRecord(pageData) ||
    pageData.type !== "post" ||
    typeof sourcePath !== "string" ||
    sourcePath.length === 0
  ) {
    return;
  }

  const gitHistory = resolveGitHistory(sourcePath);
  const lastCommit = gitHistory.lastCommit;
  const metadata: PostGitMetadata = {
    ...(gitHistory.createdAt ? { createdAt: gitHistory.createdAt } : {}),
    ...(lastCommit
      ? {
        lastCommit: {
          sha: lastCommit.sha,
          shortSha: lastCommit.shortSha,
          date: lastCommit.committedAt,
          path: lastCommit.filePath,
          ...(lastCommit.historyUrl ? { url: lastCommit.historyUrl } : {}),
          ...(lastCommit.commitUrl ? { commitUrl: lastCommit.commitUrl } : {}),
        },
      }
      : {}),
  };

  if (gitHistory.createdAt) {
    pageData.git_created = gitHistory.createdAt;
  }

  const resolvedCreatedDate = tryResolvePostCreatedDate({
    date: pageData.date,
    ...(gitHistory.createdAt ? { git_created: gitHistory.createdAt } : {}),
  });
  const resolvedUpdatedDate = tryResolvePostUpdatedDate({
    date: resolvedCreatedDate ?? pageData.date,
    update_date: pageData.update_date,
    ...(gitHistory.createdAt ? { git_created: gitHistory.createdAt } : {}),
    ...(gitHistory.createdAt || lastCommit ? { git: metadata } : {}),
  });

  if (resolvedCreatedDate) {
    pageData.date = resolvedCreatedDate;
  }

  if (resolvedUpdatedDate) {
    pageData.update_date = resolvedUpdatedDate;
  }

  if (gitHistory.createdAt || lastCommit) {
    pageData.git = metadata;
  }
}

export function applyMultilanguageDataAliases(pageData: unknown): void {
  if (!isMutableRecord(pageData)) {
    return;
  }

  for (
    const [languageCode, exportKey] of Object.entries(
      MULTILANGUAGE_DATA_ALIASES,
    )
  ) {
    if (pageData[languageCode] !== undefined) {
      continue;
    }

    const aliasData = pageData[exportKey];

    if (aliasData !== undefined) {
      pageData[languageCode] = aliasData;
    }
  }
}

export function decodePageContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (content instanceof Uint8Array) {
    return TEXT_DECODER.decode(content);
  }

  if (ArrayBuffer.isView(content)) {
    return TEXT_DECODER.decode(
      new Uint8Array(content.buffer, content.byteOffset, content.byteLength),
    );
  }

  if (content instanceof ArrayBuffer) {
    return TEXT_DECODER.decode(new Uint8Array(content));
  }

  return String(content);
}

export function registerPostDataPreparation(site: Site): void {
  // The multilanguage plugin groups localized siblings by `id` while building
  // alternates, so post ids and hyphenated language aliases must exist first.
  const generatedPostIdsByScope = new Map<string, string>();
  const resolveGitHistory = createGitFileHistoryResolver();

  site.preprocess([".html"], (pages: Page[]) => {
    for (const page of pages) {
      applyMultilanguageDataAliases(page.data);
      assignMissingPostId(
        page.data,
        typeof page.sourcePath === "string" ? page.sourcePath : undefined,
        generatedPostIdsByScope,
      );
      applyPostGitMetadata(
        page.data,
        typeof page.sourcePath === "string" ? page.sourcePath : undefined,
        resolveGitHistory,
      );
    }
  });
}

export function registerProcessors(site: Site): void {
  // Editorial images can be rewritten later in the pipeline by Lume's picture
  // plugin, so resolve dimensions against the final local asset URL here.
  site.process([".html"], async (pages: Page[]) => {
    await applyEditorialImageDimensions(site, pages);
  });

  // Fail the build when editorial images still ship without dimensions.
  site.process([".html"], (pages: Page[]) => {
    const snapshots: EditorialImagePageSnapshot[] = pages.map((page) => ({
      pageUrl: typeof page.data.url === "string"
        ? page.data.url
        : page.outputPath,
      document: page.document,
    }));

    assertEditorialImageDimensions(snapshots);
  });

  registerPostLinkGraph(site);
  registerContentInvariants(site);

  const feedLanguageMap = new Map<string, SiteLanguage>(
    FEED_VARIANTS.map((
      variant,
    ) => [`${variant.pathPrefix}/feed.json`, variant.language]),
  );

  // Lume 3.2.4 emits JSON Feed 1.1, but we re-normalize to defend against
  // schema drift and to keep date strings RFC 3339-compliant.
  site.process([".json"], (pages: Page[]) => {
    for (const page of pages) {
      const pageUrl = typeof page.data.url === "string"
        ? page.data.url
        : page.outputPath;

      if (
        typeof pageUrl !== "string" ||
        !JSON_FEED_PATH_PATTERN.test(pageUrl)
      ) {
        continue;
      }

      const feed = parseGeneratedJsonFeed(pageUrl, page.content);
      const language = feedLanguageMap.get(pageUrl);
      page.content = JSON.stringify(
        normalizeJsonFeed(
          feed,
          language ? getLanguageTag(language) : undefined,
        ),
      );
    }
  });
}
