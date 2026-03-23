import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import {
  assertEditorialImageDimensions,
  type EditorialImagePageSnapshot,
} from "../src/utils/editorial-image-dimensions.ts";
import {
  JSON_FEED_PATH_PATTERN,
  normalizeJsonFeed,
} from "../src/utils/json-feed.ts";
import { FEED_VARIANTS } from "./feeds.ts";
import { getLanguageTag, type SiteLanguage } from "../src/utils/i18n.ts";

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

function isMutableRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

export function registerProcessors(site: Site): void {
  // Add `image-size` only on searchable editorial content; other image surfaces
  // are handled separately and should not be pulled into this processor.
  site.process([".html"], (pages: Page[]) => {
    for (const page of pages) {
      for (
        const image of page.document.querySelectorAll(
          "main[data-pagefind-body] img:not([width]):not([height]):not([image-size])",
        )
      ) {
        const src = image.getAttribute("src");

        if (!src || REMOTE_IMAGE_SOURCE_PATTERN.test(src)) {
          continue;
        }

        image.setAttribute("image-size", "");
      }
    }
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

  site.preprocess([".html"], (pages: Page[]) => {
    for (const page of pages) {
      applyMultilanguageDataAliases(page.data);
    }
  });

  const feedLanguageMap = new Map<string, SiteLanguage>(
    FEED_VARIANTS.map((
      variant,
    ) => [`${variant.pathPrefix}/feed.json`, variant.language]),
  );

  // Lume's feed plugin still emits JSON Feed 1.0-shaped output, so normalize
  // generated files after the plugin runs.
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

      let feed: Record<string, unknown>;
      try {
        feed = JSON.parse(decodePageContent(page.content)) as Record<
          string,
          unknown
        >;
      } catch {
        continue;
      }

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
