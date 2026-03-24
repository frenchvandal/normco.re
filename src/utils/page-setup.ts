/**
 * Common page setup boilerplate.
 *
 * Every page repeats the same three-line preamble: resolve language, get data
 * code, get page context. This helper collapses that into one call.
 */

import {
  getLanguageDataCode,
  getLanguageTag,
  getPageContext,
  type PageContext,
  resolveSiteLanguage,
  type SiteLanguage,
} from "./i18n.ts";

export type PageSetup = PageContext & {
  language: SiteLanguage;
  languageDataCode: string;
  languageTag: string;
};

export function resolvePageSetup(lang: unknown): PageSetup {
  const language = resolveSiteLanguage(lang);
  return {
    language,
    languageDataCode: getLanguageDataCode(language),
    languageTag: getLanguageTag(language),
    ...getPageContext(language),
  };
}
