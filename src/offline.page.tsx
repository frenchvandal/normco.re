/** Offline fallback page served when navigation fails without connectivity. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;
/** Page URL. */
export const url = "/offline/";
/** Page title. */
export const title = "Offline";
/** Page meta description. */
export const description =
  "Offline fallback page for normco.re when connectivity is unavailable.";
/** Excludes this page from the sitemap and search results. */
export const unlisted = true;

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Hors ligne",
  description:
    "Page de secours hors ligne lorsque la connexion est indisponible.",
} as const;

/** Renders the offline fallback body. */
export default (data: Lume.Data): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);

  return `<section class="offline-page" aria-label="${translations.offline.ariaLabel}">
  <h1 class="offline-page-title">${translations.offline.title}</h1>
  <p class="offline-page-lead">${translations.offline.lead}</p>
  <p class="offline-page-action"><a href="${homeUrl}">${translations.offline.backToHome}</a></p>
</section>`;
};
