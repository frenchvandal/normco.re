import type { SiteLanguage } from "../utils/i18n.ts";
import {
  getLocalizedAuthorUrl,
  getLocalizedCanonicalFeedUrl,
  MF2_CONFIG,
} from "./config.ts";
import type { AuthorIdentity } from "./types.ts";

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getAuthorIdentity(
  language: SiteLanguage,
  authorName: unknown,
): AuthorIdentity {
  return {
    name: asNonEmptyString(authorName) ?? MF2_CONFIG.author.fallbackName,
    url: getLocalizedAuthorUrl(language),
  };
}

export function getCanonicalFeedUrl(language: SiteLanguage): string {
  return getLocalizedCanonicalFeedUrl(language);
}
