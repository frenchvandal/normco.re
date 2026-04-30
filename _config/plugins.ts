import terser from "lume/plugins/terser.ts";
import postcss from "lume/plugins/postcss.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import purgecss from "lume/plugins/purgecss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import svgo from "lume/plugins/svgo.ts";
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
import esbuild from "lume/plugins/esbuild.ts";
import type Site from "lume/core/site.ts";
import { enUS, fr as frLocale, zhCN, zhTW } from "npm/date-fns/locale";

import { SHIKI_OPTIONS } from "./code_highlighting.ts";
import { createPurgeCssOptions } from "./purgecss.ts";
import { writeHtmlValidationReport } from "./quality_reports.ts";
import { registerPostDataPreparation } from "./processors.ts";
import { buildRobotsRules } from "./robots_rules.ts";
import { shouldEmitSourceMaps } from "./runtime_policy.ts";
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
    esbuild({
      denoConfig: "src/blog/client/deno.json",
      options: {
        alias: {
          "@blog/archive-antd": "./src/blog/client/archive-antd.build.ts",
          "@blog/antd-icons": "./src/blog/client/antd-icons.build.ts",
          "@blog/common-antd": "./src/blog/client/common-antd.build.ts",
          "@blog/gallery-antd": "./src/blog/client/gallery-antd.build.ts",
          "@blog/post-antd": "./src/blog/client/post-antd.build.ts",
          "@blog/tag-antd": "./src/blog/client/tag-antd.build.ts",
        },
        format: "esm",
      },
    }),
  );
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

  if (!options.isServeTask) {
    site.use(purgecss(createPurgeCssOptions()));
  }

  // External source maps stay enabled for local `serve` workflows, where they
  // materially improve browser debugging. Production builds prune `.map` files
  // from deployable output, so skip generating them there and save the work.
  if (shouldEmitSourceMaps(options.isServeTask)) {
    site.use(sourceMaps());
  }

  site.use(attributes());
  site.use(jsx());
  site.use(imageSize());
  site.use(svgo());
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
      rules: buildRobotsRules(),
    }),
  );

  registerPostDataPreparation(site);

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
      output: writeHtmlValidationReport,
      rules: {
        "require-sri": "off",
        "script-type": "off",
        "attribute-boolean-style": "off",
        "attribute-empty-style": "off",
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
        ignore: ["/feed.xml", "/feed.json", "/feed.atom", "/sitemap.xml"],
        output: "_quality/broken-links-pre-fingerprint.json",
      }),
    );
  }

  site.use(jsonLd());
  site.use(shiki(SHIKI_OPTIONS));
}
