import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";

export const RSS_FEED_PATH = "/rss.xml";
export const ATOM_FEED_PATH = "/atom.xml";
export const JSON_FEED_PATH = "/feed.json";
export const FEED_STYLESHEET_PATH = "/feed.xsl";

export function getLocalizedRssFeedUrl(language: SiteLanguage): string {
  return getLocalizedUrl(RSS_FEED_PATH, language);
}

export function getLocalizedAtomFeedUrl(language: SiteLanguage): string {
  return getLocalizedUrl(ATOM_FEED_PATH, language);
}

export function getLocalizedJsonFeedUrl(language: SiteLanguage): string {
  return getLocalizedUrl(JSON_FEED_PATH, language);
}
