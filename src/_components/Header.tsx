/** Site header with Carbon UI Shell structure, navigation, and user controls. */

import type { jsx } from "lume/jsx-runtime";

import {
  CHECKMARK_ICON,
  CLOSE_ICON,
  DARK_ICON,
  LIGHT_ICON,
  MENU_ICON,
  SEARCH_ICON,
  SYSTEM_ICON,
  TRANSLATE_ICON,
} from "../utils/carbon-icons.ts";
import CarbonIcon from "./CarbonIcon.tsx";
import {
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
} from "../utils/i18n.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";

type SsxElement = ReturnType<typeof jsx>;
type HeaderActionButtonAttributes = Readonly<Record<string, string>>;

function renderHeaderAction(
  {
    buttonAttributes,
    buttonClassName = "cds--header__action",
    buttonId,
    iconMarkup,
    tooltipLabel,
  }: {
    readonly buttonAttributes: HeaderActionButtonAttributes;
    readonly buttonClassName?: string;
    readonly buttonId?: string;
    readonly iconMarkup: SsxElement;
    readonly tooltipLabel: string;
  },
): SsxElement {
  const mergedButtonAttributes = {
    ...(buttonId ? { id: buttonId } : {}),
    class: buttonClassName,
    "data-header-tooltip-trigger": "",
    ...buttonAttributes,
  };

  return (
    <div
      class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
      data-header-tooltip=""
    >
      <button type="button" {...mergedButtonAttributes}>
        {iconMarkup}
      </button>
      <div class="cds--popover" aria-hidden="true">
        <span class="cds--popover-caret"></span>
        <div class="cds--popover-content">
          <span class="cds--tooltip-content">{tooltipLabel}</span>
        </div>
      </div>
    </div>
  );
}

