import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import seo from "lume/plugins/seo.ts";
import prism from "lume/plugins/prism.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import nav from "lume/plugins/nav.ts";
import jsx from "lume/plugins/jsx.ts";
import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import otelPlugin from "./plugins/otel.ts";

/** Lume site instance — entry point for the build pipeline. */
const site: Site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

// Register assets so Lume discovers them before processors/plugins run.
site.add("/style.css");
site.add("/scripts/theme-toggle.js", "/theme-toggle.js");
site.add("/scripts/anti-flash.js", "/anti-flash.js");

// Copy XSLT stylesheets to the output as static assets.
site.add("/feed.xsl");
site.add("/sitemap.xsl");

// lightningcss minifies the stylesheet and prepares source-map metadata.
// Targets modern browsers that natively support oklch(), light-dark(),
// @layer, @container, and @view-transition — no polyfilling needed.
site.use(
  lightningcss({
    options: {
      minify: true,
      targets: {
        chrome: 123 << 16,
        firefox: 120 << 16,
        safari: (17 << 16) | (5 << 8), // 17.5
      },
    },
  }),
);

// Generate a separate .css.map sidecar file for the minified stylesheet.
site.use(sourceMaps());

// HTML attribute helpers: helpers.attr(), helpers.class()
site.use(attributes());

// Enable TSX/JSX templates for pages, layouts, and components.
site.use(jsx());

// Date formatting: helpers.date(value, "HUMAN_DATE"), helpers.date(value, "SHORT"), …
site.use(
  date({
    formats: {
      // "Mar 5" — compact date for post cards and archive rows.
      SHORT: "MMM d",
    },
  }),
);

// Reading metrics (word count, minutes, pages) powered by Intl.Segmenter.
site.use(readingInfo());

// XML sitemap + robots.txt.
// Unlisted pages (export const unlisted = true) are excluded automatically.
site.use(sitemap());

// Navigation tree: data.nav.menu(), data.nav.nextPage(), data.nav.previousPage()
site.use(nav());

// Structured data + SEO diagnostics.
// - jsonLd: renders <script type="application/ld+json"> from page data
// - seo: reports common issues in Lume debug bar (titles, descriptions, image alts, etc.)
site.use(jsonLd());
site.use(seo());

// Prism is preferred over highlight.js for its autoloadLanguages feature,
// which detects and loads language grammars on demand — no manual imports needed.
site.use(prism({ autoloadLanguages: true }));

site.use(
  feed({
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "normco.re",
      description: "Personal blog by Phiphi, based in Chengdu, China.",
      lang: "en",
      generator: false,
    },
    items: {
      title: "=title",
      description: "=description",
      published: "=date",
      content: "=content",
    },
  }),
);

// Inject <?xml-stylesheet?> processing instructions into XML outputs so browsers
// can render them as styled HTML pages via the XSLT stylesheets above.
const XML_PI_PATTERN = /^(<\?xml[^?]*\?>)/;
site.process([".xml"], (pages: Page[]) => {
  for (const page of pages) {
    const pageUrl = page.data.url as string;
    let xslHref: string | undefined;

    if (pageUrl === "/feed.xml") xslHref = "/feed.xsl";
    else if (pageUrl === "/sitemap.xml") xslHref = "/sitemap.xsl";

    if (xslHref === undefined) continue;

    const content = String(page.content);
    const pi = `<?xml-stylesheet type="text/xsl" href="${xslHref}"?>`;
    page.content = content.replace(XML_PI_PATTERN, `$1\n${pi}`);
  }
});

// OpenTelemetry build observability — no-op without OTEL_DENO=true.
// Configure exporters via OTEL_* env vars (for local JSON inspection, use
// OTEL_EXPORTER_OTLP_PROTOCOL=http/json).
site.use(otelPlugin());

export default site;
