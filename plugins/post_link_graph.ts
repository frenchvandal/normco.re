import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { parseDateValue } from "../src/utils/date-time.ts";

const SITE_ORIGIN = "https://normco.re";
const HTML_LINK_PATTERN = /<a\s[^>]*href=(["'])([^"']+)\1/giu;
const MARKDOWN_LINK_PATTERN = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gmu;

export type PostLinkReference = Readonly<{
  title: string;
  url: string;
}>;

type MutablePostLinkReference = {
  title: string;
  url: string;
};

function isMutableRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function isPostPage(page: Page): boolean {
  return isMutableRecord(page.data) && page.data.type === "post" &&
    typeof page.data.url === "string";
}

function resolveSourceContent(page: Page): string | undefined {
  if (isMutableRecord(page.data)) {
    const dataContent = getNonEmptyString(page.data.content);

    if (dataContent !== undefined) {
      return dataContent;
    }
  }

  return getNonEmptyString(page.content);
}

function normalizeInternalTarget(
  rawTarget: string,
  currentUrl: string,
): string | undefined {
  const trimmedTarget = rawTarget.trim();

  if (
    trimmedTarget.length === 0 || trimmedTarget.startsWith("#") ||
    /^(?:mailto:|tel:|data:|javascript:)/iu.test(trimmedTarget)
  ) {
    return undefined;
  }

  let resolvedUrl: URL;
  try {
    resolvedUrl = new URL(trimmedTarget, `${SITE_ORIGIN}${currentUrl}`);
  } catch {
    return undefined;
  }

  if (resolvedUrl.origin !== SITE_ORIGIN) {
    return undefined;
  }

  let pathname = resolvedUrl.pathname;

  if (pathname.endsWith("/index.html")) {
    pathname = pathname.slice(0, -"/index.html".length) || "/";
  }

  if (pathname.endsWith(".md")) {
    pathname = pathname.slice(0, -".md".length);
  }

  if (pathname.length === 0) {
    pathname = "/";
  } else if (
    pathname !== "/" && !pathname.endsWith("/") &&
    !/\.[a-z0-9]+$/iu.test(pathname)
  ) {
    pathname = `${pathname}/`;
  }

  return pathname;
}

function extractInternalTargets(
  content: string,
  currentUrl: string,
): ReadonlySet<string> {
  const targets = new Set<string>();

  for (const match of content.matchAll(MARKDOWN_LINK_PATTERN)) {
    if (match.index !== undefined && match.index > 0) {
      const previousCharacter = content[match.index - 1];

      if (previousCharacter === "!") {
        continue;
      }
    }

    const href = match[1];

    if (href === undefined) {
      continue;
    }

    const normalizedTarget = normalizeInternalTarget(href, currentUrl);

    if (normalizedTarget !== undefined) {
      targets.add(normalizedTarget);
    }
  }

  for (const match of content.matchAll(HTML_LINK_PATTERN)) {
    const href = match[2];

    if (href === undefined) {
      continue;
    }

    const normalizedTarget = normalizeInternalTarget(href, currentUrl);

    if (normalizedTarget !== undefined) {
      targets.add(normalizedTarget);
    }
  }

  return targets;
}

function sortReferences(
  a: MutablePostLinkReference,
  b: MutablePostLinkReference,
  timestamps: ReadonlyMap<string, number>,
): number {
  const timeDelta = (timestamps.get(b.url) ?? 0) - (timestamps.get(a.url) ?? 0);

  if (timeDelta !== 0) {
    return timeDelta;
  }

  return a.title.localeCompare(b.title);
}

export function registerPostLinkGraph(site: Site): void {
  site.preprocess([".md"], (pages: Page[]) => {
    const postPages = pages.filter(isPostPage);
    const postsByUrl = new Map<
      string,
      { page: Page; title: string; timestamp: number }
    >();
    const timestamps = new Map<string, number>();

    for (const page of postPages) {
      const data = page.data as Record<string, unknown>;
      const url = data.url as string;
      const title = getNonEmptyString(data.title) ?? url;
      const timestamp = parseDateValue(data.date)?.getTime() ?? 0;

      postsByUrl.set(url, { page, title, timestamp });
      timestamps.set(url, timestamp);
      data.backlinks = [];
      data.outboundInternalLinks = [];
    }

    for (const page of postPages) {
      const data = page.data as Record<string, unknown>;
      const currentUrl = data.url as string;
      const currentTitle = getNonEmptyString(data.title) ?? currentUrl;
      const content = resolveSourceContent(page);

      if (content === undefined) {
        continue;
      }

      const outboundReferences = new Map<string, MutablePostLinkReference>();

      for (const targetUrl of extractInternalTargets(content, currentUrl)) {
        if (targetUrl === currentUrl) {
          continue;
        }

        const target = postsByUrl.get(targetUrl);

        if (target === undefined) {
          continue;
        }

        outboundReferences.set(targetUrl, {
          title: target.title,
          url: targetUrl,
        });

        const targetData = target.page.data as Record<string, unknown>;
        const backlinks = Array.isArray(targetData.backlinks)
          ? targetData.backlinks as MutablePostLinkReference[]
          : [];

        if (!backlinks.some((reference) => reference.url === currentUrl)) {
          backlinks.push({
            title: currentTitle,
            url: currentUrl,
          });
        }

        targetData.backlinks = backlinks;
      }

      data.outboundInternalLinks = [...outboundReferences.values()].sort((
        a,
        b,
      ) => sortReferences(a, b, timestamps));
    }

    for (const page of postPages) {
      const data = page.data as Record<string, unknown>;
      const backlinks = Array.isArray(data.backlinks)
        ? data.backlinks as MutablePostLinkReference[]
        : [];

      data.backlinks = backlinks.sort((a, b) =>
        sortReferences(a, b, timestamps)
      );
    }
  });
}
