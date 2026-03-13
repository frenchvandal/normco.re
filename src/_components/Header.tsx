/** Site header with Carbon UI Shell structure, navigation, and user controls. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../utils/i18n.ts";

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

const CARBON_SEARCH_ICON_PATH =
  "M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z";
const CARBON_MENU_ICON_PATH = "M4 6H28V8H4zM4 15H28V17H4zM4 24H28V26H4z";
/** IBM Watson Language Translator icon — official Carbon icon */
const CARBON_LANGUAGE_ICON_PATH =
  "M28 10V6c0-.6-.4-1-1-1h-1c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h-1c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1zm-2 3h-1v-1h1v1zm0-2h-1V9h1v2zm-4-7c0-.6-.4-1-1-1h-4c-.6 0-1 .4-1 1v8c0 .6.4 1 1 1h4c.6 0 1-.4 1-1V6zm-1 8h-3V6h3v6zm-9-6h2c.6 0 1-.4 1-1V4c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v1c0 .6.4 1 1 1zm0 3h2c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v1c0 .6.4 1 1 1zm0 4h2c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v1c0 .6.4 1 1 1zM2 10h2c.6 0 1-.4 1-1V4c0-.6-.4-1-1-1H2C1.4 3 1 3.4 1 4v5c0 .6.4 1 1 1zm1-5h1v4H3V5z";
