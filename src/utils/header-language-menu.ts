import {
  getLanguageTag,
  getSiteTranslations,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "./i18n.ts";

export const HEADER_IDS = {
  languagePanel: "site-language-panel",
  searchContainer: "search",
  searchPanel: "site-search-panel",
  searchStatus: "site-search-status",
  sideNav: "site-side-nav",
  themeToggle: "theme-toggle",
} as const;

const invariantLanguageNames = getSiteTranslations("en").languageNames;

export type HeaderLanguageOption = Readonly<{
  language: SiteLanguage;
  label: string;
  tag: string;
}>;

export const HEADER_LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES.map((language) => ({
  language,
  label: invariantLanguageNames[language],
  tag: getLanguageTag(language),
})) satisfies readonly HeaderLanguageOption[];
