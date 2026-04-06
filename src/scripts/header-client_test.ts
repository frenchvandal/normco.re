import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { bindHeaderClient } from "./header-client/init.js";
import focusableSelectorSource from "./header-client/focusable-selector.js" with {
  type: "text",
};
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestMediaQueryList = MediaQueryList & {
  setMatches(nextMatches: boolean): void;
};

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  __lastPagefindOptions?: {
    openFilters?: readonly string[];
    showEmptyFilters?: boolean;
  };
  PagefindUI?: new (options: {
    element: string;
    openFilters?: readonly string[];
    showEmptyFilters?: boolean;
    translations?: Record<string, string>;
  }) => unknown;
  matchMedia?: (query: string) => TestMediaQueryList;
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
          class="site-header__action site-header__menu-toggle"
          aria-expanded="false"
          aria-controls="site-side-nav"
        >
          Menu
        </button>

        <div
          class="site-popover-container site-icon-tooltip site-popover--bottom site-popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            type="button"
            class="site-header__action"
            aria-label="Search"
            aria-expanded="false"
            aria-controls="site-search-panel"
            data-header-tooltip-trigger=""
          >
            Search
          </button>
          <div class="site-popover" aria-hidden="true">
            <span class="site-popover__caret"></span>
            <div class="site-popover__content">
              <span class="site-tooltip__content">Search</span>
            </div>
          </div>
        </div>

        <div
          class="site-popover-container site-icon-tooltip site-popover--bottom site-popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            type="button"
            class="site-header__action site-header__language-toggle"
            aria-label="Languages"
            aria-expanded="false"
            aria-controls="site-language-panel"
            aria-haspopup="menu"
            data-header-tooltip-trigger=""
          >
            Languages
          </button>
          <div class="site-popover" aria-hidden="true">
            <span class="site-popover__caret"></span>
            <div class="site-popover__content">
              <span class="site-tooltip__content">Languages</span>
            </div>
          </div>
        </div>

        <div
          class="site-popover-container site-icon-tooltip site-popover--bottom site-popover--align-center site-header-tooltip"
          data-header-tooltip=""
        >
          <button
            id="theme-toggle"
            type="button"
            class="site-header__action"
            data-label-switch-light="Switch to light theme"
            data-label-switch-dark="Switch to dark theme"
            data-label-follow-system="Follow system theme"
            data-header-tooltip-trigger=""
          >
            Theme
          </button>
          <div class="site-popover" aria-hidden="true">
            <span class="site-popover__caret"></span>
            <div class="site-popover__content">
              <span class="site-tooltip__content">Theme</span>
            </div>
          </div>
        </div>

        <div
          id="site-language-panel"
          class="site-header__panel site-header__language-panel"
          data-language-panel=""
          hidden
        >
          <div
            class="site-header__panel-content site-header__language-menu"
            role="menu"
            data-language-menu=""
          >
            <a
              href="/"
              class="site-header__language-option"
              data-language-option="en"
              role="menuitemradio"
              aria-checked="true"
              tabindex="0"
            >
              English
            </a>
            <a
              href="/fr/"
              class="site-header__language-option"
              data-language-option="fr"
              role="menuitemradio"
              aria-checked="false"
              tabindex="-1"
            >
              Francais
            </a>
          </div>
        </div>

        <div
          id="site-search-panel"
          class="site-header__panel site-header__search-panel"
          data-search-panel=""
          hidden
        >
          <div class="site-header__panel-content">
            <div
              id="site-search-status"
              class="site-header__search-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-search-status=""
              hidden
            >
              <div class="site-inline-loading site-search-inline-loading" data-search-loading="" hidden>
                <p class="site-inline-loading__text" data-search-loading-text="">
                  Loading search results.
                </p>
              </div>
              <p class="site-header__search-status-text" data-search-status-text="" hidden></p>
              <div
                class="site-notification site-notification--low-contrast site-notification--info site-search-notification"
                data-search-notification=""
                data-search-notification-tone="info"
                hidden
              >
                <div class="site-notification__details">
                  <div class="site-notification__text-wrapper">
                    <p class="site-notification__title" data-search-notification-title=""></p>
                    <p class="site-notification__subtitle" data-search-notification-subtitle=""></p>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="search"
              class="site-header__search-root"
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
                <span class="site-skeleton__text site-search-skeleton-line"></span>
                <span class="site-skeleton__text site-search-skeleton-line"></span>
                <span class="site-skeleton__text site-search-skeleton-line"></span>
              </div>
            </div>
          </div>
        </div>

        <div
          id="site-side-nav"
          class="site-side-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          hidden
        >
          <nav class="site-side-nav__navigation" aria-label="Navigation menu">
            <div class="site-side-nav__header">
              <a href="/" class="site-side-nav__brand">normco.re</a>
              <button
                type="button"
                class="site-side-nav__close"
                aria-label="Close"
                data-side-nav-close=""
              >
                <svg class="site-side-nav__close-icon" aria-hidden="true">
                  <path class="site-side-nav__close-icon-path"></path>
                </svg>
              </button>
            </div>
            <div class="site-side-nav__menu-shell">
              <ul class="site-side-nav__items">
                <li class="site-side-nav__item">
                  <a href="/posts/" class="site-side-nav__link">Articles</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div class="site-side-nav__overlay" aria-hidden="true"></div>
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
        openFilters?: readonly string[];
        showEmptyFilters?: boolean;
        translations?: Record<string, string>;
      },
    ) {
      window.__lastPagefindOptions = options;

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

      const results = window.document.createElement("ol");
      results.className = "pagefind-ui__results";

      resultsArea.append(message, results);
      drawer.append(resultsArea);
      form.append(input, clear, drawer);
      wrapper.append(form);
      target.append(wrapper);

      const translations = options.translations ?? {};
      const loading = translations.searching ?? "Loading";
      const noResults = translations.zero_results ?? "No results";
      const oneResult = translations.one_result ?? "[COUNT] result";
      const manyResults = translations.many_results ?? "[COUNT] results";

      const renderResult = (title: string) => {
        const result = window.document.createElement("li");
        result.className = "pagefind-ui__result";

        const resultTitle = window.document.createElement("p");
        resultTitle.className = "pagefind-ui__result-title";

        const link = window.document.createElement("a");
        link.className = "pagefind-ui__result-link";
        link.href = `/posts/${title.toLowerCase().replace(/\s+/g, "-")}`;
        link.textContent = title;

        resultTitle.append(link);
        result.append(resultTitle);
        return result;
      };

      const revealedResult = renderResult("Revealed result");
      revealedResult.classList.add("pagefind-ui__hidden");
      results.append(revealedResult);

      input.addEventListener("input", () => {
        const term = input.value.trim();
        if (term !== "revealed") {
          results.replaceChildren();
        }

        message.classList.remove("pagefind-ui__hidden");
        revealedResult.classList.add("pagefind-ui__hidden");

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

        if (term === "stale") {
          message.textContent = loading;
          results.append(renderResult("Stale result"));
          return;
        }

        if (term === "revealed") {
          message.textContent = loading;
          message.classList.add("pagefind-ui__hidden");
          revealedResult.classList.remove("pagefind-ui__hidden");
          return;
        }

        if (term === "one") {
          message.textContent = oneResult.replace("[COUNT]", "1");
          results.append(renderResult("One result"));
          return;
        }

        message.textContent = manyResults.replace("[COUNT]", "2");
        results.append(
          renderResult("First result"),
          renderResult("Second result"),
        );
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
  bindHeaderClient(window as unknown as Window & typeof globalThis);
}

function getLanguageToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".site-header__language-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getSearchToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(
    '.site-header__action[aria-controls="site-search-panel"]',
  );
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getMenuToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".site-header__menu-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getSideNav(window: TestWindow): HTMLElement {
  const sideNav = window.document.getElementById("site-side-nav");
  assert(sideNav instanceof window.HTMLElement);
  return sideNav;
}

