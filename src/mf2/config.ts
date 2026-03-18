import { getLocalizedUrl, type SiteLanguage } from "../utils/i18n.ts";

export type Mf2Role = "none" | "feedPreview" | "feed" | "entry" | "card";

export const MF2_HTML_CONTENT_TYPE = "text/mf2+html";

export const MF2_CONFIG = {
  discovery: {
    rss: true,
    atom: true,
    jsonFeed: true,
    htmlFeed: true,
  },
  author: {
    fallbackName: "Phiphi",
    identityPath: "/about/",
  },
  routes: {
    canonicalFeedPath: "/posts/",
  },
} as const;

export function getLocalizedAuthorUrl(language: SiteLanguage): string {
  return getLocalizedUrl(MF2_CONFIG.author.identityPath, language);
}

export function getLocalizedCanonicalFeedUrl(language: SiteLanguage): string {
  return getLocalizedUrl(MF2_CONFIG.routes.canonicalFeedPath, language);
}
