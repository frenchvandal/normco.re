import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { bindAboutContactToggletips } from "./about-contact-toggletips.js";
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
          class="site-popover-container site-popover--bottom site-popover--align-left site-popover--drop-shadow site-popover--caret site-toggletip about-contact-toggletip"
          data-contact-toggletip=""
        >
          <button
            type="button"
            class="about-contact-trigger site-toggletip__button"
            aria-controls="contact-qr-primary"
            aria-expanded="false"
            aria-haspopup="dialog"
            data-contact-toggletip-trigger=""
          >
            Primary contact
          </button>
          <div class="site-popover" hidden popover="auto">
            <span class="site-popover__caret"></span>
            <div
              id="contact-qr-primary"
              class="site-popover__content site-toggletip__content about-contact-popover"
              role="dialog"
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
          class="site-popover-container site-popover--bottom site-popover--align-left site-popover--drop-shadow site-popover--caret site-toggletip about-contact-toggletip"
          data-contact-toggletip=""
        >
          <button
            type="button"
            class="about-contact-trigger site-toggletip__button"
            aria-controls="contact-qr-wechat"
            aria-expanded="false"
            aria-haspopup="dialog"
            data-contact-toggletip-trigger=""
          >
            WeChat
          </button>
          <div class="site-popover" hidden popover="auto">
            <span class="site-popover__caret"></span>
            <div
              id="contact-qr-wechat"
              class="site-popover__content site-toggletip__content about-contact-popover"
              role="dialog"
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

function bindScript(window: TestWindow) {
  bindAboutContactToggletips(window as Window & typeof globalThis);
}

function createMediaQueryList(matches = false): TestMediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    media: "(max-width: 47.999rem)",
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
  return Array.from(window.document.querySelectorAll(".site-popover"))
    .filter((candidate): candidate is HTMLElement =>
      candidate instanceof window.HTMLElement
    );
}

function getOutsideFocus(window: TestWindow): HTMLButtonElement {
  const button = window.document.querySelector(".outside-focus");
  assert(button instanceof window.HTMLButtonElement);
  return button;
}

function installFakePopoverApi(window: TestWindow) {
  for (const popover of getPopovers(window)) {
    Object.defineProperty(popover, "showPopover", {
      configurable: true,
      value() {
        popover.setAttribute("data-popover-open", "true");
        popover.dispatchEvent(new window.Event("toggle"));
      },
    });
    Object.defineProperty(popover, "hidePopover", {
      configurable: true,
      value() {
        popover.removeAttribute("data-popover-open");
        popover.dispatchEvent(new window.Event("toggle"));
      },
    });
  }
}

