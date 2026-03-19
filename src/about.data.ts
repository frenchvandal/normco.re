import type { SiteLanguage, SiteTranslations } from "./utils/i18n.ts";

export type AboutContact = Readonly<{
  key: string;
  iconClass: string;
  label: string;
  alt: string;
  originalSrc: string;
  downloadName: string;
  width: number;
  height: number;
}>;

export type AboutFact = Readonly<{
  iconMarkup: string;
  iconClass: string;
  term: string;
  value: string;
}>;

export type AboutFactIcons = Readonly<{
  location: string;
  notebook: string;
  translate: string;
}>;

type AboutTranslations = SiteTranslations["about"];

function getLocalizedWechatAssetLanguage(language: SiteLanguage): string {
  switch (language) {
    case "fr":
      return "fr";
    case "zhHans":
      return "zh-hans";
    case "zhHant":
      return "zh-hant";
    default:
      return "en";
  }
}

export function getAboutFeedSeparators(language: SiteLanguage): Readonly<{
  final: string;
  list: string;
}> {
  if (language === "zhHans" || language === "zhHant") {
    return {
      final: "或",
      list: "、",
    };
  }

  return {
    final: language === "fr" ? "ou" : "or",
    list: ", ",
  };
}

export function getAboutContacts(
  language: SiteLanguage,
  translations: AboutTranslations,
): readonly AboutContact[] {
  const localizedWechatAssetLanguage = getLocalizedWechatAssetLanguage(
    language,
  );

  return [
    {
      key: "telegram",
      iconClass: "about-contact-icon--telegram",
      label: translations.contactTelegramLabel,
      alt: translations.contactTelegramQrAlt,
      originalSrc: "/contact/telegram/contact-telegram.jpg",
      downloadName: "contact-telegram.jpg",
      width: 1170,
      height: 2532,
    },
    {
      key: "wechat",
      iconClass: "about-contact-icon--wechat",
      label: translations.contactWechatLabel,
      alt: translations.contactWechatQrAlt,
      originalSrc:
        `/contact/wechat/contact-wechat-${localizedWechatAssetLanguage}.jpg`,
      downloadName: `contact-wechat-${localizedWechatAssetLanguage}.jpg`,
      width: 1224,
      height: 1605,
    },
  ] as const;
}

export function getAboutFacts(
  translations: AboutTranslations,
  icons: AboutFactIcons,
): readonly AboutFact[] {
  return [
    {
      iconMarkup: icons.location,
      iconClass: "about-fact-icon--location",
      term: translations.locationLabel,
      value: translations.locationValue,
    },
    {
      iconMarkup: icons.notebook,
      iconClass: "about-fact-icon--topics",
      term: translations.topicsLabel,
      value: translations.topicsValue,
    },
    {
      iconMarkup: icons.translate,
      iconClass: "about-fact-icon--languages",
      term: translations.languagesLabel,
      value: translations.languagesValue,
    },
  ] as const;
}
