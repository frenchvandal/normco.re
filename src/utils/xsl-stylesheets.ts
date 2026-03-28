import feedStylesheetTemplate from "../feed.xsl.template" with { type: "text" };
import sitemapStylesheetTemplate from "../sitemap.xsl.template" with {
  type: "text",
};

import { escape } from "@std/html";
import { renderSiteIconMarkup } from "./site-icons.ts";
import { HEADER_IDS, HEADER_LANGUAGE_OPTIONS } from "./header-language-menu.ts";
import { type SiteLanguage, SUPPORTED_LANGUAGES } from "./i18n.ts";

const HEADER_LANGUAGE_MENU_PANEL_TOKEN =
  "<!--__HEADER_LANGUAGE_MENU_PANEL__-->";
const HEADER_MENU_ICON_TOKEN = "<!--__HEADER_MENU_ICON__-->";
const HEADER_SEARCH_ICON_TOKEN = "<!--__HEADER_SEARCH_ICON__-->";
const HEADER_LANGUAGE_ICON_TOKEN = "<!--__HEADER_LANGUAGE_ICON__-->";
const HEADER_THEME_ICONS_TOKEN = "<!--__HEADER_THEME_ICONS__-->";
const HEADER_LANGUAGE_PANEL_ID_TOKEN = "__HEADER_LANGUAGE_PANEL_ID__";
const FOOTER_GITHUB_ICON_TOKEN = "<!--__FOOTER_GITHUB_ICON__-->";
const SUPPORTED_LANGUAGES_TOKEN = "__SUPPORTED_LANGUAGES__";

type XslAttributeContent = Readonly<
  | {
    kind: "literal";
    value: string;
  }
  | {
    kind: "xml";
    value: string;
  }
>;

type HeaderLanguageMenuXslContext = Readonly<{
  menuLabel: XslAttributeContent;
  panelLabel: XslAttributeContent;
  href: (language: SiteLanguage) => XslAttributeContent;
  ariaChecked: (language: SiteLanguage) => XslAttributeContent;
  tabIndex: (language: SiteLanguage) => XslAttributeContent;
}>;

const FEED_HREF_SELECT = {
  en: "$en-feed-href",
  fr: "$fr-feed-href",
  zhHans: "$zh-hans-feed-href",
  zhHant: "$zh-hant-feed-href",
} as const satisfies Record<SiteLanguage, string>;

const SITEMAP_HREF = {
  en: "/sitemap.xml",
  fr: "$fr-home-href",
  zhHans: "$zh-hans-home-href",
  zhHant: "$zh-hant-home-href",
} as const satisfies Record<SiteLanguage, string>;

const HEADER_MENU_ICON_MARKUP = renderSiteIconMarkup(
  "three-bars",
  "site-header__menu-icon",
  {
    width: 20,
    height: 20,
  },
);
const HEADER_SEARCH_ICON_MARKUP = renderSiteIconMarkup(
  "search",
  "site-header__action-icon",
  {
    width: 20,
    height: 20,
  },
);
const HEADER_LANGUAGE_ICON_MARKUP = renderSiteIconMarkup(
  "translation",
  "site-header__action-icon",
  {
    width: 20,
    height: 20,
  },
);
const HEADER_THEME_ICONS_MARKUP = [
  renderSiteIconMarkup(
    "sun",
    "site-header__action-icon theme-icon theme-icon--sun",
    {
      width: 20,
      height: 20,
    },
  ),
  renderSiteIconMarkup(
    "moon",
    "site-header__action-icon theme-icon theme-icon--moon",
    {
      width: 20,
      height: 20,
    },
  ),
  renderSiteIconMarkup(
    "device-desktop",
    "site-header__action-icon theme-icon theme-icon--system",
    {
      width: 20,
      height: 20,
    },
  ),
].join("\n");
const FOOTER_GITHUB_ICON_MARKUP = renderSiteIconMarkup(
  "github",
  "site-footer-icon",
  {
    width: 16,
    height: 16,
  },
);

function escapeXml(value: string): string {
  return escape(value).replaceAll("&#39;", "&apos;");
}

function literalAttribute(value: string): XslAttributeContent {
  return { kind: "literal", value };
}

function xmlAttribute(value: string): XslAttributeContent {
  return { kind: "xml", value };
}

function renderXslAttribute(
  name: string,
  value: XslAttributeContent,
  indent: string,
): string {
  const content = value.kind === "literal"
    ? escapeXml(value.value)
    : value.value;
  return `${indent}<xsl:attribute name="${name}">${content}</xsl:attribute>`;
}

function renderSelectedLanguageTest(language: SiteLanguage): string {
  return `<xsl:choose><xsl:when test="$page-language-key='${language}'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>`;
}

function renderSelectedLanguageTabIndex(language: SiteLanguage): string {
  return `<xsl:choose><xsl:when test="$page-language-key='${language}'">0</xsl:when><xsl:otherwise>-1</xsl:otherwise></xsl:choose>`;
}

