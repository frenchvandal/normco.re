import terser from "lume/plugins/terser.ts";
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
import { enUS, fr as frLocale, zhCN, zhTW } from "date-fns/locale";
import { SHIKI_OPTIONS } from "./code_highlighting.ts";
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

export function registerPlugins(
  site: Site,
  options: { readonly isServeTask: boolean },
): void {
  site.use(
    terser({
      options: {
        compress: true,
        mangle: true,
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

  // Keep external source maps in both serve and production builds. The
  // post-build asset fingerprinting step already renames `.map` files and
  // rewrites `sourceMappingURL` comments to the hashed filenames.
  site.use(sourceMaps());

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

  site.use(jsonLd());
  site.use(shiki(SHIKI_OPTIONS));
}
