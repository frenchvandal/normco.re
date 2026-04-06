/**
 * Content contract processor — generates `/api/posts/*.json` from rendered
 * HTML post pages during build.
 *
 * Each JSON file contains a structured block representation of the post
 * content (headings, paragraphs, code blocks, images, quotes, lists)
 * conforming to `contracts/post.schema.json`.
 */

import type Site from "lume/core/site.ts";
import { Page } from "lume/core/file.ts";
import {
  type ContentBlock,
  parsePostContent,
} from "../src/utils/post-content-blocks.ts";
import {
  isDocumentLike,
  resolveOptionalStringArray,
} from "../src/utils/type-guards.ts";

/** Schema version stamped into every generated JSON file. */
const SCHEMA_VERSION = "1.0.0" as const;
const GENERATED_POST_API_PATH =
  /^\/(?:(?:fr|zh-hans|zh-hant)\/)?api\/posts\/.+\.json$/;

/** Structured post JSON conforming to `contracts/post.schema.json`. */
interface PostJson {
  readonly version: typeof SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly lang: string;
  readonly description?: string;
  readonly readingTime?: number;
  readonly tags?: ReadonlyArray<string>;
  readonly url?: string;
  readonly blocks: ReadonlyArray<ContentBlock>;
}

/** Resolves reading time from Lume's readingInfo data. */
function resolveReadingTime(readingInfo: unknown): number | undefined {
  if (typeof readingInfo === "object" && readingInfo !== null) {
    const info = readingInfo as Record<string, unknown>;
    if (typeof info.minutes === "number") {
      return Math.max(1, Math.round(info.minutes));
    }
  }
  return undefined;
}

/** Returns true when the page is a generated post contract JSON file. */
function isGeneratedPostContractPage(page: Page): boolean {
  return page.sourcePath === "(generated)" &&
    GENERATED_POST_API_PATH.test(page.data.url);
}

/** Register the content contract processor on a Lume site. */
export function registerContentContract(site: Site): void {
  site.process([".html"], (pages: Page[], allPages: Page[]) => {
    // In watch mode, processors re-run on incremental rebuilds. These API pages
    // must live only for the current run, otherwise repeated `site.page()`
    // registration accumulates duplicates in Lume's scopedPages registry.
    for (let index = allPages.length - 1; index >= 0; index--) {
      const page = allPages[index];

      if (page !== undefined && isGeneratedPostContractPage(page)) {
        allPages.splice(index, 1);
      }
    }

    for (const page of pages) {
      const data = page.data;

      // Only process post pages
      if (data.type !== "post") continue;

      const id = typeof data.id === "string" ? data.id : undefined;
      const title = typeof data.title === "string" ? data.title : undefined;
      const date = data.date instanceof Date ? data.date : undefined;

      if (id === undefined || title === undefined || date === undefined) {
        continue;
      }

      const lang = typeof data.lang === "string" ? data.lang : "en";
      const document = isDocumentLike(page.document)
        ? page.document
        : undefined;

      if (document === undefined) {
        continue;
      }

      const blocks = parsePostContent(document);

      // Skip posts with no extractable content
      if (blocks.length === 0) continue;

      const readingTime = resolveReadingTime(data.readingInfo);
      const tags = resolveOptionalStringArray(data.tags);

      const postJson: PostJson = {
        version: SCHEMA_VERSION,
        id,
        title,
        date: date.toISOString(),
        lang,
        ...(typeof data.description === "string"
          ? { description: data.description }
          : {}),
        ...(readingTime !== undefined ? { readingTime } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(typeof data.url === "string" ? { url: data.url } : {}),
        blocks,
      };

      // Determine the API output path — language-prefixed for non-English
      const prefix = lang === "en" ? "" : `/${lang}`;
      const apiUrl = `${prefix}/api/posts/${id}.json`;

      allPages.push(Page.create({
        url: apiUrl,
        content: JSON.stringify(postJson, null, 2),
      }));
    }
  });
}
