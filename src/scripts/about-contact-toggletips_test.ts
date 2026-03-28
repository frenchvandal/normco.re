import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./about-contact-toggletips.js" with {
  type: "text",
};
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"];

type TestMediaQueryList = MediaQueryList & {
  setMatches(nextMatches: boolean): void;
};

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <button type="button" class="outside-focus">Outside</button>
        <div
          class="cds--popover-container cds--popover--bottom cds--popover--align-left cds--popover--drop-shadow cds--popover--caret cds--toggletip about-contact-toggletip"
          data-contact-toggletip=""
        >
          <button
            type="button"
            class="about-contact-trigger cds--toggletip-button"
            aria-controls="contact-qr-primary"
            aria-expanded="false"
            aria-haspopup="dialog"
            data-contact-toggletip-trigger=""
          >
            Primary contact
          </button>
          <div class="cds--popover" hidden>
            <span class="cds--popover-caret"></span>
            <div
              id="contact-qr-primary"
              class="cds--popover-content cds--toggletip-content about-contact-popover"
              role="dialog"
              aria-modal="false"
              tabindex="-1"
              data-contact-toggletip-panel=""
            >
              <a href="/contact/wechat/contact-wechat-en.jpg">Download JPG</a>
              <button type="button" data-contact-toggletip-close="">
                Close
              </button>
            </div>
          </div>
        </div>
        <div
          class="cds--popover-container cds--popover--bottom cds--popover--align-left cds--popover--drop-shadow cds--popover--caret cds--toggletip about-contact-toggletip"
          data-contact-toggletip=""
        >
          <button
            type="button"
            class="about-contact-trigger cds--toggletip-button"
            aria-controls="contact-qr-wechat"
            aria-expanded="false"
            aria-haspopup="dialog"
            data-contact-toggletip-trigger=""
          >
            WeChat
          </button>
          <div class="cds--popover" hidden>
            <span class="cds--popover-caret"></span>
            <div
              id="contact-qr-wechat"
              class="cds--popover-content cds--toggletip-content about-contact-popover"
              role="dialog"
              aria-modal="false"
              tabindex="-1"
              data-contact-toggletip-panel=""
            >
              <button type="button" data-contact-toggletip-close="">
                Close
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/about/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

function createMediaQueryList(matches = false): TestMediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    media: "(max-width: 41.98rem)",
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

function getContainers(window: TestWindow): HTMLElement[] {
  return Array.from(
    window.document.querySelectorAll("[data-contact-toggletip]"),
  )
    .filter((candidate): candidate is HTMLElement =>
      candidate instanceof window.HTMLElement
    );
}

function getTriggers(window: TestWindow): HTMLButtonElement[] {
  return Array.from(
    window.document.querySelectorAll("[data-contact-toggletip-trigger]"),
  ).filter((candidate): candidate is HTMLButtonElement =>
    candidate instanceof window.HTMLButtonElement
  );
}

function getPopovers(window: TestWindow): HTMLElement[] {
  return Array.from(window.document.querySelectorAll(".cds--popover"))
    .filter((candidate): candidate is HTMLElement =>
      candidate instanceof window.HTMLElement
    );
}

async function flushNodeTimers(cycles = 3) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
  }
}

