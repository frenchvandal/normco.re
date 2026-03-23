import {
  getPageContext,
  resolveSiteLanguage,
  type SiteTranslations,
} from "./utils/i18n.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "./utils/feed-paths.ts";
import { renderOcticonMarkup } from "./utils/primer-icons.ts";
import { escapeHtml } from "./utils/html.ts";
import {
  type AboutContact,
  type AboutFact,
  getAboutContacts,
  getAboutFacts,
  getAboutFeedSeparators,
} from "./about.data.ts";
import { ABOUT_PICTOGRAM_SVG } from "./about.pictogram.ts";

function renderContactItem(
  {
    closeIconMarkup,
    contact,
    downloadIconMarkup,
    qrImageSizes,
    qrImageTransforms,
    translations,
  }: {
    readonly closeIconMarkup: string;
    readonly contact: AboutContact;
    readonly downloadIconMarkup: string;
    readonly qrImageSizes: string;
    readonly qrImageTransforms: string;
    readonly translations: SiteTranslations;
  },
): string {
  const panelId = `contact-qr-${contact.key}`;
  const titleId = `${panelId}-title`;
  const triggerLabel =
    `${contact.label}: ${translations.about.contactOpenQrLabel}`;

  return `<li class="about-contact-item">
            <div
              class="cds--popover-container cds--popover--bottom cds--popover--align-left cds--popover--drop-shadow cds--popover--caret cds--toggletip about-contact-toggletip"
              data-contact-toggletip=""
            >
              <button
                type="button"
                class="about-contact-trigger cds--toggletip-button"
                aria-controls="${escapeHtml(panelId)}"
                aria-expanded="false"
                aria-haspopup="dialog"
                aria-label="${escapeHtml(triggerLabel)}"
                data-contact-toggletip-trigger=""
              >
                <span class="about-contact-trigger-content">
                  <span
                    class="about-contact-icon ${escapeHtml(contact.iconClass)}"
                    aria-hidden="true"
                  ></span>
                  <span class="about-contact-label">${
    escapeHtml(contact.label)
  }</span>
                </span>
              </button>
	              <div class="cds--popover" hidden>
                <span class="cds--popover-caret"></span>
                <div
                  id="${escapeHtml(panelId)}"
                  class="cds--popover-content cds--toggletip-content about-contact-popover"
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby="${escapeHtml(titleId)}"
                  tabindex="-1"
                  data-contact-toggletip-panel=""
                >
                  <div class="about-contact-popover-header">
                    <div class="about-contact-popover-brand">
                      <span
                        class="about-contact-icon about-contact-popover-app ${
    escapeHtml(contact.iconClass)
  }"
                        aria-hidden="true"
                      ></span>
                      <span id="${escapeHtml(titleId)}" class="sr-only">${
    escapeHtml(contact.label)
  }</span>
                    </div>
                    <div class="about-contact-popover-toolbar">
                      <a
                        class="btn cds--btn--ghost about-contact-action about-contact-download"
                        href="${escapeHtml(contact.originalSrc)}"
                        download="${escapeHtml(contact.downloadName)}"
                        aria-label="${
    escapeHtml(translations.about.contactDownloadJpgLabel)
  }"
                        title="${
    escapeHtml(translations.about.contactDownloadJpgLabel)
  }"
                      >
                        <span class="about-contact-action-icon" aria-hidden="true">
                          ${downloadIconMarkup}
                        </span>
                      </a>
                      <button
                        type="button"
                        class="btn cds--btn--ghost about-contact-action about-contact-close"
                        aria-label="${
    escapeHtml(translations.about.contactCloseLabel)
  }"
                        title="${
    escapeHtml(translations.about.contactCloseLabel)
  }"
                        data-contact-toggletip-close=""
                      >
                        <span class="about-contact-action-icon" aria-hidden="true">
                          ${closeIconMarkup}
                        </span>
                      </button>
                    </div>
                  </div>
                  <figure class="about-contact-qr">
                    <img
                      src="${escapeHtml(contact.originalSrc)}"
                      alt="${escapeHtml(contact.alt)}"
                      width="${contact.width}"
                      height="${contact.height}"
                      loading="lazy"
                      decoding="async"
                      sizes="${escapeHtml(qrImageSizes)}"
                      transform-images="${escapeHtml(qrImageTransforms)}"
                    />
                  </figure>
                </div>
              </div>
            </div>
          </li>`;
}

function renderFactItem(fact: AboutFact): string {
  return `<div class="about-facts-row">
      <dt class="about-facts-term">
        <span class="about-fact-icon ${
    escapeHtml(fact.iconClass)
  }" aria-hidden="true">
          ${fact.iconMarkup}
        </span>
        <span class="about-facts-term-label">${escapeHtml(fact.term)}</span>
      </dt>
      <dd class="about-facts-description">${escapeHtml(fact.value)}</dd>
    </div>`;
}

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/about/";
export const title = "About";
export const description =
  "About Phiphi—a software person writing from Chengdu, China.";

export const fr = {
  title: "À propos",
  description: "À propos de Phiphi — une personne qui écrit depuis Chengdu.",
} as const;

export const zhHans = {
  title: "关于",
  description: "关于 Phiphi：一位在成都写作的软件从业者。",
} as const;

