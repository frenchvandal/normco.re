/** Lume plugin configuration — all plugin registrations in correct order. */

import terser from "lume/plugins/terser.ts";
import sass from "lume/plugins/sass.ts";
import postcss from "lume/plugins/postcss.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import jsx from "lume/plugins/jsx.ts";
import inline from "lume/plugins/inline.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import imageSize from "lume/plugins/image_size.ts";
import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";
import date from "lume/plugins/date.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import icons from "lume/plugins/icons.ts";
import sitemap from "lume/plugins/sitemap.ts";
import robots from "lume/plugins/robots.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import nav from "lume/plugins/nav.ts";
import pagefind from "lume/plugins/pagefind.ts";
import validateHtml from "lume/plugins/validate_html.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import type Site from "lume/core/site.ts";
import { enUS, fr as frLocale, zhCN, zhTW } from "npm/date-fns-locale";
import { CARBON_SASS_LOAD_PATHS } from "./materialize_sass_npm_packages.ts";
import { SHIKI_OPTIONS } from "./code_highlighting.ts";
import otelPlugin from "../plugins/otel.ts";
import shiki from "../plugins/shiki/mod.ts";

/**
 * Lightning CSS expects packed browser versions in the form 0xMMmmpp
 * (`major << 16 | minor << 8 | patch`).
 */
function encodeLightningCssTarget(
  major: number,
  minor = 0,
  patch = 0,
): number {
  return (major << 16) | (minor << 8) | patch;
}

const LIGHTNING_CSS_TARGETS = {
  chrome: encodeLightningCssTarget(123),
  firefox: encodeLightningCssTarget(120),
  safari: encodeLightningCssTarget(17, 5),
} as const;

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

  // Typography now comes from Carbon-backed system font stacks in the token
  // layer, so the asset pipeline no longer downloads webfonts or emits a
  // generated font stylesheet.
  // Compile Carbon Sass → CSS before PostCSS/LightningCSS processing.
  // The imported package.json modules above force Deno to materialize the
  // Carbon Sass dependency graph under top-level node_modules, which is the
  // location Dart Sass resolves from when using bare package imports.
  site.use(
    sass({
      options: {
        loadPaths: [...CARBON_SASS_LOAD_PATHS],
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
        minify: !options.isServeTask,
        targets: LIGHTNING_CSS_TARGETS,
      },
    }),
  );

  if (options.isServeTask) {
    site.use(sourceMaps());
  }

  // --- Template rendering ---

  site.use(attributes());
  site.use(jsx());
  site.use(imageSize());
  site.use(
    picture({
      order: ["avif", "webp", "jpg"],
    }),
  );
  site.use(transformImages());
  site.use(
    inline({
      copyAttributes: [/^data-/, /^aria-/, "focusable", "role"],
    }),
  );
  site.use(resolveUrls());

  // --- Content processing ---

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
  site.use(icons());

  // --- Navigation and discovery ---

  site.use(
    sitemap({
      stylesheet: "/sitemap.xsl",
    }),
  );
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
      output: "_quality/html-issues.json",
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
  // The authoritative broken-link gate runs after fingerprinting in `_config.ts`.
  // Skip the pre-fingerprint crawl in `serve` mode to avoid noisy false
  // positives during incremental rebuilds while generated assets are in flux.
  if (!options.isServeTask) {
    site.use(
      checkUrls({
        anchors: true,
        throw: true,
        ignore: ["/rss.xml", "/feed.json", "/atom.xml", "/sitemap.xml"],
        output: "_quality/broken-links-pre-fingerprint.json",
      }),
    );
  }

  // --- Structured data ---

  site.use(jsonLd());
  site.use(shiki(SHIKI_OPTIONS));
  site.use(otelPlugin());
}
