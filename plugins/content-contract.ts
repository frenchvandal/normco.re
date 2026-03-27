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
  isDocumentLike,
  resolveOptionalStringArray,
} from "../src/utils/type-guards.ts";

/** Schema version stamped into every generated JSON file. */
const SCHEMA_VERSION = "1.0.0" as const;
const GENERATED_POST_API_PATH =
  /^\/(?:(?:fr|zh-hans|zh-hant)\/)?api\/posts\/.+\.json$/;

/** Block types matching `contracts/post.schema.json#/$defs/block`. */
export type ParagraphBlock = {
  readonly type: "paragraph";
  readonly text: string;
};
export type HeadingBlock = {
  readonly type: "heading";
  readonly level: number;
  readonly text: string;
};
export type CodeBlock = {
  readonly type: "code";
  readonly content: string;
  readonly language?: string;
};
export type ImageBlock = {
  readonly type: "image";
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
};
export type QuoteBlock = {
  readonly type: "quote";
  readonly text: string;
  readonly attribution?: string;
};
export type ListBlock = {
  readonly type: "list";
  readonly ordered: boolean;
  readonly items: ReadonlyArray<string>;
};

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | ImageBlock
  | QuoteBlock
  | ListBlock;

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

/** Extracts the text content from an Element, collapsing whitespace. */
function textOf(el: Element): string {
  return (el.textContent ?? "").trim();
}

/**
 * Parses a DOM element into a content block, or returns `undefined`
 * if the element does not map to a known block type.
 */
function parseBlock(el: Element): ContentBlock | undefined {
  const tag = el.tagName.toLowerCase();

  // Headings
  const headingMatch = /^h([1-6])$/.exec(tag);
  if (headingMatch !== null) {
    const level = Number(headingMatch[1]);
    return { type: "heading", level, text: textOf(el) };
  }

  // Paragraphs
  if (tag === "p") {
    const text = textOf(el);
    if (text.length === 0) return undefined;
    return { type: "paragraph", text };
  }

  // Code blocks: <pre><code>...</code></pre>
  if (tag === "pre") {
    const code = el.querySelector("code");
    const content = code !== null ? (code.textContent ?? "") : textOf(el);
    const langClass = code?.getAttribute("class") ?? "";
    const langMatch = /language-(\w+)/.exec(langClass);
    const language = langMatch?.[1];
    const block: CodeBlock = { type: "code", content };
    if (language !== undefined) {
      return { ...block, language };
    }
    return block;
  }

  // Images
  if (tag === "img") {
    const src = el.getAttribute("src") ?? "";
    const alt = el.getAttribute("alt") ?? "";
    const block: ImageBlock = { type: "image", src, alt };
    const w = el.getAttribute("width");
    const h = el.getAttribute("height");
    if (w !== null) {
      return {
        ...block,
        width: Number(w),
        ...(h !== null ? { height: Number(h) } : {}),
      };
    }
    return block;
  }

  // Blockquotes
  if (tag === "blockquote") {
    const paragraphs = el.querySelectorAll("p");
    const text = Array.from(paragraphs).map((p) => textOf(p)).join("\n");
    const cite = el.querySelector("cite");
    const block: QuoteBlock = { type: "quote", text: text || textOf(el) };
    if (cite !== null) {
      return { ...block, attribution: textOf(cite) };
    }
    return block;
  }

  // Lists
  if (tag === "ul" || tag === "ol") {
    const items = Array.from(el.querySelectorAll(":scope > li")).map((li) =>
      textOf(li)
    );
    return { type: "list", ordered: tag === "ol", items };
  }

  // Figures: extract the image or blockquote inside
  if (tag === "figure") {
    const img = el.querySelector("img");
    if (img !== null) return parseBlock(img);
    const bq = el.querySelector("blockquote");
    if (bq !== null) return parseBlock(bq);
    return undefined;
  }

  return undefined;
}

/**
 * Parses a post page's `.post-content` into an array of content blocks.
 * Falls back to the `<article>` or `<main>` element if `.post-content`
 * is not found.
 */
export function parsePostContent(
  document: Document,
): ReadonlyArray<ContentBlock> {
  const container = document.querySelector(".post-content") ??
    document.querySelector("article") ??
    document.querySelector("main");

  if (container === null) return [];

  const blocks: ContentBlock[] = [];

  for (const child of container.children) {
    const block = parseBlock(child);
    if (block !== undefined) {
      blocks.push(block);
    }
  }

  return blocks;
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
