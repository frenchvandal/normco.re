import { siteName } from "./_data.ts";
import {
  ATOM_FEED_MIME_TYPE,
  JSON_FEED_MIME_TYPE,
  RSS_FEED_MIME_TYPE,
} from "./utils/media-types.ts";
import { renderSiteIconMarkup } from "./utils/site-icons.ts";
import { resolvePageSetup } from "./utils/page-setup.ts";
import type { SiteLanguage, SiteTranslations } from "./utils/i18n.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "./utils/feed-paths.ts";
import { escapeHtml } from "./utils/html.ts";

const COPY_ICON = renderSiteIconMarkup(
  "copy",
  "feeds-copy-icon feeds-copy-icon--default",
);
const COPY_SUCCESS_ICON = renderSiteIconMarkup(
  "check",
  "feeds-copy-icon feeds-copy-icon--success",
);

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/syndication/";
export const title = "Syndication";
export const description =
  "Machine-readable syndication endpoints for normco.re.";

export const fr = {
  title: "Syndication",
  description:
    "Points d’accès de syndication structurés pour le contenu de normco.re.",
} as const;

export const zhHans = {
  title: "聚合",
  description: "normco.re 的结构化订阅与索引入口。",
} as const;

export const zhHant = {
  title: "聚合",
  description: "normco.re 的結構化訂閱與索引入口。",
} as const;

type FeedItem = Readonly<{
  description: string;
  id: "rss" | "atom" | "json";
  mime: string;
  path: string;
  title: string;
}>;

type FormatMeta = Readonly<{
  label: "JSON" | "XML";
  tone: "teal" | "gray";
}>;

type FeedActions = Readonly<{
  copiedAction: string;
  copiedStatusMessage: string;
  copyAction: string;
  errorAction: string;
  errorStatusMessage: string;
  openAction: string;
}>;

function resolveFeedFormatMeta(mime: string): FormatMeta {
  return mime.includes("json")
    ? { label: "JSON", tone: "teal" }
    : { label: "XML", tone: "gray" };
}

function renderFormatTag({ label, tone }: FormatMeta): string {
  return `<span class="site-tag site-tag--${
    escapeHtml(tone)
  } feeds-card-tag" title="${escapeHtml(label)}">
    <span class="site-tag__label">${escapeHtml(label)}</span>
  </span>`;
}

function renderCopyControl(
  item: FeedItem,
  siteOrigin: string,
  actions: FeedActions,
): string {
  const absoluteUrl = new URL(item.path, siteOrigin).href;
  const copyTitle = `${actions.copyAction} ${item.title}`;
  const copiedStatus = actions.copiedStatusMessage.replace(
    "[LABEL]",
    item.title,
  );
  const errorStatus = actions.errorStatusMessage.replace(
    "[LABEL]",
    item.title,
  );

  return `<div
    class="feed-copy-control feeds-copy-control--antd"
    data-copy-control=""
    data-copy-state="idle"
    data-copy-label="${escapeHtml(item.title)}"
    data-copy-copied-status="${escapeHtml(copiedStatus)}"
    data-copy-error-status="${escapeHtml(errorStatus)}"
  >
    <div class="feeds-endpoint-row">
      <a
        href="${escapeHtml(item.path)}"
        class="feeds-endpoint-link"
        aria-label="${escapeHtml(`${actions.openAction} ${item.title}`)}"
      >
        <span class="feeds-endpoint-url-text">
          <code>${escapeHtml(absoluteUrl)}</code>
        </span>
      </a>
      <span class="css-var-_R_0_ ant-typography ant-typography-actions feeds-endpoint-actions">
        <button
          type="button"
          class="ant-typography-copy feeds-endpoint-copy-button"
          data-copy-button=""
          data-copy-path="${escapeHtml(item.path)}"
          data-copy-title="${escapeHtml(copyTitle)}"
          data-copy-default-label="${escapeHtml(actions.copyAction)}"
          data-copy-copied-label="${escapeHtml(actions.copiedAction)}"
          data-copy-error-label="${escapeHtml(actions.errorAction)}"
          aria-label="${escapeHtml(copyTitle)}"
          title="${escapeHtml(copyTitle)}"
        >
          <span class="feeds-copy-icon-stack" aria-hidden="true">
            <span role="img" aria-label="copy" class="anticon anticon-copy feeds-copy-icon feeds-copy-icon--default">
              ${COPY_ICON}
            </span>
            <span role="img" aria-label="check" class="anticon anticon-check feeds-copy-icon feeds-copy-icon--success">
              ${COPY_SUCCESS_ICON}
            </span>
          </span>
          <span class="sr-only feeds-copy-button-label" data-copy-button-label="">
            ${escapeHtml(actions.copyAction)}
          </span>
        </button>
      </span>
    </div>
    <span class="sr-only" data-copy-status="" aria-live="polite"></span>
  </div>`;
}

