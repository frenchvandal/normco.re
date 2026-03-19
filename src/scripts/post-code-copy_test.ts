import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./post-code-copy.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  navigator: Navigator & {
    clipboard?: {
      writeText(text: string): Promise<void>;
    };
  };
};

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <article
          class="post-article"
          data-code-copy-label="Copy code"
          data-code-copy-feedback="Code copied"
          data-code-copy-failed-feedback="Cannot copy code"
        >
          <div class="post-content">
            <pre><code>console.log("hello");</code></pre>
          </div>
        </article>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/posts/example/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

async function flushMicrotasks(cycles = 3) {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
}

function installFakeTimers(window: TestWindow) {
  let nextTimerId = 1;
  const scheduledCallbacks = new Map<number, TimerHandler>();

  window.setTimeout = ((callback: TimerHandler) => {
    const timerId = nextTimerId;
    nextTimerId += 1;
    scheduledCallbacks.set(timerId, callback);
    return timerId;
  }) as typeof window.setTimeout;

  window.clearTimeout = ((timerId: number) => {
    scheduledCallbacks.delete(timerId);
  }) as typeof window.clearTimeout;

  return {
    runAll() {
      for (const [timerId, callback] of Array.from(scheduledCallbacks)) {
        scheduledCallbacks.delete(timerId);
        if (typeof callback === "function") {
          callback();
        }
      }
    },
  };
}

function getCopyButtons(window: TestWindow): HTMLButtonElement[] {
  return Array.from(window.document.querySelectorAll(".post-code-copy-button"))
    .filter((candidate): candidate is HTMLButtonElement =>
      candidate instanceof window.HTMLButtonElement
    );
}

describe("post-code-copy.js", () => {
  it("inserts one copy button per article even when the script executes twice", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    installFakeTimers(window);
    window.navigator.clipboard = {
      writeText() {
        return Promise.resolve();
      },
    };

    evaluateScript(window);
    evaluateScript(window);

    assertEquals(getCopyButtons(window).length, 1);
    const article = window.document.querySelector(".post-article");
    assert(article instanceof window.HTMLElement);
    assertEquals(article.dataset.codeCopyBound, "true");
  });

  it("copies code and shows the configured success label", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const timers = installFakeTimers(window);
    const copiedTexts: string[] = [];
    window.navigator.clipboard = {
      writeText(text: string) {
        copiedTexts.push(text);
        return Promise.resolve();
      },
    };

    evaluateScript(window);

    const [button] = getCopyButtons(window);
    assert(button);
    button.click();
    await flushMicrotasks();

    assertEquals(copiedTexts, ['console.log("hello");']);
    assertEquals(button.textContent, "Code copied");
    assertEquals(button.getAttribute("aria-label"), "Code copied");
    timers.runAll();
  });
});
