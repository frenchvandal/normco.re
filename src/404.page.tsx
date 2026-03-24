import StatePanel from "./_components/StatePanel.tsx";
import { resolvePageSetup } from "./utils/page-setup.ts";

export const url = "/404.html";
// Lume’s multilanguage plugin does not fan out the configured 404 page.
// Keep this route explicitly English so the source matches the actual build.
export const lang = "en";
export const title = "Page not found";
export const description = "The page you requested does not exist.";

// Exclude the generated error route from the sitemap and search surfaces.
export const unlisted = true;
export const unmatchedLangUrl = false;

export default (_data: Lume.Data): string => {
  const { homeUrl, translations: t } = resolvePageSetup("en");

  return `<div class="site-page-shell site-page-shell--editorial state-page state-page--404">
  ${
    StatePanel({
      title: t.notFound.heading,
      message: t.notFound.message,
      actionHref: homeUrl,
      actionLabel: t.notFound.backToHome,
      eyebrow: "404",
      eyebrowAriaHidden: true,
      headingTag: "h1",
      variant: "page",
      className: "state-panel--not-found",
    })
  }
</div>`;
};
