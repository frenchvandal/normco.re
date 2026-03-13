import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import icons, { type Catalog } from "lume/plugins/icons.ts";
import inline from "lume/plugins/inline.ts";
import imageSize from "lume/plugins/image_size.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import seo from "lume/plugins/seo.ts";
import prism from "lume/plugins/prism.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import postcss from "lume/plugins/postcss.ts";
import _purgecss from "lume/plugins/purgecss.ts"; // Temporarily disabled — see usage comment below
import lightningcss from "lume/plugins/lightningcss.ts";
import terser from "lume/plugins/terser.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import nav from "lume/plugins/nav.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import robots from "lume/plugins/robots.ts";
import pagefind from "lume/plugins/pagefind.ts";
import jsx from "lume/plugins/jsx.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import validateHtml from "lume/plugins/validate_html.ts";
import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import { enUS, fr as frLocale, zhCN, zhTW } from "npm/date-fns-locale";
import "npm/prism-bash";
import "npm/prism-typescript";
import "npm/prism-yaml";
import { readConsoleDebugPolicy } from "./plugins/console_debug.ts";
import otelPlugin from "./plugins/otel.ts";
import {
  assertEditorialImageDimensions,
  type EditorialImagePageSnapshot,
} from "./src/utils/editorial-image-dimensions.ts";
import { getLanguageTag } from "./src/utils/i18n.ts";
import { getXmlStylesheetHref } from "./src/utils/xml-stylesheet.ts";

/** Console debug policy, read once at module init from `LUME_LOGS`. */
const consoleDebugPolicy = readConsoleDebugPolicy((name) => Deno.env.get(name));
const OCTICON_CATALOGS = [
  {
    id: "octicons",
    src:
      "https://cdn.jsdelivr.net/npm/@primer/octicons@19.22.0/build/svg/{name}-{variant}.svg",
    variants: ["16", "24", "12", "48", "96"],
  },
] as const satisfies Catalog[];
const isServeTask = Deno.env.get("DENO_TASK_NAME") === "serve";

type BuildData = {
  repositoryUrl?: string;
  swDebugLevel: "off" | "summary" | "verbose";
};

// Maps hyphenated Lume data keys (URL-style) to their camelCase TypeScript
// equivalents used throughout the codebase. The multilanguage plugin resolves
// "zh-hans" as "zh" then "hans" (two separate segments), so page data exported
// as `zhHans` must be copied to the "zh-hans" key at preprocess time.
// Invariant: every entry here must have a matching key in LANGUAGE_PREFIX and
// LANGUAGE_DATA_CODE (src/utils/i18n.ts). Adding a new Chinese variant requires
// updates in both files.
const MULTILANGUAGE_DATA_ALIASES = {
  "zh-hans": "zhHans",
  "zh-hant": "zhHant",
} as const;
const REMOTE_IMAGE_SOURCE_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function runGitCommand(args: string[]): string | undefined {
  try {
    const command = new Deno.Command("git", { args });
    const output = command.outputSync();

    if (!output.success) {
      return undefined;
    }

    return new TextDecoder().decode(output.stdout).trim();
  } catch {
    return undefined;
  }
}

function normalizeRepositoryUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("git@")) {
    const sshMatch = /^git@([^:]+):(.+?)(?:\.git)?$/.exec(url);

    if (sshMatch) {
      const [, host, repoPath] = sshMatch;
      return `https://${host}/${repoPath}`;
    }
  }

  return url.replace(/\.git$/, "");
}

function getBuildData(): BuildData {
  const repositoryUrl = normalizeRepositoryUrl(
    runGitCommand(["config", "--get", "remote.origin.url"]),
  );
  const swDebugLevel = isServeTask ? consoleDebugPolicy.level : "off";

  return repositoryUrl
    ? {
      repositoryUrl,
      swDebugLevel,
    }
    : {
      swDebugLevel,
    };
}

