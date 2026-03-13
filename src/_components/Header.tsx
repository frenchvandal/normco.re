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

const CARBON_SEARCH_ICON_PATH =
  "M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z";
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

/** Renders the site header with logo, navigation, and user controls. */
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
    <header class="site-header">
      <div class="site-header-inner">
        <div class="site-header-start">
          <button
            type="button"
            class="site-navigation-toggle"
            aria-expanded="false"
            aria-controls="site-navigation-menu"
            aria-label={translations.site.menuToggleLabel}
          >
            <svg
              class="site-navigation-toggle-icon"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 6H28V8H4zM4 15H28V17H4zM4 24H28V26H4z"></path>
            </svg>
          </button>
          <nav
            id="site-navigation-menu"
            class="site-navigation"
            aria-label={translations.site.mainNavigationAriaLabel}
          >
            <ul class="site-navigation-list">
              {navigationItems.map(({ href, label, isCurrent }) => (
                <li class="site-navigation-item">
                  <a
                    href={href}
                    class="site-navigation-link"
                    {...(isCurrent
                      ? ({
                        "aria-current": "page" as const,
                      })
                      : {})}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div class="site-header-end">
          <button
            type="button"
            class="site-search-action"
            aria-label={translations.site.searchLabel}
            aria-expanded="false"
            aria-controls={searchPanelId}
          >
            <svg
              class="site-search-action-icon"
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
          <div
            id={searchPanelId}
            class="site-search-panel"
            aria-label={translations.site.searchLabel}
            data-search-panel=""
          >
            <div
              id={searchContainerId}
              class="site-search-root"
              data-search-root=""
            >
            </div>
          </div>
          <cds-header-global-action
            class="site-language-action"
            aria-label={translations.site.languageSelectAriaLabel}
            button-label-active={translations.site.languageSelectLabel}
            button-label-inactive={translations.site.languageSelectLabel}
            panel-id={languagePanelId}
          >
            <svg
              slot="icon"
              class="site-language-action-icon site-language-action-icon--watson"
              width="16"
              height="16"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M16,28h-3c-3.9,0-7-3.1-7-7v-4h2v4c0,2.8,2.2,5,5,5h3V28z">
              </path>
              <path d="M28,30h2.2l-4.6-11h-2.2l-4.6,11H21l0.8-2h5.3L28,30z M22.7,26l1.8-4.4l1.8,4.4H22.7z">
              </path>
              <path d="M28,15h-2v-4c0-2.8-2.2-5-5-5h-4V4h4c3.9,0,7,3.1,7,7V15z">
              </path>
              <path d="M14,5V3H9V1H7v2H2v2h8.2C10,5.9,9.4,7.5,8,9C7.4,8.3,6.9,7.6,6.6,7H4.3c0.4,1,1.1,2.2,2.1,3.3C5.6,11,4.4,11.6,3,12.1 L3.7,14c1.8-0.7,3.2-1.5,4.3-2.3c1.1,0.9,2.5,1.7,4.3,2.3l0.7-1.9c-1.4-0.5-2.6-1.2-3.5-1.8c1.9-2,2.5-4.1,2.7-5.3H14z">
              </path>
            </svg>
          </cds-header-global-action>
          <div class="site-language-select-root">
            <label
              for="language-select"
              class="site-language-select-label sr-only"
            >
              {translations.site.languageSelectLabel}
            </label>
            <select
              id="language-select"
              name="language"
              class="site-language-select"
              aria-label={translations.site.languageSelectAriaLabel}
              value={language}
              onChange={(event: Event) => {
                const selectedLanguage = (event.target as HTMLSelectElement)
                  .value as SiteLanguage;
                const targetUrl = getLocalizedUrl("/", selectedLanguage);
                globalThis.location?.assign(targetUrl);
              }}
            >
              {SUPPORTED_LANGUAGES.map((optionLanguage) => (
                <option
                  key={optionLanguage}
                  value={optionLanguage}
                  selected={optionLanguage === language}
                >
                  {translations.languageNames[optionLanguage]}
                </option>
              ))}
            </select>
          </div>
          <button
            id="theme-toggle"
            type="button"
            class="site-theme-action"
            aria-label={translations.site.themeToggleLabel}
            aria-pressed="false"
            data-label-switch-light={translations.site.switchToLightThemeLabel}
            data-label-switch-dark={translations.site.switchToDarkThemeLabel}
          >
            <svg
              class="theme-icon theme-icon--sun"
              width="16"
              height="16"
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
              class="theme-icon theme-icon--moon"
              width="16"
              height="16"
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
  );
};
