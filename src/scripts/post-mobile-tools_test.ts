import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getJSDOM } from "../../test/jsdom.ts";
import { bindPostMobileTools } from "./post-mobile-tools.js";

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
    media: "(max-width: 65.99rem)",
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

function createDom(pathname = "/posts/example/"): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <button
          type="button"
          aria-controls="post-mobile-tools-dialog"
          aria-expanded="false"
          data-post-mobile-tools-open=""
        >
          Post tools
        </button>
        <dialog
          id="post-mobile-tools-dialog"
          data-post-mobile-tools=""
          aria-labelledby="post-mobile-tools-title"
        >
          <div>
            <p id="post-mobile-tools-title">Post tools</p>
            <button type="button" data-post-mobile-tools-close="">Close</button>
          </div>
        </dialog>
      </body>
    </html>`,
    {
      url: `https://normco.re${pathname}`,
    },
  );
}

function installDialogShim(
  dialog: HTMLElement,
  window: InstanceType<typeof JSDOM>["window"],
): void {
  Object.defineProperty(dialog, "open", {
    configurable: true,
    get() {
      return dialog.hasAttribute("open");
    },
  });

  Reflect.set(dialog, "showModal", () => {
    dialog.setAttribute("open", "");
  });
  Reflect.set(dialog, "close", () => {
    dialog.removeAttribute("open");
    dialog.dispatchEvent(new window.Event("close"));
  });
}

async function flush(
  window: InstanceType<typeof JSDOM>["window"],
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

describe("post-mobile-tools.js", () => {
  it("marks the page as ready only in the mobile viewport", async () => {
    const dom = createDom();
    try {
      const window = dom.window as TestWindow;
      const mediaQuery = createMediaQueryList(false);
      window.matchMedia = () => mediaQuery;

      const dialog = window.document.querySelector("dialog");
      assert(dialog instanceof window.HTMLElement);
      installDialogShim(dialog, window);

      bindPostMobileTools(window);
      assertEquals(
        window.document.documentElement.dataset.postMobileToolsReady,
        undefined,
      );

      mediaQuery.setMatches(true);
      assertEquals(
        window.document.documentElement.dataset.postMobileToolsReady,
        "true",
      );

      mediaQuery.setMatches(false);
      assertEquals(
        window.document.documentElement.dataset.postMobileToolsReady,
        undefined,
      );
      await flush(window);
    } finally {
      dom.window.close();
    }
  });

  it("opens and closes the dialog from the trigger on mobile", async () => {
    const dom = createDom();
    try {
      const window = dom.window as TestWindow;
      const mediaQuery = createMediaQueryList(true);
      window.matchMedia = () => mediaQuery;

      const dialog = window.document.querySelector("dialog");
      const openButton = window.document.querySelector(
        "[data-post-mobile-tools-open]",
      );
      const closeButton = window.document.querySelector(
        "[data-post-mobile-tools-close]",
      );

      assert(dialog instanceof window.HTMLElement);
      assert(openButton instanceof window.HTMLButtonElement);
      assert(closeButton instanceof window.HTMLButtonElement);

      installDialogShim(dialog, window);

      bindPostMobileTools(window);
      openButton.click();
      await flush(window);

      assertEquals(openButton.getAttribute("aria-expanded"), "true");
      assertEquals(dialog.hasAttribute("open"), true);

      closeButton.click();
      await flush(window);

      assertEquals(openButton.getAttribute("aria-expanded"), "false");
      assertEquals(dialog.hasAttribute("open"), false);
      assertEquals(window.document.activeElement, openButton);
    } finally {
      dom.window.close();
    }
  });
});
