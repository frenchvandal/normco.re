import {
  getLocalizedUrl,
  LANGUAGE_TAG,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "./languages.ts";
import { getSiteTranslations, type SiteTranslations } from "./translations.ts";

export type PageContext = Readonly<{
  translations: SiteTranslations;
  homeUrl: string;
  archiveUrl: string;
  tagsUrl: string;
  aboutUrl: string;
  syndicationPageUrl: string;
}>;

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

const SHORT_DATE_FORMAT = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [
    lang,
    new Intl.DateTimeFormat(LANGUAGE_TAG[lang], SHORT_DATE_OPTIONS),
  ]),
) as Record<SiteLanguage, Intl.DateTimeFormat>;

const READING_TIME_FORMAT = {
  en: (m: number) => `${m} min read`,
  fr: (m: number) => `${m}\u00a0min de lecture`,
  zhHans: (m: number) => `${m} 分钟阅读`,
  zhHant: (m: number) => `${m} 分鐘閱讀`,
} as const satisfies Record<SiteLanguage, (m: number) => string>;

const POST_COUNT_FORMAT = {
  en: (n: number) => (n === 1 ? "1 post published" : `${n} posts published`),
  fr: (n: number) => n === 1 ? "1 article publié" : `${n} articles publiés`,
  zhHans: (n: number) => `${n} 篇文章`,
  zhHant: (n: number) => `${n} 篇文章`,
} as const satisfies Record<SiteLanguage, (n: number) => string>;

const TAG_PAGE_TITLE_FORMAT = {
  en: (tag: string) => `Tag: ${tag}`,
  fr: (tag: string) => `Étiquette\u00a0: ${tag}`,
  zhHans: (tag: string) => `标签：${tag}`,
  zhHant: (tag: string) => `標籤：${tag}`,
} as const satisfies Record<SiteLanguage, (tag: string) => string>;

const TAG_PAGE_DESCRIPTION_FORMAT = {
  en: (tag: string, count: number) =>
    `${POST_COUNT_FORMAT.en(count)} filed under ${tag}.`,
  fr: (tag: string, count: number) =>
    `${POST_COUNT_FORMAT.fr(count)} sous l’étiquette ${tag}.`,
  zhHans: (tag: string, count: number) =>
    `${tag} 主题下的 ${POST_COUNT_FORMAT.zhHans(count)}。`,
  zhHant: (tag: string, count: number) =>
    `${tag} 主題下的 ${POST_COUNT_FORMAT.zhHant(count)}。`,
} as const satisfies Record<
  SiteLanguage,
  (tag: string, count: number) => string
>;

export function formatShortDate(date: Date, language: SiteLanguage): string {
  return SHORT_DATE_FORMAT[language].format(date);
}

export function getPageContext(language: SiteLanguage): PageContext {
  return {
    translations: getSiteTranslations(language),
    homeUrl: getLocalizedUrl("/", language),
    archiveUrl: getLocalizedUrl("/posts/", language),
    tagsUrl: getLocalizedUrl("/tags/", language),
    aboutUrl: getLocalizedUrl("/about/", language),
    syndicationPageUrl: getLocalizedUrl("/syndication/", language),
  };
}

export function formatReadingTime(
  minutes: number,
  language: SiteLanguage,
): string {
  return READING_TIME_FORMAT[language](minutes);
}

export function formatPostCount(count: number, language: SiteLanguage): string {
  return POST_COUNT_FORMAT[language](count);
}

export function formatTagPageTitle(
  tag: string,
  language: SiteLanguage,
): string {
  return TAG_PAGE_TITLE_FORMAT[language](tag);
}

export function formatTagPageDescription(
  tag: string,
  count: number,
  language: SiteLanguage,
): string {
  return TAG_PAGE_DESCRIPTION_FORMAT[language](tag, count);
}
