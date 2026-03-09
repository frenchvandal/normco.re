import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import baseLayout from "./base.tsx";

// ---------------------------------------------------------------------------
// No helpers are used by base.tsx after JSX migration.
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

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
    siteName?: string;
    author?: string;
    metas?: { site?: string; description?: string };
    build?: {
      assetVersion?: string;
      swDebugLevel?: "off" | "summary" | "verbose";
    };
  },
): Lume.Data {
  return {
    title: undefined,
    description: undefined,
    children: { __html: "<p>Page body.</p>" },
    url: "/",
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
      const html = await renderComponent(
        baseLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<title>normco.re</title>");
    });

    it('formats title as "<title> — normco.re"', async () => {
      const randomTitle = makeSentence(601);
      const html = await renderComponent(
        baseLayout(makeData({ title: randomTitle }), MOCK_HELPERS),
      );
      assertStringIncludes(html, `<title>${randomTitle} — normco.re</title>`);
    });
  });

  describe("meta description", () => {
    it("uses the default description when none is provided", async () => {
      const html = await renderComponent(
        baseLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, "Personal blog by Phiphi");
    });

    it("uses the provided description", async () => {
      const randomDescription = makeSentence(602);
      const html = await renderComponent(
        baseLayout(
          makeData({ description: randomDescription }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, randomDescription);
    });
  });

  describe("structure", () => {
    it("renders a valid HTML5 document", async () => {
      const html = await renderComponent(
        baseLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<!doctype html>");
      assertStringIncludes(
        html,
        '<html lang="en" data-color-mode="light" data-light-theme="light" data-dark-theme="dark">',
      );
    });

    it("includes core head and accessibility links", async () => {
      const html = await renderComponent(
        baseLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, 'href="/style.css?v=dev"');
      assertStringIncludes(
        html,
        '<script src="/scripts/anti-flash.js?v=dev"></script>',
      );
      assertStringIncludes(html, 'href="/feed.xml"');
      assertStringIncludes(html, 'href="/feed.json"');
      assertStringIncludes(
        html,
        'src="/scripts/sw-register.js?v=dev" data-asset-version="dev" data-sw-debug-level="off"',
      );
      assertStringIncludes(html, 'class="skip-link"');
      assertStringIncludes(html, "#main-content");
    });

    it("passes service-worker debug level to the register script", async () => {
      const html = await renderComponent(
        baseLayout(
          makeData({
            build: { assetVersion: "abc123", swDebugLevel: "verbose" },
          }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(
        html,
        'src="/scripts/sw-register.js?v=abc123" data-asset-version="abc123" data-sw-debug-level="verbose"',
      );
    });

    it("injects the page content into <main>", async () => {
      const randomBody = makeSentence(603);
      const html = await renderComponent(
        baseLayout(
          makeData({ children: { __html: `<p>${randomBody}</p>` } }),
          MOCK_HELPERS,
        ),
      );
      assertStringIncludes(html, `<p>${randomBody}</p>`);
    });

    it("renders the mocked Header and Footer", async () => {
      const html = await renderComponent(
        baseLayout(makeData({}), MOCK_HELPERS),
      );
      assertStringIncludes(html, "<header>mock</header>");
      assertStringIncludes(html, "<footer>mock</footer>");
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

      await renderComponent(baseLayout(data, MOCK_HELPERS));
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

      await renderComponent(baseLayout(data, MOCK_HELPERS));
      assertStringIncludes(receivedUrl, "/");
    });
  });
});
