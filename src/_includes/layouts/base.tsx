/** Base HTML layout. Every page and layout chains to this. */

import type { jsx } from "lume/jsx-runtime";

/** `<!doctype html>` prepended to the document before the `<html>` root. */
const DOCTYPE = { __html: "<!doctype html>\n" } as const;

type BuildData = {
  assetVersion?: string;
  swDebugLevel?: "off" | "summary" | "verbose";
};

type LayoutData = Lume.Data & {
  build?: BuildData;
  /** Injected by `src/_data.ts` — canonical site name / domain. */
  siteName?: string;
  /** Injected by `src/_data.ts` — primary author name. */
  author?: string;
  /** Injected by `src/_data.ts` — site metadata for meta tags. */
  metas?: { readonly site?: string; readonly description?: string };
};

/** Return type of an ssx JSX element, used to type Lume component functions. */
type SsxElement = ReturnType<typeof jsx>;

/** Minimal typed interface for the components used in this layout. */
type Comp = {
  Header: (
    props: { readonly currentUrl: string; readonly siteName: string },
  ) => SsxElement;
  Footer: (props: { readonly author: string }) => SsxElement;
};

/** Renders the full HTML document shell. */
export default (
  { title, description, url, children, comp, build, siteName, author, metas }:
    LayoutData,
  _helpers: Lume.Helpers,
) => {
  // siteName and author are always provided by src/_data.ts; the fallbacks are
  // a safety net for test environments that omit them.
  const resolvedSiteName = siteName ?? "normco.re";
  const resolvedAuthor = author ?? "Phiphi";
  const pageTitle = title ? `${title} — ${resolvedSiteName}` : resolvedSiteName;
  const metaDescription = description ?? metas?.description ??
    "Personal blog by Phiphi, based in Chengdu, China.";
  const assetVersion = build?.assetVersion ?? "dev";
  const swDebugLevel = build?.swDebugLevel ?? "off";

  // Lume.comp is loosely typed; cast to the minimal Comp interface (§5.4 — library boundary).
  const { Header, Footer } = comp as unknown as Comp;

  return (
    <>
      {DOCTYPE}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{pageTitle}</title>
          <meta name="description" content={metaDescription} />
          <script src={`/scripts/anti-flash.js?v=${assetVersion}`}></script>
          <link rel="stylesheet" href={`/style.css?v=${assetVersion}`} />
          <link
            rel="alternate"
            type="application/rss+xml"
            title={resolvedSiteName}
            href="/feed.xml"
          />
          <link
            rel="alternate"
            type="application/json"
            title={`${resolvedSiteName} JSON feed`}
            href="/feed.json"
          />
        </head>
        <body>
          <a class="skip-link" href="#main-content">Skip to content</a>
          <div class="site-wrapper">
            <Header currentUrl={url ?? "/"} siteName={resolvedSiteName} />
            <main class="site-main" id="main-content">
              {children}
            </main>
            <Footer author={resolvedAuthor} />
          </div>
          <script src={`/scripts/theme-toggle.js?v=${assetVersion}`}></script>
          <script
            src={`/scripts/sw-register.js?v=${assetVersion}`}
            data-asset-version={assetVersion}
            data-sw-debug-level={swDebugLevel}
          >
          </script>
        </body>
      </html>
    </>
  );
};
