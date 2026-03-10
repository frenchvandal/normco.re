/** About page - prose introduction. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;
/** Page URL. */
export const url = "/about/";
/** Page title. */
export const title = "About";
/** Page meta description. */
export const description =
  "About Phiphi - a software person writing from Chengdu, China.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "A propos",
  description: "A propos de Phiphi - une personne qui ecrit depuis Chengdu.",
} as const;

/** Renders the About page body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const feedXmlUrl = getLocalizedUrl("/feed.xml", language);
  const feedJsonUrl = getLocalizedUrl("/feed.json", language);
  const conjunction = language === "fr" ? "ou" : "or";

  return `<section class="pagehead about-pagehead" aria-labelledby="about-title">
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
</div>`;
};