export const zhHant = {
  title: "關於",
  description: "關於 Phiphi：一位在成都寫作的軟體工作者。",
} as const;

export default (data: Lume.Data, helpers: Lume.Helpers): string => {
  const language = resolveSiteLanguage(data.lang);
  const { homeUrl, translations } = getPageContext(language);
  const atomXmlUrl = getLocalizedAtomFeedUrl(language);
  const feedXmlUrl = getLocalizedRssFeedUrl(language);
  const feedJsonUrl = getLocalizedJsonFeedUrl(language);
  const closeIconMarkup = renderOcticonMarkup(
    "x",
    "about-contact-action-icon-svg",
  );
  const downloadIconMarkup = renderOcticonMarkup(
    "download",
    "about-contact-action-icon-svg",
  );
  const locationIconMarkup = renderOcticonMarkup(
    "location",
    "about-fact-icon-svg",
  );
  const notebookIconMarkup = renderOcticonMarkup("book", "about-fact-icon-svg");
  const translateIconMarkup = renderOcticonMarkup(
    "globe",
    "about-fact-icon-svg",
  );
  const qrImageSizes =
    "(min-width: 66rem) 16rem, (min-width: 42rem) 14rem, calc(100vw - 6rem)";
  const qrImageTransforms = "avif webp jpg 240 360 512";
  const resolveIcon = helpers.icon?.bind(helpers);
  // About uses Simple Icons for network branding while keeping the rest of the
  // page markup framework-agnostic strings.
  resolveIcon?.("wechat", "simpleicons");
  resolveIcon?.("telegram", "simpleicons");
  const { final: finalSeparator, list: listSeparator } = getAboutFeedSeparators(
    language,
  );
  const contacts = getAboutContacts(language, translations.about);
  const facts = getAboutFacts(translations.about, {
    location: locationIconMarkup,
    notebook: notebookIconMarkup,
    translate: translateIconMarkup,
  });
  const contactItems = contacts.map((contact) =>
    renderContactItem({
      closeIconMarkup,
      contact,
      downloadIconMarkup,
      qrImageSizes,
      qrImageTransforms,
      translations,
    })
  ).join("");
  const factItems = facts.map(renderFactItem).join("");

  return `<div class="site-page-shell site-page-shell--wide">
<nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.about.breadcrumbAriaLabel)
  }">
  <ol class="cds--breadcrumb-list">
    <li class="cds--breadcrumb-item">
      <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">${
    escapeHtml(translations.navigation.home)
  }</a>
    </li>
  </ol>
</nav>
<section class="pagehead about-pagehead" aria-labelledby="about-title">
  <div class="about-pagehead-grid">
    <div class="about-pagehead-copy">
      <p class="pagehead-eyebrow">${escapeHtml(translations.about.eyebrow)}</p>
      <h1 id="about-title" class="about-title">${
    escapeHtml(translations.about.title)
  }</h1>
      <p class="pagehead-lead">${escapeHtml(translations.about.lead)}</p>
    </div>
    <div class="about-pagehead-meta">
      <p class="about-pagehead-kicker">${
    escapeHtml(translations.about.feedsIntro)
  }</p>
      <p class="about-pagehead-feed-links"><a href="${
    escapeHtml(feedXmlUrl)
  }">RSS</a>${escapeHtml(listSeparator)}<a href="${
    escapeHtml(atomXmlUrl)
  }">Atom</a> ${escapeHtml(finalSeparator)}
        <a href="${escapeHtml(feedJsonUrl)}">JSON Feed</a>.</p>
    </div>
  </div>
</section>
<div class="feature-layout feature-layout--with-rail">
  <div class="feature-main">
    <div class="about-content">
      <p class="about-intro">${escapeHtml(translations.about.intro)}</p>
      <p>${escapeHtml(translations.about.body)}</p>
    </div>
  </div>
  <aside class="feature-rail about-rail" aria-label="${
    escapeHtml(translations.about.railAriaLabel)
  }">
    <div class="feature-rail-sticky">
      <section class="feature-card about-rail-card about-contact-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.contactTitle)
  }</h2>
        <ul class="about-contact-list">
          ${contactItems}
        </ul>
      </section>
      <section class="feature-card about-rail-card about-facts-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.atAGlanceTitle)
  }</h2>
        <dl class="about-facts">
          ${factItems}
        </dl>
      </section>
      <section class="feature-card about-rail-card about-notes-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.siteNotesTitle)
  }</h2>
        <ul class="about-notes">
          <li>${escapeHtml(translations.about.siteNoteOne)}</li>
          <li>${escapeHtml(translations.about.siteNoteTwo)}</li>
          <li>${escapeHtml(translations.about.siteNoteThree)}</li>
        </ul>
      </section>
      <section class="feature-card about-rail-card about-pictogram-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.about.pictogramTitle)
  }</h2>
        <div class="about-pictogram-frame" aria-hidden="true">
          <div class="about-pictogram">
            ${ABOUT_PICTOGRAM_SVG}
          </div>
        </div>
        <p class="feature-card-caption">${
    escapeHtml(translations.about.pictogramCaption)
  }</p>
      </section>
    </div>
  </aside>
</div>
</div>`;
};
