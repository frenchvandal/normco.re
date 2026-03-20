import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./header-client.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestMediaQueryList = MediaQueryList & {
  setMatches(nextMatches: boolean): void;
};

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  PagefindUI?: new (options: {
    element: string;
    translations?: Record<string, string>;
  }) => unknown;
  matchMedia(query: string): TestMediaQueryList;
};

type NavigationDetail = {
  kind: "assign" | "replace";
  targetUrl: string;
};

function createMediaQueryList(matches = false): TestMediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    media: "(prefers-color-scheme: dark)",
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

function createDom(pathname = "/"): InstanceType<typeof JSDOM> {
  const dom = new JSDOM(
    `<!doctype html>
    <html lang="en">
      <head></head>
      <body>
        <button type="button" class="outside-focus">Outside</button>

        <button
          type="button"
          class="cds--header__action cds--header__menu-toggle"
          aria-expanded="false"
          aria-controls="site-side-nav"
        >
          Menu
        </button>

        <div
          class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            type="button"
            class="cds--header__action"
            aria-label="Search"
            aria-expanded="false"
            aria-controls="site-search-panel"
            data-header-tooltip-trigger=""
          >
            Search
          </button>
          <div class="cds--popover" aria-hidden="true">
            <span class="cds--popover-caret"></span>
            <div class="cds--popover-content">
              <span class="cds--tooltip-content">Search</span>
            </div>
          </div>
        </div>

        <div
          class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            type="button"
            class="cds--header__action cds--header__language-toggle"
            aria-label="Languages"
            aria-expanded="false"
            aria-controls="site-language-panel"
            aria-haspopup="menu"
            data-header-tooltip-trigger=""
          >
            Languages
          </button>
          <div class="cds--popover" aria-hidden="true">
            <span class="cds--popover-caret"></span>
            <div class="cds--popover-content">
              <span class="cds--tooltip-content">Languages</span>
            </div>
          </div>
        </div>

        <div
          class="cds--popover-container cds--icon-tooltip cds--popover--bottom cds--popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            id="theme-toggle"
            type="button"
            class="cds--header__action"
            data-label-switch-light="Switch to light theme"
            data-label-switch-dark="Switch to dark theme"
            data-label-follow-system="Follow system theme"
            data-header-tooltip-trigger=""
          >
            Theme
          </button>
          <div class="cds--popover" aria-hidden="true">
            <span class="cds--popover-caret"></span>
            <div class="cds--popover-content">
              <span class="cds--tooltip-content">Theme</span>
            </div>
          </div>
        </div>

        <section
          id="site-language-panel"
          class="cds--header__panel cds--header__language-panel"
          data-language-panel=""
          hidden
        >
          <div
            class="cds--header__panel-content cds--header__language-menu"
            role="menu"
            data-language-menu=""
          >
            <a
              href="/"
              class="cds--header__language-option"
              data-language-option="en"
              role="menuitemradio"
              aria-checked="true"
              tabindex="0"
            >
              English
            </a>
            <a
              href="/fr/"
              class="cds--header__language-option"
              data-language-option="fr"
              role="menuitemradio"
              aria-checked="false"
              tabindex="-1"
            >
              Francais
            </a>
          </div>
        </section>

        <div
          id="site-search-panel"
          class="cds--header__panel cds--header__search-panel"
          data-search-panel=""
          hidden
        >
          <div class="cds--header__panel-content">
            <div
              id="site-search-status"
              class="cds--header__search-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-search-status=""
              hidden
            >
              <div class="cds--inline-loading site-search-inline-loading" data-search-loading="" hidden>
                <p class="cds--inline-loading__text" data-search-loading-text="">
                  Loading search results.
                </p>
              </div>
              <p class="cds--header__search-status-text" data-search-status-text="" hidden></p>
              <div
                class="cds--inline-notification cds--inline-notification--low-contrast cds--inline-notification--info site-search-notification"
                data-search-notification=""
                data-search-notification-tone="info"
                hidden
              >
                <div class="cds--inline-notification__details">
                  <div class="cds--inline-notification__text-wrapper">
                    <p class="cds--inline-notification__title" data-search-notification-title=""></p>
                    <p class="cds--inline-notification__subtitle" data-search-notification-subtitle=""></p>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="search"
              class="cds--header__search-root"
              data-search-root=""
              aria-busy="false"
              data-search-loading-label="Loading search results."
              data-search-loading-title="Preparing search"
              data-search-no-results-label="No results found."
              data-search-one-result-label="[COUNT] result"
              data-search-many-results-label="[COUNT] results"
              data-search-unavailable-label="Search is temporarily unavailable."
              data-search-unavailable-title="Search unavailable"
              data-search-offline-label="Search is unavailable while offline."
              data-search-offline-title="Offline"
              data-search-retry-label="Retry"
            >
              <div class="site-search-skeleton" data-search-skeleton="" aria-hidden="true">
                <span class="cds--skeleton__text site-search-skeleton-line"></span>
                <span class="cds--skeleton__text site-search-skeleton-line"></span>
                <span class="cds--skeleton__text site-search-skeleton-line"></span>
              </div>
            </div>
          </div>
        </div>

        <aside id="site-side-nav" class="cds--side-nav" hidden>
          <nav class="cds--side-nav__navigation">
            <ul class="cds--side-nav__items">
              <li class="cds--side-nav__item">
                <a href="/posts/" class="cds--side-nav__link">Writing</a>
              </li>
            </ul>
          </nav>
        </aside>

        <div class="cds--side-nav__overlay" aria-hidden="true"></div>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: `https://normco.re${pathname}`,
    },
  );

  const window = dom.window as TestWindow;
  window.requestAnimationFrame = (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(0), 0);

  return dom;
}