function renderHeaderLanguageMenuPanelXsl(
  context: HeaderLanguageMenuXslContext,
): string {
  const checkmarkIconMarkup = renderSiteIconMarkup(
    "check",
    "site-header__language-check-icon",
    {
      width: 16,
      height: 16,
    },
  );
  const languageOptionsMarkup = HEADER_LANGUAGE_OPTIONS.map((option) =>
    [
      `              <a class="site-header__language-option" data-language-option="${option.language}" hreflang="${option.tag}" lang="${option.tag}" role="menuitemradio">`,
      renderXslAttribute(
        "href",
        context.href(option.language),
        "                ",
      ),
      renderXslAttribute(
        "aria-checked",
        context.ariaChecked(option.language),
        "                ",
      ),
      renderXslAttribute(
        "tabindex",
        context.tabIndex(option.language),
        "                ",
      ),
      `                <span class="site-header__language-label">${
        escapeXml(option.label)
      }</span>`,
      '                <span class="site-header__language-check" aria-hidden="true">',
      `                  ${checkmarkIconMarkup}`,
      "                </span>",
      "              </a>",
    ].join("\n")
  ).join("\n");

  return [
    "          <section",
    `            id="${HEADER_IDS.languagePanel}"`,
    '            class="site-header__panel site-header__language-panel"',
    '            data-language-panel=""',
    '            hidden=""',
    "          >",
    renderXslAttribute("aria-label", context.panelLabel, "            "),
    "            <div",
    '              class="site-header__panel-content site-header__language-menu"',
    '              role="menu"',
    '              data-language-menu=""',
    "            >",
    renderXslAttribute("aria-label", context.menuLabel, "              "),
    languageOptionsMarkup,
    "            </div>",
    "          </section>",
  ].join("\n");
}

function renderFeedHeaderLanguageMenuPanel(): string {
  return renderHeaderLanguageMenuPanelXsl({
    panelLabel: xmlAttribute(
      '<xsl:value-of select="$language-select-label"/>',
    ),
    menuLabel: xmlAttribute(
      '<xsl:value-of select="$language-select-label"/>',
    ),
    href: (language) =>
      xmlAttribute(`<xsl:value-of select="${FEED_HREF_SELECT[language]}"/>`),
    ariaChecked: (language) =>
      xmlAttribute(renderSelectedLanguageTest(language)),
    tabIndex: (language) =>
      xmlAttribute(renderSelectedLanguageTabIndex(language)),
  });
}

function renderSitemapHeaderLanguageMenuPanel(): string {
  return renderHeaderLanguageMenuPanelXsl({
    panelLabel: literalAttribute("Language"),
    menuLabel: literalAttribute("Language"),
    href: (language) =>
      SITEMAP_HREF[language].startsWith("$")
        ? xmlAttribute(`<xsl:value-of select="${SITEMAP_HREF[language]}"/>`)
        : literalAttribute(SITEMAP_HREF[language]),
    ariaChecked: (language) =>
      literalAttribute(language === "en" ? "true" : "false"),
    tabIndex: (language) => literalAttribute(language === "en" ? "0" : "-1"),
  });
}

function replaceRequiredToken(
  template: string,
  token: string,
  replacement: string,
): string {
  if (!template.includes(token)) {
    throw new Error(`Expected XSL template token ${token} to be present`);
  }

  return template.replaceAll(token, replacement);
}

function renderStylesheet(
  template: string,
  languageMenuPanel: string,
): string {
  let renderedTemplate = replaceRequiredToken(
    template,
    HEADER_LANGUAGE_MENU_PANEL_TOKEN,
    languageMenuPanel,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    HEADER_LANGUAGE_PANEL_ID_TOKEN,
    HEADER_IDS.languagePanel,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    HEADER_MENU_ICON_TOKEN,
    HEADER_MENU_ICON_MARKUP,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    HEADER_SEARCH_ICON_TOKEN,
    HEADER_SEARCH_ICON_MARKUP,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    HEADER_LANGUAGE_ICON_TOKEN,
    HEADER_LANGUAGE_ICON_MARKUP,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    HEADER_THEME_ICONS_TOKEN,
    HEADER_THEME_ICONS_MARKUP,
  );
  renderedTemplate = replaceRequiredToken(
    renderedTemplate,
    FOOTER_GITHUB_ICON_TOKEN,
    FOOTER_GITHUB_ICON_MARKUP,
  );

  return replaceRequiredToken(
    renderedTemplate,
    SUPPORTED_LANGUAGES_TOKEN,
    SUPPORTED_LANGUAGES.join(","),
  );
}

export function renderFeedStylesheet(): string {
  return renderStylesheet(
    feedStylesheetTemplate,
    renderFeedHeaderLanguageMenuPanel(),
  );
}

export function renderSitemapStylesheet(): string {
  return renderStylesheet(
    sitemapStylesheetTemplate,
    renderSitemapHeaderLanguageMenuPanel(),
  );
}