/** Lume site instance — entry point for the build pipeline. */
const site: Site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
  server: {
    debugBar: true,
  },
});

const buildData = getBuildData();
site.data("build", buildData);

type SeoIssue = {
  pagePath: string;
  messages: string[];
};

const seoIssues: SeoIssue[] = [];

function normalizeSeoMessage(message: unknown): string {
  if (typeof message === "string") {
    return message;
  }

  return JSON.stringify(message, null, 2);
}

function updateSeoDebugCollection(site: Site): void {
  const collection = site.debugBar?.collection("SEO output errors");

  if (!collection) {
    return;
  }

  collection.icon = "search";
  collection.items = seoIssues.map(({ pagePath, messages }) => ({
    title: pagePath,
    description: messages.join("\n"),
    actions: [
      {
        text: "Open page",
        href: pagePath,
      },
      ...(buildData.repositoryUrl
        ? [
          {
            text: "Open repository",
            href: buildData.repositoryUrl,
          },
        ]
        : []),
    ],
  }));
}

site.addEventListener("beforeSave", () => {
  updateSeoDebugCollection(site);
});

// Register assets so Lume discovers them before processors/plugins run.
site.add("/style.css");
site.add("/scripts/theme-toggle.js");
site.add("/scripts/disclosure-controls.js");
site.add("/scripts/anti-flash.js");
site.add("/scripts/carbon.js");
site.add("/scripts/language-preference.js");
site.add("/scripts/feed-copy.js");
site.add("/scripts/post-code-copy.js");
site.add("/scripts/post-code-copy-exec-command.js");
site.add("/scripts/link-prefetch-intent.js");
site.add("/scripts/sw-register.js");
site.add("/scripts/archive-year-nav.js");
site.add("/scripts/pagefind-lazy-init.js");
site.add("/scripts/sw-core.js", "/sw-core.js");
site.add("/scripts/sw-lifecycle.js", "/sw-lifecycle.js");
site.add("/scripts/sw-routing.js", "/sw-routing.js");
site.add("/scripts/sw-module.js", "/sw-module.js");
site.add("/scripts/sw-classic.js", "/sw-classic.js");
site.add("/scripts/sw.js", "/sw.js");

// Copy XSLT stylesheets to the output as static assets.
site.add("/feed.xsl");
site.add("/sitemap.xsl");

// Minify client-side JavaScript with terser.
site.use(
  terser({
    options: {
      compress: true,
      mangle: true,
    },
  }),
);

// Process CSS imports with PostCSS while keeping minification to lightningcss.
site.use(
  postcss({
    useDefaultPlugins: false,
  }),
);

// Minify CSS and preserve modern syntax targets.
// Temporarily disabled to debug CSS output issues
site.use(
  lightningcss({
    options: {
      minify: false, // Changed to debug
      targets: {
        chrome: 123 << 16,
        firefox: 120 << 16,
        safari: (17 << 16) | (5 << 8),
      },
    },
  }),
);

// NOTE: PurgeCSS disabled temporarily — it removes Carbon Design System classes
// because they are generated dynamically by TSX components and not detected in
// static HTML scanning. Re-enable only with a complete safelist or custom extractor.
// site.use(
//   purgecss({
//     contentExtensions: [".html", ".js", ".xsl"],
//     options: {
//       keyframes: true,
//       variables: true,
//       safelist: [/^feed-/, /^sr-only$/, /^pagefind-ui/],
//     },
//   }),
// );

// Keep source maps in local `serve` sessions; skip them in build/CI output to
// trim shipped JS/CSS bytes and avoid non-production sidecars.
if (isServeTask) {
  site.use(sourceMaps());
}

// HTML attribute helpers: helpers.attr(), helpers.class()
site.use(attributes());

// Enable TSX/JSX templates for pages, layouts, and components.
site.use(jsx());

// Download only Octicons on demand and expose `helpers.icon()`.
site.use(
  icons({
    catalogs: OCTICON_CATALOGS,
  }),
);

