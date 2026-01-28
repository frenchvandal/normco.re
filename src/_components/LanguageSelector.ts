/**
 * Language Selector Component
 *
 * Renders a dropdown menu for switching between available languages.
 * Uses the `alternates` variable provided by Lume's Multilanguage plugin.
 *
 * @module
 */

/**
 * Language alternate page information.
 * Provided by Lume's Multilanguage plugin.
 */
interface Alternate {
  /** Language code (e.g., "en", "fr", "zh") */
  lang: string;
  /** URL to the alternate page */
  url: string;
  /** Page title in that language */
  title?: string;
}

/**
 * Language display names for supported languages.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
  zh: "中文",
};

/**
 * Gets the display name for a language code.
 *
 * @param lang - Language code.
 * @returns The display name for the language.
 */
function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] ?? lang.toUpperCase();
}

/**
 * Props for the LanguageSelector component.
 */
interface LanguageSelectorProps {
  /** Current page language */
  lang?: string;
  /** Alternate pages in other languages (from Multilanguage plugin) */
  alternates?: Alternate[];
  /** i18n strings */
  i18n?: {
    lang?: {
      select_language?: string;
      current_language?: string;
    };
  };
}

/**
 * Renders a language selector dropdown.
 *
 * Returns an empty string if no alternates are available or if there's
 * only the current language.
 *
 * @param data - Component props containing language info and alternates.
 * @returns The HTML markup for the language selector.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderLanguageSelector from "./LanguageSelector.ts";
 *
 * assertEquals(typeof renderLanguageSelector, "function");
 * ```
 *
 * @example
 * ```ts
 * import { assertStringIncludes } from "@std/assert";
 * import renderLanguageSelector from "./LanguageSelector.ts";
 *
 * const data = {
 *   lang: "en",
 *   alternates: [
 *     { lang: "en", url: "/about/" },
 *     { lang: "fr", url: "/fr/about/" },
 *   ],
 *   i18n: { lang: { select_language: "Select language" } },
 * };
 * const html = renderLanguageSelector(data);
 * assertStringIncludes(html, "Français");
 * assertStringIncludes(html, "/fr/about/");
 * ```
 */
export default function ({
  lang = "en",
  alternates,
  i18n,
}: LanguageSelectorProps): string {
  // No alternates or only current language
  if (!alternates || alternates.length <= 1) {
    return "";
  }

  const selectLabel = i18n?.lang?.select_language ?? "Select language";
  const currentLangName = getLanguageName(lang);

  const options = alternates
    .map((alt) => {
      const langName = getLanguageName(alt.lang);
      const isCurrent = alt.lang === lang;

      return `
      <li>
        <a
          href="${alt.url}"
          lang="${alt.lang}"
          hreflang="${alt.lang}"
          class="lang-selector__link${
        isCurrent ? " lang-selector__link--current" : ""
      }"
          ${isCurrent ? 'aria-current="page"' : ""}
        >
          ${langName}
        </a>
      </li>`;
    })
    .join("");

  return `
<nav class="lang-selector" aria-label="${selectLabel}">
  <button
    type="button"
    class="lang-selector__toggle"
    aria-expanded="false"
    aria-haspopup="true"
  >
    <span class="lang-selector__current">${currentLangName}</span>
    <svg class="lang-selector__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
  <ul class="lang-selector__menu" role="menu">
    ${options}
  </ul>
</nav>`;
}
