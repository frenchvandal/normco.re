import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import baseLayout from "./base.tsx";

// ---------------------------------------------------------------------------
// Minimal mock helpers satisfying the `H` interface used inside base.ts.
// ---------------------------------------------------------------------------
const MOCK_HELPERS = {
  attr: (attrs: Record<string, unknown>): string =>
    Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" "),
} as unknown as Lume.Helpers;

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

/** Builds a minimal Lume.Data mock for the base layout. */
function makeData(
  overrides: {
    title?: string;
    description?: string;
    content?: string;
    url?: string;
  },
): Lume.Data {
  return {
    title: undefined,
    description: undefined,
    content: "<p>Page body.</p>",
    url: "/",
    comp: {
      Header: (_props: unknown) => Promise.resolve("<header>mock</header>"),
      Footer: (_props: unknown) => Promise.resolve("<footer>mock</footer>"),
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
      const html = await baseLayout(makeData({}), MOCK_HELPERS);
      assertStringIncludes(html, "<title>normco.re</title>");
    });

    it('formats title as "<title> — normco.re"', async () => {
      const html = await baseLayout(
        makeData({ title: "My Post" }),
        MOCK_HELPERS,
      );
      assertStringIncludes(html, "<title>My Post — normco.re</title>");
    });
  });

  describe("meta description", () => {
    it("uses the default description when none is provided", async () => {
      const html = await baseLayout(makeData({}), MOCK_HELPERS);
      assertStringIncludes(html, "Personal blog by Phiphi");
    });

    it("uses the provided description", async () => {
      const html = await baseLayout(
        makeData({ description: "A custom description." }),
        MOCK_HELPERS,
      );
      assertStringIncludes(html, "A custom description.");
    });
  });

  describe("structure", () => {
    it("renders a valid HTML5 document", async () => {
      const html = await baseLayout(makeData({}), MOCK_HELPERS);
      assertStringIncludes(html, "<!doctype html>");
      assertStringIncludes(html, '<html lang="en">');
    });

    it("includes core head and accessibility links", async () => {
      const html = await baseLayout(makeData({}), MOCK_HELPERS);
      assertStringIncludes(html, 'href="/style.css"');
      assertStringIncludes(html, '<script src="/anti-flash.js"></script>');
      assertStringIncludes(html, 'href="/feed.xml"');
      assertStringIncludes(html, 'href="/feed.json"');
      assertStringIncludes(html, '<script src="/sw-register.js"></script>');
      assertStringIncludes(html, 'id="sw-update-toast"');
      assertStringIncludes(html, 'class="skip-link"');
      assertStringIncludes(html, "#main-content");
    });

    it("injects the page content into <main>", async () => {
      const html = await baseLayout(
        makeData({ content: "<p>Injected.</p>" }),
        MOCK_HELPERS,
      );
      assertStringIncludes(html, "<p>Injected.</p>");
    });

    it("renders the mocked Header and Footer", async () => {
      const html = await baseLayout(makeData({}), MOCK_HELPERS);
      assertStringIncludes(html, "<header>mock</header>");
      assertStringIncludes(html, "<footer>mock</footer>");
    });

    it("passes the current URL to the Header component", async () => {
      let receivedUrl = "";
      const data = {
        title: undefined,
        description: undefined,
        content: "",
        url: "/about/",
        comp: {
          Header: (props: Record<string, unknown>) => {
            receivedUrl = props["currentUrl"] as string;
            return Promise.resolve("");
          },
          Footer: (_props: unknown) => Promise.resolve(""),
        },
      } as unknown as Lume.Data;

      await baseLayout(data, MOCK_HELPERS);
      assertStringIncludes(receivedUrl, "/about/");
    });

    it('falls back to "/" when url is absent from data', async () => {
      let receivedUrl = "";
      // Omit `url` from the data object to exercise the `url ?? "/"` branch.
      const data = {
        title: undefined,
        description: undefined,
        content: "",
        comp: {
          Header: (props: Record<string, unknown>) => {
            receivedUrl = props["currentUrl"] as string;
            return Promise.resolve("");
          },
          Footer: (_props: unknown) => Promise.resolve(""),
        },
      } as unknown as Lume.Data;

      await baseLayout(data, MOCK_HELPERS);
      assertStringIncludes(receivedUrl, "/");
    });
  });
});
