/** Syndication page with copyable feed and indexing endpoints. */

import { siteName } from "./_data.ts";
import {
  type CarbonIconDescriptor,
  CHECKMARK_FILLED_ICON as CARBON_CHECKMARK_FILLED_ICON,
  CHECKMARK_ICON as CARBON_CHECKMARK_ICON,
  CHEVRON_DOWN_ICON as CARBON_CHEVRON_DOWN_ICON,
  COPY_ICON as CARBON_COPY_ICON,
  LIST_ICON as CARBON_LIST_ICON,
  VIEW_ICON as CARBON_VIEW_ICON,
  WARNING_FILLED_ICON as CARBON_WARNING_FILLED_ICON,
} from "./utils/carbon-icons.ts";
import {
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "./utils/feed-paths.ts";
import { escapeHtml } from "./utils/html.ts";

const SYNDICATION_PICTOGRAM =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M18,13.5c0,.2761-.2239.5-.5.5s-.5-.2239-.5-.5.2239-.5.5-.5.5.2239.5.5ZM14.5,13c-.2761,0-.5.2239-.5.5s.2239.5.5.5.5-.2239.5-.5-.2239-.5-.5-.5ZM26.7178,26.4883c.4385-1.0586.0986-2.1807-.4629-2.7432l-.5098.5098c.3887.3887.6104,1.2275.3076,1.958-.3281.791-1.1748,1.2764-2.415,1.3975.3428-.6689.7861-1.7861.5381-2.7227-.1436-.5371-.4844-.9443-1.0146-1.21-.3076-.1533-.7285-.2324-1.2627-.332-1.9082-.3564-4.792-.8955-5.5435-5.4053-.0576-.3457-.6523-.3457-.71,0-.7515,4.5098-3.6353,5.0488-5.543,5.4053-.5342.0996-.9561.1787-1.2632.332-.5303.2656-.8716.6729-1.0142,1.21-.249.9365.1948,2.0537.5371,2.7227-1.2397-.1211-2.0869-.6064-2.4146-1.3975-.3027-.7305-.0815-1.5693.3071-1.958l-.5088-.5098c-.562.5625-.9019,1.6846-.4634,2.7432.2896.6992,1.1572,1.8721,3.7178,1.8721.1328,0,.2549-.0732.3174-.1904s.0557-.2588-.0181-.3691c-.2988-.4492-1.022-1.8135-.7788-2.7285.0884-.334.2983-.5791.6406-.75.2168-.1084.6138-.1826,1.0732-.2686,1.6484-.3086,4.564-.8535,5.7656-4.5234,1.2021,3.6699,4.1172,4.2148,5.7656,4.5234.46.0859.8564.1602,1.0732.2686.3418.1709.5518.416.6406.749.2422.9111-.4805,2.2793-.7793,2.7295-.0732.1104-.0801.252-.0176.3691s.1846.1904.3174.1904c2.5605,0,3.4287-1.1729,3.7178-1.8721ZM30.0918,23.5557c.1221-.0762.2686-.2334.2686-.5557,0-1.2041-2.1982-3.3604-4.3604-3.3604-4.0977,0-4.8027-.0498-5.6777-1.8008l-.6445.3223c1.0996,2.1992,2.3105,2.1992,6.3223,2.1992,1.7539,0,3.4199,1.6895,3.6182,2.5205-.1846-.0664-.4668-.208-.707-.3281-.7705-.3848-1.8262-.9131-2.9111-.9131h-4c-2.6807,0-3.6416-3.6904-3.6504-3.7275l-.6992.1748c.0439.1748,1.1055,4.2734,4.3496,4.2734h4c.915,0,1.8828.4834,2.5889.8369.5059.2529.8867.4434,1.1924.4434.1123,0,.2148-.0264.3105-.085ZM3.4111,23.1973c.7065-.3535,1.6738-.8369,2.5889-.8369h4c3.2437,0,4.3057-4.0986,4.3491-4.2734l-.6982-.1748c-.0093.0371-.9702,3.7275-3.6509,3.7275h-4c-1.085,0-2.1401.5283-2.9111.9131-.2437.1221-.5322.2666-.7158.332.1631-.79,1.8501-2.5244,3.627-2.5244,4.0117,0,5.2227,0,6.3218-2.1992l-.6436-.3223c-.876,1.751-1.5806,1.8008-5.6782,1.8008-2.1626,0-4.3599,2.1562-4.3599,3.3604,0,.3223.146.4795.2686.5557.0947.0586.1973.085.3105.085.3052,0,.6855-.1904,1.1919-.4434ZM26.3604,15c0-1.1089-.5391-1.9175-1.0605-2.6997-.4834-.7246-.9395-1.4092-.9395-2.3003,0-1.4922,1.3311-2.3921,2.3223-2.5923-.3994.5234-1.043,1.3857-1.043,2.5923,0,1.0698.7148,1.6533,1.4062,2.2178.7832.6396,1.5938,1.3018,1.5938,2.7822,0,1.8101-.8594,2.709-.8955,2.7471l.2559.2529-.2549-.2549.5098.5098c.0449-.0459,1.1055-1.1299,1.1055-3.2549,0-1.8223-1.0312-2.6641-1.8594-3.3403-.6377-.5205-1.1406-.9316-1.1406-1.6597,0-.9839.5498-1.7046.915-2.1816.2686-.3521.4629-.6064.3184-.8994-.1377-.2788-.4688-.2788-.5938-.2788-1.1729,0-3.3604,1.1538-3.3604,3.3599,0,1.1089.5391,1.9175,1.0605,2.6997.4834.7246.9395,1.4092.9395,2.3003,0,1.8013-.8389,2.6396-2.6396,2.6396-1.9824,0-2.4922-1.9741-2.6221-3,1.2617-1.2114,1.9824-2.8916,1.9824-4.6396,0-3.5068-2.8535-6.3599-6.3604-6.3599s-6.3599,2.853-6.3599,6.3599c0,1.7476.7202,3.4282,1.9819,4.6396-.1299,1.0259-.6382,3-2.6221,3-1.8013,0-2.6401-.8384-2.6401-2.6396,0-.8911.4565-1.5757.9395-2.3003.5215-.7822,1.0605-1.5908,1.0605-2.6997,0-2.2061-2.1875-3.3599-3.3599-3.3599-.1245,0-.4556,0-.5938.2788-.1445.293.0498.5474.3188.8994.3643.4771.915,1.1978.915,2.1816,0,.728-.5039,1.1392-1.1411,1.6597-.8281.6763-1.8589,1.5181-1.8589,3.3403,0,2.125,1.0601,3.209,1.1055,3.2549l.5103-.5078c-.0366-.0381-.896-.937-.896-2.7471,0-1.4805.8105-2.1426,1.5942-2.7822.6914-.5645,1.4058-1.1479,1.4058-2.2178,0-1.2207-.6577-2.0889-1.0562-2.6099.9355.1719,2.3364,1.0791,2.3364,2.6099,0,.8911-.4565,1.5757-.9395,2.3003-.5215.7822-1.0605,1.5908-1.0605,2.6997,0,2.1982,1.1616,3.3604,3.3599,3.3604,2.769,0,3.2705-2.9282,3.3584-3.8252.0107-.1133-.0322-.2256-.1167-.3018-1.1958-1.0835-1.8818-2.6265-1.8818-4.2334,0-3.1099,2.5303-5.6401,5.6401-5.6401s5.6396,2.5303,5.6396,5.6401c0,1.6069-.6855,3.1499-1.8809,4.2334-.085.0762-.1279.1885-.1172.3018.0879.8975.5908,3.8252,3.3584,3.8252,2.1982,0,3.3604-1.1621,3.3604-3.3604Z"/></svg>';

function renderCarbonIconMarkup(
  { attrs, content, name }: CarbonIconDescriptor,
  className: string,
): string {
  const paths = content.map((node: CarbonIconDescriptor["content"][number]) => {
    const attributes = Object.entries(node.attrs)
      .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
      .join(" ");

    return `<path ${attributes}></path>`;
  }).join("");

  return `<svg class="${
    escapeHtml(className)
  }" width="${attrs.width}" height="${attrs.height}" viewBox="${
    escapeHtml(attrs.viewBox)
  }" fill="currentColor" aria-hidden="true" focusable="false" data-carbon-icon="${
    escapeHtml(name)
  }">${paths}</svg>`;
}

const COPY_ICON = renderCarbonIconMarkup(
  CARBON_COPY_ICON,
  "feeds-copy-icon feeds-copy-icon--default",
);
const COPY_SUCCESS_ICON = renderCarbonIconMarkup(
  CARBON_CHECKMARK_ICON,
  "feeds-copy-icon feeds-copy-icon--success",
);
const CHECKMARK_FILLED_ICON = renderCarbonIconMarkup(
  CARBON_CHECKMARK_FILLED_ICON,
  "feeds-notice-icon feeds-notice-icon--success",
);
const WARNING_FILLED_ICON = renderCarbonIconMarkup(
  CARBON_WARNING_FILLED_ICON,
  "feeds-notice-icon feeds-notice-icon--error",
);
const VIEW_ICON = renderCarbonIconMarkup(
  CARBON_VIEW_ICON,
  "site-switcher-icon cds--content-switcher__icon",
);
const LIST_ICON = renderCarbonIconMarkup(
  CARBON_LIST_ICON,
  "site-switcher-icon cds--content-switcher__icon",
);
const CHEVRON_DOWN_ICON = renderCarbonIconMarkup(
  CARBON_CHEVRON_DOWN_ICON,
  "cds--accordion__arrow",
);

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/syndication/";
/** Page title. */
export const title = "Syndication";
/** Page meta description. */
export const description =
  "Machine-readable syndication endpoints for normco.re.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Syndication",
  description:
    "Points d’accès de syndication structurés pour le contenu de normco.re.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "聚合",
  description: "normco.re 的结构化订阅与索引入口。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "聚合",
  description: "normco.re 的結構化訂閱與索引入口。",
} as const;