function installFakePagefind(window: TestWindow) {
  window.PagefindUI = class {
    constructor(
      options: {
        element: string;
        translations?: Record<string, string>;
      },
    ) {
      const target = window.document.querySelector(options.element);

      if (!(target instanceof window.HTMLElement)) {
        throw new Error("Missing Pagefind mount target");
      }

      const wrapper = window.document.createElement("div");
      wrapper.className = "pagefind-ui";

      const form = window.document.createElement("form");
      form.className = "pagefind-ui__form";
      form.setAttribute("role", "search");

      const input = window.document.createElement("input");
      input.className = "pagefind-ui__search-input";
      input.type = "text";

      const clear = window.document.createElement("button");
      clear.type = "button";
      clear.className = "pagefind-ui__search-clear";
      clear.textContent = "Clear";

      const drawer = window.document.createElement("div");
      drawer.className = "pagefind-ui__drawer";

      const resultsArea = window.document.createElement("div");
      resultsArea.className = "pagefind-ui__results-area";

      const message = window.document.createElement("p");
      message.className = "pagefind-ui__message";

      resultsArea.append(message);
      drawer.append(resultsArea);
      form.append(input, clear, drawer);
      wrapper.append(form);
      target.append(wrapper);

      const translations = options.translations ?? {};
      const loading = translations.searching ?? "Loading";
      const noResults = translations.zero_results ?? "No results";
      const oneResult = translations.one_result ?? "[COUNT] result";
      const manyResults = translations.many_results ?? "[COUNT] results";

      input.addEventListener("input", () => {
        const term = input.value.trim();

        if (term.length === 0) {
          message.textContent = "";
          return;
        }

        if (term === "loading") {
          message.textContent = loading;
          return;
        }

        if (term === "none") {
          message.textContent = noResults;
          return;
        }

        if (term === "one") {
          message.textContent = oneResult.replace("[COUNT]", "1");
          return;
        }

        message.textContent = manyResults.replace("[COUNT]", "2");
      });
    }
  };
}

async function flush(window: TestWindow, cycles = 4) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

function getLanguageToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".cds--header__language-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getSearchToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(
    '.cds--header__action[aria-controls="site-search-panel"]',
  );
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getMenuToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".cds--header__menu-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getSearchPanel(window: TestWindow): HTMLElement {
  const panel = window.document.querySelector("[data-search-panel]");
  assert(panel instanceof window.HTMLElement);
  return panel;
}

function getLanguagePanel(window: TestWindow): HTMLElement {
  const panel = window.document.querySelector("[data-language-panel]");
  assert(panel instanceof window.HTMLElement);
  return panel;
}

function getTooltipContainer(window: TestWindow): HTMLElement {
  const container = window.document.querySelector("[data-header-tooltip]");
  assert(container instanceof window.HTMLElement);
  return container;
}

function captureNavigation(window: TestWindow): NavigationDetail[] {
  const navigationCalls: NavigationDetail[] = [];

  window.document.addEventListener(
    "site:language-navigation",
    (event: Event) => {
      if (!(event instanceof window.CustomEvent)) {
        return;
      }

      navigationCalls.push((event as CustomEvent<NavigationDetail>).detail);
      event.preventDefault();
    },
  );

  return navigationCalls;
}

