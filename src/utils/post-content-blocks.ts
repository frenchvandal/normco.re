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

/** Extracts the text content from an Element, collapsing whitespace. */
function textOf(element: Element): string {
  return (element.textContent ?? "").trim();
}

/**
 * Parses a DOM element into a content block, or returns `undefined`
 * if the element does not map to a known block type.
 */
function parseBlock(element: Element): ContentBlock | undefined {
  const tag = element.tagName.toLowerCase();

  const headingMatch = /^h([1-6])$/.exec(tag);
  if (headingMatch !== null) {
    const level = Number(headingMatch[1]);
    return { type: "heading", level, text: textOf(element) };
  }

  if (tag === "p") {
    const text = textOf(element);
    return text.length === 0 ? undefined : { type: "paragraph", text };
  }

  if (tag === "pre") {
    const code = element.querySelector("code");
    const content = code !== null ? (code.textContent ?? "") : textOf(element);
    const langClass = code?.getAttribute("class") ?? "";
    const langMatch = /language-(\w+)/.exec(langClass);
    const block: CodeBlock = { type: "code", content };

    return langMatch?.[1] !== undefined
      ? { ...block, language: langMatch[1] }
      : block;
  }

  if (tag === "img") {
    const src = element.getAttribute("src") ?? "";
    const alt = element.getAttribute("alt") ?? "";
    const block: ImageBlock = { type: "image", src, alt };
    const width = element.getAttribute("width");
    const height = element.getAttribute("height");

    if (width === null) {
      return block;
    }

    return {
      ...block,
      width: Number(width),
      ...(height !== null ? { height: Number(height) } : {}),
    };
  }

  if (tag === "blockquote") {
    const paragraphs = element.querySelectorAll("p");
    const text = Array.from(paragraphs).map((paragraph) => textOf(paragraph))
      .join("\n");
    const cite = element.querySelector("cite");
    const block: QuoteBlock = { type: "quote", text: text || textOf(element) };

    return cite !== null ? { ...block, attribution: textOf(cite) } : block;
  }

  if (tag === "ul" || tag === "ol") {
    const items = Array.from(element.querySelectorAll(":scope > li")).map((
      li,
    ) => textOf(li));

    return { type: "list", ordered: tag === "ol", items };
  }

  if (tag === "figure") {
    const image = element.querySelector("img");
    if (image !== null) {
      return parseBlock(image);
    }

    const blockquote = element.querySelector("blockquote");
    if (blockquote !== null) {
      return parseBlock(blockquote);
    }
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

  if (container === null) {
    return [];
  }

  const blocks: ContentBlock[] = [];

  for (const child of container.children) {
    const block = parseBlock(child);
    if (block !== undefined) {
      blocks.push(block);
    }
  }

  return blocks;
}