describe("about-contact-toggletips.js", () => {
  it("keeps contact popovers hidden until a trigger is activated", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const popovers = getPopovers(window);

      assertEquals(popovers.length, 2);
      for (const popover of popovers) {
        assertEquals(popover.hidden, true);
      }
    } finally {
      window.close();
    }
  });

  it("opens a contact toggletip and updates the ARIA state", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      trigger.click();

      assertEquals(container.classList.contains("cds--popover--open"), true);
      assertEquals(container.classList.contains("cds--toggletip--open"), true);
      assertEquals(trigger.getAttribute("aria-expanded"), "true");
      assertEquals(popover.hidden, false);
    } finally {
      window.close();
    }
  });

  it("keeps only one toggletip open at a time", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const [primaryPopover, wechatPopover] = getPopovers(window);
      const [primaryContainer, wechatContainer] = getContainers(window);
      const [primaryTrigger, wechatTrigger] = getTriggers(window);
      assert(primaryPopover);
      assert(wechatPopover);
      assert(primaryContainer);
      assert(wechatContainer);
      assert(primaryTrigger);
      assert(wechatTrigger);

      primaryTrigger.click();
      wechatTrigger.click();

      assertEquals(
        primaryContainer.classList.contains("cds--popover--open"),
        false,
      );
      assertEquals(primaryPopover.hidden, true);
      assertEquals(
        wechatContainer.classList.contains("cds--popover--open"),
        true,
      );
      assertEquals(wechatPopover.hidden, false);
    } finally {
      window.close();
    }
  });

  it("closes the toggletip when clicking the close button and restores focus", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      trigger.click();

      const closeButton = window.document.querySelector(
        "[data-contact-toggletip-close]",
      );
      assert(closeButton instanceof window.HTMLButtonElement);

      closeButton.click();

      assertEquals(container.classList.contains("cds--popover--open"), false);
      assertEquals(trigger.getAttribute("aria-expanded"), "false");
      assertEquals(popover.hidden, true);
      assertEquals(window.document.activeElement, trigger);
    } finally {
      window.close();
    }
  });

  it("does not restore focus to the trigger after a pointer close", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      trigger.click();

      const closeButton = window.document.querySelector(
        "[data-contact-toggletip-close]",
      );
      assert(closeButton instanceof window.HTMLButtonElement);
      closeButton.focus();

      closeButton.dispatchEvent(
        new window.MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          detail: 1,
        }),
      );

      assertEquals(container.classList.contains("cds--popover--open"), false);
      assertEquals(popover.hidden, true);
      assert(window.document.activeElement !== trigger);
    } finally {
      window.close();
    }
  });

  it("closes all open toggletips when clicking outside", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    try {
      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      trigger.click();

      const outsideButton = window.document.querySelector(".outside-focus");
      assert(outsideButton instanceof window.HTMLButtonElement);

      outsideButton.dispatchEvent(
        new window.MouseEvent("pointerdown", { bubbles: true }),
      );

      assertEquals(container.classList.contains("cds--popover--open"), false);
      assertEquals(popover.hidden, true);
    } finally {
      window.close();
    }
  });

  it("uses modal semantics on mobile and traps focus inside the open panel", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow & {
      matchMedia: (query: string) => MediaQueryList;
    };
    try {
      const mediaQueryList = createMediaQueryList(true);
      window.matchMedia = (_query: string) => mediaQueryList;

      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      assert(container);
      assert(trigger);

      trigger.click();

      const panel = window.document.querySelector(
        "[data-contact-toggletip-panel]",
      );
      assert(panel instanceof window.HTMLElement);
      const focusableElements = panel.querySelectorAll("a[href], button");
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      assert(firstFocusable instanceof window.HTMLElement);
      assert(lastFocusable instanceof window.HTMLElement);

      await new Promise((resolve) => window.setTimeout(resolve, 0));

      assertEquals(panel.getAttribute("aria-modal"), "true");
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        "true",
      );
      assertEquals(window.document.activeElement, panel);

      panel.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      );

      assertEquals(window.document.activeElement, firstFocusable);

      lastFocusable.focus();
      lastFocusable.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      );

      assertEquals(window.document.activeElement, firstFocusable);
      await flushNodeTimers();
    } finally {
      window.close();
    }
  });

  it("keeps the dialog modal when the viewport switches between desktop and mobile", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow & {
      matchMedia: (query: string) => MediaQueryList;
    };
    try {
      const mediaQueryList = createMediaQueryList(false);
      window.matchMedia = (_query: string) => mediaQueryList;

      evaluateScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      assert(container);
      assert(trigger);

      trigger.click();

      const panel = window.document.querySelector(
        "[data-contact-toggletip-panel]",
      );
      assert(panel instanceof window.HTMLElement);

      assertEquals(panel.getAttribute("aria-modal"), "true");
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        "true",
      );

      mediaQueryList.setMatches(true);
      await new Promise((resolve) => window.setTimeout(resolve, 0));

      assertEquals(panel.getAttribute("aria-modal"), "true");
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        "true",
      );

      mediaQueryList.setMatches(false);

      assertEquals(panel.getAttribute("aria-modal"), "true");
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        "true",
      );
      await flushNodeTimers();
    } finally {
      window.close();
    }
  });
});