type FeedCard = {
  readonly id: "rss" | "atom" | "json" | "sitemap";
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly mime: string;
};
type FeedActions = Readonly<{
  openAction: string;
  copyAction: string;
  copiedAction: string;
  errorAction: string;
  copiedStatusMessage: string;
  errorStatusMessage: string;
  copiedTitle: string;
  errorTitle: string;
}>;

function resolveFeedFormatMeta(mime: string): {
  readonly label: "JSON" | "XML";
  readonly tone: "teal" | "gray";
} {
  return mime.includes("json")
    ? { label: "JSON", tone: "teal" }
    : { label: "XML", tone: "gray" };
}

function renderCopyNotice(
  actions: Pick<FeedActions, "copiedTitle" | "errorTitle">,
): string {
  return `<div
    class="cds--inline-notification cds--inline-notification--success cds--inline-notification--low-contrast feeds-copy-notice"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    data-copy-notice=""
    data-copy-notice-success-title="${escapeHtml(actions.copiedTitle)}"
    data-copy-notice-error-title="${escapeHtml(actions.errorTitle)}"
    data-copy-notice-state="idle"
    hidden
  >
    <div class="cds--inline-notification__details">
      <span class="feeds-notice-icons" aria-hidden="true">
        ${CHECKMARK_FILLED_ICON}
        ${WARNING_FILLED_ICON}
      </span>
      <div class="cds--inline-notification__text-wrapper">
        <p class="cds--inline-notification__title" data-copy-notice-title="">
          ${escapeHtml(actions.copiedTitle)}
        </p>
        <p class="cds--inline-notification__subtitle" data-copy-notice-message=""></p>
      </div>
    </div>
  </div>`;
}