function getSearchPanel(window: TestWindow): HTMLElement {
  const panel = window.document.querySelector("[data-search-panel]");
  assert(panel instanceof window.HTMLElement);
  return panel;
}

function getSearchNotification(window: TestWindow): HTMLElement {
  const notification = window.document.querySelector(
    "[data-search-notification]",
  );
  assert(notification instanceof window.HTMLElement);
  return notification;
}

function getSearchStatusText(window: TestWindow): HTMLElement {
  const statusText = window.document.querySelector("[data-search-status-text]");
  assert(statusText instanceof window.HTMLElement);
  return statusText;
}

function getSearchLoading(window: TestWindow): HTMLElement {
  const loading = window.document.querySelector("[data-search-loading]");
  assert(loading instanceof window.HTMLElement);
  return loading;
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

function getOutsideFocus(window: TestWindow): HTMLButtonElement {
  const button = window.document.querySelector(".outside-focus");
  assert(button instanceof window.HTMLButtonElement);
  return button;
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
  it("keeps the focus trap selector aligned with richer interactive elements", () => {
    assertStringIncludes(focusableSelectorSource, "audio[controls]");
    assertStringIncludes(focusableSelectorSource, "video[controls]");
    assertStringIncludes(
      focusableSelectorSource,
      "details > summary:first-of-type",
    );
    assertStringIncludes(
      focusableSelectorSource,
      "[contenteditable]:not([contenteditable='false'])",
    );
  });

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

  it("locks body scroll and traps Tab inside the language panel on mobile", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const mobileMedia = createMediaQueryList(true);
    window.matchMedia = () => mobileMedia;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const englishOption = window.document.querySelector(
      '[data-language-option="en"]',
    );
    const frenchOption = window.document.querySelector(
      '[data-language-option="fr"]',
    );
    assert(englishOption instanceof window.HTMLAnchorElement);
    assert(frenchOption instanceof window.HTMLAnchorElement);

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(getLanguagePanel(window).hidden, false);
    assertEquals(window.document.body.style.overflow, "hidden");

    englishOption.focus();
    englishOption.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(window.document.activeElement, frenchOption);

    frenchOption.focus();
    frenchOption.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(window.document.activeElement, englishOption);

    window.document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(getLanguagePanel(window).hidden, true);
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(window.document.activeElement, toggle);
  });

  it("opens the side nav from the keyboard and restores focus from the overlay", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getMenuToggle(window);
    const firstLink = window.document.querySelector(".site-side-nav__link");
    const overlay = window.document.querySelector(".site-side-nav__overlay");
    const outsideFocus = getOutsideFocus(window);
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
    assertEquals(overlay.getAttribute("aria-hidden"), "true");
    assertEquals(outsideFocus.hasAttribute("inert"), true);

    overlay.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(window.document.activeElement, toggle);
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(overlay.getAttribute("aria-hidden"), "true");
    assertEquals(outsideFocus.hasAttribute("inert"), false);
  });

  it("closes the side nav from the internal close button and restores focus", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getMenuToggle(window);
    const closeButton = window.document.querySelector("[data-side-nav-close]");
    assert(closeButton instanceof window.HTMLButtonElement);

    toggle.click();
    await flush(window);

    closeButton.click();
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(window.document.activeElement, toggle);
  });

  it("closes the side nav when the close icon itself is clicked", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getMenuToggle(window);
    const closeIconPath = window.document.querySelector(
      ".site-side-nav__close-icon-path",
    );
    assert(closeIconPath instanceof window.SVGElement);

    toggle.click();
    await flush(window);

    closeIconPath.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true }),
    );
    await flush(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(window.document.activeElement, toggle);
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
    assertEquals(container.classList.contains("site-popover--open"), true);

    outsideButton.focus();
    await flush(window);
    assertEquals(container.classList.contains("site-popover--open"), false);

    trigger.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    trigger.click();
    await flush(window);

    trigger.focus();
    await flush(window);
    assertEquals(container.classList.contains("site-popover--open"), false);
  });

  it("prefetches Pagefind assets when the search control receives intent", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    const originalSupports = window.DOMTokenList.prototype.supports;

    window.DOMTokenList.prototype.supports = function (token: string) {
      if (token === "prefetch") {
        return true;
      }

      return typeof originalSupports === "function"
        ? originalSupports.call(this, token)
        : false;
    };

    try {
      evaluateScript(window);

      const toggle = getSearchToggle(window);
      toggle.focus();
      toggle.dispatchEvent(
        new window.MouseEvent("pointerover", {
          bubbles: true,
        }),
      );
      await flush(window);

      const prefetchedScript = window.document.querySelector(
        'link[rel="prefetch"][href$="/pagefind/pagefind-ui.js"]',
      );
      const prefetchedStylesheet = window.document.querySelector(
        'link[rel="prefetch"][href$="/pagefind/pagefind-ui.css"]',
      );

      assert(prefetchedScript instanceof window.HTMLLinkElement);
      assert(prefetchedStylesheet instanceof window.HTMLLinkElement);
    } finally {
      window.DOMTokenList.prototype.supports = originalSupports;
    }
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
    assert(input instanceof window.HTMLInputElement);
    const notification = getSearchNotification(window);
    const statusText = getSearchStatusText(window);
    const loading = getSearchLoading(window);
    assertEquals(window.document.activeElement, input);

    input.value = "alpha";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);

    assertEquals(notification.hidden, true);
    assertEquals(statusText.hidden, false);
    assertEquals(statusText.textContent, "2 results");
    assertEquals(loading.hidden, true);
    assertEquals(panel.getAttribute("aria-busy"), "false");
  });

  it("clears the inline loader once results are rendered even if Pagefind's message is stale", async () => {
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

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);

    input.value = "stale";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);

    const notification = getSearchNotification(window);
    const statusText = getSearchStatusText(window);
    const loading = getSearchLoading(window);

    assertEquals(notification.hidden, true);
    assertEquals(statusText.hidden, false);
    assertEquals(statusText.textContent, "1 result");
    assertEquals(loading.hidden, true);
  });

  it("clears the inline loader when Pagefind reveals results through class changes", async () => {
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

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);

    input.value = "revealed";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);

    const notification = getSearchNotification(window);
    const statusText = getSearchStatusText(window);
    const loading = getSearchLoading(window);

    assertEquals(notification.hidden, true);
    assertEquals(statusText.hidden, false);
    assertEquals(statusText.textContent, "1 result");
    assertEquals(loading.hidden, true);
  });

  it("initializes Pagefind with filters collapsed by default", async () => {
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

    assertEquals(window.__lastPagefindOptions?.openFilters?.length, 0);
    assertEquals(window.__lastPagefindOptions?.showEmptyFilters, false);
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

  it("locks body scroll while the search panel is open", async () => {
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

    assertEquals(window.document.body.style.overflow, "hidden");

    window.document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(window.document.body.style.overflow, "");
  });

  it("routes Tab into the search panel after a pointer open", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = () => createMediaQueryList(false);
    evaluateScript(window);

    const toggle = getSearchToggle(window);
    toggle.focus();
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

    window.document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);
    assertEquals(window.document.activeElement, input);
  });

  it("keeps Tab navigation trapped inside the search panel", async () => {
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

    const input = window.document.querySelector(".pagefind-ui__search-input");
    assert(input instanceof window.HTMLInputElement);

    input.value = "one";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);

    const resultLink = window.document.querySelector(
      ".pagefind-ui__result-link",
    );
    assert(resultLink instanceof window.HTMLAnchorElement);
    resultLink.focus();

    resultLink.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flush(window);

    assertEquals(window.document.activeElement, input);
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

  it("keeps the header interactive when matchMedia is unavailable", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    window.matchMedia = undefined;

    evaluateScript(window);

    const menuToggle = getMenuToggle(window);
    const themeButton = window.document.getElementById("theme-toggle");
    const sideNav = getSideNav(window);
    assert(themeButton instanceof window.HTMLButtonElement);

    menuToggle.click();
    assertEquals(menuToggle.getAttribute("aria-expanded"), "true");
    assertEquals(sideNav.hidden, false);

    themeButton.click();
    assertEquals(
      window.document.documentElement.getAttribute("data-theme-preference"),
      "light",
    );
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
