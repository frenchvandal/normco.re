import type { SiteLanguage } from "./i18n.ts";

export const SITE_DOMAIN = "normco.re" as const;
export const SITE_ORIGIN = `https://${SITE_DOMAIN}` as const;
export const SITE_AUTHOR = "Phiphi" as const;

const LATIN_SITE_NAME = "PhiPhi’s Bizarre Aventure" as const;
const HANS_SITE_NAME = "PhiPhi的奇妙冒险" as const;
const HANT_SITE_NAME = "PhiPhi的奇妙冒險" as const;

export const SITE_NAME_BY_LANGUAGE = {
  en: LATIN_SITE_NAME,
  fr: LATIN_SITE_NAME,
  zhHans: HANS_SITE_NAME,
  zhHant: HANT_SITE_NAME,
} as const satisfies Record<SiteLanguage, string>;

export const SITE_NAME = SITE_NAME_BY_LANGUAGE.en;
export const SITE_SHORT_NAME = "PhiPhi" as const;

export function getSiteName(language: SiteLanguage): string {
  return SITE_NAME_BY_LANGUAGE[language];
}
