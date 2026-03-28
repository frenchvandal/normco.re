/**
 * Shared internationalization primitives for the site UI.
 *
 * ## Internal vs. external language key design
 *
 * This module uses two parallel conventions for language codes, each serving a
 * distinct purpose:
 *
 * - **Internal TypeScript keys** (`SiteLanguage` type): `"en"`, `"fr"`,
 *   `"zhHans"`, `"zhHant"`. These are valid JavaScript identifiers used as
 *   object keys throughout the codebase (lookup tables, component props, page
 *   data). The camelCase Chinese variants avoid the hyphen that would require
 *   bracket notation everywhere.
 *
 * - **External codes** (URLs, HTML `lang`, feed metadata): `"zh-hans"`,
 *   `"zh-hant"`. These follow BCP 47 / browser conventions and are used in URL
 *   prefixes (`LANGUAGE_PREFIX`), HTML `lang` attributes (`LANGUAGE_TAG`), and
 *   page data keys (`LANGUAGE_DATA_CODE`).
 *
 * The mapping between the two spaces is handled by `LANGUAGE_DATA_CODE`,
 * `LANGUAGE_ALIASES`, and the `MULTILANGUAGE_DATA_ALIASES` preprocess hook in
 * `_config.ts`. Adding a new Chinese script variant would require updates in
 * all four locations.
 */

export const SUPPORTED_LANGUAGES = [
  "en",
  "fr",
  "zhHans",
  "zhHant",
] as const;

export type SiteLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SiteLanguage = "en";

const SUPPORTED_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);

export const LANGUAGE_TAG = {
  en: "en",
  fr: "fr",
  zhHans: "zh-Hans",
  zhHant: "zh-Hant",
} as const satisfies Record<SiteLanguage, string>;

export const LANGUAGE_DATA_CODE = {
  en: "en",
  fr: "fr",
  zhHans: "zh-hans",
  zhHant: "zh-hant",
} as const satisfies Record<SiteLanguage, string>;

export const LANGUAGE_PREFIX = {
  en: "",
  fr: "/fr",
  zhHans: "/zh-hans",
  zhHant: "/zh-hant",
} as const satisfies Record<SiteLanguage, string>;

const LANGUAGE_ALIASES: Readonly<Record<string, SiteLanguage>> = {
  "zh-hans": "zhHans",
  "zh_hans": "zhHans",
  "zh-hant": "zhHant",
  "zh_hant": "zhHant",
};

export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return typeof value === "string" && SUPPORTED_LANGUAGE_SET.has(value);
}

export function tryResolveSiteLanguage(
  value: unknown,
): SiteLanguage | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (isSiteLanguage(value)) {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized];
}

export function resolveSiteLanguage(value: unknown): SiteLanguage {
  return tryResolveSiteLanguage(value) ?? DEFAULT_LANGUAGE;
}

export function getLanguageTag(language: SiteLanguage): string {
  return LANGUAGE_TAG[language];
}

export function getLanguageDataCode(language: SiteLanguage): string {
  return LANGUAGE_DATA_CODE[language];
}

export function getLanguagePrefix(language: SiteLanguage): string {
  return LANGUAGE_PREFIX[language];
}

export function getLocalizedUrl(path: string, language: SiteLanguage): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (language === DEFAULT_LANGUAGE) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${getLanguagePrefix(language)}/`;
  }

  return `${getLanguagePrefix(language)}${normalizedPath}`;
}
