import { assert, assertEquals } from "jsr:@std/assert@^1.0.19";
import { describe, it } from "jsr:@std/testing@^1.0.17/bdd";
import { getJSDOM } from "../../../test/jsdom.ts";
import { HEADER_IDS } from "../../utils/header-language-menu.ts";
import {
  HEADER_MOBILE_TABBAR_DATA_ID,
  HEADER_MOBILE_TABBAR_ROOT_ID,
} from "../../utils/header-mobile-tabbar.ts";
import { prepareHeaderMobileTabBar } from "./header-mobile-bootstrap.ts";

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
    media: "(max-width: 63.99rem)",
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

function createDom(pathname = "/posts/"): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <button
          type="button"
          aria-controls="${HEADER_IDS.sideNav}"
          aria-expanded="true"
        >
          Menu
        </button>
        <div id="${HEADER_MOBILE_TABBAR_ROOT_ID}" hidden></div>
        <script type="application/json" id="${HEADER_MOBILE_TABBAR_DATA_ID}">
          {"ariaLabel":"Main navigation","items":[
            {"href":"/","label":"Home","isCurrent":false},
            {"href":"/posts/","label":"Writing","isCurrent":true},
            {"href":"/about/","label":"About","isCurrent":false}
          ]}
        </script>
        <aside id="${HEADER_IDS.sideNav}" expanded=""></aside>
      </body>
    </html>`,
    {
      url: `https://normco.re${pathname}`,
      pretendToBeVisual: true,
    },
  );
}

describe("header-mobile-main.js", () => {
  it("prepares the mobile tab bar only in the mobile viewport", () => {
    const dom = createDom();
    try {
      const window = dom.window as TestWindow;
      window.matchMedia = () => createMediaQueryList(true);

      const prepared = prepareHeaderMobileTabBar(window);

      assert(prepared);
      assertEquals(
        window.document.documentElement.dataset.mobileTabbarReady,
        "true",
      );

      const root = window.document.getElementById(HEADER_MOBILE_TABBAR_ROOT_ID);
      const sideNav = window.document.getElementById(HEADER_IDS.sideNav);
      const menuToggle = window.document.querySelector(
        `[aria-controls="${HEADER_IDS.sideNav}"]`,
      );

      assert(root instanceof window.HTMLElement);
      assert(sideNav instanceof window.HTMLElement);
      assert(menuToggle instanceof window.HTMLButtonElement);

      assertEquals(root.hidden, false);
      assertEquals(sideNav.hidden, true);
      assertEquals(sideNav.hasAttribute("expanded"), false);
      assertEquals(menuToggle.getAttribute("aria-expanded"), "false");
      assertEquals(prepared.rootElement, root);
      assertEquals(prepared.data.items[1]?.label, "Writing");
    } finally {
      dom.window.close();
    }
  });

  it("skips preparation outside the mobile viewport", () => {
    const dom = createDom();
    try {
      const window = dom.window as TestWindow;
      window.matchMedia = () => createMediaQueryList(false);

      const prepared = prepareHeaderMobileTabBar(window);

      assertEquals(prepared, undefined);
      assertEquals(
        window.document.documentElement.dataset.mobileTabbarReady,
        undefined,
      );
    } finally {
      dom.window.close();
    }
  });
});
