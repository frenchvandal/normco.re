/** 404 error page. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Page URL. */
export const url = "/404.html";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page title. */
export const title = "Page not found";
/** Page meta description. */
export const description = "The page you requested does not exist.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Page introuvable",
  description: "La page demandée n'existe pas.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "页面不存在",
  description: "你请求的页面不存在。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "找不到頁面",
  description: "你要求的頁面不存在。",
} as const;

// Exclude this page from the sitemap and search results.
/** Excludes this page from the sitemap and search results. */
export const unlisted = true;

/** Renders the 404 page body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);

  return `<div class="site-page-shell site-page-shell--editorial">
  <div class="not-found">
  <p class="not-found-code" aria-hidden="true">404</p>
  <h1 class="not-found-heading">${translations.notFound.heading}</h1>
  <p class="not-found-message">${translations.notFound.message}</p>
  <a href="${homeUrl}" class="not-found-link">${translations.notFound.backToHome}</a>
</div>
</div>`;
};
