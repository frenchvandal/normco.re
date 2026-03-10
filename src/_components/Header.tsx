/** Site header with logo, primary navigation, and theme toggle. */

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

/** Renders the site header with logo, navigation, and theme toggle. */
export default (
  { currentUrl, siteName }: {
    readonly currentUrl: string;
    readonly siteName: string;
  },
  helpers: IconHelpers = DEFAULT_ICON_HELPERS,
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
