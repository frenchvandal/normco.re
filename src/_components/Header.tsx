/** Site header shell with navigation and user controls. */

import type { jsx } from "lume/jsx-runtime";

import {
  getLocalizedUrl,
  getPageContext,
  getSiteTranslations,
  type SiteLanguage,
} from "../utils/i18n.ts";
import { type IconResolver } from "../utils/primer-icons.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";
import SiteIcon from "./SiteIcon.tsx";

type SsxElement = ReturnType<typeof jsx>;
type HeaderTranslations = ReturnType<typeof getSiteTranslations>;
type LanguageAlternates = Partial<Record<SiteLanguage, string>>;
type NavigationItem = ReturnType<typeof buildHeaderNavigation>[number];
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: LanguageAlternates;
  icon?: IconResolver;
}>;
type HeaderActionButtonAttributes = Readonly<Record<string, string>>;
type HeaderActionProps = Readonly<{
  buttonAttributes: HeaderActionButtonAttributes;
  buttonClassName?: string;
  buttonId?: string;
  iconMarkup: SsxElement;
  tooltipLabel: string;
}>;
type HeaderActionDescriptor = Readonly<
  HeaderActionProps & {
    key: "search" | "language" | "theme";
  }
>;
type HeaderActionVariant = Readonly<{
  actionButtonClassName: string;
  actionIconClassName: string;
  iconSize?: number;
  languageButtonClassName?: string;
}>;
type LanguagePanelProps = Readonly<{
  language: SiteLanguage;
  languageAlternates: LanguageAlternates;
  optionClassName: string;
  menuClassName: string;
  panelClassName: string;
  panelContentClassName: string;
  translations: HeaderTranslations;
  panelHeadClassName?: string;
}>;
type SearchPanelProps = Readonly<{
  panelClassName: string;
  panelContentClassName: string;
  searchRootClassName: string;
  translations: HeaderTranslations;
  panelHeadClassName?: string;
}>;
type SideNavProps = Readonly<{
  navigationItems: readonly NavigationItem[];
  homeUrl: string;
  ariaLabel: string;
  lead: string;
  asideClassName: string;
  navigationClassName?: string;
  headerClassName?: string;
  eyebrow?: string;
}>;

