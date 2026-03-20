import type { CarbonIconDescriptor } from "../_components/CarbonIcon.tsx";
import feedStylesheetTemplate from "../feed.xsl.template" with { type: "text" };
import sitemapStylesheetTemplate from "../sitemap.xsl.template" with {
  type: "text",
};

import { CHECKMARK_ICON } from "./carbon-icons.ts";
import { HEADER_IDS, HEADER_LANGUAGE_OPTIONS } from "./header-language-menu.ts";
import { type SiteLanguage, SUPPORTED_LANGUAGES } from "./i18n.ts";

const HEADER_LANGUAGE_MENU_PANEL_TOKEN =
  "<!--__HEADER_LANGUAGE_MENU_PANEL__-->";
const HEADER_LANGUAGE_PANEL_ID_TOKEN = "__HEADER_LANGUAGE_PANEL_ID__";
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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

function renderIconAttributes(
  attributes: Readonly<Record<string, string | number>>,
): string {
  return Object.entries(attributes).map(([name, value]) =>
    `${name}="${escapeXml(String(value))}"`
  ).join(" ");
}

function renderCarbonIconMarkup(
  {
    className,
    height,
    icon,
    width,
  }: {
    readonly className: string;
    readonly height?: number;
    readonly icon: CarbonIconDescriptor;
    readonly width?: number;
  },
): string {
  const svgAttributes = renderIconAttributes({
    class: className,
    width: width ?? icon.attrs.width,
    height: height ?? icon.attrs.height,
    viewBox: icon.attrs.viewBox,
    fill: "currentColor",
    "aria-hidden": "true",
    focusable: "false",
    "data-carbon-icon": icon.name,
  });
  const pathMarkup = icon.content.map((node) =>
    `<path ${renderIconAttributes(node.attrs)}></path>`
  ).join("");

  return `<svg ${svgAttributes}>${pathMarkup}</svg>`;
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
  const checkmarkIconMarkup = renderCarbonIconMarkup({
    icon: CHECKMARK_ICON,
    className: "cds--header__language-check-icon",
    width: 16,
    height: 16,
  });
  const languageOptionsMarkup = HEADER_LANGUAGE_OPTIONS.map((option) =>
    [
      `              <a class="cds--header__language-option" data-language-option="${option.language}" hreflang="${option.tag}" lang="${option.tag}" role="menuitemradio">`,
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
      `                <span class="cds--header__language-label">${
        escapeXml(option.label)
      }</span>`,
      '                <span class="cds--header__language-check" aria-hidden="true">',
      `                  ${checkmarkIconMarkup}`,
      "                </span>",
      "              </a>",
    ].join("\n")
  ).join("\n");

  return [
    "          <section",
    `            id="${HEADER_IDS.languagePanel}"`,
    '            class="cds--header__panel cds--header__language-panel"',
    '            data-language-panel=""',
    '            hidden=""',
    "          >",
    renderXslAttribute("aria-label", context.panelLabel, "            "),
    "            <div",
    '              class="cds--header__panel-content cds--header__language-menu"',
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