function installFakeDesktopPopoverGeometry(window: TestWindow) {
  const [trigger] = getTriggers(window);
  const [popover] = getPopovers(window);

  assert(trigger);
  assert(popover);

  Object.defineProperty(trigger, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 120,
      y: 80,
      width: 176,
      height: 56,
      top: 80,
      right: 296,
      bottom: 136,
      left: 120,
      toJSON() {
        return this;
      },
    }),
  });

  Object.defineProperty(popover, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 104,
      y: 144,
      width: 208,
      height: 320,
      top: 144,
      right: 312,
      bottom: 464,
      left: 104,
      toJSON() {
        return this;
      },
    }),
  });
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
      bindScript(window);

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
      bindScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      trigger.click();

      assertEquals(container.classList.contains("site-popover--open"), true);
      assertEquals(container.classList.contains("site-toggletip--open"), true);
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
      bindScript(window);

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
        primaryContainer.classList.contains("site-popover--open"),
        false,
      );
      assertEquals(primaryPopover.hidden, true);
      assertEquals(
        wechatContainer.classList.contains("site-popover--open"),
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
      bindScript(window);

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

      assertEquals(container.classList.contains("site-popover--open"), false);
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
      bindScript(window);

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

      assertEquals(container.classList.contains("site-popover--open"), false);
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
      bindScript(window);

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

      assertEquals(container.classList.contains("site-popover--open"), false);
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

      bindScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const outsideFocus = getOutsideFocus(window);
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
      assertEquals(outsideFocus.hasAttribute("inert"), true);

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

  it("toggles modal semantics when the viewport switches between desktop and mobile", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow & {
      matchMedia: (query: string) => MediaQueryList;
    };
    try {
      const mediaQueryList = createMediaQueryList(false);
      window.matchMedia = (_query: string) => mediaQueryList;

      bindScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      assert(container);
      assert(trigger);

      trigger.click();

      const panel = window.document.querySelector(
        "[data-contact-toggletip-panel]",
      );
      assert(panel instanceof window.HTMLElement);

      assertEquals(panel.hasAttribute("aria-modal"), false);
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        undefined,
      );

      mediaQueryList.setMatches(true);
      await new Promise((resolve) => window.setTimeout(resolve, 0));

      assertEquals(panel.getAttribute("aria-modal"), "true");
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        "true",
      );

      mediaQueryList.setMatches(false);

      assertEquals(panel.hasAttribute("aria-modal"), false);
      assertEquals(
        window.document.body.dataset.contactToggletipModalOpen,
        undefined,
      );
      assertEquals(getOutsideFocus(window).hasAttribute("inert"), false);
      await flushNodeTimers();
    } finally {
      window.close();
    }
  });

  it("uses the native Popover API on desktop when available", () => {
    const dom = createDom();
    const window = dom.window as TestWindow & {
      matchMedia: (query: string) => MediaQueryList;
    };
    try {
      const mediaQueryList = createMediaQueryList(false);
      window.matchMedia = (_query: string) => mediaQueryList;
      installFakePopoverApi(window);
      installFakeDesktopPopoverGeometry(window);

      bindScript(window);

      const [container] = getContainers(window);
      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(container);
      assert(trigger);
      assert(popover);

      assertEquals(popover.getAttribute("popover"), "auto");
      assertEquals(popover.hasAttribute("data-contact-native-popover"), true);
      assertEquals(popover.hidden, true);

      trigger.click();

      assertEquals(container.classList.contains("site-popover--open"), true);
      assertEquals(popover.hidden, false);
      assertEquals(popover.getAttribute("data-popover-open"), "true");
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-top"),
        "144px",
      );
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-left"),
        "208px",
      );
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-caret-offset"),
        "0px",
      );

      trigger.click();

      assertEquals(popover.hidden, true);
      assertEquals(popover.getAttribute("data-popover-open"), null);
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-top"),
        "",
      );
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-left"),
        "",
      );
    } finally {
      window.close();
    }
  });

  it("uses the native Popover API on mobile when available", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow & {
      matchMedia: (query: string) => MediaQueryList;
    };
    try {
      const mediaQueryList = createMediaQueryList(true);
      window.matchMedia = (_query: string) => mediaQueryList;
      installFakePopoverApi(window);

      bindScript(window);

      const [trigger] = getTriggers(window);
      const [popover] = getPopovers(window);
      assert(trigger);
      assert(popover);
      assertEquals(popover.hidden, true);
      assertEquals(popover.getAttribute("data-popover-open"), null);
      assertEquals(popover.hasAttribute("data-contact-native-popover"), false);

      trigger.click();
      await flushNodeTimers(1);

      assertEquals(popover.hidden, false);
      assertEquals(popover.getAttribute("data-popover-open"), "true");
      assertEquals(popover.hasAttribute("data-contact-native-popover"), false);
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-top"),
        "",
      );
      assertEquals(
        popover.style.getPropertyValue("--about-contact-popover-left"),
        "",
      );

      const closeButton = window.document.querySelector(
        "[data-contact-toggletip-close]",
      );
      assert(closeButton instanceof window.HTMLButtonElement);

      closeButton.click();
      await flushNodeTimers(1);

      assertEquals(popover.hidden, true);
      assertEquals(popover.getAttribute("data-popover-open"), null);
      assertEquals(trigger.getAttribute("aria-expanded"), "false");
    } finally {
      window.close();
    }
  });

  it(
    "keeps the mobile native popover open while focus is settling after open",
    async () => {
      const dom = createDom();
      const window = dom.window as TestWindow & {
        matchMedia: (query: string) => MediaQueryList;
      };
      try {
        const mediaQueryList = createMediaQueryList(true);
        window.matchMedia = (_query: string) => mediaQueryList;
        installFakePopoverApi(window);

        bindScript(window);

        const [container] = getContainers(window);
        const [trigger] = getTriggers(window);
        const [popover] = getPopovers(window);
        const outsideFocus = getOutsideFocus(window);
        const panel = window.document.querySelector(
          "[data-contact-toggletip-panel]",
        );
        assert(container);
        assert(trigger);
        assert(popover);
        assert(panel instanceof window.HTMLElement);

        Object.defineProperty(panel, "focus", {
          configurable: true,
          value() {
            outsideFocus.focus();
          },
        });

        trigger.focus();
        trigger.click();
        container.dispatchEvent(
          new window.FocusEvent("focusout", {
            bubbles: true,
          }),
        );
        await flushNodeTimers(2);

        assertEquals(popover.hidden, false);
        assertEquals(popover.getAttribute("data-popover-open"), "true");
        assertEquals(trigger.getAttribute("aria-expanded"), "true");
      } finally {
        window.close();
      }
    },
  );
});
