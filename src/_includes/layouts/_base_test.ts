import { assertMatch, assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../../test/faker.ts";
import { asLumeData, asLumeHelpers } from "../../../test/lume.ts";

import baseLayout from "./base.tsx";
import { THEME_BOOTSTRAP_SCRIPT } from "../../utils/theme-bootstrap.ts";

const MOCK_HELPERS = asLumeHelpers({});

async function renderBase(data: Lume.Data): Promise<string> {
  return await renderComponent(await baseLayout(data, MOCK_HELPERS));
}

function makeSentence(seed: number): string {
  seedTestFaker(seed);
  return faker.lorem.sentence({ min: 3, max: 7 });
}

function makeData(
  overrides: {
    title?: string;
    description?: string;
    extraStylesheets?: string[];
    children?: { __html: string };
    afterMainContent?: { __html: string };
    url?: string;
    unlisted?: boolean;
    siteName?: string;
    siteOrigin?: string;
    author?: string;
    metas?: { site?: string; description?: string };
    siteChrome?: {
      faviconIcoUrl?: string;
      faviconSvgUrl?: string;
      appleTouchIconUrl?: string;
      themeColorLight?: string;
      themeColorDark?: string;
    };
    build?: {
      swDebugLevel?: "off" | "summary" | "verbose";
    };
  },
): Lume.Data {
  return asLumeData({
    title: undefined,
    description: undefined,
    children: { __html: "<p>Page body.</p>" },
    afterMainContent: undefined,
    url: "/",
    unlisted: false,
    siteName: "PhiPhi’s Bizarre Aventure",
    siteOrigin: "https://normco.re",
    author: "Phiphi",
    metas: {
      site: "PhiPhi’s Bizarre Aventure",
      description: "Personal blog by Phiphi, based in Chengdu, China.",
    },
    siteChrome: {
      faviconIcoUrl: "/favicon.ico",
      faviconSvgUrl: "/favicon.svg",
      appleTouchIconUrl: "/apple-touch-icon.png",
      themeColorLight: "#ffffff",
      themeColorDark: "#262626",
    },
    comp: {
      Header: (_props: unknown) => "<header>mock</header>",
      Footer: (_props: unknown) => "<footer>mock</footer>",
    },
    ...overrides,
  });
}

describe("base.tsx layout", () => {
  describe("page title", () => {
    it('renders "PhiPhi’s Bizarre Aventure" when no title is provided', async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "<title>PhiPhi’s Bizarre Aventure</title>");
    });

    it('formats title as "<title> - PhiPhi"', async () => {
      const randomTitle = makeSentence(601);
      const html = await renderBase(makeData({ title: randomTitle }));
      assertStringIncludes(
        html,
        `<title>${randomTitle} - PhiPhi</title>`,
      );
    });

    it("does not duplicate the site name when title already matches it", async () => {
      const html = await renderBase(makeData({
        title: "PhiPhi’s Bizarre Aventure",
      }));
      assertStringIncludes(html, "<title>PhiPhi’s Bizarre Aventure</title>");
    });
  });

  describe("meta description", () => {
    it("uses the default description when none is provided", async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "Personal blog by Phiphi");
    });

    it("uses the provided description", async () => {
      const randomDescription = makeSentence(602);
      const html = await renderBase(
        makeData({ description: randomDescription }),
      );
      assertStringIncludes(html, randomDescription);
    });
  });

  describe("structure", () => {
    it("renders a valid HTML5 document", async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "<!doctype html>");
      assertStringIncludes(
        html,
        '<html lang="en" data-color-mode="light">',
      );
    });

    it("includes core head and accessibility links", async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, 'href="/style.css"');
      assertStringIncludes(
        html,
        '<meta name="color-scheme" content="light dark">',
      );
      assertStringIncludes(
        html,
        'name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"',
      );
      assertStringIncludes(
        html,
        'name="theme-color" content="#262626" media="(prefers-color-scheme: dark)"',
      );
      assertStringIncludes(
        html,
        'rel="manifest" href="/manifest.webmanifest" type="application/manifest+json"',
      );
      assertStringIncludes(
        html,
        'rel="canonical" href="https://normco.re/"',
      );
      assertStringIncludes(
        html,
        'rel="icon" href="/favicon.ico" sizes="48x48"',
      );
      assertStringIncludes(
        html,
        'rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any"',
      );
      assertStringIncludes(
        html,
        'rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"',
      );
      assertStringIncludes(
        html,
        'data-supported-languages="en,fr,zhHans,zhHant"',
      );
      assertStringIncludes(
        html,
        `<script>${THEME_BOOTSTRAP_SCRIPT}</script>`,
      );
      assertStringIncludes(
        html,
        "const currentScript = globalThis.document.currentScript;",
      );
      assertStringIncludes(
        html,
        "data-view-transition-name",
      );
      assertStringIncludes(
        html,
        "view-transition-name",
      );
      assertStringIncludes(html, 'href="/rss.xml"');
      assertStringIncludes(html, 'href="/atom.xml"');
      assertStringIncludes(html, 'href="/feed.json"');
      assertStringIncludes(
        html,
        'loadModule("/scripts/header-client.js")',
      );
      assertStringIncludes(
        html,
        'loadScript("/scripts/sw-register.js"',
      );
      assertStringIncludes(
        html,
        'swUrl: "/sw.js"',
      );
      assertStringIncludes(
        html,
        'swDebugLevel: "off"',
      );
      assertStringIncludes(
        html,
        '"/scripts/link-prefetch-intent.js"',
      );
      assertStringIncludes(
        html,
        '<script type="speculationrules" data-adaptive="prefetch">',
      );
      assertStringIncludes(
        html,
        '"eagerness":"conservative"',
      );
      assertStringIncludes(html, 'class="skip-link"');
      assertStringIncludes(html, "#main-content");
    });

    it("uses a route-scoped critical stylesheet before deferring /style.css", async () => {
      const html = await renderBase(makeData({}));

      assertMatch(
        html,
        /<link[^>]*rel="stylesheet"[^>]*href="\/critical\/home\.css"[^>]*fetchpriority="high"/,
      );
      assertMatch(
        html,
        /href="\/critical\/home\.css"[\s\S]*<link[^>]*rel="preload"[^>]*href="\/style\.css"[^>]*as="style"/,
      );
      assertNotMatch(html, /<style>[\s\S]*--ph-font-measure[\s\S]*<\/style>/);
    });

    it("keeps route-level above-the-fold styles render-blocking on deferred routes", async () => {
      const html = await renderBase(makeData({
        url: "/posts/lorem-ipsum/",
        extraStylesheets: ["/styles/blog-antd.css"],
      }));

      assertStringIncludes(html, 'href="/style.css"');
      assertStringIncludes(html, 'href="/styles/blog-antd.css"');
      assertMatch(
        html,
        /href="\/critical\/post\.css".*href="\/styles\/blog-antd\.css".*href="\/style\.css"/,
      );
      assertMatch(
        html,
        /<link[^>]*rel="preload"[^>]*href="\/style\.css"[^>]*as="style"/,
      );
      assertMatch(
        html,
        /<noscript>\s*<link rel="stylesheet" href="\/style\.css"/,
      );
      assertMatch(
        html,
        /href="\/styles\/blog-antd\.css"[^>]*fetchpriority="high"/,
      );
    });

    it("extends route-scoped critical CSS to the about page", async () => {
      const html = await renderBase(makeData({
        url: "/about/",
      }));

      assertMatch(
        html,
        /<link[^>]*rel="stylesheet"[^>]*href="\/critical\/about\.css"[^>]*fetchpriority="high"/,
      );
      assertMatch(
        html,
        /href="\/critical\/about\.css"[\s\S]*<link[^>]*rel="preload"[^>]*href="\/style\.css"[^>]*as="style"/,
      );
    });

    it("extends route-scoped critical CSS to the syndication page", async () => {
      const html = await renderBase(makeData({
        url: "/syndication/",
      }));

      assertMatch(
        html,
        /<link[^>]*rel="stylesheet"[^>]*href="\/critical\/syndication\.css"[^>]*fetchpriority="high"/,
      );
      assertMatch(
        html,
        /href="\/critical\/syndication\.css"[\s\S]*<link[^>]*rel="preload"[^>]*href="\/style\.css"[^>]*as="style"/,
      );
    });

    it("keeps /style.css render-blocking on routes without critical coverage", async () => {
      const html = await renderBase(makeData({
        url: "/offline/",
      }));

      assertMatch(
        html,
        /<link[^>]*rel="stylesheet"[^>]*href="\/style\.css"[^>]*fetchpriority="high"/,
      );
      assertNotMatch(html, /href="\/critical\//);
      assertNotMatch(html, /rel="preload"[^>]*href="\/style\.css"/);
    });

    it("keeps the Pretext probe on the conservative blocking stylesheet path", async () => {
      const html = await renderBase(makeData({
        url: "/pretext/probe/",
        extraStylesheets: ["/styles/blog-antd.css"],
      }));

      assertMatch(
        html,
        /<link[^>]*rel="stylesheet"[^>]*href="\/style\.css"[^>]*fetchpriority="high"/,
      );
      assertMatch(
        html,
        /href="\/styles\/blog-antd\.css"[^>]*fetchpriority="high"/,
      );
      assertNotMatch(html, /href="\/critical\//);
      assertNotMatch(html, /rel="preload"[^>]*href="\/style\.css"/);
    });

    it("passes service-worker debug level to the register script", async () => {
      const html = await renderBase(makeData({
        build: { swDebugLevel: "verbose" },
      }));
      assertStringIncludes(
        html,
        'loadScript("/scripts/sw-register.js"',
      );
      assertStringIncludes(
        html,
        'swUrl: "/sw.js"',
      );
      assertStringIncludes(
        html,
        'swDebugLevel: "verbose"',
      );
    });

    it("skips link-prefetch script on post detail routes", async () => {
      const html = await renderBase(makeData({
        url: "/posts/sample-post/",
      }));
      assertNotMatch(html, /"\/scripts\/link-prefetch-intent\.js"/);
      assertNotMatch(html, /type="speculationrules"/);
    });

    it("skips link-prefetch script on localized posts archive routes", async () => {
      const html = await renderBase(makeData({
        url: "/fr/posts/",
      }));
      assertNotMatch(html, /"\/scripts\/link-prefetch-intent\.js"/);
      assertNotMatch(html, /type="speculationrules"/);
    });

    it("injects the page content into <main>", async () => {
      const randomBody = makeSentence(603);
      const html = await renderBase(
        makeData({ children: { __html: `<p>${randomBody}</p>` } }),
      );
      assertStringIncludes(html, `<p>${randomBody}</p>`);
      assertStringIncludes(html, 'id="main-content" data-pagefind-body=""');
    });

    it("renders optional after-main content outside <main>", async () => {
      const html = await renderBase(
        makeData({
          afterMainContent: { __html: '<div class="floating-ui">Float</div>' },
        }),
      );

      assertMatch(
        html,
        /<\/main><div class="floating-ui">Float<\/div><footer>/,
      );
    });

    it("omits `data-pagefind-body` on unlisted pages", async () => {
      const html = await renderBase(makeData({ unlisted: true }));
      assertNotMatch(html, /data-pagefind-body=""/);
    });

    it("adds a noindex robots meta to unlisted pages and omits canonical", async () => {
      const html = await renderBase(makeData({ unlisted: true }));
      assertStringIncludes(html, 'name="robots" content="noindex"');
      assertNotMatch(html, /rel="canonical"/);
    });

    it("renders the mocked Header and Footer", async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "<header>mock</header>");
      assertStringIncludes(html, "<footer>mock</footer>");
    });

    it("awaits async Header and Footer components", async () => {
      const html = await renderBase(
        asLumeData({
          ...makeData({}),
          comp: {
            Header: (_props: unknown) =>
              Promise.resolve("<header>async mock</header>"),
            Footer: (_props: unknown) =>
              Promise.resolve("<footer>async mock</footer>"),
          },
        }),
      );

      assertStringIncludes(html, "<header>async mock</header>");
      assertStringIncludes(html, "<footer>async mock</footer>");
    });

    it("falls back to an empty shell when Header and Footer are unavailable", async () => {
      const html = await renderBase(
        asLumeData({
          ...makeData({}),
          comp: {},
        }),
      );

      assertStringIncludes(html, '<div class="site-wrapper">');
      assertStringIncludes(html, "<main");
      assertNotMatch(html, /<header>mock<\/header>/);
      assertNotMatch(html, /<footer>mock<\/footer>/);
    });

    it("passes the current URL to the Header component", async () => {
      let receivedUrl = "";
      const data = asLumeData({
        title: undefined,
        description: undefined,
        children: { __html: "" },
        url: "/about/",
        comp: {
          Header: (props: Record<string, unknown>) => {
            receivedUrl = props["currentUrl"] as string;
            return "";
          },
          Footer: (_props: unknown) => "",
        },
      });

      await renderBase(data);
      assertStringIncludes(receivedUrl, "/about/");
    });

    it('falls back to "/" when url is absent from data', async () => {
      let receivedUrl = "";
      // Omit `url` from the data object to exercise the `url ?? "/"` branch.
      const data = asLumeData({
        title: undefined,
        description: undefined,
        children: { __html: "" },
        comp: {
          Header: (props: Record<string, unknown>) => {
            receivedUrl = props["currentUrl"] as string;
            return "";
          },
          Footer: (_props: unknown) => "",
        },
      });

      await renderBase(data);
      assertStringIncludes(receivedUrl, "/");
    });
  });
});
