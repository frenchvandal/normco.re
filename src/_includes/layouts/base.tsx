/** Base HTML layout. Every page and layout chains to this. */

/** Typed helpers used in this layout. */
type H = {
  attr: (attrs: Record<string, unknown>) => string;
};

/** Typed component functions used in this layout. */
type Comp = {
  Header: (props: { readonly currentUrl: string }) => Promise<string>;
  Footer: (props: Record<never, never>) => Promise<string>;
};

type BuildData = {
  assetVersion?: string;
};

type LayoutData = Lume.Data & {
  build?: BuildData;
};

/** Renders the full HTML document shell. */
export default async function (
  { title, description, content, url, comp, build }: LayoutData,
  helpers: Lume.Helpers,
): Promise<string> {
  const { attr } = helpers as unknown as H;
  // Lume.comp is loosely typed; cast to the minimal Comp interface (§5.4 — library boundary).
  const { Header, Footer } = comp as unknown as Comp;

  const pageTitle = title ? `${title} — normco.re` : "normco.re";
  const metaDescription = description ??
    "Personal blog by Phiphi, based in Chengdu, China.";

  const header = await Header({ currentUrl: url ?? "/" });
  const footer = await Footer({});
  const assetVersion = build?.assetVersion ?? "dev";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta ${
    attr({ name: "viewport", content: "width=device-width, initial-scale=1" })
  }>
    <title>${pageTitle}</title>
    <meta ${attr({ name: "description", content: metaDescription })}>
    <script src="/anti-flash.js?v=${assetVersion}"></script>
    <link rel="stylesheet" href="/style.css?v=${assetVersion}">
    <link rel="alternate" type="application/rss+xml" title="normco.re" href="/feed.xml">
    <link rel="alternate" type="application/json" title="normco.re JSON feed" href="/feed.json">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-wrapper">
      ${header}
      <main class="site-main" id="main-content">
        ${content}
      </main>
      ${footer}
    </div>
    <div id="sw-update-toast" class="sw-update-toast" role="status" aria-live="polite" hidden>
      <p class="sw-update-toast-text">A new version is available.</p>
      <button type="button" id="sw-update-button" class="sw-update-toast-button">Refresh</button>
    </div>
    <script src="/theme-toggle.js?v=${assetVersion}"></script>
    <script src="/sw-register.js?v=${assetVersion}" data-asset-version="${assetVersion}"></script>
  </body>
</html>`;
}