function renderHeaderAction(
  {
    buttonAttributes,
    buttonClassName = "cds--header__action",
    buttonId,
    iconMarkup,
    tooltipLabel,
  }: HeaderActionProps,
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

function renderThemeIcons(
  className: string,
  {
    height = 16,
    width = 16,
  }: Readonly<{
    height?: number;
    width?: number;
  }> = {},
): SsxElement {
  return (
    <>
      <SiteIcon
        name="sun"
        className={`theme-icon theme-icon--sun ${className}`}
        width={width}
        height={height}
      />
      <SiteIcon
        name="moon"
        className={`theme-icon theme-icon--moon ${className}`}
        width={width}
        height={height}
      />
      <SiteIcon
        name="device-desktop"
        className={`theme-icon theme-icon--system ${className}`}
        width={width}
        height={height}
      />
    </>
  );
}

function resolveHeaderActions(
  translations: HeaderTranslations,
  {
    actionButtonClassName,
    actionIconClassName,
    iconSize = 16,
    languageButtonClassName,
  }: HeaderActionVariant,
): readonly HeaderActionDescriptor[] {
  return [
    {
      key: "search",
      buttonAttributes: {
        "aria-label": translations.site.searchLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.searchPanel,
      },
      buttonClassName: actionButtonClassName,
      iconMarkup: (
        <SiteIcon
          name="search"
          className={actionIconClassName}
          width={iconSize}
          height={iconSize}
        />
      ),
      tooltipLabel: translations.site.searchLabel,
    },
    {
      key: "language",
      buttonAttributes: {
        "aria-label": translations.site.languageSelectAriaLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.languagePanel,
        "aria-haspopup": "menu",
      },
      buttonClassName: languageButtonClassName ?? actionButtonClassName,
      iconMarkup: (
        <SiteIcon
          name="globe"
          className={actionIconClassName}
          width={iconSize}
          height={iconSize}
        />
      ),
      tooltipLabel: translations.site.languageSelectLabel,
    },
    {
      key: "theme",
      buttonAttributes: {
        "aria-label": translations.site.themeToggleLabel,
        "data-label-switch-light": translations.site.switchToLightThemeLabel,
        "data-label-switch-dark": translations.site.switchToDarkThemeLabel,
        "data-label-follow-system": translations.site.followSystemThemeLabel,
      },
      buttonClassName: actionButtonClassName,
      buttonId: HEADER_IDS.themeToggle,
      iconMarkup: renderThemeIcons(actionIconClassName, {
        width: iconSize,
        height: iconSize,
      }),
      tooltipLabel: translations.site.themeToggleLabel,
    },
  ];
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
          <SiteIcon
            name="info"
            className="site-search-notification-icon site-search-notification-icon--info"
            width={20}
            height={20}
          />
          <SiteIcon
            name="alert-fill"
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

function getCurrentPageAttributes(isCurrent: boolean) {
  return isCurrent ? { "aria-current": "page" as const } : {};
}

function resolveLanguageOptionUrl(
  optionLanguage: SiteLanguage,
  languageAlternates: LanguageAlternates,
): string {
  return languageAlternates[optionLanguage] ??
    getLocalizedUrl("/", optionLanguage);
}

function renderHeaderNavigationLinks(
  navigationItems: readonly NavigationItem[],
  className: string,
  labelClassName?: string,
): SsxElement[] {
  return navigationItems.map(({ href, label, isCurrent }) => (
    <a
      key={href}
      href={href}
      class={className}
      {...getCurrentPageAttributes(isCurrent)}
    >
      {labelClassName ? <span class={labelClassName}>{label}</span> : label}
    </a>
  ));
}

function renderSideNavItems(
  navigationItems: readonly NavigationItem[],
): SsxElement[] {
  return navigationItems.map(({ href, label, isCurrent }) => (
    <li class="cds--side-nav__item" key={href}>
      <a
        href={href}
        class="cds--side-nav__link"
        {...getCurrentPageAttributes(isCurrent)}
      >
        <span class="cds--side-nav__link-text">{label}</span>
      </a>
    </li>
  ));
}

function renderLanguageOptions(
  {
    language,
    languageAlternates,
    optionClassName,
  }: Pick<
    LanguagePanelProps,
    "language" | "languageAlternates" | "optionClassName"
  >,
): SsxElement[] {
  return HEADER_LANGUAGE_OPTIONS.map(
    ({ label, language: optionLanguage, tag }) => {
      const isSelected = optionLanguage === language;

      return (
        <a
          key={optionLanguage}
          href={resolveLanguageOptionUrl(optionLanguage, languageAlternates)}
          class={optionClassName}
          data-language-option={optionLanguage}
          hreflang={tag}
          lang={tag}
          role="menuitemradio"
          aria-checked={isSelected ? "true" : "false"}
          tabindex={isSelected ? "0" : "-1"}
        >
          <span class="cds--header__language-label">{label}</span>
          <span class="cds--header__language-check" aria-hidden="true">
            <SiteIcon
              name="check"
              className="cds--header__language-check-icon"
              width={16}
              height={16}
            />
          </span>
        </a>
      );
    },
  );
}

function renderLanguagePanel(
  {
    language,
    languageAlternates,
    optionClassName,
    menuClassName,
    panelClassName,
    panelContentClassName,
    translations,
    panelHeadClassName,
  }: LanguagePanelProps,
): SsxElement {
  return (
    <section
      id={HEADER_IDS.languagePanel}
      class={panelClassName}
      aria-label={translations.site.languageSelectLabel}
      data-language-panel=""
      hidden
    >
      <div class={panelContentClassName}>
        {panelHeadClassName && (
          <div class={panelHeadClassName}>
            <p class="cds--header__panel-title">
              {translations.site.languageSelectLabel}
            </p>
          </div>
        )}
        <div
          class={menuClassName}
          role="menu"
          aria-label={translations.site.languageSelectLabel}
          data-language-menu=""
        >
          {renderLanguageOptions({
            language,
            languageAlternates,
            optionClassName,
          })}
        </div>
      </div>
    </section>
  );
}

function renderSearchRoot(
  translations: HeaderTranslations,
  className: string,
): SsxElement {
  return (
    <div
      id={HEADER_IDS.searchContainer}
      class={className}
      data-search-root=""
      aria-busy="false"
      data-search-loading-label={translations.site.searchLoadingLabel}
      data-search-loading-title={translations.site.searchLoadingTitle}
      data-search-no-results-label={translations.site.searchNoResultsLabel}
      data-search-one-result-label={translations.site.searchOneResultLabel}
      data-search-many-results-label={translations.site.searchManyResultsLabel}
      data-search-unavailable-label={translations.site.searchUnavailableLabel}
      data-search-unavailable-title={translations.site.searchUnavailableTitle}
      data-search-offline-label={translations.site.searchOfflineLabel}
      data-search-offline-title={translations.site.searchOfflineTitle}
      data-search-retry-label={translations.site.searchRetryLabel}
    >
      {renderSearchSkeleton()}
    </div>
  );
}

function renderSearchPanel(
  {
    panelClassName,
    panelContentClassName,
    searchRootClassName,
    translations,
    panelHeadClassName,
  }: SearchPanelProps,
): SsxElement {
  return (
    <div
      id={HEADER_IDS.searchPanel}
      class={panelClassName}
      role="search"
      aria-label={translations.site.searchLabel}
      hidden
      data-search-panel=""
    >
      <div class={panelContentClassName}>
        {panelHeadClassName && (
          <div class={panelHeadClassName}>
            <p class="cds--header__panel-title">
              {translations.site.searchLabel}
            </p>
          </div>
        )}
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
        {renderSearchRoot(translations, searchRootClassName)}
      </div>
    </div>
  );
}

function renderSideNav(
  {
    navigationItems,
    homeUrl,
    ariaLabel,
    lead,
    asideClassName,
    navigationClassName = "cds--side-nav__navigation",
    headerClassName = "cds--side-nav__header",
    eyebrow,
  }: SideNavProps,
): SsxElement {
  return (
    <aside
      id={HEADER_IDS.sideNav}
      class={asideClassName}
      aria-label={ariaLabel}
      hidden
    >
      <nav class={navigationClassName}>
        <div class={headerClassName}>
          {eyebrow && <p class="cds--side-nav__eyebrow">{eyebrow}</p>}
          <a href={homeUrl} class="cds--side-nav__brand">
            <span class="cds--side-nav__brand-prefix">normco</span>
            .re
          </a>
          <p class="cds--side-nav__lead">{lead}</p>
        </div>
        <ul class="cds--side-nav__items">
          {renderSideNavItems(navigationItems)}
        </ul>
      </nav>
    </aside>
  );
}

function renderPrimerHomeHeader(props: HeaderProps): SsxElement {
  const { currentUrl, language, languageAlternates = {} } = props;
  const { homeUrl, translations } = getPageContext(language);
  const navigationItems = buildHeaderNavigation({ currentUrl, language });
  const headerActions = resolveHeaderActions(translations, {
    actionButtonClassName:
      "cds--header__action btn-octicon primer-home-header__action",
    actionIconClassName: "primer-home-header__action-icon",
    languageButtonClassName:
      "cds--header__action cds--header__language-toggle btn-octicon primer-home-header__action",
  });

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
              <SiteIcon
                name="three-bars"
                className="site-menu-icon site-menu-icon--menu primer-home-header__action-icon"
              />
              <SiteIcon
                name="x"
                className="site-menu-icon site-menu-icon--close primer-home-header__action-icon"
              />
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
            {renderHeaderNavigationLinks(
              navigationItems,
              "cds--header__menu-item subnav-item primer-home-header__nav-link",
              "site-header-menu-item-label",
            )}
          </nav>

          <div class="cds--header__global primer-home-header__global">
            {headerActions.map((action) => renderHeaderAction(action))}
          </div>
        </div>
      </header>

      {renderLanguagePanel({
        language,
        languageAlternates,
        optionClassName:
          "cds--header__language-option primer-home-header__menu-option",
        menuClassName:
          "cds--header__language-menu primer-home-header__language-menu",
        panelClassName:
          "cds--header__panel cds--header__language-panel primer-home-header__panel",
        panelContentClassName:
          "cds--header__panel-content Box primer-home-header__panel-box",
        translations,
        panelHeadClassName: "site-header-panel-head",
      })}

      {renderSearchPanel({
        panelClassName:
          "cds--header__panel cds--header__search-panel primer-home-header__panel",
        panelContentClassName:
          "cds--header__panel-content Box primer-home-header__panel-box",
        searchRootClassName:
          "cds--header__search-root primer-home-header__search-root",
        translations,
        panelHeadClassName:
          "site-header-panel-head site-header-panel-head--search",
      })}

      {renderSideNav({
        navigationItems,
        homeUrl,
        ariaLabel: translations.site.mainNavigationAriaLabel,
        lead: translations.home.lead,
        asideClassName: "cds--side-nav primer-home-header__drawer",
        navigationClassName:
          "cds--side-nav__navigation primer-home-header__drawer-navigation",
        headerClassName:
          "cds--side-nav__header primer-home-header__drawer-header",
        eyebrow: translations.site.mainNavigationAriaLabel,
      })}

      <div class="cds--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
}

/** Renders the site header with navigation and user controls. */
export default (props: HeaderProps): SsxElement => {
  const { currentUrl, language, languageAlternates = {} } = props;
  const { homeUrl, translations } = getPageContext(language);
  const navigationItems = buildHeaderNavigation({ currentUrl, language });
  const headerActions = resolveHeaderActions(translations, {
    actionButtonClassName: "cds--header__action",
    actionIconClassName: "cds--header__action-icon",
    iconSize: 20,
    languageButtonClassName: "cds--header__action cds--header__language-toggle",
  });

  if (currentUrl === homeUrl) {
    return renderPrimerHomeHeader(props);
  }

  return (
    <>
      <header class="cds--header">
        <div class="cds--header__wrapper">
          <div class="cds--header__left">
            <button
              type="button"
              class="cds--header__action cds--header__menu-toggle"
              aria-label={translations.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              <SiteIcon
                name="three-bars"
                className="cds--header__menu-icon site-menu-icon site-menu-icon--menu"
                width={20}
                height={20}
              />
              <SiteIcon
                name="x"
                className="cds--header__menu-icon site-menu-icon site-menu-icon--close"
                width={20}
                height={20}
              />
            </button>

            <a href={homeUrl} class="cds--header__name">
              <span class="cds--header__name--prefix">normco</span>
              .re
            </a>

            <nav
              class="cds--header__nav"
              aria-label={translations.site.mainNavigationAriaLabel}
            >
              {renderHeaderNavigationLinks(
                navigationItems,
                "cds--header__menu-item",
              )}
            </nav>
          </div>

          <div class="cds--header__global">
            {headerActions.map((action) => renderHeaderAction(action))}
          </div>
        </div>
      </header>

      {renderLanguagePanel({
        language,
        languageAlternates,
        optionClassName: "cds--header__language-option",
        menuClassName: "cds--header__language-menu",
        panelClassName: "cds--header__panel cds--header__language-panel",
        panelContentClassName: "cds--header__panel-content",
        translations,
      })}

      {renderSearchPanel({
        panelClassName: "cds--header__panel cds--header__search-panel",
        panelContentClassName: "cds--header__panel-content",
        searchRootClassName: "cds--header__search-root",
        translations,
      })}

      {renderSideNav({
        navigationItems,
        homeUrl,
        ariaLabel: translations.site.mainNavigationAriaLabel,
        lead: translations.home.lead,
        asideClassName: "cds--side-nav",
      })}

      <div class="cds--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
