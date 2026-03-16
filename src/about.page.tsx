/** About page - prose introduction. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";

const TAIPEI_BUBBLE_TEA_PICTOGRAM =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M22,30.36H10c-0.186,0-0.341-0.142-0.358-0.326L7.673,9.36H6V8.64h12.334l3.335-7.782l0.662,0.283L19.117,8.64H26v0.72h-1.673l-1.969,20.674C22.341,30.219,22.186,30.36,22,30.36z M10.327,29.64h11.346l1.359-14.28H8.967L10.327,29.64z M16.546,14.64h6.556l0.503-5.28h-4.796L16.546,14.64z M8.899,14.64h6.864l2.263-5.28h-9.63L8.899,14.64z M19,28.36c-0.75,0-1.36-0.61-1.36-1.36s0.61-1.36,1.36-1.36s1.36,0.61,1.36,1.36S19.75,28.36,19,28.36z M19,26.36c-0.353,0-0.64,0.287-0.64,0.64s0.287,0.64,0.64,0.64s0.64-0.287,0.64-0.64S19.353,26.36,19,26.36z M13,28.36c-0.75,0-1.36-0.61-1.36-1.36s0.61-1.36,1.36-1.36s1.36,0.61,1.36,1.36S13.75,28.36,13,28.36z M13,26.36c-0.353,0-0.64,0.287-0.64,0.64s0.287,0.64,0.64,0.64s0.64-0.287,0.64-0.64S13.353,26.36,13,26.36z M16,25.36c-0.75,0-1.36-0.61-1.36-1.36s0.61-1.36,1.36-1.36s1.36,0.61,1.36,1.36S16.75,25.36,16,25.36z M16,23.36c-0.353,0-0.64,0.287-0.64,0.64s0.287,0.64,0.64,0.64s0.64-0.287,0.64-0.64S16.353,23.36,16,23.36z M13,22.36c-0.75,0-1.36-0.61-1.36-1.36s0.61-1.36,1.36-1.36s1.36,0.61,1.36,1.36S13.75,22.36,13,22.36z M13,20.36c-0.353,0-0.64,0.287-0.64,0.64s0.287,0.64,0.64,0.64s0.64-0.287,0.64-0.64S13.353,20.36,13,20.36z M19,20.36c-0.75,0-1.36-0.61-1.36-1.36s0.61-1.36,1.36-1.36s1.36,0.61,1.36,1.36S19.75,20.36,19,20.36z M19,18.36c-0.353,0-0.64,0.287-0.64,0.64s0.287,0.64,0.64,0.64s0.64-0.287,0.64-0.64S19.353,18.36,19,18.36z"/>
</svg>`;

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/about/";
/** Page title. */
export const title = "About";
/** Page meta description. */
export const description =
  "About Phiphi - a software person writing from Chengdu, China.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "À propos",
  description: "À propos de Phiphi — une personne qui écrit depuis Chengdu.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "关于",
  description: "关于 Phiphi：一位在成都写作的软件从业者。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "關於",
  description: "關於 Phiphi：一位在成都寫作的軟體工作者。",
} as const;

/** Renders the About page body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const feedXmlUrl = getLocalizedUrl("/feed.xml", language);
  const feedJsonUrl = getLocalizedUrl("/feed.json", language);
  const conjunction = language === "fr"
    ? "ou"
    : language === "zhHans" || language === "zhHant"
    ? "或"
    : "or";

  return `<div class="site-page-shell site-page-shell--wide">
<section class="pagehead about-pagehead" aria-labelledby="about-title">
  <p class="pagehead-eyebrow">${translations.about.eyebrow}</p>
  <h1 id="about-title" class="about-title">${translations.about.title}</h1>
  <p class="pagehead-lead">${translations.about.lead}</p>
</section>
<div class="feature-layout feature-layout--with-rail">
  <div class="feature-main">
    <div class="about-content">
      <p>${translations.about.intro}</p>
      <p>${translations.about.body}</p>
      <p>
        ${translations.about.feedsIntro} <a href="${feedXmlUrl}">RSS</a> ${conjunction}
        <a href="${feedJsonUrl}">JSON Feed</a>.
      </p>
    </div>
  </div>
  <aside class="feature-rail about-rail" aria-label="${translations.about.railAriaLabel}">
    <div class="feature-rail-sticky">
      <section class="feature-card">
        <h2 class="feature-card-title">${translations.about.atAGlanceTitle}</h2>
        <dl class="about-facts">
          <div class="about-facts-row">
            <dt class="about-facts-term">${translations.about.locationLabel}</dt>
            <dd class="about-facts-description">${translations.about.locationValue}</dd>
          </div>
          <div class="about-facts-row">
            <dt class="about-facts-term">${translations.about.topicsLabel}</dt>
            <dd class="about-facts-description">${translations.about.topicsValue}</dd>
          </div>
          <div class="about-facts-row">
            <dt class="about-facts-term">${translations.about.languagesLabel}</dt>
            <dd class="about-facts-description">${translations.about.languagesValue}</dd>
          </div>
        </dl>
      </section>
      <section class="feature-card">
        <h2 class="feature-card-title">${translations.about.siteNotesTitle}</h2>
        <ul class="about-notes">
          <li>${translations.about.siteNoteOne}</li>
          <li>${translations.about.siteNoteTwo}</li>
          <li>${translations.about.siteNoteThree}</li>
        </ul>
      </section>
      <section class="feature-card about-pictogram-card">
        <h2 class="feature-card-title">${translations.about.pictogramTitle}</h2>
        <div class="about-pictogram-frame" aria-hidden="true">
          <div class="about-pictogram">
            ${TAIPEI_BUBBLE_TEA_PICTOGRAM}
          </div>
        </div>
        <p class="feature-card-caption">${translations.about.pictogramCaption}</p>
      </section>
    </div>
  </aside>
</div>
</div>`;
};