function renderCopyControl(
  card: FeedCard,
  siteOrigin: string,
  actions: FeedActions,
  { compact = false }: { readonly compact?: boolean } = {},
): string {
  const absoluteUrl = new URL(card.path, siteOrigin).href;
  const copyTitle = `${actions.copyAction} ${card.title}`;
  const copiedStatus = actions.copiedStatusMessage.replace(
    "[LABEL]",
    card.title,
  );
  const errorStatus = actions.errorStatusMessage.replace("[LABEL]", card.title);

  return `<div
    class="feed-copy-control feeds-copy-control${
    compact ? " feeds-copy-control--compact" : ""
  }"
    data-copy-control=""
    data-copy-state="idle"
    data-copy-label="${escapeHtml(card.title)}"
    data-copy-copied-status="${escapeHtml(copiedStatus)}"
    data-copy-error-status="${escapeHtml(errorStatus)}"
  >
    <div class="feeds-endpoint-row${
    compact ? " feeds-endpoint-row--compact" : ""
  }">
      <a
        href="${escapeHtml(card.path)}"
        class="feeds-endpoint-link"
        aria-label="${escapeHtml(`${actions.openAction} ${card.title}`)}"
      >
        <span class="feeds-endpoint-url-text">
          <code>${escapeHtml(absoluteUrl)}</code>
        </span>
      </a>
      <button
        type="button"
        class="feeds-endpoint-copy-button"
        data-copy-button=""
        data-copy-path="${escapeHtml(card.path)}"
        data-copy-title="${escapeHtml(copyTitle)}"
        data-copy-default-label="${escapeHtml(actions.copyAction)}"
        data-copy-copied-label="${escapeHtml(actions.copiedAction)}"
        data-copy-error-label="${escapeHtml(actions.errorAction)}"
        aria-label="${escapeHtml(copyTitle)}"
        title="${escapeHtml(copyTitle)}"
      >
        ${COPY_ICON}
        ${COPY_SUCCESS_ICON}
        <span class="sr-only" data-copy-button-label="">
          ${escapeHtml(actions.copyAction)}
        </span>
      </button>
    </div>
    ${compact ? "" : renderCopyNotice(actions)}
    <span class="sr-only" data-copy-status="" aria-live="polite"></span>
  </div>`;
}