/** Renders the Carbon UI Shell header with navigation and user controls. */
export default (
  { currentUrl, language, languageAlternates = {} }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
    readonly languageAlternates?: Partial<Record<SiteLanguage, string>>;
  },
): SsxElement => {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const navigationItems = buildHeaderNavigation({ currentUrl, language });

  return (
    <>
      {/* Carbon UI Shell Header */}
      <header class="cds--header">
        <div class="cds--header__wrapper">
          {/* Left section: hamburger menu + product name */}
          <div class="cds--header__left">
            {/* Hamburger menu trigger for SideNav */}
            <button
              type="button"
              class="cds--header__action cds--header__menu-toggle"
              aria-label={translations.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              <CarbonIcon
                icon={MENU_ICON}
                className="cds--header__menu-icon site-menu-icon site-menu-icon--menu"
                width={20}
                height={20}
              />
              <CarbonIcon
                icon={CLOSE_ICON}
                className="cds--header__menu-icon site-menu-icon site-menu-icon--close"
                width={20}
                height={20}
              />
            </button>

            {/* Product/brand name */}
            <a href={homeUrl} class="cds--header__name">
              <span class="cds--header__name--prefix">normco</span>
              .re
            </a>

            {/* Header navigation (desktop) */}
            <nav
              class="cds--header__nav"
              aria-label={translations.site.mainNavigationAriaLabel}
            >
              {navigationItems.map(({ href, label, isCurrent }) => (
                <a
                  key={href}
                  href={href}
                  class="cds--header__menu-item"
                  {...(isCurrent
                    ? ({
                      "aria-current": "page" as const,
                    })
                    : {})}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right section: global actions */}
          <div class="cds--header__global">
            {/* Search action */}
            {renderHeaderAction({
              buttonAttributes: {
                "aria-label": translations.site.searchLabel,
                "aria-expanded": "false",
                "aria-controls": HEADER_IDS.searchPanel,
              },
              iconMarkup: (
                <CarbonIcon
                  icon={SEARCH_ICON}
                  className="cds--header__action-icon"
                  width={20}
                  height={20}
                />
              ),
              tooltipLabel: translations.site.searchLabel,
            })}

            {/* Language selector action */}
            {renderHeaderAction({
              buttonAttributes: {
                "aria-label": translations.site.languageSelectAriaLabel,
                "aria-expanded": "false",
                "aria-controls": HEADER_IDS.languagePanel,
                "aria-haspopup": "menu",
              },
              buttonClassName:
                "cds--header__action cds--header__language-toggle",
              iconMarkup: (
                <CarbonIcon
                  icon={TRANSLATE_ICON}
                  className="cds--header__action-icon"
                  width={20}
                  height={20}
                />
              ),
              tooltipLabel: translations.site.languageSelectLabel,
            })}

            {/* Theme toggle action */}
            {renderHeaderAction({
              buttonAttributes: {
                "aria-label": translations.site.themeToggleLabel,
                "data-label-switch-light": translations.site
                  .switchToLightThemeLabel,
                "data-label-switch-dark": translations.site
                  .switchToDarkThemeLabel,
                "data-label-follow-system": translations.site
                  .followSystemThemeLabel,
              },
              buttonId: HEADER_IDS.themeToggle,
              iconMarkup: (
                <>
                  <CarbonIcon
                    icon={LIGHT_ICON}
                    className="cds--header__action-icon theme-icon theme-icon--sun"
                    width={20}
                    height={20}
                  />
                  <CarbonIcon
                    icon={DARK_ICON}
                    className="cds--header__action-icon theme-icon theme-icon--moon"
                    width={20}
                    height={20}
                  />
                  <CarbonIcon
                    icon={SYSTEM_ICON}
                    className="cds--header__action-icon theme-icon theme-icon--system"
                    width={20}
                    height={20}
                  />
                </>
              ),
              tooltipLabel: translations.site.themeToggleLabel,
            })}
          </div>
        </div>
      </header>

      {/* Language selector dropdown menu */}
      <section
        id={HEADER_IDS.languagePanel}
        class="cds--header__panel cds--header__language-panel"
        aria-label={translations.site.languageSelectLabel}
        data-language-panel=""
        hidden
      >
        <div
          class="cds--header__panel-content cds--header__language-menu"
          role="menu"
          aria-label={translations.site.languageSelectLabel}
          data-language-menu=""
        >
          {HEADER_LANGUAGE_OPTIONS.map(
            ({ label, language: optionLanguage, tag }) => {
              const optionUrl = languageAlternates[optionLanguage] ??
                getLocalizedUrl("/", optionLanguage);
              const isSelected = optionLanguage === language;
              return (
                <a
                  key={optionLanguage}
                  href={optionUrl}
                  class="cds--header__language-option"
                  data-language-option={optionLanguage}
                  hreflang={tag}
                  lang={tag}
                  role="menuitemradio"
                  aria-checked={isSelected ? "true" : "false"}
                  tabindex={isSelected ? "0" : "-1"}
                >
                  <span class="cds--header__language-label">{label}</span>
                  <span class="cds--header__language-check" aria-hidden="true">
                    <CarbonIcon
                      icon={CHECKMARK_ICON}
                      className="cds--header__language-check-icon"
                      width={16}
                      height={16}
                    />
                  </span>
                </a>
              );
            },
          )}
        </div>
      </section>

      {/* Search panel */}
      <div
        id={HEADER_IDS.searchPanel}
        class="cds--header__panel cds--header__search-panel"
        role="search"
        aria-label={translations.site.searchLabel}
        hidden
        data-search-panel=""
      >
        <div class="cds--header__panel-content">
          <p
            id={HEADER_IDS.searchStatus}
            class="cds--header__search-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-search-status=""
            hidden
          >
          </p>
          <div
            id={HEADER_IDS.searchContainer}
            class="cds--header__search-root"
            data-search-root=""
            aria-busy="false"
            data-search-loading-label={translations.site.searchLoadingLabel}
            data-search-no-results-label={translations.site
              .searchNoResultsLabel}
            data-search-one-result-label={translations.site
              .searchOneResultLabel}
            data-search-many-results-label={translations.site
              .searchManyResultsLabel}
            data-search-unavailable-label={translations.site
              .searchUnavailableLabel}
            data-search-offline-label={translations.site.searchOfflineLabel}
            data-search-retry-label={translations.site.searchRetryLabel}
          >
          </div>
        </div>
      </div>

      {/* Carbon UI Shell Left Panel (SideNav) */}
      <aside
        id={HEADER_IDS.sideNav}
        class="cds--side-nav"
        aria-label={translations.site.mainNavigationAriaLabel}
        hidden
      >
        <nav class="cds--side-nav__navigation">
          <ul class="cds--side-nav__items">
            {navigationItems.map(({ href, label, isCurrent }) => (
              <li class="cds--side-nav__item" key={href}>
                <a
                  href={href}
                  class="cds--side-nav__link"
                  {...(isCurrent
                    ? ({
                      "aria-current": "page" as const,
                    })
                    : {})}
                >
                  <span class="cds--side-nav__link-text">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile when SideNav is open */}
      <div class="cds--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
