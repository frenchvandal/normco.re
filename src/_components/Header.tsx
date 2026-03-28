import type { jsx } from "lume/jsx-runtime";

import {
  getLocalizedUrl,
  getPageContext,
  type SiteLanguage,
  type SiteTranslations,
} from "../utils/i18n.ts";
import { type IconResolver } from "../utils/site-icons.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";
import SiteIcon from "./SiteIcon.tsx";

type El = ReturnType<typeof jsx>;
type Translations = SiteTranslations;
type LanguageAlternates = Partial<Record<SiteLanguage, string>>;
type NavigationItem = ReturnType<typeof buildHeaderNavigation>[number];
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: LanguageAlternates;
  icon?: IconResolver;
}>;

/** CSS class sets that differ between the editorial-home and standard variants. */
type VariantClasses = Readonly<{
  header: string;
  wrapper: string;
  left: string;
  menuToggle: string;
  menuIconClass: string;
  menuIconSize: number;
  name: string;
  nav: string;
  navLink: string;
  navLinkLabel?: string;
  global: string;
  actionButton: string;
  actionIcon: string;
  actionIconSize: number;
  languageButton: string;
  languageOption: string;
  languageMenu: string;
  languagePanel: string;
  languagePanelContent: string;
  searchPanel: string;
  searchPanelContent: string;
  searchRoot: string;
  sideNav: string;
  sideNavNavigation?: string;
  sideNavHeader?: string;
  panelHead: boolean;
  searchPanelHead: boolean;
}>;

/** Standard (non-home) variant - base class names only. */
const STANDARD: VariantClasses = {
  header: "cds--header",
  wrapper: "cds--header__wrapper",
  left: "cds--header__left",
  menuToggle: "cds--header__action cds--header__menu-toggle",
  menuIconClass: "cds--header__menu-icon site-menu-icon",
  menuIconSize: 20,
  name: "cds--header__name",
  nav: "cds--header__nav",
  navLink: "cds--header__menu-item",
  global: "cds--header__global",
  actionButton: "cds--header__action",
  actionIcon: "cds--header__action-icon",
  actionIconSize: 20,
  languageButton: "cds--header__action cds--header__language-toggle",
  languageOption: "cds--header__language-option",
  languageMenu: "cds--header__language-menu",
  languagePanel: "cds--header__panel cds--header__language-panel",
  languagePanelContent: "cds--header__panel-content",
  searchPanel: "cds--header__panel cds--header__search-panel",
  searchPanelContent: "cds--header__panel-content",
  searchRoot: "cds--header__search-root",
  sideNav: "cds--side-nav",
  panelHead: false,
  searchPanelHead: false,
};

/** Editorial home variant extends standard with additional home classes. */
const eh = (suffix: string) => `editorial-home-header__${suffix}`;
const EDITORIAL_HOME: VariantClasses = {
  ...STANDARD,
  header: `cds--header site-header--editorial-home`,
  wrapper: `cds--header__wrapper ${eh("wrapper")}`,
  left: `cds--header__left ${eh("left")}`,
  menuToggle: `cds--header__action cds--header__menu-toggle btn-octicon ${
    eh("menu-toggle")
  }`,
  menuIconClass: `site-menu-icon ${eh("action-icon")}`,
  menuIconSize: 16,
  name: `cds--header__name ${eh("name")}`,
  nav: `cds--header__nav ${eh("nav")}`,
  navLink: `cds--header__menu-item subnav-item ${eh("nav-link")}`,
  navLinkLabel: "site-header-menu-item-label",
  global: `cds--header__global ${eh("global")}`,
  actionButton: `cds--header__action btn-octicon ${eh("action")}`,
  actionIcon: eh("action-icon"),
  actionIconSize: 16,
  languageButton:
    `cds--header__action cds--header__language-toggle btn-octicon ${
      eh("action")
    }`,
  languageOption: `cds--header__language-option ${eh("menu-option")}`,
  languageMenu: `cds--header__language-menu ${eh("language-menu")}`,
  languagePanel: `cds--header__panel cds--header__language-panel ${
    eh("panel")
  }`,
  languagePanelContent: `cds--header__panel-content Box ${eh("panel-box")}`,
  searchPanel: `cds--header__panel cds--header__search-panel ${eh("panel")}`,
  searchPanelContent: `cds--header__panel-content Box ${eh("panel-box")}`,
  searchRoot: `cds--header__search-root ${eh("search-root")}`,
  sideNav: `cds--side-nav ${eh("drawer")}`,
  sideNavNavigation: `cds--side-nav__navigation ${eh("drawer-navigation")}`,
  sideNavHeader: `cds--side-nav__header ${eh("drawer-header")}`,
  panelHead: true,
  searchPanelHead: true,
};

