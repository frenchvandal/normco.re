import { dirname, fromFileUrl, join } from "@std/path";
import { DOMParser } from "lume/deps/dom.ts";
import { imageDimensionsFromStream } from "lume/deps/image_dimmensions.ts";

import type { DateHelper } from "../utils/lume-helpers.ts";
import type { SiteLanguage } from "../utils/i18n.ts";
import type { BlogGalleryItem } from "./view-data.ts";
import { toStoryData } from "../utils/story-data.ts";
import { resolveHtmlChildren } from "../utils/lume-data.ts";
import { resolveOptionalTrimmedString } from "../utils/type-guards.ts";

const REMOTE_IMAGE_SOURCE_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
type GalleryImageDimensions = Readonly<{
  width: number;
  height: number;
}>;

type HtmlImageLike = Readonly<{
  getAttribute(name: string): string | null;
}>;

const DEFAULT_GALLERY_IMAGE_DIMENSIONS = {
  width: 4,
  height: 3,
} as const satisfies GalleryImageDimensions;
const REPO_ROOT = join(dirname(fromFileUrl(import.meta.url)), "..", "..");
const IMAGE_DIMENSIONS_CACHE = new Map<
  string,
  Promise<GalleryImageDimensions | undefined>
>();

function parseDimensionAttribute(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function resolveGalleryAssetUrl(
  slug: string,
  src: string | undefined,
): string | undefined {
  const resolvedSrc = src?.trim();

  if (!resolvedSrc || REMOTE_IMAGE_SOURCE_PATTERN.test(resolvedSrc)) {
    return undefined;
  }

  if (resolvedSrc.startsWith("/")) {
    return resolvedSrc;
  }

  return new URL(resolvedSrc, `https://normco.re/posts/${slug}/`).pathname;
}

function resolveLocalAssetPath(assetUrl: string): string {
  return join(REPO_ROOT, "src", assetUrl.replace(/^\/+/, ""));
}

async function readLocalImageDimensions(
  assetUrl: string,
): Promise<GalleryImageDimensions | undefined> {
  const cached = IMAGE_DIMENSIONS_CACHE.get(assetUrl);

  if (cached !== undefined) {
    return await cached;
  }

  const pendingDimensions = (async () => {
    const filePath = resolveLocalAssetPath(assetUrl);

    try {
      using stream = await Deno.open(filePath, {
        read: true,
        write: false,
      });
      const dimensions = await imageDimensionsFromStream(stream.readable);

      if (
        dimensions === undefined ||
        !Number.isFinite(dimensions.width) ||
        !Number.isFinite(dimensions.height)
      ) {
        return undefined;
      }

      return {
        width: dimensions.width,
        height: dimensions.height,
      };
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return undefined;
      }

      throw error;
    }
  })();

  IMAGE_DIMENSIONS_CACHE.set(assetUrl, pendingDimensions);

  return await pendingDimensions;
}

function resolveImageDimensionsFromElement(
  image: HtmlImageLike,
): GalleryImageDimensions | undefined {
  const width = parseDimensionAttribute(image.getAttribute("width"));
  const height = parseDimensionAttribute(image.getAttribute("height"));

  if (width === undefined || height === undefined) {
    return undefined;
  }

  return { width, height };
}

export async function collectGalleryItems(
  posts: readonly Lume.Data[],
  language: SiteLanguage,
  dateFormat: DateHelper,
): Promise<readonly BlogGalleryItem[]> {
  const parser = new DOMParser();
  const items: BlogGalleryItem[] = [];
  const diagnostics: string[] = [];

  for (const post of posts) {
    const slug = resolveOptionalTrimmedString(post.basename);
    const html = resolveHtmlChildren(post.children);
    const childrenType = typeof post.children;
    const htmlLen = html?.length ?? -1;

    if (slug === undefined || html === undefined) {
      diagnostics.push(
        `skip post basename=${
          String(post.basename)
        } childrenType=${childrenType} htmlLen=${htmlLen}`,
      );
      continue;
    }

    const document = parser.parseFromString(
      `<article>${html}</article>`,
      "text/html",
    );
    const root = document?.querySelector("article");

    if (root === null || root === undefined) {
      diagnostics.push(`skip post ${slug}: article root missing`);
      continue;
    }

    const story = toStoryData(post, language, dateFormat);
    const seenPostImages = new Set<string>();
    let imageIndex = 0;
    const imgs = Array.from(root.querySelectorAll("img"));
    diagnostics.push(
      `post ${slug} lang=${language} htmlLen=${htmlLen} imgCount=${imgs.length}`,
    );

    for (const image of imgs) {
      const src = resolveGalleryAssetUrl(slug, image.getAttribute("src") ?? "");

      if (src === undefined || seenPostImages.has(src)) {
        diagnostics.push(
          `  skip img src=${image.getAttribute("src")} resolved=${src}`,
        );
        continue;
      }

      seenPostImages.add(src);
      imageIndex += 1;

      const explicitDimensions = resolveImageDimensionsFromElement(image);
      const resolvedDimensions = explicitDimensions ??
        await readLocalImageDimensions(src) ??
        DEFAULT_GALLERY_IMAGE_DIMENSIONS;

      items.push({
        key: `${story.url}::${imageIndex}`,
        src,
        alt: image.getAttribute("alt")?.trim() || story.title,
        width: resolvedDimensions.width,
        height: resolvedDimensions.height,
        postTitle: story.title,
        postUrl: story.url,
        ...(story.summary ? { postSummary: story.summary } : {}),
        postDateIso: story.dateIso,
        postDateLabel: story.dateLabel,
        ...(story.readingLabel ? { postReadingLabel: story.readingLabel } : {}),
        tags: story.tags,
      });
    }
  }

  if (items.length === 0) {
    console.error(
      `[gallery] empty (lang=${language}, postsIn=${posts.length})\n${
        diagnostics.join("\n")
      }`,
    );
  }

  return items;
}
