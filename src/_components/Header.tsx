import type { jsx } from "lume/jsx-runtime";

import {
  getLocalizedUrl,
  getPageContext,
  type SiteLanguage,
  type SiteTranslations,
} from "../utils/i18n.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";
import { getSiteName } from "../utils/site-identity.ts";
import SiteIcon from "./SiteIcon.tsx";

type El = ReturnType<typeof jsx>;
type LanguageAlternates = Partial<Record<SiteLanguage, string>>;
type NavigationItem = ReturnType<typeof buildHeaderNavigation>[number];
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: LanguageAlternates;
}>;

// ── Shared sub-components ──────────────────────────────────────────────

function renderHeaderAction(
  {
    buttonAttributes,
    buttonClassName = "site-header__action",
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
      class="site-popover-container site-icon-tooltip site-popover--bottom site-popover--align-center site-header-tooltip"
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
      <div class="site-popover" aria-hidden="true">
        <span class="site-popover__caret" aria-hidden="true"></span>
        <div class="site-popover__content">
          <span class="site-tooltip__content">{tooltipLabel}</span>
        </div>
      </div>
    </div>
  );
}

function renderThemeIcons(className: string): El {
  return (
    <>
      <SiteIcon
        name="sun"
        className={`theme-icon theme-icon--sun ${className}`}
      />
      <SiteIcon
        name="moon"
        className={`theme-icon theme-icon--moon ${className}`}
      />
      <SiteIcon
        name="device-desktop"
        className={`theme-icon theme-icon--system ${className}`}
      />
    </>
  );
}

