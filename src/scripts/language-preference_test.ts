import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./language-preference.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

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
  const script = window.document.createElement("script");
  script.dataset.supportedLanguages = "en,fr,zhHans,zhHant";
  script.dataset.defaultLanguage = "en";
  script.dataset.currentLanguage = "en";
  script.dataset.languageAlternates = JSON.stringify({
    en: "/",
    fr: "/fr/",
  });
  script.textContent = SCRIPT_SOURCE;
  window.document.body.append(script);
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

describe("language-preference.js", () => {
  it("redirects the root route to the stored preferred language", () => {
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
      window.close();
    }
  });

  it("does not redirect non-root routes even when a different language is preferred", () => {
    const dom = createDom("/about/");
    const window = dom.window;
    try {
      const navigationCalls = captureNavigation(window);
      window.localStorage.setItem("preferred-language", "fr");

      installScript(window);

      assertEquals(navigationCalls, []);
    } finally {
      window.close();
    }
  });
});
