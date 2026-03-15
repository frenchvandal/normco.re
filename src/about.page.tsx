/** About page - prose introduction. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/about/";
/** Page title. */
export const title = "About";
/** Page meta description. */
export const description =
  "About Phiphi - a software person writing from Chengdu, China.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "À propos",
  description: "À propos de Phiphi — une personne qui écrit depuis Chengdu.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "关于",
  description: "关于 Phiphi：一位在成都写作的软件从业者。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "關於",
  description: "關於 Phiphi：一位在成都寫作的軟體工作者。",
} as const;

/** Renders the About page body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const feedXmlUrl = getLocalizedUrl("/feed.xml", language);
  const feedJsonUrl = getLocalizedUrl("/feed.json", language);
  const conjunction = language === "fr"
    ? "ou"
    : language === "zhHans" || language === "zhHant"
    ? "或"
    : "or";

  return `<div class="site-page-shell site-page-shell--editorial">
<section class="pagehead about-pagehead" aria-labelledby="about-title">
  <p class="pagehead-eyebrow">${translations.about.eyebrow}</p>
  <h1 id="about-title" class="about-title">${translations.about.title}</h1>
  <p class="pagehead-lead">${translations.about.lead}</p>
</section>
<div class="about-content">
  <p>${translations.about.intro}</p>
  <p>${translations.about.body}</p>
  <p>
    ${translations.about.feedsIntro} <a href="${feedXmlUrl}">RSS</a> ${conjunction}
    <a href="${feedJsonUrl}">JSON Feed</a>.
  </p>
</div>
</div>`;
};
