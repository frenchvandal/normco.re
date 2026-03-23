import StatePanel from "./_components/StatePanel.tsx";
import { getPageContext, resolveSiteLanguage } from "./utils/i18n.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/offline/";
export const title = "Offline";
export const description =
  "Offline fallback page for normco.re when connectivity is unavailable.";
// Keep the offline fallback out of sitemap and search surfaces.
export const unlisted = true;

export const fr = {
  title: "Hors ligne",
  description:
    "Page de secours hors ligne lorsque la connexion est indisponible.",
} as const;

export const zhHans = {
  title: "离线",
  description: "当网络连接不可用时的离线后备页面。",
} as const;

export const zhHant = {
  title: "離線",
  description: "當網路連線不可用時的離線備援頁面。",
} as const;

export default (data: Lume.Data): string => {
  const language = resolveSiteLanguage(data.lang);
  const { homeUrl, translations } = getPageContext(language);

  return `<div class="site-page-shell site-page-shell--editorial state-page state-page--offline">
  ${
    StatePanel({
      title: translations.offline.title,
      message: translations.offline.lead,
      actionHref: homeUrl,
      actionLabel: translations.offline.backToHome,
      ariaLabel: translations.offline.ariaLabel,
      headingTag: "h1",
      variant: "page",
      className: "state-panel--offline-page",
    })
  }
</div>`;
};
