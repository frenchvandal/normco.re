import { escapeHtml } from "../utils/html.ts";
import { getLanguageDataCode, resolveSiteLanguage } from "../utils/i18n.ts";
import {
  PRETEXT_BROWSER_PROBE_ROOT_ID,
  PRETEXT_BROWSER_PROBE_ROUTE,
} from "../blog/client/pretext-browser-probe-shared.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = PRETEXT_BROWSER_PROBE_ROUTE;
export const layout = "layouts/base.tsx";
export const extraStylesheets = ["/styles/blog-antd.css"];
export const searchIndexed = false;
export const unlisted = true;
export const title = "Pretext Browser Probe";
export const description =
  "Internal browser-only route for measuring Pretext-driven React surfaces.";

export default function pretextProbePage(data: Lume.Data): string {
  const language = resolveSiteLanguage(data.lang);

  return `<div class="blog-antd-root">
  <div class="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--probe">
    <div
      id="${PRETEXT_BROWSER_PROBE_ROOT_ID}"
      class="blog-antd-probe-root"
      data-language="${escapeHtml(getLanguageDataCode(language))}"
    ></div>
  </div>
</div>
<script src="/scripts/pretext-browser-probe.js" type="module" defer="defer"></script>`;
}
