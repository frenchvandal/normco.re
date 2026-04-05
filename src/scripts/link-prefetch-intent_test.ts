import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./link-prefetch-intent.js" with { type: "text" };
import { evaluateClassicScript, getJSDOM } from "../../test/jsdom.ts";

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

function evaluateScript(window: TestWindow) {
  evaluateClassicScript(window, SCRIPT_SOURCE);
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
    const fetchedUrls: string[] = [];

    Object.defineProperty(window.navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
    window.fetch = (input: string | URL) => {
      fetchedUrls.push(String(input));
      return Promise.resolve(new Response("", { status: 200 }));
    };

    evaluateScript(window);
    const internalLink = window.document.getElementById("internal");
    assertExists(internalLink, "Expected internal link fixture to exist.");
    internalLink.dispatchEvent(new window.MouseEvent("mouseenter"));

    assertEquals(fetchedUrls, []);
  });

  it("prefetches only same-origin document links after hover or focus intent", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const fetchedUrls: string[] = [];
    const fetchSignals: AbortSignal[] = [];

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

    evaluateScript(window);
    await flush(window);

    const internalLink = window.document.getElementById("internal");
    const assetLink = window.document.getElementById("asset");
    const externalLink = window.document.getElementById("external");
    const hashLink = window.document.getElementById("hash");
    assertExists(internalLink, "Expected internal link fixture to exist.");
    assertExists(assetLink, "Expected asset link fixture to exist.");
    assertExists(externalLink, "Expected external link fixture to exist.");
    assertExists(hashLink, "Expected hash link fixture to exist.");

    internalLink.dispatchEvent(new window.MouseEvent("mouseenter"));
    await flush(window, 8);

    assetLink.dispatchEvent(new window.MouseEvent("mouseenter"));
    externalLink.dispatchEvent(new window.MouseEvent("mouseenter"));
    hashLink.dispatchEvent(new window.MouseEvent("mouseenter"));
    internalLink.dispatchEvent(new window.FocusEvent("focus"));
    await flush(window);

    assertEquals(fetchedUrls, ["https://normco.re/about/"]);
    assertEquals(fetchSignals.length, 1);
    assertEquals(fetchSignals[0]?.aborted, false);
  });
});
