/** Site header with logo, primary navigation, and user controls. */

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

type IconHelpers = Pick<Lume.Helpers, "icon">;

const DEFAULT_ICON_HELPERS: IconHelpers = {
  icon: (key, catalogId, variant) => {
    const variantSuffix = variant ? `-${variant}` : "";
    return `/icons/${catalogId}/${key}${variantSuffix}.svg`;
  },
};

/** Renders the site header with logo, navigation, and user controls. */
export default (
  { currentUrl, language }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
  },
  helpers: IconHelpers = DEFAULT_ICON_HELPERS,
) => {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const postsUrl = getLocalizedUrl("/posts/", language);
  const aboutUrl = getLocalizedUrl("/about/", language);
  const menuIcon = helpers.icon("three-bars", "octicons", "16");
  const homeIcon = helpers.icon("home", "octicons", "16");
  const writingIcon = helpers.icon("book", "octicons", "16");
  const aboutIcon = helpers.icon("info", "octicons", "16");
  const searchIcon = helpers.icon("search", "octicons", "16");
  const globeIcon = helpers.icon("globe", "octicons", "16");
  const checkIcon = helpers.icon("check", "octicons", "16");
  const searchContainerId = "search";

  return (
    <header class="site-header">
      <div class="site-header-inner">
        <div class="site-header-start">
          <details class="site-menu">
            <summary
              class="site-menu-trigger"
              aria-label={translations.site.menuToggleLabel}
              title={translations.site.menuToggleLabel}
            >
              <img
                inline
                class="site-menu-trigger-icon octicon-svg"
                width="16"
                height="16"
                src={menuIcon}
                alt=""
                aria-hidden="true"
                focusable="false"
              />
              <span class="sr-only">{translations.site.menuToggleLabel}</span>
            </summary>
            <div class="site-menu-panel">
              <nav
                class="site-menu-nav"
                aria-label={translations.site.mainNavigationAriaLabel}
              >
                <ul class="site-menu-nav-list">
                  <li class="site-menu-nav-item">
                    <a
                      href={homeUrl}
                      class="site-menu-link"
                      {...ariaCurrent(homeUrl, currentUrl)}
                    >
                      <img
                        inline
                        class="site-menu-link-icon octicon-svg"
                        width="16"
                        height="16"
                        src={homeIcon}
                        alt=""
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span class="site-menu-link-label">
                        {translations.navigation.home}
                      </span>
                    </a>
                  </li>
                  <li class="site-menu-nav-item">
                    <a
                      href={postsUrl}
                      class="site-menu-link"
                      {...ariaCurrent(postsUrl, currentUrl)}
                    >
                      <img
                        inline
                        class="site-menu-link-icon octicon-svg"
                        width="16"
                        height="16"
                        src={writingIcon}
                        alt=""
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span class="site-menu-link-label">
                        {translations.navigation.writing}
                      </span>
                    </a>
                  </li>
                  <li class="site-menu-nav-item">
                    <a
                      href={aboutUrl}
                      class="site-menu-link"
                      {...ariaCurrent(aboutUrl, currentUrl)}
                    >
                      <img
                        inline
                        class="site-menu-link-icon octicon-svg"
                        width="16"
                        height="16"
                        src={aboutIcon}
                        alt=""
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span class="site-menu-link-label">
                        {translations.navigation.about}
                      </span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </details>
        </div>
        <div class="site-header-end">
          <details class="site-search">
            <summary
              class="site-search-trigger"
              aria-label={translations.site.searchLabel}
              title={translations.site.searchLabel}
            >
              <img
                inline
                class="site-search-trigger-icon octicon-svg"
                width="16"
                height="16"
                src={searchIcon}
                alt=""
                aria-hidden="true"
                focusable="false"
              />
              <span class="sr-only">{translations.site.searchLabel}</span>
            </summary>
            <div
              class="site-search-panel"
              role="dialog"
              aria-label={translations.site.searchLabel}
            >
              <p class="site-search-panel-title">
                {translations.site.searchLabel}
              </p>
              <div id={searchContainerId} class="site-search-root"></div>
            </div>
          </details>
          <div class="language-switcher">
            <details class="language-menu">
              <summary
                class="language-menu-trigger"
                aria-label={translations.site.languageSelectAriaLabel}
                title={translations.site.languageSelectLabel}
              >
                <img
                  inline
                  class="language-menu-trigger-icon octicon-svg"
                  width="16"
                  height="16"
                  src={globeIcon}
                  alt=""
                  aria-hidden="true"
                  focusable="false"
                />
                <span class="sr-only">
                  {translations.site.languageSelectLabel}
                </span>
              </summary>
              <ul
                class="language-menu-list"
                aria-label={translations.site.languageSelectLabel}
              >
                {SUPPORTED_LANGUAGES.map((optionLanguage) => {
                  const isCurrentLanguage = optionLanguage === language;
                  const optionUrl = getLocalizedUrl("/", optionLanguage);

                  return (
                    <li class="language-menu-item-wrapper">
                      <a
                        href={optionUrl}
                        class="language-menu-item"
                        data-language-option={optionLanguage}
                        {...(isCurrentLanguage
                          ? {
                            "data-current-language": "true",
                            "aria-current": "true" as const,
                          }
                          : {})}
                      >
                        <img
                          inline
                          class="language-menu-check-icon octicon-svg"
                          width="16"
                          height="16"
                          src={checkIcon}
                          alt=""
                          aria-hidden="true"
                          focusable="false"
                        />
                        <span>
                          {translations.languageNames[optionLanguage]}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
            <label class="sr-only" for="language-select">
              {translations.site.languageSelectLabel}
            </label>
            <select
              id="language-select"
              name="language"
              class="sr-only"
              aria-label={translations.site.languageSelectAriaLabel}
              aria-hidden="true"
              tabindex="-1"
            >
              {SUPPORTED_LANGUAGES.map((optionLanguage) => (
                <option
                  value={optionLanguage}
                  selected={optionLanguage === language}
                >
                  {translations.languageNames[optionLanguage]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            id="theme-toggle"
            class="theme-toggle"
            aria-label={translations.site.themeToggleLabel}
            aria-pressed="false"
            data-label-switch-light={translations.site.switchToLightThemeLabel}
            data-label-switch-dark={translations.site.switchToDarkThemeLabel}
          >
            <img
              inline
              class="theme-icon theme-icon--sun octicon-svg"
              width="16"
              height="16"
              src={helpers.icon("sun", "octicons", "16")}
              alt=""
              aria-hidden="true"
              focusable="false"
            />
            <img
              inline
              class="theme-icon theme-icon--moon octicon-svg"
              width="16"
              height="16"
              src={helpers.icon("moon", "octicons", "16")}
              alt=""
              aria-hidden="true"
              focusable="false"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
