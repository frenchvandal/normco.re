import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./theme-toggle.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestMediaQueryList = MediaQueryList & {
  setMatches(nextMatches: boolean): void;
};

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  matchMedia(query: string): TestMediaQueryList;
};

function createMediaQueryList(matches = false): TestMediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    media: "(prefers-color-scheme: dark)",
    matches,
    onchange: null,
    addListener(listener: (event: MediaQueryListEvent) => void) {
      listeners.add(listener);
    },
    removeListener(listener: (event: MediaQueryListEvent) => void) {
      listeners.delete(listener);
    },
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (type !== "change" || typeof listener !== "function") {
        return;
      }

      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (type !== "change" || typeof listener !== "function") {
        return;
      }

      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    dispatchEvent() {
      return true;
    },
    setMatches(nextMatches: boolean) {
      mediaQuery.matches = nextMatches;
      const event = {
        matches: nextMatches,
        media: mediaQuery.media,
      } as MediaQueryListEvent;

      for (const listener of listeners) {
        listener(event);
      }
    },
  };

  return mediaQuery as TestMediaQueryList;
}

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <button
          id="theme-toggle"
          type="button"
          data-label-switch-light="Switch to light theme"
          data-label-switch-dark="Switch to dark theme"
          data-label-follow-system="Follow system theme"
        >
          Toggle
        </button>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

function getToggleButton(window: TestWindow): HTMLButtonElement {
  const button = window.document.getElementById("theme-toggle");
  if (!(button instanceof window.HTMLButtonElement)) {
    throw new Error("Missing theme toggle button");
  }

  return button;
}

describe("theme-toggle.js", () => {
  it("cycles theme preference and keeps the title synchronized with the next action", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const mediaQuery = createMediaQueryList(false);
    window.matchMedia = () => mediaQuery;

    evaluateScript(window);

    const button = getToggleButton(window);
    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "system",
    );
    assertEquals(button.getAttribute("aria-label"), "Switch to light theme");
    assertEquals(button.getAttribute("title"), "Switch to light theme");

    button.click();

    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "light",
    );
    assertEquals(
      window.document.documentElement.getAttribute("data-color-mode"),
      "light",
    );
    assertEquals(button.getAttribute("aria-label"), "Switch to dark theme");
    assertEquals(button.getAttribute("title"), "Switch to dark theme");

    button.click();

    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "dark",
    );
    assertEquals(button.getAttribute("title"), "Follow system theme");
  });

  it("does not double-bind the toggle when the script executes twice", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);

    evaluateScript(window);
    evaluateScript(window);

    const button = getToggleButton(window);
    button.click();

    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "light",
    );
    assertEquals(button.dataset.themeToggleBound, "true");
  });
});
