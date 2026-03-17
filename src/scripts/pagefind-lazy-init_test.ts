import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./pagefind-lazy-init.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  PagefindUI?: new (options: {
    element: string;
    translations?: Record<string, string>;
  }) => unknown;
};

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <head></head>
      <body>
        <div
          id="site-search-panel"
          class="cds--header__panel cds--header__search-panel"
          data-search-panel=""
          hidden
        >
          <div class="cds--header__panel-content">
            <p
              id="site-search-status"
              class="cds--header__search-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-search-status=""
              hidden
            ></p>
            <div
              id="search"
              class="cds--header__search-root"
              data-search-root=""
              data-search-loading-label="Loading search results."
              data-search-no-results-label="No results found."
              data-search-one-result-label="[COUNT] result"
              data-search-many-results-label="[COUNT] results"
              data-search-unavailable-label="Search is temporarily unavailable."
              data-search-offline-label="Search is unavailable while offline."
              data-search-retry-label="Retry"
            ></div>
          </div>
        </div>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/",
    },
  );
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
      target.replaceChildren(wrapper);

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

async function flush(window: TestWindow, cycles = 3) {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

function getSearchPanel(window: TestWindow): HTMLElement {
  const panel = window.document.querySelector("[data-search-panel]");
  assert(panel instanceof window.HTMLElement);
  return panel;
}

function getStatus(window: TestWindow): HTMLElement {
  const status = window.document.querySelector("[data-search-status]");
  assert(status instanceof window.HTMLElement);
  return status;
}

function getSearchRoot(window: TestWindow): HTMLElement {
  const root = window.document.querySelector("[data-search-root]");
  assert(root instanceof window.HTMLElement);
  return root;
}

function getSearchInput(window: TestWindow): HTMLInputElement {
  const input = window.document.querySelector(".pagefind-ui__search-input");
  assert(input instanceof window.HTMLInputElement);
  return input;
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

describe("pagefind-lazy-init.js", () => {
  it("shows loading before Pagefind is ready, then focuses the input and mirrors result states", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const panel = getSearchPanel(window);
    panel.removeAttribute("hidden");
    panel.setAttribute("expanded", "");

    await flush(window, 1);

    const status = getStatus(window);
    const root = getSearchRoot(window);
    assertEquals(status.hidden, false);
    assertEquals(status.textContent, "Loading search results.");
    assertEquals(root.getAttribute("aria-busy"), "true");
    assertEquals(root.dataset.searchBusy, "true");
    assertEquals(panel.getAttribute("aria-busy"), "true");

    const runtimeScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(runtimeScript instanceof window.HTMLScriptElement);

    installFakePagefind(window);
    runtimeScript.dispatchEvent(new window.Event("load"));

    await flush(window);

    const input = getSearchInput(window);
    assertEquals(window.document.activeElement, input);
    assertEquals(status.hidden, true);
    assertEquals(root.getAttribute("aria-busy"), "false");
    assertEquals(root.dataset.searchBusy, "false");
    assertEquals(panel.getAttribute("aria-busy"), "false");

    input.value = "alpha";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);
    assertEquals(status.hidden, false);
    assertEquals(status.textContent, "2 results");
    assertEquals(root.getAttribute("aria-busy"), "false");

    input.value = "none";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    await flush(window);
    assertEquals(status.textContent, "No results found.");
  });

  it("keeps the retry action keyboard usable after an initialization failure", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const panel = getSearchPanel(window);
    panel.removeAttribute("hidden");
    panel.setAttribute("expanded", "");

    await flush(window, 1);

    const failingScript = window.document.querySelector(
      'script[src="/pagefind/pagefind-ui.js"]',
    );
    assert(failingScript instanceof window.HTMLScriptElement);
    failingScript.dispatchEvent(new window.Event("error"));

    await flush(window);

    const status = getStatus(window);
    const root = getSearchRoot(window);
    assertEquals(status.textContent, "Search is temporarily unavailable.");
    assertEquals(root.getAttribute("aria-busy"), "false");
    assertEquals(panel.getAttribute("aria-busy"), "false");

    const retryButton = window.document.querySelector(
      "[data-pagefind-fallback] .pagefind-ui__button",
    );
    assert(retryButton instanceof window.HTMLButtonElement);
    assertEquals(window.document.activeElement, retryButton);

    installFakePagefind(window);
    retryButton.click();

    await flush(window);

    const input = getSearchInput(window);
    assertEquals(window.document.activeElement, input);
  });
});
