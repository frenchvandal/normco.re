/** Site header with logo, primary navigation, and theme toggle. */

/** Returns `aria-current="page"` when the link matches the active URL. */
function ariaCurrent(href: string, currentUrl: string): string {
  if (href === "/" && currentUrl === "/") return ' aria-current="page"';
  if (href !== "/" && currentUrl.startsWith(href)) {
    return ' aria-current="page"';
  }
  return "";
}

/** Inline SVG sun icon — displayed in dark mode (click to switch to light). */
const sunIcon =
  `<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`;

/** Inline SVG moon icon — displayed in light mode (click to switch to dark). */
const moonIcon =
  `<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

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
      <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle color theme">${sunIcon}${moonIcon}</button>
    </div>
  </div>
</header>`;
}
