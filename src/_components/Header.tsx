/** Site header with Carbon UI Shell structure, navigation, and user controls. */

import type { jsx } from "lume/jsx-runtime";

import {
  CHECKMARK_ICON,
  CLOSE_ICON,
  DARK_ICON,
  INFO_FILLED_ICON,
  LIGHT_ICON,
  MENU_ICON,
  SEARCH_ICON,
  SYSTEM_ICON,
  TRANSLATE_ICON,
  WARNING_FILLED_ICON,
} from "../utils/carbon-icons.ts";
import CarbonIcon from "./CarbonIcon.tsx";
import {
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
} from "../utils/i18n.ts";
import {
  getOcticonPathData,
  type IconResolver,
  type OcticonName,
} from "../utils/primer-icons.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";

type SsxElement = ReturnType<typeof jsx>;
type HeaderActionButtonAttributes = Readonly<Record<string, string>>;

function renderMaskedIcon(
  name: OcticonName,
  className: string,
): SsxElement {
  const pathData = getOcticonPathData(name);

  return (
    <svg
      class={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={pathData}></path>
    </svg>
  );
}

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

function renderSearchLoading(loadingLabel: string): SsxElement {
  return (
    <div
      class="cds--inline-loading site-search-inline-loading"
      data-search-loading=""
      hidden
    >
      <div class="cds--inline-loading__animation">
        <div class="cds--loading cds--loading--small">
          <svg
            class="cds--loading__svg"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              class="cds--loading__background"
              cx="50"
              cy="50"
              r="44"
            >
            </circle>
            <circle class="cds--loading__stroke" cx="50" cy="50" r="44">
            </circle>
          </svg>
        </div>
      </div>
      <p class="cds--inline-loading__text" data-search-loading-text="">
        {loadingLabel}
      </p>
    </div>
  );
}

function renderSearchNotification(): SsxElement {
  return (
    <div
      class="cds--inline-notification cds--inline-notification--low-contrast cds--inline-notification--info site-search-notification"
      data-search-notification=""
      data-search-notification-tone="info"
      hidden
    >
      <div class="cds--inline-notification__details">
        <span class="site-search-notification-icons" aria-hidden="true">
          <CarbonIcon
            icon={INFO_FILLED_ICON}
            className="site-search-notification-icon site-search-notification-icon--info"
            width={20}
            height={20}
          />
          <CarbonIcon
            icon={WARNING_FILLED_ICON}
            className="site-search-notification-icon site-search-notification-icon--warning"
            width={20}
            height={20}
          />
        </span>
        <div class="cds--inline-notification__text-wrapper">
          <p
            class="cds--inline-notification__title"
            data-search-notification-title=""
          >
          </p>
          <p
            class="cds--inline-notification__subtitle"
            data-search-notification-subtitle=""
          >
          </p>
        </div>
      </div>
    </div>
  );
}

function renderSearchSkeleton(): SsxElement {
  return (
    <div
      class="site-search-skeleton"
      data-search-skeleton=""
      aria-hidden="true"
    >
      <span class="cds--skeleton__text site-search-skeleton-line"></span>
      <span class="cds--skeleton__text site-search-skeleton-line"></span>
      <span class="cds--skeleton__text site-search-skeleton-line"></span>
    </div>
  );
}

function renderPrimerHomeHeader(
  {
    currentUrl,
    language,
    languageAlternates = {},
    icon,
  }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
    readonly languageAlternates?: Partial<Record<SiteLanguage, string>>;
    readonly icon?: IconResolver;
  },
): SsxElement {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const navigationItems = buildHeaderNavigation({ currentUrl, language });
  void icon;

  return (
    <>
      <header class="cds--header site-header--primer">
        <div class="cds--header__wrapper primer-home-header__wrapper">
          <div class="cds--header__left primer-home-header__left">
            <button
              type="button"
              class="cds--header__action cds--header__menu-toggle btn-octicon primer-home-header__menu-toggle"
              aria-label={translations.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              {renderMaskedIcon(
                "three-bars",
                "site-menu-icon site-menu-icon--menu primer-home-header__action-icon",
              )}
              {renderMaskedIcon(
                "x",
                "site-menu-icon site-menu-icon--close primer-home-header__action-icon",
              )}
            </button>

            <a
              href={homeUrl}
              class="cds--header__name primer-home-header__name"
            >
              <span class="primer-home-header__brand-lockup">
                <span class="primer-home-header__brand-wordmark">
                  <span class="cds--header__name--prefix">normco</span>
                  .re
                </span>
                <span class="primer-home-header__brand-meta">
                  {translations.home.eyebrow}
                </span>
              </span>
            </a>
          </div>

          <nav
            class="cds--header__nav subnav subnav-flush primer-home-header__nav"
            aria-label={translations.site.mainNavigationAriaLabel}
          >
            {navigationItems.map(({ href, label, isCurrent }) => (
              <a
                key={href}
                href={href}
                class="cds--header__menu-item subnav-item primer-home-header__nav-link"
                {...(isCurrent
                  ? ({
                    "aria-current": "page" as const,
                  })
                  : {})}
              >
                <span class="site-header-menu-item-label">{label}</span>
              </a>
            ))}
          </nav>

          <div class="cds--header__global primer-home-header__global">
            {renderHeaderAction({
              buttonAttributes: {
                "aria-label": translations.site.searchLabel,
                "aria-expanded": "false",
                "aria-controls": HEADER_IDS.searchPanel,
              },
              buttonClassName:
                "cds--header__action btn-octicon primer-home-header__action",
              iconMarkup: renderMaskedIcon(
                "search",
                "primer-home-header__action-icon",
              ),
              tooltipLabel: translations.site.searchLabel,
            })}

            {renderHeaderAction({
              buttonAttributes: {
                "aria-label": translations.site.languageSelectAriaLabel,
                "aria-expanded": "false",
                "aria-controls": HEADER_IDS.languagePanel,
                "aria-haspopup": "menu",
              },
              buttonClassName:
                "cds--header__action cds--header__language-toggle btn-octicon primer-home-header__action",
              iconMarkup: renderMaskedIcon(
                "globe",
                "primer-home-header__action-icon",
              ),
              tooltipLabel: translations.site.languageSelectLabel,
            })}

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
              buttonClassName:
                "cds--header__action btn-octicon primer-home-header__action",
              buttonId: HEADER_IDS.themeToggle,
              iconMarkup: (
                <>
                  {renderMaskedIcon(
                    "sun",
                    "theme-icon theme-icon--sun primer-home-header__action-icon",
                  )}
                  {renderMaskedIcon(
                    "moon",
                    "theme-icon theme-icon--moon primer-home-header__action-icon",
                  )}
                  {renderMaskedIcon(
                    "device-desktop",
                    "theme-icon theme-icon--system primer-home-header__action-icon",
                  )}
                </>
              ),
              tooltipLabel: translations.site.themeToggleLabel,
            })}
          </div>
        </div>
      </header>

      <section
        id={HEADER_IDS.languagePanel}
        class="cds--header__panel cds--header__language-panel primer-home-header__panel"
        aria-label={translations.site.languageSelectLabel}
        data-language-panel=""
        hidden
      >
        <div class="cds--header__panel-content Box primer-home-header__panel-box">
          <div class="site-header-panel-head">
            <p class="cds--header__panel-title">
              {translations.site.languageSelectLabel}
            </p>
          </div>
          <div
            class="cds--header__language-menu primer-home-header__language-menu"
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
                    class="cds--header__language-option primer-home-header__menu-option"
                    data-language-option={optionLanguage}
                    hreflang={tag}
                    lang={tag}
                    role="menuitemradio"
                    aria-checked={isSelected ? "true" : "false"}
                    tabindex={isSelected ? "0" : "-1"}
                  >
                    <span class="cds--header__language-label">{label}</span>
                    <span
                      class="cds--header__language-check"
                      aria-hidden="true"
                    >
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
        </div>
      </section>

      <div
        id={HEADER_IDS.searchPanel}
        class="cds--header__panel cds--header__search-panel primer-home-header__panel"
        role="search"
        aria-label={translations.site.searchLabel}
        hidden
        data-search-panel=""
      >
        <div class="cds--header__panel-content Box primer-home-header__panel-box">
          <div class="site-header-panel-head site-header-panel-head--search">
            <p class="cds--header__panel-title">
              {translations.site.searchLabel}
            </p>
          </div>
          <div
            id={HEADER_IDS.searchStatus}
            class="cds--header__search-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-search-status=""
            hidden
          >
            {renderSearchLoading(translations.site.searchLoadingLabel)}
            <p
              class="cds--header__search-status-text"
              data-search-status-text=""
              hidden
            >
            </p>
            {renderSearchNotification()}
          </div>
          <div
            id={HEADER_IDS.searchContainer}
            class="cds--header__search-root primer-home-header__search-root"
            data-search-root=""
            aria-busy="false"
            data-search-loading-label={translations.site.searchLoadingLabel}
            data-search-loading-title={translations.site.searchLoadingTitle}
            data-search-no-results-label={translations.site
              .searchNoResultsLabel}
            data-search-one-result-label={translations.site
              .searchOneResultLabel}
            data-search-many-results-label={translations.site
              .searchManyResultsLabel}
            data-search-unavailable-label={translations.site
              .searchUnavailableLabel}
            data-search-unavailable-title={translations.site
              .searchUnavailableTitle}
            data-search-offline-label={translations.site.searchOfflineLabel}
            data-search-offline-title={translations.site.searchOfflineTitle}
            data-search-retry-label={translations.site.searchRetryLabel}
          >
            {renderSearchSkeleton()}
          </div>
        </div>
      </div>

      <aside
        id={HEADER_IDS.sideNav}
        class="cds--side-nav primer-home-header__drawer"
        aria-label={translations.site.mainNavigationAriaLabel}
        hidden
      >
        <nav class="cds--side-nav__navigation primer-home-header__drawer-navigation">
          <div class="cds--side-nav__header primer-home-header__drawer-header">
            <p class="cds--side-nav__eyebrow">
              {translations.site.mainNavigationAriaLabel}
            </p>
            <a href={homeUrl} class="cds--side-nav__brand">
              <span class="cds--side-nav__brand-prefix">normco</span>
              .re
            </a>
            <p class="cds--side-nav__lead">{translations.home.lead}</p>
          </div>
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

      <div class="cds--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
}