function renderCard(
  card: FeedCard,
  siteOrigin: string,
  actions: FeedActions,
): string {
  const { label: formatLabel, tone: formatTone } = resolveFeedFormatMeta(
    card.mime,
  );

  return `<article class="cds--tile feeds-card feeds-card--${
    escapeHtml(card.id)
  }">
  <div class="feeds-card-head">
    <div class="feeds-card-badges">
      <span class="cds--tag cds--tag--${
    escapeHtml(formatTone)
  } feeds-card-tag" title="${escapeHtml(formatLabel)}">
        <span class="cds--tag__label">${escapeHtml(formatLabel)}</span>
      </span>
    </div>
    <p class="feeds-card-kicker">${escapeHtml(card.mime)}</p>
    <h3 class="feeds-card-title">${escapeHtml(card.title)}</h3>
    <p class="feeds-card-description">${escapeHtml(card.description)}</p>
  </div>
  ${renderCopyControl(card, siteOrigin, actions)}
</article>`;
}

function renderStructuredListRow(
  card: FeedCard,
  siteOrigin: string,
  actions: FeedActions,
): string {
  const { label: formatLabel, tone: formatTone } = resolveFeedFormatMeta(
    card.mime,
  );

  return `<div class="cds--structured-list-row">
    <div class="cds--structured-list-td feeds-structured-list-format">
      <div class="feeds-structured-list-copy">
        <span class="cds--tag cds--tag--${
    escapeHtml(formatTone)
  } feeds-card-tag" title="${escapeHtml(formatLabel)}">
          <span class="cds--tag__label">${escapeHtml(formatLabel)}</span>
        </span>
        <div class="feeds-structured-list-meta">
          <p class="feeds-structured-list-title">${escapeHtml(card.title)}</p>
          <p class="feeds-structured-list-kicker">${escapeHtml(card.mime)}</p>
        </div>
      </div>
    </div>
    <div class="cds--structured-list-td">
      ${renderCopyControl(card, siteOrigin, actions, { compact: true })}
    </div>
    <div class="cds--structured-list-td feeds-structured-list-use">
      <p>${escapeHtml(card.description)}</p>
    </div>
  </div>`;
}

function renderAccordionItem(
  {
    body,
    id,
    title,
  }: {
    readonly body: string;
    readonly id: string;
    readonly title: string;
  },
  expanded = false,
): string {
  return `<li class="cds--accordion__item${
    expanded ? " cds--accordion__item--active" : ""
  }">
    <button
      type="button"
      class="cds--accordion__heading"
      data-accordion-trigger=""
      aria-expanded="${expanded ? "true" : "false"}"
      aria-controls="${escapeHtml(id)}"
    >
      ${CHEVRON_DOWN_ICON}
      <span class="cds--accordion__title">${escapeHtml(title)}</span>
    </button>
    <div
      id="${escapeHtml(id)}"
      class="cds--accordion__wrapper"
      data-accordion-panel=""
      ${expanded ? "" : "hidden"}
    >
      <div class="cds--accordion__content">
        <p>${escapeHtml(body)}</p>
      </div>
    </div>
  </li>`;
}