// Replace `<img inline>` by inline SVG while preserving accessibility attributes.
site.use(
  inline({
    copyAttributes: [/^data-/, /^aria-/, "focusable", "role"],
  }),
);

// Add `image-size` to editorial images missing dimensions so the official
// image_size plugin can emit explicit width/height attributes for CLS stability.
site.process([".html"], (pages: Page[]) => {
  for (const page of pages) {
    for (
      const image of page.document.querySelectorAll(
        "main[data-pagefind-body] img:not([width]):not([height]):not([image-size])",
      )
    ) {
      const src = image.getAttribute("src");

      if (!src || REMOTE_IMAGE_SOURCE_PATTERN.test(src)) {
        continue;
      }

      image.setAttribute("image-size", "");
    }
  }
});

// Resolve width and height attributes from local image files at build time.
site.use(imageSize());

// Enforce explicit dimensions in editorial HTML to keep CLS safeguards active.
site.process([".html"], (pages: Page[]) => {
  const snapshots: EditorialImagePageSnapshot[] = pages.map((page) => ({
    pageUrl: typeof page.data.url === "string"
      ? page.data.url
      : page.outputPath,
    document: page.document,
  }));

  assertEditorialImageDimensions(snapshots);
});

// Date formatting: helpers.date(value, "HUMAN_DATE"), helpers.date(value, "SHORT"), …
site.use(
  date({
    locales: {
      en: enUS,
      fr: frLocale,
      zhHans: zhCN,
      zhHant: zhTW,
    },
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
// The disallow list below enumerates every language-prefixed offline and 404
// path manually. This is intentional: the robots() plugin API expects static
// string values and cannot derive paths from LANGUAGE_PREFIX at build time.
// When adding a new language, also add the corresponding disallow entries here.
site.use(
  robots({
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: "/404",
      },
      {
        userAgent: "*",
        disallow: "/404.html",
      },
      {
        userAgent: "*",
        disallow: "/offline",
      },
      {
        userAgent: "*",
        disallow: "/offline.html",
      },
      {
        userAgent: "*",
        disallow: "/fr/offline",
      },
      {
        userAgent: "*",
        disallow: "/fr/offline/",
      },
      {
        userAgent: "*",
        disallow: "/zh-hans/offline",
      },
      {
        userAgent: "*",
        disallow: "/zh-hans/offline/",
      },
      {
        userAgent: "*",
        disallow: "/zh-hant/offline",
      },
      {
        userAgent: "*",
        disallow: "/zh-hant/offline/",
      },
      {
        sitemap: "https://normco.re/sitemap.xml",
      },
    ],
  }),
);

// Multilanguage plugin resolves per-language overrides from keys matching the
// language code. For hyphenated codes, expose alias keys from camelCase exports.
site.preprocess([".html"], (pages: Page[]) => {
  for (const page of pages) {
    const pageData = page.data as Record<string, unknown>;

    for (
      const [languageCode, exportKey] of Object.entries(
        MULTILANGUAGE_DATA_ALIASES,
      )
    ) {
      if (pageData[languageCode] !== undefined) {
        continue;
      }

      const aliasData = pageData[exportKey];

      if (aliasData !== undefined) {
        pageData[languageCode] = aliasData;
      }
    }
  }
});

// Navigation tree: data.nav.menu(), data.nav.nextPage(), data.nav.previousPage()
site.use(
  multilanguage({
    languages: ["en", "fr", "zh-hans", "zh-hant"],
    defaultLanguage: "en",
  }),
);
site.use(nav());
// Keep the search index generation but disable Pagefind's auto UI injection.
// The site uses a custom lazy initializer (`/scripts/pagefind-lazy-init.js`)
// to avoid loading search UI assets on the critical rendering path.
site.use(
  pagefind({
    ui: false,
  }),
);

// Validate generated HTML against html-validate recommended/document presets.
// Keep strict error reporting for common production issues while allowing
// framework-required patterns (quotes and doctype style) handled by defaults.
site.use(
  validateHtml({
    output: "_html-issues.json",
    rules: {
      "require-sri": "off",
      "heading-level": "off",
      "script-type": "off",
      "attribute-boolean-style": "off",
      "attribute-empty-style": "off", // JSX renders hidden as hidden=""
      "unique-landmark": "off", // SideNav nav inherits aside aria-label
    },
  }),
);

// Detect broken internal links, including hash anchors, and fail the build
// when invalid URLs are detected.
// Ignore JavaScript files: URL-like strings in JS are routing/service worker
// paths, not actual links. The plugin would otherwise report false positives.
site.use(
  checkUrls({
    anchors: true,
    throw: true,
    ignore: [
      "/feed.xml",
      "/feed.json",
      "/sitemap.xml",
      /\.js$/,
    ],
    output: "_broken_links.json",
  }),
);

// Structured data + SEO diagnostics.
// - jsonLd: renders <script type="application/ld+json"> from page data
// - seo: reports common issues in Lume debug bar (titles, descriptions, image alts, etc.)
site.use(jsonLd());
site.use(
  seo({
    output: (reports) => {
      seoIssues.length = 0;

      const logEnabled = consoleDebugPolicy.level !== "off";

      if (reports.size === 0) {
        if (logEnabled) console.info("No SEO errors found");
        updateSeoDebugCollection(site);
        return;
      }

      if (logEnabled) {
        console.info(`${reports.size} pages found with SEO errors`);
      }

      for (const [pagePath, messages] of reports.entries()) {
        const normalizedMessages = messages.map(normalizeSeoMessage);
        seoIssues.push({
          pagePath,
          messages: normalizedMessages,
        });

        if (logEnabled) {
          console.group(`SEO errors for ${pagePath}`);
          for (const message of normalizedMessages) {
            console.info(`- ${message}`);
          }
          console.groupEnd();
        }
      }

      updateSeoDebugCollection(site);
    },
  }),
);

// Prism grammars are preloaded with side-effect imports above.
// Avoid `autoloadLanguages` here because it is async and may finish
// after static HTML serialization, leaving unhighlighted code blocks.
site.use(prism());

site.use(
  feed({
    output: ["/feed.xml", "/feed.json"],
    query: "type=post lang=en",
    info: {
      title: "normco.re",
      description: "Personal blog by Phiphi, based in Chengdu, China.",
      lang: getLanguageTag("en"),
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
site.use(
  feed({
    output: ["/fr/feed.xml", "/fr/feed.json"],
    query: "type=post lang=fr",
    info: {
      title: "normco.re (fr)",
      description: "Blog personnel de Phiphi, basé à Chengdu, en Chine.",
      lang: getLanguageTag("fr"),
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
site.use(
  feed({
    output: ["/zh-hans/feed.xml", "/zh-hans/feed.json"],
    query: "type=post lang=zh-hans",
    info: {
      title: "normco.re (简体中文)",
      description: "Phiphi 的个人博客，写于中国成都。",
      lang: getLanguageTag("zhHans"),
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
site.use(
  feed({
    output: ["/zh-hant/feed.xml", "/zh-hant/feed.json"],
    query: "type=post lang=zh-hant",
    info: {
      title: "normco.re (繁體中文)",
      description: "Phiphi 的個人部落格，寫於中國成都。",
      lang: getLanguageTag("zhHant"),
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
    const pageUrl = page.data.url;

    if (typeof pageUrl !== "string") {
      continue;
    }

    const xslHref = getXmlStylesheetHref(pageUrl);

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
site.addEventListener(
  "afterBuild",
  "deno fmt _site && deno run --allow-read --allow-write scripts/fingerprint-assets.ts _site && deno run --allow-read --allow-write --allow-run=deno scripts/build-carbon-vendor.ts _site && deno run --allow-read scripts/check-browser-imports.ts _site",
);

export default site;