/** Renders the Carbon UI Shell header with navigation and user controls. */
export default (
  { currentUrl, language, languageAlternates = {}, icon }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
    readonly languageAlternates?: Partial<Record<SiteLanguage, string>>;
    readonly icon?: IconResolver;
  },
): SsxElement => {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const navigationItems = buildHeaderNavigation({ currentUrl, language });

  if (currentUrl === homeUrl) {
    return renderPrimerHomeHeader({
      currentUrl,
      language,
      languageAlternates,
      ...(icon ? { icon } : {}),
    });
  }

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
        <div class="cds--header__panel-content">
          <div
            class="cds--header__language-menu"
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
                    <span
                      class="cds--header__language-check"
                      aria-hidden="true"
                    >
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
          <div
            id={HEADER_IDS.searchStatus}
            class="cds--header__search-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-search-status=""
            hidden
          >
            {renderSearchLoading(translations.site.searchLoadingLabel)}
            <p
              class="cds--header__search-status-text"
              data-search-status-text=""
              hidden
            >
            </p>
            {renderSearchNotification()}
          </div>
          <div
            id={HEADER_IDS.searchContainer}
            class="cds--header__search-root"
            data-search-root=""
            aria-busy="false"
            data-search-loading-label={translations.site.searchLoadingLabel}
            data-search-loading-title={translations.site.searchLoadingTitle}
            data-search-no-results-label={translations.site
              .searchNoResultsLabel}
            data-search-one-result-label={translations.site
              .searchOneResultLabel}
            data-search-many-results-label={translations.site
              .searchManyResultsLabel}
            data-search-unavailable-label={translations.site
              .searchUnavailableLabel}
            data-search-unavailable-title={translations.site
              .searchUnavailableTitle}
            data-search-offline-label={translations.site.searchOfflineLabel}
            data-search-offline-title={translations.site.searchOfflineTitle}
            data-search-retry-label={translations.site.searchRetryLabel}
          >
            {renderSearchSkeleton()}
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
          <div class="cds--side-nav__header">
            <a href={homeUrl} class="cds--side-nav__brand">
              <span class="cds--side-nav__brand-prefix">normco</span>
              .re
            </a>
            <p class="cds--side-nav__lead">{translations.home.lead}</p>
          </div>
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