function renderFeedRow(
  item: FeedItem,
  siteOrigin: string,
  actions: FeedActions,
): string {
  const formatMeta = resolveFeedFormatMeta(item.mime);

  return `<article class="feeds-description-row feeds-description-row--${
    escapeHtml(item.id)
  }">
    <div class="feeds-description-term">
      <div class="feeds-entry-meta">
        ${renderFormatTag(formatMeta)}
      </div>
      <h2 class="feeds-entry-title">${escapeHtml(item.title)}</h2>
      <p class="feeds-entry-kicker">${escapeHtml(item.mime)}</p>
    </div>
    <div class="feeds-description-body">
      <p class="feeds-entry-description">${escapeHtml(item.description)}</p>
      ${renderCopyControl(item, siteOrigin, actions)}
    </div>
  </article>`;
}

function buildFeedItems(
  language: SiteLanguage,
  translations: SiteTranslations,
): readonly FeedItem[] {
  return [
    {
      id: "rss",
      title: translations.feeds.rssTitle,
      description: translations.feeds.rssDescription,
      path: getLocalizedRssFeedUrl(language),
      mime: RSS_FEED_MIME_TYPE,
    },
    {
      id: "atom",
      title: translations.feeds.atomTitle,
      description: translations.feeds.atomDescription,
      path: getLocalizedAtomFeedUrl(language),
      mime: ATOM_FEED_MIME_TYPE,
    },
    {
      id: "json",
      title: translations.feeds.jsonTitle,
      description: translations.feeds.jsonDescription,
      path: getLocalizedJsonFeedUrl(language),
      mime: JSON_FEED_MIME_TYPE,
    },
  ];
}

function buildFeedActions(translations: SiteTranslations): FeedActions {
  return {
    openAction: translations.feeds.openAction,
    copyAction: translations.feeds.copyAction,
    copiedAction: translations.feeds.copiedAction,
    errorAction: translations.feeds.errorAction,
    copiedStatusMessage: translations.feeds.copiedStatusMessage,
    errorStatusMessage: translations.feeds.errorStatusMessage,
  };
}

export default (data: Lume.Data): string => {
  const { language, translations } = resolvePageSetup(data.lang);
  const siteOrigin = `https://${siteName}`;
  const feedItems = buildFeedItems(language, translations);
  const feedActions = buildFeedActions(translations);
  const feedRowsHtml = feedItems.map((item) =>
    renderFeedRow(item, siteOrigin, feedActions)
  ).join("\n");

  return `<div class="site-page-shell site-page-shell--wide feeds-page feeds-page--minimal">
  <section class="pagehead syndication-pagehead" aria-labelledby="syndication-title">
    <div class="syndication-pagehead-grid">
      <div class="syndication-pagehead-copy">
        <p class="pagehead-eyebrow">${
    escapeHtml(translations.feeds.eyebrow)
  }</p>
        <h1 id="syndication-title" class="feeds-page-title">${
    escapeHtml(translations.feeds.title)
  }</h1>
        <p class="pagehead-lead feeds-page-lead">${
    escapeHtml(translations.feeds.lead)
  }</p>
        <p class="syndication-intro">${escapeHtml(translations.feeds.intro)}</p>
      </div>
    </div>
  </section>
  <div class="syndication-layout">
    <div class="syndication-content">
      <section
        class="syndication-section"
        aria-label="${escapeHtml(translations.feeds.cardsAriaLabel)}"
      >
        <div class="css-var-_R_0_ ant-descriptions feeds-descriptions">
          <div class="ant-descriptions-view">
            ${feedRowsHtml}
          </div>
        </div>
      </section>
    </div>
  </div>

  <script src="/scripts/feed-copy.js" defer></script>
</div>`;
};
