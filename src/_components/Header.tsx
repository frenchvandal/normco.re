/** Site header with logo, primary navigation, and theme toggle. */

import { getOcticonData } from "../utils/octicon.ts";

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

const sunIcon = getOcticonData("sun");
const moonIcon = getOcticonData("moon");

/** Renders the site header with logo, navigation, and theme toggle. */
export default (
  { currentUrl, siteName }: {
    readonly currentUrl: string;
    readonly siteName: string;
  },
) => (
  <header class="site-header">
    <div class="site-header-inner">
      <a href="/" class="site-name" {...ariaCurrent("/", currentUrl)}>
        {siteName}
      </a>
      <div class="site-header-end">
        <nav class="site-nav" aria-label="Main navigation">
          <ul class="site-nav-list">
            <li class="site-nav-item">
              <a
                href="/posts/"
                class="site-nav-link"
                {...ariaCurrent("/posts/", currentUrl)}
              >
                Writing
              </a>
            </li>
            <li class="site-nav-item">
              <a
                href="/about/"
                class="site-nav-link"
                {...ariaCurrent("/about/", currentUrl)}
              >
                About
              </a>
            </li>
          </ul>
        </nav>
        <button
          type="button"
          id="theme-toggle"
          class="theme-toggle"
          aria-label="Toggle color theme"
          aria-pressed="false"
        >
          <svg
            class="theme-icon theme-icon--sun octicon-svg"
            width="16"
            height="16"
            viewBox={sunIcon.viewBox}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d={sunIcon.path}></path>
          </svg>
          <svg
            class="theme-icon theme-icon--moon octicon-svg"
            width="16"
            height="16"
            viewBox={moonIcon.viewBox}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d={moonIcon.path}></path>
          </svg>
        </button>
      </div>
    </div>
  </header>
);
