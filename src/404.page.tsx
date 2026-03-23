import StatePanel from "./_components/StatePanel.tsx";
import { getPageContext, resolveSiteLanguage } from "./utils/i18n.ts";

export const url = "/404.html";
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const title = "Page not found";
export const description = "The page you requested does not exist.";

export const fr = {
  title: "Page introuvable",
  description: "La page demandée n'existe pas.",
} as const;

export const zhHans = {
  title: "页面不存在",
  description: "你请求的页面不存在。",
} as const;

export const zhHant = {
  title: "找不到頁面",
  description: "你要求的頁面不存在。",
} as const;

// Exclude the generated error route from the sitemap and search surfaces.
export const unlisted = true;

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
