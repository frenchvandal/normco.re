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

const CARBON_SEARCH_ICON_PATH =
  "M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z";

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
          <cds-header
            class="site-carbon-header"
            aria-label={translations.site.mainNavigationAriaLabel}
          >
            <cds-header-menu-button
              button-label-active={translations.site.menuToggleLabel}
              button-label-inactive={translations.site.menuToggleLabel}
            >
            </cds-header-menu-button>
            <cds-side-nav
              class="site-carbon-side-nav"
              aria-label={translations.site.mainNavigationAriaLabel}
            >
              <cds-side-nav-items>
                {navigationItems.map(({ href, label, isCurrent }) => (
                  <cds-side-nav-link
                    href={href}
                    {...(isCurrent
                      ? ({
                        active: "",
                        "aria-current": "page" as const,
                      })
                      : {})}
                  >
                    {label}
                  </cds-side-nav-link>
                ))}
              </cds-side-nav-items>
            </cds-side-nav>
            <cds-header-nav
              menu-bar-label={translations.site.mainNavigationAriaLabel}
            >
              {navigationItems.map(({ href, label, isCurrent }) => (
                <cds-header-nav-item
                  href={href}
                  {...(isCurrent
                    ? ({
                      "is-active": "",
                      "aria-current": "page" as const,
                    })
                    : {})}
                >
                  {label}
                </cds-header-nav-item>
              ))}
            </cds-header-nav>
          </cds-header>
        </div>
        <div class="site-header-end">
          <cds-header-global-action
            class="site-search-action"
            aria-label={translations.site.searchLabel}
            button-label-active={translations.site.searchLabel}
            button-label-inactive={translations.site.searchLabel}
            panel-id={searchPanelId}
          >
            <svg
              slot="icon"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d={CARBON_SEARCH_ICON_PATH}></path>
            </svg>
          </cds-header-global-action>
          <cds-header-panel
            id={searchPanelId}
            class="site-search-panel"
            aria-label={translations.site.searchLabel}
            data-search-panel=""
          >
            <div id={searchContainerId} class="site-search-root"></div>
          </cds-header-panel>
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
          <cds-header-panel
            id={languagePanelId}
            class="site-language-panel"
            aria-label={translations.site.languageSelectAriaLabel}
            data-language-panel=""
          >
            <cds-switcher
              class="site-language-switcher"
              aria-label={translations.site.languageSelectLabel}
            >
              {SUPPORTED_LANGUAGES.map((optionLanguage) => {
                const isCurrentLanguage = optionLanguage === language;
                const optionUrl = getLocalizedUrl("/", optionLanguage);

                return (
                  <cds-switcher-item
                    href={optionUrl}
                    data-language-option={optionLanguage}
                    {...(isCurrentLanguage
                      ? {
                        selected: "",
                        "data-current-language": "true",
                      }
                      : {})}
                  >
                    {translations.languageNames[optionLanguage]}
                  </cds-switcher-item>
                );
              })}
            </cds-switcher>
          </cds-header-panel>
          <div class="site-language-fallback">
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
