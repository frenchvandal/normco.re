import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./sw-register.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type RegisterCall = {
  url: string;
  options: RegistrationOptions;
};

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
};

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    '<!doctype html><html lang="en"><body></body></html>',
    {
      pretendToBeVisual: true,
      runScripts: "dangerously",
      url: "https://normco.re/",
    },
  );
}

function installScript(window: TestWindow, dataset: Record<string, string>) {
  const script = window.document.createElement("script");
  for (const [key, value] of Object.entries(dataset)) {
    script.dataset[key] = value;
  }
  script.textContent = SCRIPT_SOURCE;
  window.document.body.append(script);
}

async function flush(window: TestWindow, cycles = 2) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

describe("sw-register.js", () => {
  it("registers the service worker with the requested debug level", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const calls: RegisterCall[] = [];

    window.requestIdleCallback = (callback: IdleRequestCallback) => {
      callback({
        didTimeout: false,
        timeRemaining: () => 10,
      });
      return 1;
    };

    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: null,
        addEventListener() {},
        register(url: string, options: RegistrationOptions) {
          calls.push({ url, options });
          return Promise.resolve({
            active: null,
            installing: null,
            waiting: null,
            addEventListener() {},
          });
        },
      },
    });

    installScript(window, {
      swUrl: "/sw.js",
      swDebugLevel: "summary",
    });
    await flush(window);

    assertEquals(calls.length, 1);
    assertEquals(calls[0]?.url, "/sw.js?debug=summary");
    assertEquals(calls[0]?.options.scope, "/");
    assertEquals(calls[0]?.options.type, "module");
    assertEquals(calls[0]?.options.updateViaCache, "none");
  });

  it("skips registration for known crawler user agents", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    let registerCalls = 0;

    window.requestIdleCallback = (callback: IdleRequestCallback) => {
      callback({
        didTimeout: false,
        timeRemaining: () => 10,
      });
      return 1;
    };

    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Googlebot/2.1",
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: null,
        addEventListener() {},
        register() {
          registerCalls += 1;
          return Promise.resolve({
            active: null,
            installing: null,
            waiting: null,
            addEventListener() {},
          });
        },
      },
    });

    installScript(window, {
      swUrl: "/sw.js",
      swDebugLevel: "off",
    });
    await flush(window);

    assertEquals(registerCalls, 0);
  });
});
