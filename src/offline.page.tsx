/** Offline fallback page served when navigation fails without connectivity. */

import StatePanel from "./_components/StatePanel.tsx";
import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
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

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "离线",
  description: "当网络连接不可用时的离线后备页面。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "離線",
  description: "當網路連線不可用時的離線備援頁面。",
} as const;

/** Renders the offline fallback body. */
export default (data: Lume.Data): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);

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
