import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import nav from "lume/plugins/nav.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

// Reading time — computed from the plain-text length of each post's content.
// Average adult reading speed: 238 words per minute (source: Brysbaert et al., 2019).
const WORDS_PER_MINUTE = 238;
site.preprocess([".ts"], (pages) => {
  for (const page of pages) {
    const raw = String(page.data.content ?? "");
    // Strip HTML tags to count only visible words.
    const text = raw.replace(/<[^>]+>/g, " ");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    page.data.readingTime = Math.max(
      1,
      Math.ceil(wordCount / WORDS_PER_MINUTE),
    );
  }
});

// Register the stylesheet so Lume discovers it before lightningcss runs.
site.add("/style.css");

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

// Date formatting: helpers.date(value, "HUMAN_DATE"), helpers.date(value, "SHORT"), …
site.use(
  date({
    formats: {
      // "Mar 5" — compact date for post cards and archive rows.
      SHORT: "MMM d",
    },
  }),
);

// XML sitemap + robots.txt.
// Unlisted pages (export const unlisted = true) are excluded automatically.
site.use(sitemap());

// Navigation tree: data.nav.menu(), data.nav.nextPage(), data.nav.previousPage()
site.use(nav());

site.use(codeHighlight());

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

export default site;