/** Renders the syndication page. */
export default (data: Lume.Data): string => {
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const siteOrigin = `https://${siteName}`;
  const homeUrl = getLocalizedUrl("/", language);
  const feedCards: ReadonlyArray<FeedCard> = [
    {
      id: "rss",
      title: translations.feeds.rssTitle,
      description: translations.feeds.rssDescription,
      path: getLocalizedRssFeedUrl(language),
      mime: "application/rss+xml",
    },
    {
      id: "atom",
      title: translations.feeds.atomTitle,
      description: translations.feeds.atomDescription,
      path: getLocalizedAtomFeedUrl(language),
      mime: "application/atom+xml",
    },
    {
      id: "json",
      title: translations.feeds.jsonTitle,
      description: translations.feeds.jsonDescription,
      path: getLocalizedJsonFeedUrl(language),
      mime: "application/feed+json",
    },
    {
      id: "sitemap",
      title: translations.feeds.sitemapTitle,
      description: translations.feeds.sitemapDescription,
      path: "/sitemap.xml",
      mime: "application/xml",
    },
  ];
  const feedActions: FeedActions = {
    openAction: translations.feeds.openAction,
    copyAction: translations.feeds.copyAction,
    copiedAction: translations.feeds.copiedAction,
    errorAction: translations.feeds.errorAction,
    copiedStatusMessage: translations.feeds.copiedStatusMessage,
    errorStatusMessage: translations.feeds.errorStatusMessage,
    copiedTitle: translations.feeds.copyNoticeTitle,
    errorTitle: translations.feeds.errorNoticeTitle,
  };

  const cardsHtml = feedCards.map((card) =>
    renderCard(card, siteOrigin, feedActions)
  ).join("\n");

  const listRowsHtml = feedCards.map((card) =>
    renderStructuredListRow(card, siteOrigin, feedActions)
  ).join("\n");

  const guidanceAccordion = [
    renderAccordionItem(
      {
        id: "syndication-guidance-readers",
        title: translations.feeds.guidanceReadersTitle,
        body: translations.feeds.guidanceReadersBody,
      },
      true,
    ),
    renderAccordionItem({
      id: "syndication-guidance-automation",
      title: translations.feeds.guidanceAutomationTitle,
      body: translations.feeds.guidanceAutomationBody,
    }),
    renderAccordionItem({
      id: "syndication-guidance-discovery",
      title: translations.feeds.guidanceDiscoveryTitle,
      body: translations.feeds.guidanceDiscoveryBody,
    }),
  ].join("\n");

  return `<div class="site-page-shell site-page-shell--wide feeds-page">
  <nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.feeds.breadcrumbAriaLabel)
  }">
    <ol class="cds--breadcrumb-list">
      <li class="cds--breadcrumb-item">
        <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">
          ${escapeHtml(translations.navigation.home)}
        </a>
      </li>
    </ol>
  </nav>
  <section class="cds--tile pagehead syndication-pagehead" aria-labelledby="syndication-title">
    <p class="pagehead-eyebrow">${escapeHtml(translations.feeds.eyebrow)}</p>
    <h1 id="syndication-title" class="feeds-page-title">${
    escapeHtml(translations.feeds.title)
  }</h1>
    <p class="pagehead-lead feeds-page-lead">${
    escapeHtml(translations.feeds.lead)
  }</p>
  </section>
  <div class="syndication-layout">
    <div class="syndication-content">
      <div class="syndication-hero">
        <div class="syndication-hero-copy">
          <p class="syndication-intro">${
    escapeHtml(translations.feeds.intro)
  }</p>
        </div>
        <aside class="syndication-rail" aria-hidden="true">
          <section class="cds--tile feature-card syndication-pictogram-card">
            <div class="syndication-pictogram-frame" aria-hidden="true">
              <div class="syndication-pictogram">
                ${SYNDICATION_PICTOGRAM}
              </div>
            </div>
          </section>
        </aside>
      </div>
      <div class="cds--tabs site-tabs site-tabs--syndication" data-site-tabs="">
        <ul class="cds--tab--list" role="tablist" aria-label="${
    escapeHtml(translations.feeds.tabsAriaLabel)
  }">
          <li class="cds--tabs__nav-item cds--tabs__nav-item--selected">
            <button
              type="button"
              class="cds--tabs__nav-link"
              id="syndication-tab-endpoints"
              role="tab"
              data-tabs-trigger=""
              aria-selected="true"
              aria-controls="syndication-panel-endpoints"
            >
              <span class="cds--tabs__nav-item-label">${
    escapeHtml(translations.feeds.endpointsTabLabel)
  }</span>
            </button>
          </li>
          <li class="cds--tabs__nav-item">
            <button
              type="button"
              class="cds--tabs__nav-link"
              id="syndication-tab-guidance"
              role="tab"
              data-tabs-trigger=""
              aria-selected="false"
              tabindex="-1"
              aria-controls="syndication-panel-guidance"
            >
              <span class="cds--tabs__nav-item-label">${
    escapeHtml(translations.feeds.guidanceTabLabel)
  }</span>
            </button>
          </li>
        </ul>
      </div>
      <section
        id="syndication-panel-endpoints"
        class="cds--tab-content syndication-tab-panel"
        role="tabpanel"
        aria-labelledby="syndication-tab-endpoints"
        data-tabs-panel=""
      >
        <section class="cds--tile editorial-callout editorial-callout--info feeds-overview-callout">
          <p class="editorial-callout-eyebrow">${
    escapeHtml(translations.feeds.overviewCalloutEyebrow)
  }</p>
          <p class="editorial-callout-title">${
    escapeHtml(translations.feeds.overviewCalloutTitle)
  }</p>
          <p class="editorial-callout-body">${
    escapeHtml(translations.feeds.overviewCalloutBody)
  }</p>
        </section>
        <section class="syndication-section" aria-labelledby="syndication-endpoints-title">
          <div class="subhead">
            <h2 id="syndication-endpoints-title" class="subhead-heading">${
    escapeHtml(translations.feeds.cardsAriaLabel)
  }</h2>
          </div>
          <div class="cds--content-switcher site-content-switcher" data-content-switcher="" role="tablist" aria-label="${
    escapeHtml(translations.feeds.viewLabel)
  }">
            <button
              type="button"
              class="cds--content-switcher-btn cds--content-switcher--selected"
              role="tab"
              data-content-switcher-trigger=""
              aria-selected="true"
              aria-controls="syndication-endpoints-cards"
            >
              ${VIEW_ICON}
              <span class="cds--content-switcher__label">${
    escapeHtml(translations.feeds.cardsViewLabel)
  }</span>
            </button>
            <button
              type="button"
              class="cds--content-switcher-btn"
              role="tab"
              data-content-switcher-trigger=""
              aria-selected="false"
              tabindex="-1"
              aria-controls="syndication-endpoints-list"
            >
              ${LIST_ICON}
              <span class="cds--content-switcher__label">${
    escapeHtml(translations.feeds.listViewLabel)
  }</span>
            </button>
          </div>
          <div id="syndication-endpoints-cards" data-content-switcher-panel="">
            <div class="feeds-grid">
              ${cardsHtml}
            </div>
          </div>
          <div id="syndication-endpoints-list" data-content-switcher-panel="" hidden>
            <div
              class="cds--structured-list cds--structured-list--condensed feeds-structured-list"
            >
              <div class="cds--structured-list-thead">
                <div class="cds--structured-list-row cds--structured-list-row--header-row">
                  <span class="cds--structured-list-th">${
    escapeHtml(translations.feeds.listFormatHeading)
  }</span>
                  <span class="cds--structured-list-th">${
    escapeHtml(translations.feeds.listUrlHeading)
  }</span>
                  <span class="cds--structured-list-th">${
    escapeHtml(translations.feeds.listUseHeading)
  }</span>
                </div>
              </div>
              <div class="cds--structured-list-tbody">
                ${listRowsHtml}
              </div>
            </div>
          </div>
        </section>
      </section>
      <section
        id="syndication-panel-guidance"
        class="cds--tab-content syndication-tab-panel"
        role="tabpanel"
        aria-labelledby="syndication-tab-guidance"
        data-tabs-panel=""
        hidden
      >
        <section class="syndication-section" aria-labelledby="syndication-guidance-title">
          <div class="subhead">
            <h2 id="syndication-guidance-title" class="subhead-heading">${
    escapeHtml(translations.feeds.guidanceTabLabel)
  }</h2>
          </div>
          <p class="syndication-guidance-lead">${
    escapeHtml(translations.feeds.guidanceLead)
  }</p>
          <ul class="cds--accordion site-accordion" data-site-accordion="">
            ${guidanceAccordion}
          </ul>
        </section>
      </section>
    </div>
  </div>

  <script src="/scripts/surface-controls.js" defer></script>
  <script src="/scripts/feed-copy.js" defer></script>
</div>`;
};