describe("header-client.js", () => {
  it("keeps focus on the language trigger for pointer opens and moves focus into the menu from ArrowDown", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const selectedOption = window.document.querySelector(
      '[data-language-option][aria-checked="true"]',
    );
    assert(selectedOption instanceof window.HTMLAnchorElement);

    toggle.focus();
    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(getLanguagePanel(window).hidden, false);
    assertEquals(window.document.activeElement, toggle);

    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(window.document.activeElement, selectedOption);
  });

  it("opens the side nav from the keyboard and restores focus from the overlay", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getMenuToggle(window);
    const firstLink = window.document.querySelector(".cds--side-nav__link");
    const overlay = window.document.querySelector(".cds--side-nav__overlay");
    assert(firstLink instanceof window.HTMLAnchorElement);
    assert(overlay instanceof window.HTMLElement);

    toggle.focus();
    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await flush(window);

    assertEquals(window.document.activeElement, firstLink);
    assertEquals(window.document.body.style.overflow, "hidden");
    assertEquals(overlay.getAttribute("aria-hidden"), "false");

    overlay.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(window.document.activeElement, toggle);
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(overlay.getAttribute("aria-hidden"), "true");
  });

  it("drives header tooltips from delegated focus events and suppresses them while a panel is expanded", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const container = getTooltipContainer(window);
    const trigger = getSearchToggle(window);
    const outsideButton = window.document.querySelector(".outside-focus");
    assert(outsideButton instanceof window.HTMLButtonElement);

    trigger.focus();
    await flush(window);
    assertEquals(container.classList.contains("cds--popover--open"), true);

    outsideButton.focus();
    await flush(window);
    assertEquals(container.classList.contains("cds--popover--open"), false);

    trigger.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    trigger.click();
    await flush(window);

    trigger.focus();
    await flush(window);
    assertEquals(container.classList.contains("cds--popover--open"), false);
  });

  it("initializes Pagefind on keyboard open and mirrors result status", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getSearchToggle(window);
    toggle.focus();
    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await flush(window, 1);

    const panel = getSearchPanel(window);
    assertEquals(panel.hidden, false);
    assertEquals(panel.getAttribute("aria-busy"), "true");

    const runtimeScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(runtimeScript instanceof window.HTMLScriptElement);

    installFakePagefind(window);
    runtimeScript.dispatchEvent(new window.Event("load"));
    await flush(window);

    const input = window.document.querySelector(".pagefind-ui__search-input");
    const statusText = window.document.querySelector(
      "[data-search-status-text]",
    );
    assert(input instanceof window.HTMLInputElement);
    assert(statusText instanceof window.HTMLElement);
    assertEquals(window.document.activeElement, input);

    input.value = "alpha";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);

    assertEquals(statusText.hidden, false);
    assertEquals(statusText.textContent, "2 results");
    assertEquals(panel.getAttribute("aria-busy"), "false");
  });

  it("removes the placeholder skeleton before mounting the live Pagefind UI", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getSearchToggle(window);
    toggle.focus();
    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await flush(window, 1);

    const runtimeScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(runtimeScript instanceof window.HTMLScriptElement);

    installFakePagefind(window);
    runtimeScript.dispatchEvent(new window.Event("load"));
    await flush(window);

    const searchRoot = window.document.querySelector("[data-search-root]");
    assert(searchRoot instanceof window.HTMLElement);
    assertEquals(searchRoot.querySelector("[data-search-skeleton]"), null);
    assertEquals(searchRoot.querySelectorAll(".pagefind-ui").length, 1);
  });

  it("does not autofocus search when the panel opens from a pointer interaction", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getSearchToggle(window);
    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await flush(window, 1);

    const runtimeScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(runtimeScript instanceof window.HTMLScriptElement);

    installFakePagefind(window);
    runtimeScript.dispatchEvent(new window.Event("load"));
    await flush(window);

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);
    assertEquals(window.document.activeElement, window.document.body);
  });

  it("keeps the retry action keyboard usable after a Pagefind load failure", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getSearchToggle(window);
    toggle.focus();
    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await flush(window, 1);

    const runtimeScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(runtimeScript instanceof window.HTMLScriptElement);
    runtimeScript.dispatchEvent(new window.Event("error"));
    await flush(window);

    const retryButton = window.document.querySelector(
      "[data-pagefind-fallback] .pagefind-ui__button",
    );
    assert(retryButton instanceof window.HTMLButtonElement);
    assertEquals(window.document.activeElement, retryButton);

    installFakePagefind(window);
    retryButton.click();
    await flush(window);

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);
    assertEquals(window.document.activeElement, input);
  });

  it("cycles the theme toggle and avoids double binding when evaluated twice", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const mediaQuery = createMediaQueryList(false);
    window.matchMedia = () => mediaQuery;

    evaluateScript(window);
    evaluateScript(window);

    const button = window.document.getElementById("theme-toggle");
    assert(button instanceof window.HTMLButtonElement);

    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "system",
    );
    assertEquals(button.getAttribute("title"), "Switch to light theme");

    button.click();
    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "light",
    );
    assertEquals(button.getAttribute("title"), "Switch to dark theme");

    button.click();
    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "dark",
    );
    assertEquals(button.getAttribute("title"), "Follow system theme");
  });

  it("persists the selected language and closes the menu without navigating when the target matches the current page", async () => {
    const dom = createDom("/");
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    const navigationCalls = captureNavigation(window);
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await flush(window);

    const englishOption = window.document.querySelector(
      '[data-language-option="en"]',
    );
    assert(englishOption instanceof window.HTMLAnchorElement);

    englishOption.click();
    await flush(window);

    assertEquals(window.localStorage.getItem("preferred-language"), "en");
    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(getLanguagePanel(window).hidden, true);
    assertEquals(window.document.activeElement, toggle);
    assertEquals(navigationCalls, []);
  });
});
