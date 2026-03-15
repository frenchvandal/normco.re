/** Lume plugin configuration — all plugin registrations in correct order. */

import terser from "lume/plugins/terser.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import sass from "lume/plugins/sass.ts";
import postcss from "lume/plugins/postcss.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import jsx from "lume/plugins/jsx.ts";
import inline from "lume/plugins/inline.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import imageSize from "lume/plugins/image_size.ts";
import date from "lume/plugins/date.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import sitemap from "lume/plugins/sitemap.ts";
import robots from "lume/plugins/robots.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import nav from "lume/plugins/nav.ts";
import pagefind from "lume/plugins/pagefind.ts";
import validateHtml from "lume/plugins/validate_html.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import prism from "lume/plugins/prism.ts";
import type Site from "lume/core/site.ts";
import { enUS, fr as frLocale, zhCN, zhTW } from "npm/date-fns-locale";
import "npm/prism-bash";
import "npm/prism-typescript";
import "npm/prism-yaml";
import otelPlugin from "../plugins/otel.ts";

/** Register all Lume plugins in the correct cascade order. */
export function registerPlugins(
  site: Site,
  options: { readonly isServeTask: boolean },
): void {
  // --- Asset processing ---

  site.use(
    terser({
      options: {
        compress: true,
        mangle: true,
      },
    }),
  );

  // Download IBM Plex and Noto CJK fonts locally instead of loading from
  // Google Fonts CDN. Must run before postcss so generated CSS is processed.
  // Strategy: IBM Plex (primary) → Noto Sans SC/TC (CJK fallback) → system fonts.
  // IBM Plex has no CJK glyphs; Noto Sans provides coherent humanist coverage
  // for Simplified and Traditional Chinese with similar x-height and weight axis.
  site.use(
    googleFonts({
      subsets: [
        "latin",
        "latin-ext",
        "chinese-simplified",
        "chinese-traditional",
      ],
      fonts:
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600&display=swap",
      cssFile: "styles/fonts.css",
      fontsFolder: "/fonts",
    }),
  );

  // Compile Carbon Sass → CSS before PostCSS/LightningCSS processing.
  // loadPaths resolves @carbon/styles from node_modules.
  site.use(
    sass({
      options: {
        loadPaths: ["node_modules"],
      },
    }),
  );

  site.use(
    postcss({
      useDefaultPlugins: false,
    }),
  );

  site.use(
    lightningcss({
      options: {
        minify: false,
        targets: {
          chrome: 123 << 16,
          firefox: 120 << 16,
          safari: (17 << 16) | (5 << 8),
        },
      },
    }),
  );

  if (options.isServeTask) {
    site.use(sourceMaps());
  }

  // --- Template rendering ---

  site.use(attributes());
  site.use(jsx());
  site.use(
    inline({
      copyAttributes: [/^data-/, /^aria-/, "focusable", "role"],
    }),
  );
  site.use(resolveUrls());

  // --- Content processing ---

  site.use(imageSize());
  site.use(
    date({
      locales: {
        en: enUS,
        fr: frLocale,
        zhHans: zhCN,
        zhHant: zhTW,
      },
      formats: {
        SHORT: "MMM d",
      },
    }),
  );
  site.use(readingInfo());

  // --- Navigation and discovery ---

  site.use(sitemap());
  site.use(
    robots({
      rules: [
        { userAgent: "*", allow: "/" },
        { userAgent: "*", disallow: "/404" },
        { userAgent: "*", disallow: "/404.html" },
        { userAgent: "*", disallow: "/offline" },
        { userAgent: "*", disallow: "/offline.html" },
        { userAgent: "*", disallow: "/fr/offline" },
        { userAgent: "*", disallow: "/fr/offline/" },
        { userAgent: "*", disallow: "/zh-hans/offline" },
        { userAgent: "*", disallow: "/zh-hans/offline/" },
        { userAgent: "*", disallow: "/zh-hant/offline" },
        { userAgent: "*", disallow: "/zh-hant/offline/" },
        { sitemap: "https://normco.re/sitemap.xml" },
      ],
    }),
  );
  site.use(
    multilanguage({
      languages: ["en", "fr", "zh-hans", "zh-hant"],
      defaultLanguage: "en",
    }),
  );
  site.use(nav());
  site.use(
    pagefind({
      ui: false,
    }),
  );

  // --- Validation ---

  site.use(
    validateHtml({
      output: "_html-issues.json",
      rules: {
        "require-sri": "off",
        "heading-level": "off",
        "script-type": "off",
        "attribute-boolean-style": "off",
        "attribute-empty-style": "off",
        "unique-landmark": "off",
      },
    }),
  );
  site.use(
    checkUrls({
      anchors: true,
      throw: true,
      ignore: ["/feed.xml", "/feed.json", "/sitemap.xml"],
      output: "_broken_links.json",
    }),
  );

  // --- Structured data ---

  site.use(jsonLd());
  site.use(prism());
  site.use(otelPlugin());
}