const CARBON_THEME_LIGHT_ICON_PATHS = [
  { d: "M7.5 1H8.5V3.5H7.5z" },
  { d: "M10.8 3.4H13.3V4.4H10.8z", transform: "rotate(-45 12.041 3.923)" },
  { d: "M12.5 7.5H15V8.5H12.5z" },
  { d: "M11.6 10.8H12.6V13.3H11.6z", transform: "rotate(-45 12.075 12.04)" },
  { d: "M7.5 12.5H8.5V15H7.5z" },
  { d: "M2.7 11.6H5.2V12.6H2.7z", transform: "rotate(-45 3.96 12.078)" },
  { d: "M1 7.5H3.5V8.5H1z" },
  { d: "M3.4 2.7H4.4V5.2H3.4z", transform: "rotate(-45 3.925 3.961)" },
  {
    d: "M8,6c1.1,0,2,0.9,2,2s-0.9,2-2,2S6,9.1,6,8S6.9,6,8,6 M8,5C6.3,5,5,6.3,5,8s1.3,3,3,3s3-1.3,3-3S9.7,5,8,5z",
  },
] as const;
const CARBON_THEME_DARK_ICON_PATHS = [
  {
    d: "M7.2,2.3c-1,4.4,1.7,8.7,6.1,9.8c0.1,0,0.1,0,0.2,0c-1.1,1.2-2.7,1.8-4.3,1.8c-0.1,0-0.2,0-0.2,0C5.6,13.8,3,11,3.2,7.7 C3.2,5.3,4.8,3.1,7.2,2.3",
  },
  {
    d: "M8,1L8,1C4.1,1.6,1.5,5.3,2.1,9.1c0.6,3.3,3.4,5.8,6.8,5.9c0.1,0,0.2,0,0.3,0c2.3,0,4.4-1.1,5.8-3 c0.2-0.2,0.1-0.6-0.1-0.7c-0.1-0.1-0.2-0.1-0.3-0.1c-3.9-0.3-6.7-3.8-6.4-7.6C8.3,3,8.4,2.4,8.6,1.8c0.1-0.3,0-0.6-0.3-0.7 C8.1,1,8.1,1,8,1z",
  },
] as const;

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
      <header class="bx--header">
        <div class="bx--header__wrapper">
          {/* Left section: hamburger menu + product name */}
          <div class="bx--header__left">
            {/* Hamburger menu trigger for SideNav */}
            <button
              type="button"
              class="bx--header__action bx--header__menu-toggle"
              aria-label={translations.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={sideNavId}
            >
              <svg
                class="bx--header__menu-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={CARBON_MENU_ICON_PATH}></path>
              </svg>
            </button>

            {/* Product/brand name */}
            <a href={homeUrl} class="bx--header__name">
              <span class="bx--header__name--prefix">normco</span>
              .re
            </a>

            {/* Header navigation (desktop) */}
            <nav
              class="bx--header__nav"
              aria-label={translations.site.mainNavigationAriaLabel}
            >
              {navigationItems.map(({ href, label, isCurrent }) => (
                <a
                  key={href}
                  href={href}
                  class="bx--header__menu-item"
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
          <div class="bx--header__global">
            {/* Search action */}
            <button
              type="button"
              class="bx--header__action"
              aria-label={translations.site.searchLabel}
              aria-expanded="false"
              aria-controls={searchPanelId}
            >
              <svg
                class="bx--header__action-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={CARBON_SEARCH_ICON_PATH}></path>
              </svg>
            </button>

            {/* Language selector action */}
            <button
              type="button"
              class="bx--header__action bx--header__language-toggle"
              aria-label={translations.site.languageSelectAriaLabel}
              aria-expanded="false"
              aria-controls={languagePanelId}
              aria-haspopup="true"
            >
              <svg
                class="bx--header__action-icon"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={CARBON_LANGUAGE_ICON_PATH}></path>
              </svg>
            </button>

            {/* Theme toggle action */}
            <button
              id="theme-toggle"
              type="button"
              class="bx--header__action"
              aria-label={translations.site.themeToggleLabel}
              aria-pressed="false"
              data-label-switch-light={translations.site
                .switchToLightThemeLabel}
              data-label-switch-dark={translations.site.switchToDarkThemeLabel}
            >
              <svg
                class="bx--header__action-icon theme-icon theme-icon--sun"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                {CARBON_THEME_LIGHT_ICON_PATHS.map((path) => (
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
                class="bx--header__action-icon theme-icon theme-icon--moon"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                {CARBON_THEME_DARK_ICON_PATHS.map(({ d }) => (
                  <path key={d} d={d}></path>
                ))}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Language selector dropdown panel */}
      <div
        id={languagePanelId}
        class="bx--header__panel bx--header__language-panel"
        aria-modal="true"
        hidden
      >
        <div class="bx--header__panel-content">
          <h2 id={`${languagePanelId}-title`} class="bx--header__panel-title">
            {translations.site.languageSelectLabel}
          </h2>
          <nav
            class="bx--header__language-list"
            aria-labelledby={`${languagePanelId}-title`}
          >
            {SUPPORTED_LANGUAGES.map((optionLanguage) => {
              const optionUrl = getLocalizedUrl("/", optionLanguage);
              const isSelected = optionLanguage === language;
              return (
                <a
                  key={optionLanguage}
                  href={optionUrl}
                  class="bx--header__menu-item bx--header__language-item"
                  {...(isSelected ? { "aria-current": "page" as const } : {})}
                >
                  {translations.languageNames[optionLanguage]}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Search panel */}
      <div
        id={searchPanelId}
        class="bx--header__panel bx--header__search-panel"
        aria-modal="true"
        hidden
        data-search-panel=""
      >
        <div class="bx--header__panel-content">
          <div
            id={searchContainerId}
            class="bx--header__search-root"
            data-search-root=""
          >
          </div>
        </div>
      </div>

      {/* Carbon UI Shell Left Panel (SideNav) */}
      <aside
        id={sideNavId}
        class="bx--side-nav"
        aria-label={translations.site.mainNavigationAriaLabel}
        hidden
      >
        <nav class="bx--side-nav__navigation">
          <ul class="bx--side-nav__items">
            {navigationItems.map(({ href, label, isCurrent }) => (
              <li class="bx--side-nav__item" key={href}>
                <a
                  href={href}
                  class="bx--side-nav__link"
                  {...(isCurrent
                    ? ({
                      "aria-current": "page" as const,
                    })
                    : {})}
                >
                  <span class="bx--side-nav__link-text">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile when SideNav is open */}
      <div class="bx--side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
