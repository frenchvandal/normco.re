import { assertEquals, assertExists, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { AdaptivePrefetch } from "./adaptive-prefetch.js";
import { getJSDOM } from "../../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  HTMLScriptElement: typeof HTMLScriptElement & {
    supports?: (type: string) => boolean;
  };
};

function createDom(rules: string): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <head>
        <script type="speculationrules" data-adaptive="prefetch">${rules}</script>
      </head>
      <body></body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/",
    },
  );
}

function enableSpeculationRules(window: TestWindow): () => void {
  const originalSupports = window.HTMLScriptElement.supports;
  window.HTMLScriptElement.supports = (type: string) =>
    type === "speculationrules";

  return () => {
    window.HTMLScriptElement.supports = originalSupports;
  };
}

describe("adaptive-prefetch.js", () => {
  it("replaces processed speculation rules scripts instead of mutating them", () => {
    const originalRules = JSON.stringify({
      prefetch: [{
        where: { selector_matches: "a[href^='/']" },
        eagerness: "conservative",
      }],
    });
    const dom = createDom(originalRules);
    const window = dom.window as TestWindow;
    const restoreSupports = enableSpeculationRules(window);

    try {
      Object.defineProperty(window.navigator, "connection", {
        configurable: true,
        value: { saveData: false, effectiveType: "4g" },
      });
      Object.defineProperty(window.navigator, "deviceMemory", {
        configurable: true,
        value: 4,
      });

      const originalScript = window.document.querySelector(
        'script[type="speculationrules"][data-adaptive]',
      );
      assertExists(originalScript);

      const scheduler = new AdaptivePrefetch(
        window as unknown as Window & typeof globalThis,
      );

      const nextScript = window.document.querySelector(
        'script[type="speculationrules"][data-adaptive]',
      );
      assertExists(nextScript);
      assertNotEquals(nextScript, originalScript);
      assertEquals(
        nextScript.textContent,
        JSON.stringify({
          prefetch: [{
            where: { selector_matches: "a[href^='/']" },
            eagerness: "moderate",
          }],
        }),
      );
      assertEquals(
        window.document.head.querySelectorAll(
          'script[type="speculationrules"][data-adaptive]',
        ).length,
        1,
      );

      scheduler.destroy();
    } finally {
      restoreSupports();
      window.close();
    }
  });

  it("keeps the existing speculation rules script when the rules are unchanged", () => {
    const originalRules = JSON.stringify({
      prefetch: [{
        where: { selector_matches: "a[href^='/']" },
        eagerness: "conservative",
      }],
    });
    const dom = createDom(originalRules);
    const window = dom.window as TestWindow;
    const restoreSupports = enableSpeculationRules(window);

    try {
      Object.defineProperty(window.navigator, "connection", {
        configurable: true,
        value: { saveData: false, effectiveType: "4g" },
      });

      const originalScript = window.document.querySelector(
        'script[type="speculationrules"][data-adaptive]',
      );
      assertExists(originalScript);

      const scheduler = new AdaptivePrefetch(
        window as unknown as Window & typeof globalThis,
      );

      const nextScript = window.document.querySelector(
        'script[type="speculationrules"][data-adaptive]',
      );
      assertEquals(nextScript, originalScript);

      scheduler.destroy();
    } finally {
      restoreSupports();
      window.close();
    }
  });
});
