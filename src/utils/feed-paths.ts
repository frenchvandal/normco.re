import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";

export const RSS_FEED_PATH = "/feed.xml";
export const ATOM_FEED_PATH = "/feed.atom";
export const JSON_FEED_PATH = "/feed.json";
export const FEED_STYLESHEET_PATH = "/feed.xsl";

const localizedFeedUrl = (path: string) => (language: SiteLanguage) =>
  getLocalizedUrl(path, language);

export const getLocalizedRssFeedUrl = localizedFeedUrl(RSS_FEED_PATH);
export const getLocalizedAtomFeedUrl = localizedFeedUrl(ATOM_FEED_PATH);
export const getLocalizedJsonFeedUrl = localizedFeedUrl(JSON_FEED_PATH);
