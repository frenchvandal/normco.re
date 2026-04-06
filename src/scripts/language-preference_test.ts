import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./language-preference.js" with { type: "text" };
import { getJSDOM, installClassicScript } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"];
type NavigationDetail = {
  kind: "assign" | "replace";
  targetUrl: string;
};

function createDom(pathname: string): InstanceType<typeof JSDOM> {
  return new JSDOM(
    '<!doctype html><html lang="en"><body></body></html>',
    {
      pretendToBeVisual: true,
      runScripts: "dangerously",
      url: `https://normco.re${pathname}`,
    },
  );
}

function installScript(window: TestWindow) {
  installClassicScript(window, SCRIPT_SOURCE, {
    supportedLanguages: "en,fr,zhHans,zhHant",
    defaultLanguage: "en",
    currentLanguage: "en",
    languageAlternates: JSON.stringify({
      en: "/",
      fr: "/fr/",
    }),
  });
}

function captureNavigation(window: TestWindow): NavigationDetail[] {
  const navigationCalls: NavigationDetail[] = [];

  window.document.addEventListener(
    "site:language-navigation",
    (event: Event) => {
      if (!(event instanceof window.CustomEvent)) {
        return;
      }

      const navigationEvent = event as CustomEvent<NavigationDetail>;
      navigationCalls.push(navigationEvent.detail);
      event.preventDefault();
    },
  );

  return navigationCalls;
}

async function flush(window: TestWindow, cycles = 2) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

describe("language-preference.js", () => {
  it("redirects the root route to the stored preferred language", async () => {
    const dom = createDom("/");
    const window = dom.window;
    try {
      const navigationCalls = captureNavigation(window);
      window.localStorage.setItem("preferred-language", "fr");

      installScript(window);

      assertEquals(navigationCalls.length, 1);
      assertEquals(navigationCalls[0]?.kind, "replace");
      assertEquals(navigationCalls[0]?.targetUrl, "/fr/");
    } finally {
      await flush(window);
      window.close();
    }
  });

  it("does not redirect non-root routes even when a different language is preferred", async () => {
    const dom = createDom("/about/");
    const window = dom.window;
    try {
      const navigationCalls = captureNavigation(window);
      window.localStorage.setItem("preferred-language", "fr");

      installScript(window);

      assertEquals(navigationCalls, []);
    } finally {
      await flush(window);
      window.close();
    }
  });

  it("preserves the root query string and hash during language redirect", async () => {
    const dom = createDom("/?utm_source=test#intro");
    const window = dom.window;
    try {
      const navigationCalls = captureNavigation(window);
      window.localStorage.setItem("preferred-language", "fr");

      installScript(window);

      assertEquals(navigationCalls.length, 1);
      assertEquals(navigationCalls[0]?.kind, "replace");
      assertEquals(navigationCalls[0]?.targetUrl, "/fr/?utm_source=test#intro");
    } finally {
      await flush(window);
      window.close();
    }
  });
});
