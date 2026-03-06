/** Base HTML layout. Every page and layout chains to this. */

import { ANTI_FLASH_SCRIPT } from "./_anti-flash.ts";

/** Typed helpers used in this layout. */
type H = {
  attr: (attrs: Record<string, unknown>) => string;
};

/** Typed component functions used in this layout. */
type Comp = {
  Header: (props: { readonly currentUrl: string }) => Promise<string>;
  Footer: (props: Record<never, never>) => Promise<string>;
};

/** Renders the full HTML document shell. */
export default async function (
  { title, description, content, url, comp }: Lume.Data,
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

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta ${
    attr({ name: "viewport", content: "width=device-width, initial-scale=1" })
  }>
    <title>${pageTitle}</title>
    <meta ${attr({ name: "description", content: metaDescription })}>
    <script>${ANTI_FLASH_SCRIPT}</script>
    <link rel="stylesheet" href="/style.css">
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
    <script src="/theme-toggle.js"></script>
  </body>
</html>`;
}
