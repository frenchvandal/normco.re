/** Base HTML layout. Every page and layout chains to this. */

/** Typed helpers used in this layout. */
type H = {
  attr: (attrs: Record<string, unknown>) => string;
};

export default function (
  { title, description, content, url, comp }: Lume.Data,
  helpers: Lume.Helpers,
): string {
  const { attr } = helpers as unknown as H;

  const pageTitle = title ? `${title} — normco.re` : "normco.re";
  const metaDescription = description ??
    "Personal blog by Phiphi, based in Chengdu, China.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta ${
    attr({ name: "viewport", content: "width=device-width, initial-scale=1" })
  }>
    <title>${pageTitle}</title>
    <meta ${attr({ name: "description", content: metaDescription })}>
    <link rel="stylesheet" href="/style.css">
    <link rel="alternate" type="application/rss+xml" title="normco.re" href="/feed.xml">
    <link rel="alternate" type="application/json" title="normco.re JSON feed" href="/feed.json">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-wrapper">
      ${comp.Header({ currentUrl: url ?? "/" })}
      <main class="site-main" id="main-content">
        ${content}
      </main>
      ${comp.Footer({})}
    </div>
  </body>
</html>`;
}
