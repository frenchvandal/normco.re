/** 404 error page. */

import StatePanel from "./_components/StatePanel.tsx";
import { getPageContext, resolveSiteLanguage } from "./utils/i18n.ts";

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
  const { homeUrl, translations } = getPageContext(language);

  return `<div class="site-page-shell site-page-shell--editorial state-page state-page--404">
  ${
    StatePanel({
      title: translations.notFound.heading,
      message: translations.notFound.message,
      actionHref: homeUrl,
      actionLabel: translations.notFound.backToHome,
      eyebrow: "404",
      eyebrowAriaHidden: true,
      headingTag: "h1",
      variant: "page",
      className: "state-panel--not-found",
    })
  }
</div>`;
};