// ── Shared sub-components ──────────────────────────────────────────────

function renderHeaderAction(
  {
    buttonAttributes,
    buttonClassName = "cds--header__action",
    buttonId,
    iconMarkup,
    tooltipLabel,
  }: Readonly<{
    buttonAttributes: Readonly<Record<string, string>>;
    buttonClassName?: string;
    buttonId?: string;
    iconMarkup: El;
    tooltipLabel: string;
  }>,
): El {
  return (
    <div
      class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
      data-header-tooltip=""
    >
      <button
        type="button"
        {...(buttonId ? { id: buttonId } : {})}
        class={buttonClassName}
        data-header-tooltip-trigger=""
        {...buttonAttributes}
      >
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

function renderThemeIcons(className: string, size = 16): El {
  return (
    <>
      <SiteIcon
        name="sun"
        className={`theme-icon theme-icon--sun ${className}`}
        width={size}
        height={size}
      />
      <SiteIcon
        name="moon"
        className={`theme-icon theme-icon--moon ${className}`}
        width={size}
        height={size}
      />
      <SiteIcon
        name="device-desktop"
        className={`theme-icon theme-icon--system ${className}`}
        width={size}
        height={size}
      />
    </>
  );
}

function resolveHeaderActions(
  t: Translations,
  v: VariantClasses,
) {
  return [
    {
      key: "search" as const,
      buttonAttributes: {
        "aria-label": t.site.searchLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.searchPanel,
      },
      buttonClassName: v.actionButton,
      iconMarkup: (
        <SiteIcon
          name="search"
          className={v.actionIcon}
          width={v.actionIconSize}
          height={v.actionIconSize}
        />
      ),
      tooltipLabel: t.site.searchLabel,
    },
    {
      key: "language" as const,
      buttonAttributes: {
        "aria-label": t.site.languageSelectAriaLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.languagePanel,
        "aria-haspopup": "menu",
      },
      buttonClassName: v.languageButton,
      iconMarkup: (
        <SiteIcon
          name="translation"
          className={v.actionIcon}
          width={v.actionIconSize}
          height={v.actionIconSize}
        />
      ),
      tooltipLabel: t.site.languageSelectLabel,
    },
    {
      key: "theme" as const,
      buttonAttributes: {
        "aria-label": t.site.themeToggleLabel,
        "data-label-switch-light": t.site.switchToLightThemeLabel,
        "data-label-switch-dark": t.site.switchToDarkThemeLabel,
        "data-label-follow-system": t.site.followSystemThemeLabel,
      },
      buttonClassName: v.actionButton,
      buttonId: HEADER_IDS.themeToggle,
      iconMarkup: renderThemeIcons(v.actionIcon, v.actionIconSize),
      tooltipLabel: t.site.themeToggleLabel,
    },
  ] as const;
}

function renderDesktopNavigationMenu(
  items: readonly NavigationItem[],
): El {
  return (
    <ul
      class="site-header-antd-menu ant-menu-overflow ant-menu ant-menu-root ant-menu-horizontal ant-menu-light css-var-_R_0_ ant-menu-css-var"
      role="menu"
      tabindex="0"
      data-menu-list="true"
    >
      {items.map(({ href, isCurrent, label }) => (
        <li
          key={href}
          class={`ant-menu-overflow-item ant-menu-item ant-menu-item-only-child${
            isCurrent ? " ant-menu-item-selected" : ""
          }`}
          role="menuitem"
          tabindex="-1"
        >
          <span class="ant-menu-title-content">
            <a
              href={href}
              {...(isCurrent ? { "aria-current": "page" as const } : {})}
            >
              {label}
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}

function renderLanguageOptions(
  language: SiteLanguage,
  alternates: LanguageAlternates,
  optionClassName: string,
): El[] {
  return HEADER_LANGUAGE_OPTIONS.map(
    ({ label, language: optLang, tag }) => {
      const isSelected = optLang === language;
      return (
        <a
          key={optLang}
          href={alternates[optLang] ?? getLocalizedUrl("/", optLang)}
          class={optionClassName}
          data-language-option={optLang}
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

function PanelHead({ className, title }: { className: string; title: string }) {
  return (
    <div class={className}>
      <p class="cds--header__panel-title">{title}</p>
    </div>
  );
}

function renderLanguagePanel(
  language: SiteLanguage,
  alternates: LanguageAlternates,
  t: Translations,
  v: VariantClasses,
): El {
  return (
    <section
      id={HEADER_IDS.languagePanel}
      class={v.languagePanel}
      aria-label={t.site.languageSelectLabel}
      data-language-panel=""
      hidden
    >
      <div class={v.languagePanelContent}>
        {v.panelHead && (
          <PanelHead
            className="site-header-panel-head"
            title={t.site.languageSelectLabel}
          />
        )}
        <div
          class={v.languageMenu}
          role="menu"
          aria-label={t.site.languageSelectLabel}
          data-language-menu=""
        >
          {renderLanguageOptions(language, alternates, v.languageOption)}
        </div>
      </div>
    </section>
  );
}

function renderSearchPanel(
  t: Translations,
  v: VariantClasses,
): El {
  return (
    <div
      id={HEADER_IDS.searchPanel}
      class={v.searchPanel}
      role="search"
      aria-label={t.site.searchLabel}
      hidden
      data-search-panel=""
    >
      <div class={v.searchPanelContent}>
        {v.searchPanelHead && (
          <PanelHead
            className="site-header-panel-head site-header-panel-head--search"
            title={t.site.searchLabel}
          />
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
                  />
                  <circle
                    class="cds--loading__stroke"
                    cx="50"
                    cy="50"
                    r="44"
                  />
                </svg>
              </div>
            </div>
            <p
              class="cds--inline-loading__text"
              data-search-loading-text=""
            >
              {t.site.searchLoadingLabel}
            </p>
          </div>
          <p
            class="cds--header__search-status-text"
            data-search-status-text=""
            hidden
          />
          <div
            class="cds--inline-notification cds--inline-notification--low-contrast cds--inline-notification--info site-search-notification"
            data-search-notification=""
            data-search-notification-tone="info"
            hidden
          >
            <div class="cds--inline-notification__details">
              <span
                class="site-search-notification-icons"
                aria-hidden="true"
              >
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
                />
                <p
                  class="cds--inline-notification__subtitle"
                  data-search-notification-subtitle=""
                />
              </div>
            </div>
          </div>
        </div>
        <div
          id={HEADER_IDS.searchContainer}
          class={v.searchRoot}
          data-search-root=""
          aria-busy="false"
          data-search-loading-label={t.site.searchLoadingLabel}
          data-search-loading-title={t.site.searchLoadingTitle}
          data-search-no-results-label={t.site.searchNoResultsLabel}
          data-search-one-result-label={t.site.searchOneResultLabel}
          data-search-many-results-label={t.site.searchManyResultsLabel}
          data-search-unavailable-label={t.site.searchUnavailableLabel}
          data-search-unavailable-title={t.site.searchUnavailableTitle}
          data-search-offline-label={t.site.searchOfflineLabel}
          data-search-offline-title={t.site.searchOfflineTitle}
          data-search-retry-label={t.site.searchRetryLabel}
        >
          <div
            class="site-search-skeleton"
            data-search-skeleton=""
            aria-hidden="true"
          >
            <span class="cds--skeleton__text site-search-skeleton-line" />
            <span class="cds--skeleton__text site-search-skeleton-line" />
            <span class="cds--skeleton__text site-search-skeleton-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSideNav(
  items: readonly NavigationItem[],
  homeUrl: string,
  t: Translations,
  v: VariantClasses,
  eyebrow?: string,
): El {
  return (
    <aside
      id={HEADER_IDS.sideNav}
      class={v.sideNav}
      aria-label={t.site.mainNavigationAriaLabel}
      hidden
    >
      <nav class={v.sideNavNavigation ?? "cds--side-nav__navigation"}>
        <div class={v.sideNavHeader ?? "cds--side-nav__header"}>
          {eyebrow && <p class="cds--side-nav__eyebrow">{eyebrow}</p>}
          <a href={homeUrl} class="cds--side-nav__brand">
            <span class="cds--side-nav__brand-prefix">normco</span>
            .re
          </a>
          <p class="cds--side-nav__lead">{t.home.lead}</p>
        </div>
        <ul class="cds--side-nav__items">
          {items.map(({ href, label, isCurrent }) => (
            <li class="cds--side-nav__item" key={href}>
              <a
                href={href}
                class="cds--side-nav__link"
                {...(isCurrent ? { "aria-current": "page" as const } : {})}
              >
                <span class="cds--side-nav__link-text">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// ── Editorial home brand markup ────────────────────────────────────────

function renderEditorialHomeBrand(
  homeUrl: string,
  t: Translations,
): El {
  return (
    <a href={homeUrl} class="cds--header__name editorial-home-header__name">
      <span class="editorial-home-header__brand-lockup">
        <span class="editorial-home-header__brand-wordmark">
          <span class="cds--header__name--prefix">normco</span>
          .re
        </span>
        <span class="editorial-home-header__brand-meta">
          {t.home.eyebrow}
        </span>
      </span>
    </a>
  );
}

// ── Main export ────────────────────────────────────────────────────────

export default (
  { currentUrl, language, languageAlternates = {} }: HeaderProps,
): El => {
  const { homeUrl, translations: t } = getPageContext(language);
  const navItems = buildHeaderNavigation({ currentUrl, language });
  const isHome = currentUrl === homeUrl;
  const v = isHome ? EDITORIAL_HOME : STANDARD;
  const actions = resolveHeaderActions(t, v);

  return (
    <>
      <header class={v.header}>
        <div class={v.wrapper}>
          <div class={v.left}>
            <button
              type="button"
              class={v.menuToggle}
              aria-label={t.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              <SiteIcon
                name="three-bars"
                className={`${v.menuIconClass} site-menu-icon--menu`}
                width={v.menuIconSize}
                height={v.menuIconSize}
              />
              <SiteIcon
                name="x"
                className={`${v.menuIconClass} site-menu-icon--close`}
                width={v.menuIconSize}
                height={v.menuIconSize}
              />
            </button>

            {isHome ? renderEditorialHomeBrand(homeUrl, t) : (
              <>
                <a href={homeUrl} class={v.name}>
                  <span class="cds--header__name--prefix">normco</span>
                  .re
                </a>
                <nav
                  class={v.nav}
                  aria-label={t.site.mainNavigationAriaLabel}
                >
                  <div
                    class="site-header-antd-menu-shell"
                    data-site-header-menu=""
                  >
                    {renderDesktopNavigationMenu(navItems)}
                  </div>
                </nav>
              </>
            )}
          </div>

          {isHome && (
            <nav
              class={v.nav}
              aria-label={t.site.mainNavigationAriaLabel}
            >
              <div class="site-header-antd-menu-shell" data-site-header-menu="">
                {renderDesktopNavigationMenu(navItems)}
              </div>
            </nav>
          )}

          <div class={v.global}>
            {actions.map((action) => renderHeaderAction(action))}
          </div>
        </div>
      </header>

      {renderLanguagePanel(language, languageAlternates, t, v)}
      {renderSearchPanel(t, v)}
      {renderSideNav(
        navItems,
        homeUrl,
        t,
        v,
        isHome ? t.site.mainNavigationAriaLabel : undefined,
      )}
      <div class="cds--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
