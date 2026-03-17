import { escapeHtml } from "./html.ts";
import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";

/** HTML feed discovery MIME type for Microformats2 documents. */
export const MF2_HTML_CONTENT_TYPE = "text/mf2+html";

export type MicroformatsAuthor = {
  readonly name: string;
  readonly url: string;
};

function resolveNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Resolves the canonical localized HTML h-feed URL for a given language. */
export function getLocalizedHFeedUrl(language: SiteLanguage): string {
  return getLocalizedUrl("/posts/", language);
}

/** Resolves the localized author h-card for the current language. */
export function getLocalizedAuthorHCard(
  language: SiteLanguage,
  authorName: unknown,
): MicroformatsAuthor {
  return {
    name: resolveNonEmptyString(authorName) ?? "Phiphi",
    url: getLocalizedUrl("/about/", language),
  };
}

/** Renders a hidden canonical URL property without affecting visible layout. */
export function renderHiddenUrl(
  url: string,
  className: string = "u-url",
): string {
  return `<a class="${escapeHtml(`${className} sr-only`)}" href="${
    escapeHtml(url)
  }">${escapeHtml(url)}</a>`;
}

/** Renders a hidden h-card for explicit authorship discovery. */
export function renderHiddenHCard(
  author: MicroformatsAuthor,
  className: string = "p-author h-card",
): string {
  return `<a class="${escapeHtml(`${className} sr-only`)}" href="${
    escapeHtml(author.url)
  }"><span class="p-name">${escapeHtml(author.name)}</span></a>`;
}
