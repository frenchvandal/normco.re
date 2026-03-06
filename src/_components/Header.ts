/** Site header with logo, primary navigation, and theme toggle. */

/** Returns `aria-current="page"` when the link matches the active URL. */
function ariaCurrent(href: string, currentUrl: string): string {
  if (href === "/" && currentUrl === "/") return ' aria-current="page"';
  if (href !== "/" && currentUrl.startsWith(href)) {
    return ' aria-current="page"';
  }
  return "";
}

/**
 * Half-filled circle: the geometric symbol of contrast (light/dark duality).
 * A single static icon — no swapping, no visual ambiguity.
 * Right semicircle filled, left empty; universally legible at small sizes.
 */
const contrastIcon =
  `<svg class="theme-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M10 2.5A7.5 7.5 0 0 1 10 17.5Z" fill="currentColor"/></svg>`;

/** Renders the site header with logo, navigation, and theme toggle. */
export default function (
  { currentUrl }: { readonly currentUrl: string },
): string {
  return `<header class="site-header">
  <div class="site-header-inner">
    <a href="/" class="site-name"${ariaCurrent("/", currentUrl)}>normco.re</a>
    <div class="site-header-end">
      <nav class="site-nav" aria-label="Main navigation">
        <a href="/posts/"${ariaCurrent("/posts/", currentUrl)}>Writing</a>
        <a href="/about/"${ariaCurrent("/about/", currentUrl)}>About</a>
      </nav>
      <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle color theme">${contrastIcon}</button>
    </div>
  </div>
</header>`;
}
