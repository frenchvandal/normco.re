/** Site header with Carbon UI Shell structure, navigation, and user controls. */

import {
  CHECKMARK_ICON,
  DARK_ICON,
  LIGHT_ICON,
  MENU_ICON,
  SEARCH_ICON,
  SYSTEM_ICON,
  TRANSLATE_ICON,
} from "../utils/carbon-icons.ts";
import CarbonIcon from "./CarbonIcon.tsx";
import {
  getLanguageTag,
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../utils/i18n.ts";

const HOME_URLS = new Set(
  SUPPORTED_LANGUAGES.map((language) => getLocalizedUrl("/", language)),
);

function normalizeUrlPath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/**
 * Returns `{ "aria-current": "page" }` when the link matches the active URL,
 * otherwise an empty object, for safe spreading into JSX props.
 */
function ariaCurrent(
  href: string,
  currentUrl: string,
): { readonly "aria-current"?: "page" } {
  const normalizedHref = normalizeUrlPath(href);
  const normalizedCurrentUrl = normalizeUrlPath(currentUrl);

  if (normalizedHref === normalizedCurrentUrl) {
    return { "aria-current": "page" };
  }

  if (HOME_URLS.has(normalizedHref)) return {};

  if (normalizedCurrentUrl.startsWith(normalizedHref)) {
    return { "aria-current": "page" };
  }

  return {};
}

/** Renders the Carbon UI Shell header with navigation and user controls. */
export default (
  { currentUrl, language, languageAlternates = {} }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
    readonly languageAlternates?: Partial<Record<SiteLanguage, string>>;
  },
) => {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const postsUrl = getLocalizedUrl("/posts/", language);
  const tagsUrl = getLocalizedUrl("/tags/", language);
  const aboutUrl = getLocalizedUrl("/about/", language);
  const searchContainerId = "search";
  const searchPanelId = "site-search-panel";
  const searchStatusId = "site-search-status";
  const languagePanelId = "site-language-panel";
  const sideNavId = "site-side-nav";

  const navigationItems = [
    {
      href: homeUrl,
      label: translations.navigation.home,
      isCurrent: ariaCurrent(homeUrl, currentUrl)["aria-current"] === "page",
    },
    {
      href: postsUrl,
      label: translations.navigation.writing,
      isCurrent: ariaCurrent(postsUrl, currentUrl)["aria-current"] === "page" ||
        ariaCurrent(tagsUrl, currentUrl)["aria-current"] === "page",
    },
    {
      href: aboutUrl,
      label: translations.navigation.about,
      isCurrent: ariaCurrent(aboutUrl, currentUrl)["aria-current"] === "page",
    },
  ] as const;

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
              aria-controls={sideNavId}
            >
              <CarbonIcon
                icon={MENU_ICON}
                className="cds--header__menu-icon"
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
            <div
              class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
              data-header-tooltip=""
            >
              <button
                type="button"
                class="cds--header__action"
                aria-label={translations.site.searchLabel}
                aria-expanded="false"
                aria-controls={searchPanelId}
                data-header-tooltip-trigger=""
              >
                <CarbonIcon
                  icon={SEARCH_ICON}
                  className="cds--header__action-icon"
                  width={20}
                  height={20}
                />
              </button>
              <div class="cds--popover" aria-hidden="true">
                <span class="cds--popover-caret"></span>
                <div class="cds--popover-content">
                  <span class="cds--tooltip-content">
                    {translations.site.searchLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Language selector action */}
            <div
              class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
              data-header-tooltip=""
            >
              <button
                type="button"
                class="cds--header__action cds--header__language-toggle"
                aria-label={translations.site.languageSelectAriaLabel}
                aria-expanded="false"
                aria-controls={languagePanelId}
                aria-haspopup="menu"
                data-header-tooltip-trigger=""
              >
                <CarbonIcon
                  icon={TRANSLATE_ICON}
                  className="cds--header__action-icon"
                  width={20}
                  height={20}
                />
              </button>
              <div class="cds--popover" aria-hidden="true">
                <span class="cds--popover-caret"></span>
                <div class="cds--popover-content">
                  <span class="cds--tooltip-content">
                    {translations.site.languageSelectLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme toggle action */}
            <div
              class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
              data-header-tooltip=""
            >
              <button
                id="theme-toggle"
                type="button"
                class="cds--header__action"
                aria-label={translations.site.themeToggleLabel}
                data-label-switch-light={translations.site
                  .switchToLightThemeLabel}
                data-label-switch-dark={translations.site
                  .switchToDarkThemeLabel}
                data-label-follow-system={translations.site
                  .followSystemThemeLabel}
                data-header-tooltip-trigger=""
              >
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
              </button>
              <div class="cds--popover" aria-hidden="true">
                <span class="cds--popover-caret"></span>
                <div class="cds--popover-content">
                  <span class="cds--tooltip-content">
                    {translations.site.themeToggleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Language selector dropdown menu */}
      <section
        id={languagePanelId}
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
          {SUPPORTED_LANGUAGES.map((optionLanguage) => {
            const optionUrl = languageAlternates[optionLanguage] ??
              getLocalizedUrl("/", optionLanguage);
            const isSelected = optionLanguage === language;
            return (
              <a
                key={optionLanguage}
                href={optionUrl}
                class="cds--header__language-option"
                data-language-option={optionLanguage}
                hreflang={getLanguageTag(optionLanguage)}
                lang={getLanguageTag(optionLanguage)}
                role="menuitemradio"
                aria-checked={isSelected ? "true" : "false"}
                tabindex={isSelected ? "0" : "-1"}
              >
                <span class="cds--header__language-label">
                  {translations.languageNames[optionLanguage]}
                </span>
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
          })}
        </div>
      </section>

      {/* Search panel */}
      <div
        id={searchPanelId}
        class="cds--header__panel cds--header__search-panel"
        role="search"
        aria-label={translations.site.searchLabel}
        hidden
        data-search-panel=""
      >
        <div class="cds--header__panel-content">
          <p
            id={searchStatusId}
            class="cds--header__search-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-search-status=""
            hidden
          >
          </p>
          <div
            id={searchContainerId}
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
        id={sideNavId}
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
