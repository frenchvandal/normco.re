import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./surface-controls.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"];

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <div class="cds--content-switcher" data-content-switcher="">
          <button
            type="button"
            class="cds--content-switcher-btn cds--content-switcher--selected"
            data-content-switcher-trigger=""
            aria-selected="true"
            aria-controls="switcher-panel-cards"
          >
            Cards
          </button>
          <button
            type="button"
            class="cds--content-switcher-btn"
            data-content-switcher-trigger=""
            aria-selected="false"
            tabindex="-1"
            aria-controls="switcher-panel-list"
          >
            List
          </button>
        </div>
        <section id="switcher-panel-cards" data-content-switcher-panel="">Cards panel</section>
        <section id="switcher-panel-list" data-content-switcher-panel="" hidden>List panel</section>

        <div class="cds--tabs cds--tabs--contained" data-site-tabs="">
          <ul class="cds--tab--list" role="tablist">
            <li class="cds--tabs__nav-item cds--tabs__nav-item--selected">
              <button
                type="button"
                class="cds--tabs__nav-link"
                data-tabs-trigger=""
                role="tab"
                aria-selected="true"
                aria-controls="tab-panel-a"
              >
                <span class="cds--tabs__nav-item-label">A</span>
              </button>
            </li>
            <li class="cds--tabs__nav-item">
              <button
                type="button"
                class="cds--tabs__nav-link"
                data-tabs-trigger=""
                role="tab"
                aria-selected="false"
                tabindex="-1"
                aria-controls="tab-panel-b"
              >
                <span class="cds--tabs__nav-item-label">B</span>
              </button>
            </li>
          </ul>
        </div>
        <section id="tab-panel-a" role="tabpanel" data-tabs-panel="">Panel A</section>
        <section id="tab-panel-b" role="tabpanel" data-tabs-panel="" hidden>Panel B</section>

        <ul class="cds--accordion" data-site-accordion="">
          <li class="cds--accordion__item">
            <button
              type="button"
              class="cds--accordion__heading"
              data-accordion-trigger=""
              aria-expanded="false"
              aria-controls="accordion-panel-1"
            >
              One
            </button>
            <div id="accordion-panel-1" data-accordion-panel="" hidden>Body</div>
          </li>
        </ul>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/posts/",
    },
  );
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
}

describe("surface-controls.js", () => {
  it("switches content-switcher panels and selection state", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const buttons = Array.from(
      window.document.querySelectorAll("[data-content-switcher-trigger]"),
    ).filter((candidate): candidate is HTMLButtonElement =>
      candidate instanceof window.HTMLButtonElement
    );

    const listButton = buttons[1];
    assert(listButton);
    listButton.click();

    const cardsPanel = window.document.getElementById("switcher-panel-cards");
    const listPanel = window.document.getElementById("switcher-panel-list");
    assert(cardsPanel instanceof window.HTMLElement);
    assert(listPanel instanceof window.HTMLElement);

    assertEquals(listButton.getAttribute("aria-selected"), "true");
    assertEquals(
      listButton.classList.contains("cds--content-switcher--selected"),
      true,
    );
    assertEquals(cardsPanel.hidden, true);
    assertEquals(listPanel.hidden, false);
  });

  it("switches tabs and selected tab-item classes", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const tabs = Array.from(
      window.document.querySelectorAll("[data-tabs-trigger]"),
    ).filter((candidate): candidate is HTMLButtonElement =>
      candidate instanceof window.HTMLButtonElement
    );
    const secondTab = tabs[1];
    assert(secondTab);
    secondTab.click();

    const firstItem = tabs[0]?.closest(".cds--tabs__nav-item");
    const secondItem = secondTab.closest(".cds--tabs__nav-item");
    const panelA = window.document.getElementById("tab-panel-a");
    const panelB = window.document.getElementById("tab-panel-b");
    if (!(firstItem instanceof window.HTMLElement)) {
      throw new Error("Expected the first tab item to exist.");
    }
    if (!(secondItem instanceof window.HTMLElement)) {
      throw new Error("Expected the second tab item to exist.");
    }
    if (!(panelA instanceof window.HTMLElement)) {
      throw new Error("Expected tab panel A to exist.");
    }
    if (!(panelB instanceof window.HTMLElement)) {
      throw new Error("Expected tab panel B to exist.");
    }
    const firstTabItem = firstItem as HTMLElement;
    const secondTabItem = secondItem as HTMLElement;

    assertEquals(
      firstTabItem.classList.contains("cds--tabs__nav-item--selected"),
      false,
    );
    assertEquals(
      secondTabItem.classList.contains("cds--tabs__nav-item--selected"),
      true,
    );
    assertEquals(panelA.hidden, true);
    assertEquals(panelB.hidden, false);
  });

  it("toggles accordion panels and active item classes", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const trigger = window.document.querySelector("[data-accordion-trigger]");
    const panel = window.document.getElementById("accordion-panel-1");
    const item = trigger?.closest(".cds--accordion__item");
    assert(trigger instanceof window.HTMLButtonElement);
    assert(panel instanceof window.HTMLElement);
    assert(item instanceof window.HTMLElement);

    trigger.click();

    assertEquals(trigger.getAttribute("aria-expanded"), "true");
    assertEquals(panel.hidden, false);
    assertEquals(item.classList.contains("cds--accordion__item--active"), true);
  });
});
