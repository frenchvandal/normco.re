import StatePanel from "./_components/StatePanel.tsx";
import { resolvePageSetup } from "./utils/page-setup.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/offline/";
export const title = "Offline";
export const description =
  "Offline fallback page when connectivity is unavailable.";
// Keep the offline fallback out of sitemap and search surfaces.
export const unlisted = true;
export const unmatchedLangUrl = false;

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

function renderOfflineEmptyVisual(): string {
  return `<div class="state-panel-visual state-panel-visual--offline" aria-hidden="true">
  <svg
    class="state-panel-empty-illustration"
    viewBox="0 0 240 140"
    role="presentation"
    focusable="false"
  >
    <ellipse class="state-panel-empty-shadow" cx="120" cy="118" rx="74" ry="12"></ellipse>
    <circle class="state-panel-empty-orb state-panel-empty-orb--left" cx="48" cy="50" r="18"></circle>
    <circle class="state-panel-empty-orb state-panel-empty-orb--right" cx="190" cy="42" r="14"></circle>
    <rect class="state-panel-empty-card" x="58" y="26" width="124" height="78" rx="18"></rect>
    <path class="state-panel-empty-card-top" d="M78 50h84"></path>
    <path class="state-panel-empty-card-line" d="M78 68h64"></path>
    <path class="state-panel-empty-card-line state-panel-empty-card-line--short" d="M78 82h48"></path>
    <circle class="state-panel-empty-signal" cx="160" cy="80" r="10"></circle>
    <path class="state-panel-empty-signal-mark" d="M160 74v7"></path>
    <circle class="state-panel-empty-signal-dot" cx="160" cy="87" r="1.5"></circle>
  </svg>
</div>`;
}

export default (data: Lume.Data): string => {
  const { homeUrl, translations: t } = resolvePageSetup(data.lang);

  return `<div class="site-page-shell site-page-shell--editorial state-page state-page--offline">
  ${
    StatePanel({
      visual: renderOfflineEmptyVisual(),
      title: t.offline.title,
      message: t.offline.lead,
      actionHref: homeUrl,
      actionLabel: t.offline.backToHome,
      ariaLabel: t.offline.ariaLabel,
      headingTag: "h1",
      variant: "page",
      className: "state-panel--offline-page",
    })
  }
</div>`;
};
