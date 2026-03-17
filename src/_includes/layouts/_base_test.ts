import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import baseLayout from "./base.tsx";

// ---------------------------------------------------------------------------
// No helpers are used by base.tsx after JSX migration.
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

async function renderBase(data: Lume.Data): Promise<string> {
  return await renderComponent(await baseLayout(data, MOCK_HELPERS));
}

function makeSentence(seed: number): string {
  faker.seed(seed);
  return faker.lorem.sentence({ min: 3, max: 7 });
}

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

/** Builds a minimal Lume.Data mock for the base layout. */
function makeData(
  overrides: {
    title?: string;
    description?: string;
    children?: { __html: string };
    url?: string;
    unlisted?: boolean;
    siteName?: string;
    author?: string;
    metas?: { site?: string; description?: string };
    build?: {
      swDebugLevel?: "off" | "summary" | "verbose";
    };
  },
): Lume.Data {
  return {
    title: undefined,
    description: undefined,
    children: { __html: "<p>Page body.</p>" },
    url: "/",
    unlisted: false,
    siteName: "normco.re",
    author: "Phiphi",
    metas: {
      site: "normco.re",
      description: "Personal blog by Phiphi, based in Chengdu, China.",
    },
    comp: {
      Header: (_props: unknown) => "<header>mock</header>",
      Footer: (_props: unknown) => "<footer>mock</footer>",
    },
    ...overrides,
  } as unknown as Lume.Data;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("base.tsx layout", () => {
  describe("page title", () => {
    it('renders "normco.re" when no title is provided', async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "<title>normco.re</title>");
    });

    it('formats title as "<title> - normco.re"', async () => {
      const randomTitle = makeSentence(601);
      const html = await renderBase(makeData({ title: randomTitle }));
      assertStringIncludes(html, `<title>${randomTitle} - normco.re</title>`);
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
        '<html lang="en" data-color-mode="light" data-light-theme="light" data-dark-theme="dark">',
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
        'src="/scripts/language-preference.js"',
      );
      assertStringIncludes(
        html,
        '<script src="/scripts/anti-flash.js"></script>',
      );
      assertStringIncludes(html, 'href="/feed.xml"');
      assertStringIncludes(html, 'href="/atom.xml"');
      assertStringIncludes(html, 'href="/feed.json"');
      assertStringIncludes(
        html,
        'src="/scripts/sw-register.js"',
      );
      assertStringIncludes(
        html,
        'src="/scripts/header-tooltips.js"',
      );
      assertStringIncludes(
        html,
        'data-sw-url="/sw.js"',
      );
      assertStringIncludes(
        html,
        'data-sw-debug-level="off"',
      );
      assertStringIncludes(
        html,
        'src="/scripts/link-prefetch-intent.js"',
      );
      assertStringIncludes(html, 'class="skip-link"');
      assertStringIncludes(html, "#main-content");
    });

    it("passes service-worker debug level to the register script", async () => {
      const html = await renderBase(makeData({
        build: { swDebugLevel: "verbose" },
      }));
      assertStringIncludes(
        html,
        'src="/scripts/sw-register.js"',
      );
      assertStringIncludes(
        html,
        'data-sw-url="/sw.js"',
      );
      assertStringIncludes(
        html,
        'data-sw-debug-level="verbose"',
      );
    });

    it("skips link-prefetch script on post detail routes", async () => {
      const html = await renderBase(makeData({
        url: "/posts/sample-post/",
      }));
      assertNotMatch(html, /src="\/scripts\/link-prefetch-intent\.js"/);
    });

    it("skips link-prefetch script on localized posts archive routes", async () => {
      const html = await renderBase(makeData({
        url: "/fr/posts/",
      }));
      assertNotMatch(html, /src="\/scripts\/link-prefetch-intent\.js"/);
    });

    it("injects the page content into <main>", async () => {
      const randomBody = makeSentence(603);
      const html = await renderBase(
        makeData({ children: { __html: `<p>${randomBody}</p>` } }),
      );
      assertStringIncludes(html, `<p>${randomBody}</p>`);
      assertStringIncludes(html, 'id="main-content" data-pagefind-body=""');
    });

    it("omits `data-pagefind-body` on unlisted pages", async () => {
      const html = await renderBase(makeData({ unlisted: true }));
      assertNotMatch(html, /data-pagefind-body=""/);
    });

    it("renders the mocked Header and Footer", async () => {
      const html = await renderBase(makeData({}));
      assertStringIncludes(html, "<header>mock</header>");
      assertStringIncludes(html, "<footer>mock</footer>");
    });

    it("awaits async Header and Footer components", async () => {
      const html = await renderBase(
        {
          ...makeData({}),
          comp: {
            Header: async (_props: unknown) => "<header>async mock</header>",
            Footer: async (_props: unknown) => "<footer>async mock</footer>",
          },
        } as unknown as Lume.Data,
      );

      assertStringIncludes(html, "<header>async mock</header>");
      assertStringIncludes(html, "<footer>async mock</footer>");
    });

    it("falls back to an empty shell when Header and Footer are unavailable", async () => {
      const html = await renderBase(
        {
          ...makeData({}),
          comp: {},
        } as unknown as Lume.Data,
      );

      assertStringIncludes(html, '<div class="site-wrapper">');
      assertStringIncludes(html, "<main");
      assertNotMatch(html, /<header>mock<\/header>/);
      assertNotMatch(html, /<footer>mock<\/footer>/);
    });

    it("passes the current URL to the Header component", async () => {
      let receivedUrl = "";
      const data = {
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
      } as unknown as Lume.Data;

      await renderBase(data);
      assertStringIncludes(receivedUrl, "/about/");
    });

    it('falls back to "/" when url is absent from data', async () => {
      let receivedUrl = "";
      // Omit `url` from the data object to exercise the `url ?? "/"` branch.
      const data = {
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
      } as unknown as Lume.Data;

      await renderBase(data);
      assertStringIncludes(receivedUrl, "/");
    });
  });
});
