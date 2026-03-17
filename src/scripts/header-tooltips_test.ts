import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./header-tooltips.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"];

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <button type="button" class="outside-focus">Outside</button>
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
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

function getTooltipContainer(window: TestWindow): HTMLElement {
  const container = window.document.querySelector("[data-header-tooltip]");
  assert(container instanceof window.HTMLElement);
  return container;
}

function getTooltipTrigger(window: TestWindow): HTMLButtonElement {
  const trigger = window.document.querySelector(
    "[data-header-tooltip-trigger]",
  );
  assert(trigger instanceof window.HTMLButtonElement);
  return trigger;
}

describe("header-tooltips.js", () => {
  it("opens the tooltip on focus and closes it when focus leaves the container", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const container = getTooltipContainer(window);
    const trigger = getTooltipTrigger(window);
    const outsideButton = window.document.querySelector(".outside-focus");
    assert(outsideButton instanceof window.HTMLButtonElement);

    trigger.focus();
    trigger.dispatchEvent(new window.FocusEvent("focusin", { bubbles: true }));

    assertEquals(container.classList.contains("cds--popover--open"), true);

    outsideButton.focus();
    trigger.dispatchEvent(
      new window.FocusEvent("focusout", {
        bubbles: true,
        relatedTarget: outsideButton,
      }),
    );

    assertEquals(container.classList.contains("cds--popover--open"), false);
  });

  it("does not reopen a tooltip while the linked panel trigger is expanded", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const container = getTooltipContainer(window);
    const trigger = getTooltipTrigger(window);
    trigger.setAttribute("aria-expanded", "true");

    trigger.dispatchEvent(
      new window.FocusEvent("focusin", { bubbles: true }),
    );

    assertEquals(container.classList.contains("cds--popover--open"), false);
  });
});
