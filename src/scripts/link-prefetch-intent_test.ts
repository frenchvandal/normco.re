import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { bindLinkPrefetchIntent } from "./link-prefetch-intent.js";
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  fetch(input: string | URL, init?: RequestInit): Promise<Response>;
};

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <a id="internal" href="/about/">About</a>
        <a id="asset" href="/style.css">Style</a>
        <a id="external" href="https://example.com/">External</a>
        <a id="hash" href="/#section">Hash</a>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/",
    },
  );
}

function bindScript(window: TestWindow) {
  bindLinkPrefetchIntent(window as Window & typeof globalThis);
}

async function flush(window: TestWindow, cycles = 2) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

describe("link-prefetch-intent.js", () => {
  it("skips initialization when save-data is enabled", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      const fetchedUrls: string[] = [];

      Object.defineProperty(window.navigator, "connection", {
        configurable: true,
        value: { saveData: true },
      });
      window.fetch = (input: string | URL) => {
        fetchedUrls.push(String(input));
        return Promise.resolve(new Response("", { status: 200 }));
      };

      bindScript(window);
      const internalLink = window.document.getElementById("internal");
      assertExists(internalLink, "Expected internal link fixture to exist.");
      internalLink.dispatchEvent(new window.MouseEvent("mouseenter"));

      assertEquals(fetchedUrls, []);
    } finally {
      window.close();
    }
  });

  it("uses an idle-only budget by default and prefetches only same-origin documents", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const originalSupports = window.DOMTokenList.prototype.supports;
    const originalFetch = globalThis.fetch;
    try {
      const fetchedUrls: string[] = [];
      const fetchSignals: AbortSignal[] = [];

      window.DOMTokenList.prototype.supports = function (token: string) {
        if (token === "prefetch") {
          return false;
        }

        return typeof originalSupports === "function"
          ? originalSupports.call(this, token)
          : false;
      };
      Object.defineProperty(window.navigator, "connection", {
        configurable: true,
        value: { saveData: false, effectiveType: "4g" },
      });
      window.requestIdleCallback = (idleCallback: IdleRequestCallback) => {
        idleCallback({
          didTimeout: false,
          timeRemaining: () => 10,
        });
        return 1;
      };
      window.fetch = (input: string | URL, init?: RequestInit) => {
        fetchedUrls.push(String(input));
        if (init?.signal != null) {
          fetchSignals.push(init.signal);
        }
        return Promise.resolve(new Response("", { status: 200 }));
      };
      globalThis.fetch = window.fetch as typeof globalThis.fetch;

      bindScript(window);
      await flush(window);

      assertEquals(fetchedUrls, ["https://normco.re/about/"]);
      assertEquals(fetchSignals.length, 1);
      assertEquals(fetchSignals[0]?.aborted, false);
    } finally {
      globalThis.fetch = originalFetch;
      window.DOMTokenList.prototype.supports = originalSupports;
      window.close();
    }
  });

  it("upgrades to normal mode on capable devices and prefetches focus intent without idle work", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const originalSupports = window.DOMTokenList.prototype.supports;
    const originalFetch = globalThis.fetch;
    try {
      const fetchedUrls: string[] = [];

      window.DOMTokenList.prototype.supports = function (token: string) {
        if (token === "prefetch") {
          return false;
        }

        return typeof originalSupports === "function"
          ? originalSupports.call(this, token)
          : false;
      };
      Object.defineProperty(window.navigator, "connection", {
        configurable: true,
        value: { saveData: false, effectiveType: "4g" },
      });
      Object.defineProperty(window.navigator, "deviceMemory", {
        configurable: true,
        value: 4,
      });
      window.requestIdleCallback = () => 1;
      window.fetch = (input: string | URL) => {
        fetchedUrls.push(String(input));
        return Promise.resolve(new Response("", { status: 200 }));
      };
      globalThis.fetch = window.fetch as typeof globalThis.fetch;

      bindScript(window);

      const internalLink = window.document.getElementById("internal");
      const assetLink = window.document.getElementById("asset");
      const externalLink = window.document.getElementById("external");
      const hashLink = window.document.getElementById("hash");
      assertExists(internalLink, "Expected internal link fixture to exist.");
      assertExists(assetLink, "Expected asset link fixture to exist.");
      assertExists(externalLink, "Expected external link fixture to exist.");
      assertExists(hashLink, "Expected hash link fixture to exist.");

      internalLink.dispatchEvent(
        new window.FocusEvent("focusin", { bubbles: true }),
      );
      assetLink.dispatchEvent(
        new window.FocusEvent("focusin", { bubbles: true }),
      );
      externalLink.dispatchEvent(
        new window.FocusEvent("focusin", { bubbles: true }),
      );
      hashLink.dispatchEvent(
        new window.FocusEvent("focusin", { bubbles: true }),
      );
      await flush(window);

      assertEquals(fetchedUrls, ["https://normco.re/about/"]);
    } finally {
      globalThis.fetch = originalFetch;
      window.DOMTokenList.prototype.supports = originalSupports;
      window.close();
    }
  });
});
