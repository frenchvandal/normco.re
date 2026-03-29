import {
  DEFAULT_LANGUAGE,
  LANGUAGE_PREFIX,
  SUPPORTED_LANGUAGES,
} from "../src/utils/i18n.ts";

export type RobotsRule = {
  allow?: string;
  disallow?: string;
  sitemap?: string;
  userAgent?: string;
};

function buildOfflineRobotsRules(): RobotsRule[] {
  return SUPPORTED_LANGUAGES.flatMap((language) => {
    const offlinePath = `${LANGUAGE_PREFIX[language]}/offline`;
    const variants = language === DEFAULT_LANGUAGE
      ? [offlinePath, `${offlinePath}/`, "/offline.html"]
      : [offlinePath, `${offlinePath}/`];

    return variants.map((disallow) => ({ userAgent: "*", disallow }));
  });
}

export function buildRobotsRules(): RobotsRule[] {
  return [
    { userAgent: "*", allow: "/" },
    { userAgent: "*", disallow: "/404" },
    { userAgent: "*", disallow: "/404.html" },
    ...buildOfflineRobotsRules(),
    { sitemap: "https://normco.re/sitemap.xml" },
  ];
}
