import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./feed-copy.js" with { type: "text" };
import { evaluateClassicScript, getJSDOM } from "../../test/jsdom.ts";

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
    <html lang="fr">
      <body>
        <div
          class="feed-copy-control feeds-copy-control"
          data-copy-control=""
          data-copy-state="idle"
          data-copy-label="Flux RSS"
          data-copy-copied-status="URL de Flux RSS copiée"
          data-copy-error-status="Impossible de copier l’URL de Flux RSS"
        >
          <button
            type="button"
            data-copy-button=""
            data-copy-path="/fr/rss.xml"
            data-copy-title="Copier Flux RSS"
            data-copy-default-label="Copier"
            data-copy-copied-label="Copié"
            data-copy-error-label="Échec"
            aria-label="Copier Flux RSS"
            title="Copier Flux RSS"
          >
            <span data-copy-button-label="">Copier</span>
          </button>
          <div
            class="site-notification site-notification--success site-notification--low-contrast feeds-copy-notice"
            data-copy-notice=""
            data-copy-notice-success-title="Copié"
            data-copy-notice-error-title="Action impossible"
            data-copy-notice-state="idle"
            hidden
          >
            <div class="site-notification__details">
              <div class="site-notification__text-wrapper">
                <p class="site-notification__title" data-copy-notice-title="">
                  Copié
                </p>
                <p class="site-notification__subtitle" data-copy-notice-message=""></p>
              </div>
            </div>
          </div>
          <span data-copy-status="" aria-live="polite"></span>
        </div>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/fr/syndication/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  evaluateClassicScript(window, SCRIPT_SOURCE);
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

function getControl(window: TestWindow): HTMLElement {
  const control = window.document.querySelector("[data-copy-control]");
  assert(control instanceof window.HTMLElement);
  return control;
}

function getButton(window: TestWindow): HTMLButtonElement {
  const button = window.document.querySelector("[data-copy-button]");
  assert(button instanceof window.HTMLButtonElement);
  return button;
}

function getButtonLabel(window: TestWindow): HTMLElement {
  const label = window.document.querySelector("[data-copy-button-label]");
  assert(label instanceof window.HTMLElement);
  return label;
}

function getStatus(window: TestWindow): HTMLElement {
  const status = window.document.querySelector("[data-copy-status]");
  assert(status instanceof window.HTMLElement);
  return status;
}

function getNotice(window: TestWindow): HTMLElement {
  const notice = window.document.querySelector("[data-copy-notice]");
  assert(notice instanceof window.HTMLElement);
  return notice;
}

function getNoticeTitle(window: TestWindow): HTMLElement {
  const title = window.document.querySelector("[data-copy-notice-title]");
  assert(title instanceof window.HTMLElement);
  return title;
}

function getNoticeMessage(window: TestWindow): HTMLElement {
  const message = window.document.querySelector("[data-copy-notice-message]");
  assert(message instanceof window.HTMLElement);
  return message;
}

describe("feed-copy.js", () => {
  it("uses localized success feedback from server-provided datasets", async () => {
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

    const control = getControl(window);
    const button = getButton(window);
    button.click();
    await flushMicrotasks();

    assertEquals(copiedTexts, ["https://normco.re/fr/rss.xml"]);
    assertEquals(control.dataset.copyState, "copied");
    assertEquals(getButtonLabel(window).textContent, "Copié");
    assertEquals(getStatus(window).textContent, "URL de Flux RSS copiée");
    assertEquals(getNotice(window).hidden, false);
    assertEquals(getNoticeTitle(window).textContent, "Copié");
    assertEquals(
      getNoticeMessage(window).textContent,
      "URL de Flux RSS copiée",
    );
    assertEquals(button.getAttribute("aria-label"), "URL de Flux RSS copiée");
    assertEquals(button.getAttribute("title"), "URL de Flux RSS copiée");
    timers.runAll();
  });

  it("does not double-bind copy controls when the script executes twice", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const timers = installFakeTimers(window);
    let callCount = 0;
    window.navigator.clipboard = {
      writeText() {
        callCount += 1;
        return Promise.resolve();
      },
    };

    evaluateScript(window);
    evaluateScript(window);

    getButton(window).click();
    await flushMicrotasks();

    assertEquals(callCount, 1);
    assertEquals(getControl(window).dataset.copyBound, "true");
    timers.runAll();
  });

  it("uses localized error feedback when clipboard writes fail", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const timers = installFakeTimers(window);
    window.navigator.clipboard = {
      writeText() {
        return Promise.reject(new Error("blocked"));
      },
    };

    evaluateScript(window);

    const control = getControl(window);
    const button = getButton(window);
    button.click();
    await flushMicrotasks();

    assertEquals(control.dataset.copyState, "error");
    assertEquals(getButtonLabel(window).textContent, "Échec");
    assertEquals(
      getStatus(window).textContent,
      "Impossible de copier l’URL de Flux RSS",
    );
    assertEquals(getNotice(window).hidden, false);
    assertEquals(getNoticeTitle(window).textContent, "Action impossible");
    assertEquals(
      getNoticeMessage(window).textContent,
      "Impossible de copier l’URL de Flux RSS",
    );
    assertEquals(
      button.getAttribute("aria-label"),
      "Impossible de copier l’URL de Flux RSS",
    );
    timers.runAll();
  });

  it("keeps compact copy controls working without an inline notice", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const timers = installFakeTimers(window);
    window.navigator.clipboard = {
      writeText() {
        return Promise.resolve();
      },
    };

    getNotice(window).remove();
    evaluateScript(window);

    const control = getControl(window);
    const button = getButton(window);
    button.click();
    await flushMicrotasks();

    assertEquals(control.dataset.copyState, "copied");
    assertEquals(getStatus(window).textContent, "URL de Flux RSS copiée");
    assertEquals(getButtonLabel(window).textContent, "Copié");
    timers.runAll();
  });
});
