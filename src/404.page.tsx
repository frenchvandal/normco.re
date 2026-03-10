/** 404 error page. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Page URL. */
export const url = "/404.html";
/** Page title. */
export const title = "Page not found";
/** Page meta description. */
export const description = "The page you requested does not exist.";

// Exclude this page from the sitemap and search results.
/** Excludes this page from the sitemap and search results. */
export const unlisted = true;

/** Renders the 404 page body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);

  return `<div class="not-found">
  <p class="not-found-code" aria-hidden="true">404</p>
  <p class="not-found-message">${translations.notFound.message}</p>
  <a href="${homeUrl}" class="not-found-link">${translations.notFound.backToHome}</a>
</div>`;
};