function resolveHeaderActions(
  t: SiteTranslations,
) {
  return [
    {
      key: "search" as const,
      buttonAttributes: {
        "aria-label": t.site.searchLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.searchPanel,
      },
      iconMarkup: (
        <SiteIcon
          name="search"
          className="site-header__action-icon"
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
      buttonClassName: "site-header__action site-header__language-toggle",
      iconMarkup: (
        <SiteIcon
          name="translation"
          className="site-header__action-icon"
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
      buttonId: HEADER_IDS.themeToggle,
      iconMarkup: renderThemeIcons("site-header__action-icon"),
      tooltipLabel: t.site.themeToggleLabel,
    },
  ] as const;
}

function renderDesktopNavigationMenu(
  items: readonly NavigationItem[],
): El {
  return (
    <div class="site-header__menu-shell" data-site-header-menu="">
      <ul class="site-header__menu-list">
        {items.map(({ href, isCurrent, label }) => (
          <li
            key={href}
            class={`site-header__menu-list-item${
              isCurrent ? " site-header__menu-list-item--current" : ""
            }`}
          >
            <a
              href={href}
              class="site-header__menu-item"
              {...(isCurrent ? { "aria-current": "page" as const } : {})}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
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
          <span class="site-header__language-label">{label}</span>
          <span class="site-header__language-check" aria-hidden="true">
            <SiteIcon
              name="check"
              className="site-header__language-check-icon"
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
      <p class="site-header__panel-title">{title}</p>
    </div>
  );
}

function renderLanguagePanel(
  language: SiteLanguage,
  alternates: LanguageAlternates,
  t: SiteTranslations,
): El {
  return (
    <div
      id={HEADER_IDS.languagePanel}
      class="site-header__panel site-header__language-panel"
      data-language-panel=""
      hidden
    >
      <div class="site-header__panel-content">
        <PanelHead
          className="site-header-panel-head site-header-panel-head--language"
          title={t.site.languageSelectLabel}
        />
        <div
          class="site-header__language-menu"
          role="menu"
          aria-label={t.site.languageSelectLabel}
          data-language-menu=""
        >
          {renderLanguageOptions(
            language,
            alternates,
            "site-header__language-option",
          )}
        </div>
      </div>
    </div>
  );
}

function renderSearchPanel(
  t: SiteTranslations,
): El {
  return (
    <div
      id={HEADER_IDS.searchPanel}
      class="site-header__panel site-header__search-panel"
      role="search"
      aria-label={t.site.searchLabel}
      hidden
      data-search-panel=""
    >
      <div class="site-header__panel-content">
        <PanelHead
          className="site-header-panel-head site-header-panel-head--search"
          title={t.site.searchLabel}
        />
        <div
          id={HEADER_IDS.searchStatus}
          class="site-header__search-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-search-status=""
          hidden
        >
          <div
            class="site-inline-loading site-search-inline-loading"
            data-search-loading=""
            hidden
          >
            <div class="site-inline-loading__animation">
              <div class="site-loading site-loading--small">
                <svg
                  class="site-loading__svg"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    class="site-loading__background"
                    cx="50"
                    cy="50"
                    r="44"
                  />
                  <circle
                    class="site-loading__stroke"
                    cx="50"
                    cy="50"
                    r="44"
                  />
                </svg>
              </div>
            </div>
            <p
              class="site-inline-loading__text"
              data-search-loading-text=""
            >
              {t.site.searchLoadingLabel}
            </p>
          </div>
          <p
            class="site-header__search-status-text"
            data-search-status-text=""
            hidden
          />
          <div
            class="site-notification site-notification--low-contrast site-notification--info site-search-notification"
            data-search-notification=""
            data-search-notification-tone="info"
            hidden
          >
            <div class="site-notification__details">
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
              <div class="site-notification__text-wrapper">
                <p
                  class="site-notification__title"
                  data-search-notification-title=""
                />
                <p
                  class="site-notification__subtitle"
                  data-search-notification-subtitle=""
                />
              </div>
            </div>
          </div>
        </div>
        <div
          id={HEADER_IDS.searchContainer}
          class="site-header__search-root"
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
            <span class="site-skeleton__text site-search-skeleton-line" />
            <span class="site-skeleton__text site-search-skeleton-line" />
            <span class="site-skeleton__text site-search-skeleton-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSideNav(
  items: readonly NavigationItem[],
  homeUrl: string,
  siteName: string,
  t: SiteTranslations,
): El {
  return (
    <div
      id={HEADER_IDS.sideNav}
      class="site-side-nav"
      role="dialog"
      aria-modal="true"
      aria-label={t.site.navigationMenuAriaLabel}
      hidden
    >
      <nav
        class="site-side-nav__navigation"
        aria-label={t.site.siteLinksAriaLabel}
      >
        <div class="site-side-nav__header">
          <a href={homeUrl} class="site-side-nav__brand">{siteName}</a>
          <button
            type="button"
            class="site-side-nav__close"
            aria-label={t.site.closeLabel}
            data-side-nav-close=""
          >
            <SiteIcon
              name="x"
              className="site-side-nav__close-icon"
              width={18}
              height={18}
            />
          </button>
        </div>
        <div class="site-side-nav__menu-shell">
          <ul class="site-side-nav__items">
            {items.map(({ href, label, isCurrent }) => (
              <li
                class={`site-side-nav__item${
                  isCurrent ? " site-side-nav__item--current" : ""
                }`}
                key={href}
              >
                <a
                  href={href}
                  class="site-side-nav__link"
                  {...(isCurrent ? { "aria-current": "page" as const } : {})}
                >
                  <span class="site-side-nav__link-text">{label}</span>
                  <SiteIcon
                    name="arrow-right"
                    className="site-side-nav__link-icon"
                    width={18}
                    height={18}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default (
  { currentUrl, language, languageAlternates = {} }: HeaderProps,
): El => {
  const { homeUrl, translations: t } = getPageContext(language);
  const siteName = getSiteName(language);
  const navItems = buildHeaderNavigation({ currentUrl, language });
  const actions = resolveHeaderActions(t);

  return (
    <>
      <header class="site-header">
        <div class="site-header__wrapper">
          <div class="site-header__left">
            <button
              type="button"
              class="site-header__action site-header__menu-toggle"
              aria-label={t.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              <SiteIcon
                name="three-bars"
                className="site-header__menu-icon site-menu-icon site-menu-icon--menu"
              />
              <SiteIcon
                name="x"
                className="site-header__menu-icon site-menu-icon site-menu-icon--close"
              />
            </button>

            <a href={homeUrl} class="site-header__brand">{siteName}</a>
            <nav
              class="site-header__nav"
              aria-label={t.site.mainNavigationAriaLabel}
            >
              {renderDesktopNavigationMenu(navItems)}
            </nav>
          </div>

          <div class="site-header__global">
            {actions.map((action) => renderHeaderAction(action))}
          </div>
        </div>
      </header>

      {renderLanguagePanel(language, languageAlternates, t)}
      {renderSearchPanel(t)}
      {renderSideNav(navItems, homeUrl, siteName, t)}
      <div class="site-side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
