/** Site header with logo and primary navigation. */

/** Returns `aria-current="page"` when the link matches the active URL. */
function ariaCurrent(href: string, currentUrl: string): string {
  if (href === "/" && currentUrl === "/") return ' aria-current="page"';
  if (href !== "/" && currentUrl.startsWith(href)) {
    return ' aria-current="page"';
  }
  return "";
}

export default function (
  { currentUrl }: { readonly currentUrl: string },
): string {
  return `<header class="site-header">
  <div class="site-header-inner">
    <a href="/" class="site-name"${ariaCurrent("/", currentUrl)}>normco.re</a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/posts/"${ariaCurrent("/posts/", currentUrl)}>Writing</a>
      <a href="/about/"${ariaCurrent("/about/", currentUrl)}>About</a>
    </nav>
  </div>
</header>`;
}
