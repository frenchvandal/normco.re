/** Site header with logo, primary navigation, and user controls. */

import {
  getLocalizedUrl,
  getSiteTranslations,
  LANGUAGE_FLAG_EMOJI,
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
  const activeFlagEmoji = LANGUAGE_FLAG_EMOJI[language];

  return (
    <header class="site-header">
      <div class="site-header-inner">
        <a
          href={homeUrl}
          class="site-name"
          {...ariaCurrent(homeUrl, currentUrl)}
        >
          {translations.navigation.home}
        </a>
        <div class="site-header-end">
          <nav
            class="site-nav"
            aria-label={translations.site.mainNavigationAriaLabel}
          >
            <ul class="site-nav-list">
              <li class="site-nav-item">
                <a
                  href={postsUrl}
                  class="site-nav-link"
                  {...ariaCurrent(postsUrl, currentUrl)}
                >
                  {translations.navigation.writing}
                </a>
              </li>
              <li class="site-nav-item">
                <a
                  href={aboutUrl}
                  class="site-nav-link"
                  {...ariaCurrent(aboutUrl, currentUrl)}
                >
                  {translations.navigation.about}
                </a>
              </li>
            </ul>
          </nav>
          <div class="language-switcher" data-active-flag={activeFlagEmoji}>
            <label class="sr-only" for="language-select">
              {translations.site.languageSelectLabel}
            </label>
            <select
              id="language-select"
              name="language"
              class="language-select"
            >
              {SUPPORTED_LANGUAGES.map((optionLanguage) => (
                <option
                  value={optionLanguage}
                  selected={optionLanguage === language}
                >
                  {`${LANGUAGE_FLAG_EMOJI[optionLanguage]} ${
                    translations.languageNames[optionLanguage]
                  }`}
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
