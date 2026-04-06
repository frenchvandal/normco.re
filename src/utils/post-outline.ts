import { DOMParser } from "lume/deps/dom.ts";

import { slugify } from "./slugify.ts";

const REMOTE_IMAGE_SOURCE_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export const POST_RESPONSIVE_IMAGE_SIZES =
  "(min-width: 48rem) 42rem, calc(100vw - 2rem)";
export const POST_RESPONSIVE_IMAGE_TRANSFORMS =
  "avif webp jpg 420 672 1008 1344";

export type PostOutlineItem = Readonly<{
  id: string;
  level: 2 | 3;
  text: string;
}>;

export type EnhancedPostContent = Readonly<{
  html: string;
  outline: readonly PostOutlineItem[];
}>;
type ResponsiveImageElement = Readonly<{
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  setAttribute(name: string, value: string): void;
}>;

function isHeadingLevel(value: number): value is 2 | 3 {
  return value === 2 || value === 3;
}

const headingTextEncoder = new TextEncoder();

function sanitizeHeadingId(value: string): string {
  return slugify(value).replace(/^-+|-+$/g, "");
}

function ensureLeadingLetter(value: string): string {
  return /^[a-z]/.test(value) ? value : `section-${value}`;
}

function hashHeadingText(value: string): string {
  let hash = 0x811c9dc5;

  for (const byte of headingTextEncoder.encode(value.normalize("NFKC"))) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function createHeadingBaseId(text: string, explicitId: string): string {
  const explicitCandidate = sanitizeHeadingId(explicitId);

  if (explicitCandidate.length > 0) {
    return ensureLeadingLetter(explicitCandidate);
  }

  const textCandidate = sanitizeHeadingId(text);

  if (textCandidate.length > 0) {
    return ensureLeadingLetter(textCandidate);
  }

  return `section-${hashHeadingText(text)}`;
}

function enhancePostImages(root: {
  querySelectorAll(selector: string): Iterable<ResponsiveImageElement>;
}): void {
  for (const image of root.querySelectorAll("img")) {
    const src = image.getAttribute("src");

    if (!src || REMOTE_IMAGE_SOURCE_PATTERN.test(src)) {
      continue;
    }

    if (!image.hasAttribute("transform-images")) {
      image.setAttribute(
        "transform-images",
        POST_RESPONSIVE_IMAGE_TRANSFORMS,
      );
    }

    if (!image.hasAttribute("sizes")) {
      image.setAttribute("sizes", POST_RESPONSIVE_IMAGE_SIZES);
    }
  }
}

/**
 * Ensures post headings have stable anchor ids and returns a compact outline
 * for the article rail.
 */
export function enhancePostContent(html: string): EnhancedPostContent {
  const parser = new DOMParser();
  const document = parser.parseFromString(
    `<article>${html}</article>`,
    "text/html",
  );

  if (document === null) {
    return { html, outline: [] };
  }

  const root = document.querySelector("article");

  if (root === null) {
    return { html, outline: [] };
  }

  enhancePostImages(root);

  const outline: PostOutlineItem[] = [];
  const usedIds = new Set<string>();
  const headings = root.querySelectorAll("h2, h3");

  for (const heading of headings) {
    const tagName = heading.tagName.toLowerCase();
    const levelMatch = /^h([23])$/.exec(tagName);

    if (levelMatch === null) {
      continue;
    }

    const level = Number(levelMatch[1]);

    if (!isHeadingLevel(level)) {
      continue;
    }

    const text = heading.textContent?.trim() ?? "";

    if (text.length === 0) {
      continue;
    }

    const explicitId = heading.getAttribute("id")?.trim() ?? "";
    const baseId = createHeadingBaseId(text, explicitId);

    if (baseId.length === 0) {
      continue;
    }

    let nextId = baseId;
    let duplicateIndex = 2;

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${duplicateIndex}`;
      duplicateIndex += 1;
    }

    usedIds.add(nextId);
    heading.setAttribute("id", nextId);
    outline.push({ id: nextId, level, text });
  }

  return {
    html: root.innerHTML,
    outline,
  };
}
