/** Site header with Carbon UI Shell structure, navigation, and user controls. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../utils/i18n.ts";
import {
  DARK_ICON_PATHS,
  LIGHT_ICON_PATHS,
  MENU_ICON_PATH,
  SEARCH_ICON_PATH,
  TRANSLATE_ICON_PATH,
} from "../utils/carbon-icons.ts";

/**
 * Returns `{ "aria-current": "page" }` when the link matches the active URL,
 * otherwise an empty object, for safe spreading into JSX props.
 */
function ariaCurrent(
  href: string,
  currentUrl: string,
): { readonly "aria-current"?: "page" } {
  if (href === "/" && currentUrl === "/") return { "aria-current": "page" };
  if (href !== "/" && currentUrl.startsWith(href)) {
    return { "aria-current": "page" };
  }
  return {};
}

/** Renders the Carbon UI Shell header with navigation and user controls. */
export default (
  { currentUrl, language }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
  },
) => {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const postsUrl = getLocalizedUrl("/posts/", language);
  const aboutUrl = getLocalizedUrl("/about/", language);
  const searchContainerId = "search";
  const searchPanelId = "site-search-panel";
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
      isCurrent: ariaCurrent(postsUrl, currentUrl)["aria-current"] === "page",
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
              <svg
                class="cds--header__menu-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={MENU_ICON_PATH}></path>
              </svg>
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
            <button
              type="button"
              class="cds--header__action"
              aria-label={translations.site.searchLabel}
              aria-expanded="false"
              aria-controls={searchPanelId}
            >
              <svg
                class="cds--header__action-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={SEARCH_ICON_PATH}></path>
              </svg>
            </button>

            {/* Language selector action */}
            <button
              type="button"
              class="cds--header__action cds--header__language-toggle"
              aria-label={translations.site.languageSelectAriaLabel}
              aria-expanded="false"
              aria-controls={languagePanelId}
              aria-haspopup="true"
            >
              <svg
                class="cds--header__action-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={TRANSLATE_ICON_PATH}></path>
              </svg>
            </button>

            {/* Theme toggle action */}
            <button
              id="theme-toggle"
              type="button"
              class="cds--header__action"
              aria-label={translations.site.themeToggleLabel}
              aria-pressed="false"
              data-label-switch-light={translations.site
                .switchToLightThemeLabel}
              data-label-switch-dark={translations.site.switchToDarkThemeLabel}
            >
              <svg
                class="cds--header__action-icon theme-icon theme-icon--sun"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                {LIGHT_ICON_PATHS.map((path) => (
                  <path
                    key={path.d}
                    d={path.d}
                    {...("transform" in path
                      ? { transform: path.transform }
                      : {})}
                  >
                  </path>
                ))}
              </svg>
              <svg
                class="cds--header__action-icon theme-icon theme-icon--moon"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                {DARK_ICON_PATHS.map(({ d }) => <path key={d} d={d}></path>)}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Language selector dropdown panel */}
      <section
        id={languagePanelId}
        class="cds--header__panel cds--header__language-panel"
        aria-labelledby={`${languagePanelId}-title`}
        hidden
      >
        <div class="cds--header__panel-content">
          <h2 id={`${languagePanelId}-title`} class="cds--header__panel-title">
            {translations.site.languageSelectLabel}
          </h2>
          <nav
            class="cds--header__language-list"
            aria-labelledby={`${languagePanelId}-title`}
          >
            {SUPPORTED_LANGUAGES.map((optionLanguage) => {
              const optionUrl = getLocalizedUrl("/", optionLanguage);
              const isSelected = optionLanguage === language;
              return (
                <a
                  key={optionLanguage}
                  href={optionUrl}
                  class="cds--header__menu-item cds--header__language-item"
                  {...(isSelected ? { "aria-current": "page" as const } : {})}
                >
                  {translations.languageNames[optionLanguage]}
                </a>
              );
            })}
          </nav>
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
          <div
            id={searchContainerId}
            class="cds--header__search-root"
            data-search-root=""
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
