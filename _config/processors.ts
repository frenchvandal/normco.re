/** HTML processors — image dimensions, XML stylesheets, font preloads, and multilanguage aliases. */

import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import {
  assertEditorialImageDimensions,
  type EditorialImagePageSnapshot,
} from "../src/utils/editorial-image-dimensions.ts";
import { getXmlStylesheetHref } from "../src/utils/xml-stylesheet.ts";
import { selectCriticalFontUrls } from "../src/utils/font-preload.ts";

const REMOTE_IMAGE_SOURCE_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const XML_PI_PATTERN = /^(<\?xml[^?]*\?>)/;
const TEXT_DECODER = new TextDecoder();
const FEED_DATE_KEYS = ["date_published", "date_modified"] as const;

const FEED_LANGUAGE_BY_PREFIX: ReadonlyArray<readonly [string, string]> = [
  ["/fr/", "fr"],
  ["/zh-hans/", "zh-Hans"],
  ["/zh-hant/", "zh-Hant"],
];

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

/** Applies camelCase-to-hyphenated language aliases onto mutable page data. */
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

/** Normalizes Lume page content into a string for downstream text processors. */
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

function getFeedLanguage(pageUrl: string): string {
  for (const [prefix, languageTag] of FEED_LANGUAGE_BY_PREFIX) {
    if (pageUrl.startsWith(prefix)) {
      return languageTag;
    }
  }

  return "en";
}

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

/** Upgrades generated JSON feeds to JSON Feed 1.1 metadata conventions. */
export function normalizeJsonFeedDocument(
  content: string,
  pageUrl: string,
): string {
  let parsed: Record<string, unknown>;

  try {
    const parsedValue = JSON.parse(content) as unknown;

    if (typeof parsedValue !== "object" || parsedValue === null) {
      return content;
    }

    parsed = parsedValue as Record<string, unknown>;
  } catch {
    return content;
  }

  parsed.version = "https://jsonfeed.org/version/1.1";

  if (typeof parsed.language !== "string" || parsed.language.length === 0) {
    parsed.language = getFeedLanguage(pageUrl);
  }

  if (Array.isArray(parsed.items)) {
    for (const item of parsed.items) {
      if (typeof item !== "object" || item === null) {
        continue;
      }

      const itemRecord = item as Record<string, unknown>;

      for (const key of FEED_DATE_KEYS) {
        const isoDate = toIsoDate(itemRecord[key]);

        if (isoDate !== undefined) {
          itemRecord[key] = isoDate;
        }
      }
    }
  }

  return JSON.stringify(parsed);
}

/** Register all HTML and XML processors. */
export function registerProcessors(site: Site): void {
  // Add image-size attribute to editorial images missing dimensions.
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

  // Enforce explicit dimensions in editorial HTML for CLS safeguards.
  site.process([".html"], (pages: Page[]) => {
    const snapshots: EditorialImagePageSnapshot[] = pages.map((page) => ({
      pageUrl: typeof page.data.url === "string"
        ? page.data.url
        : page.outputPath,
      document: page.document,
    }));

    assertEditorialImageDimensions(snapshots);
  });

  // Expose camelCase data aliases for multilanguage hyphenated codes.
  site.preprocess([".html"], (pages: Page[]) => {
    for (const page of pages) {
      applyMultilanguageDataAliases(page.data);
    }
  });

  // Inject <link rel="preload"> for critical font files generated by the
  // google_fonts plugin. Discovers fonts dynamically from site pages instead
  // of hardcoding paths that depend on the plugin's naming convention.
  site.process([".html"], (pages: Page[]) => {
    const fontUrls = site.pages
      .map((p) => p.data.url)
      .filter((url): url is string =>
        typeof url === "string" && url.endsWith(".woff2")
      );

    const criticalUrls = selectCriticalFontUrls(fontUrls);

    if (criticalUrls.length === 0) return;

    for (const page of pages) {
      const head = page.document.querySelector("head");

      if (!head) continue;

      // Insert preloads right before the first <link rel="stylesheet"> for
      // maximum priority — the browser discovers fonts before parsing CSS.
      const firstStylesheet = head.querySelector('link[rel="stylesheet"]');

      for (const fontUrl of criticalUrls) {
        const link = page.document.createElement("link");
        link.setAttribute("rel", "preload");
        link.setAttribute("href", fontUrl);
        link.setAttribute("as", "font");
        link.setAttribute("type", "font/woff2");
        link.setAttribute("crossorigin", "anonymous");

        if (firstStylesheet) {
          head.insertBefore(link, firstStylesheet);
        } else {
          head.appendChild(link);
        }
      }
    }
  });

  // Inject <?xml-stylesheet?> processing instructions into XML outputs.
  site.process([".xml"], (pages: Page[]) => {
    for (const page of pages) {
      const pageUrl = typeof page.data.url === "string"
        ? page.data.url
        : page.outputPath;

      if (typeof pageUrl !== "string") {
        continue;
      }

      const xslHref = getXmlStylesheetHref(pageUrl);

      if (xslHref === undefined) continue;

      const content = decodePageContent(page.content);
      const pi = `<?xml-stylesheet type="text/xsl" href="${xslHref}"?>`;

      if (content.includes(pi)) {
        continue;
      }

      page.content = XML_PI_PATTERN.test(content)
        ? content.replace(XML_PI_PATTERN, `$1\n${pi}`)
        : `${pi}\n${content}`;
    }
  });

  // Normalize generated feed JSON files to strict JSON Feed 1.1 fields.
  site.process([".json"], (pages: Page[]) => {
    for (const page of pages) {
      const pageUrl = typeof page.data.url === "string"
        ? page.data.url
        : page.outputPath;

      if (typeof pageUrl !== "string" || !pageUrl.endsWith("/feed.json")) {
        continue;
      }

      page.content = normalizeJsonFeedDocument(
        decodePageContent(page.content),
        pageUrl,
      );
    }
  });
}
