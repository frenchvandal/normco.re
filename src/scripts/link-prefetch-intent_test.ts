import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./link-prefetch-intent.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type IntersectionEntryLike = {
  isIntersecting: boolean;
  target: Element;
};

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  fetch(input: string | URL, init?: RequestInit): Promise<Response>;
  IntersectionObserver: new (
    callback: (entries: IntersectionEntryLike[]) => void,
    options?: IntersectionObserverInit,
  ) => {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  };
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
  window.eval(SCRIPT_SOURCE);
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
    let observerCount = 0;

    Object.defineProperty(window.navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
    window.IntersectionObserverEntry = function () {} as never;
    Object.defineProperty(
      window.IntersectionObserverEntry.prototype,
      "isIntersecting",
      {
        configurable: true,
        value: true,
      },
    );
    window.IntersectionObserver = class {
      constructor() {
        observerCount += 1;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    evaluateScript(window);

    assertEquals(observerCount, 0);
  });

  it("observes only same-origin document links and prefetches intersecting candidates", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const observedIds: string[] = [];
    const fetchedUrls: string[] = [];
    let callback: ((entries: IntersectionEntryLike[]) => void) | undefined;

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
    window.IntersectionObserverEntry = function () {} as never;
    Object.defineProperty(
      window.IntersectionObserverEntry.prototype,
      "isIntersecting",
      {
        configurable: true,
        value: true,
      },
    );
    window.IntersectionObserver = class {
      constructor(nextCallback: (entries: IntersectionEntryLike[]) => void) {
        callback = nextCallback;
      }
      observe(target: Element) {
        observedIds.push((target as HTMLElement).id);
      }
      unobserve() {}
      disconnect() {}
    };
    window.fetch = (input: string | URL) => {
      fetchedUrls.push(String(input));
      return Promise.resolve(new Response("", { status: 200 }));
    };

    evaluateScript(window);
    await flush(window);

    assertEquals(observedIds, ["internal"]);
    callback?.([
      {
        isIntersecting: true,
        target: window.document.getElementById("internal")!,
      },
    ]);
    await flush(window);

    assertEquals(fetchedUrls, ["https://normco.re/about/"]);
  });
});
