import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import seo from "lume/plugins/seo.ts";
import prism from "lume/plugins/prism.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import postcss from "lume/plugins/postcss.ts";
import purgecss from "lume/plugins/purgecss.ts";
import lightningcss from "lume/plugins/lightningcss.ts";
import terser from "lume/plugins/terser.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import attributes from "lume/plugins/attributes.ts";
import nav from "lume/plugins/nav.ts";
import robots from "lume/plugins/robots.ts";
import jsx from "lume/plugins/jsx.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import validateHtml from "lume/plugins/validate_html.ts";
import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";
import { readConsoleDebugPolicy } from "./plugins/console_debug.ts";
import otelPlugin from "./plugins/otel.ts";

/** Console debug policy, read once at module init from `LUME_LOGS`. */
const consoleDebugPolicy = readConsoleDebugPolicy((name) => Deno.env.get(name));

type BuildData = {
  assetVersion: string;
  repositoryUrl?: string;
  swDebugLevel: "off" | "summary" | "verbose";
};

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
  const commitHash = runGitCommand(["rev-parse", "--short", "HEAD"]);
  const assetVersion = commitHash ?? crypto.randomUUID();
  const repositoryUrl = normalizeRepositoryUrl(
    runGitCommand(["config", "--get", "remote.origin.url"]),
  );
  const isServeTask = Deno.env.get("DENO_TASK_NAME") === "serve";
  const swDebugLevel = isServeTask ? consoleDebugPolicy.level : "off";

  return repositoryUrl
    ? {
      assetVersion,
      repositoryUrl,
      swDebugLevel,
    }
    : {
      assetVersion,
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
site.add("/scripts/anti-flash.js");
site.add("/scripts/feed-copy.js");
site.add("/scripts/sw-register.js");
site.add("/scripts/sw.js", "/sw.js");

// Copy XSLT stylesheets to the output as static assets.
site.add("/feed.xsl");
site.add("/sitemap.xsl");

// Minify client-side JavaScript with terser while preserving source maps.
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
site.use(
  lightningcss({
    options: {
      minify: true,
      targets: {
        chrome: 123 << 16,
        firefox: 120 << 16,
        safari: (17 << 16) | (5 << 8),
      },
    },
  }),
);

// Remove unused selectors after minification.
site.use(
  purgecss({
    options: {
      keyframes: true,
      variables: true,
    },
  }),
);

// Generate source-map sidecar files for processed CSS and JavaScript assets.
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
        sitemap: "https://normco.re/sitemap.xml",
      },
    ],
  }),
);

// Navigation tree: data.nav.menu(), data.nav.nextPage(), data.nav.previousPage()
site.use(nav());

// Validate generated HTML against html-validate recommended/document presets.
// Keep strict error reporting for common production issues while allowing
// framework-required patterns (quotes and doctype style) handled by defaults.
site.use(
  validateHtml({
    rules: {
      "require-sri": "off",
      "heading-level": "off",
    },
  }),
);

// Detect broken internal links, including hash anchors, and fail the build
// when invalid URLs are detected.
site.use(
  checkUrls({
    anchors: true,
    throw: true,
    ignore: ["/feed.xml", "/feed.json", "/sitemap.xml"],
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
