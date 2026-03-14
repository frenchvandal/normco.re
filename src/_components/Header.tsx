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
                <path d={MENU_ICON_PATH}></path>
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
                <path d={SEARCH_ICON_PATH}></path>
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
                <path d={TRANSLATE_ICON_PATH}></path>
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
                class="bx--header__action-icon theme-icon theme-icon--moon"
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
