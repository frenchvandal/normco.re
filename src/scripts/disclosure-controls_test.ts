import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { JSDOM } from "npm:jsdom@29.0.0";

const SCRIPT_SOURCE = await Deno.readTextFile(
  new URL("./disclosure-controls.js", import.meta.url),
);

type TestWindow = JSDOM["window"];

function createDom(): JSDOM {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
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
        <button
          type="button"
          class="cds--header__action cds--header__language-toggle"
          aria-expanded="false"
          aria-controls="site-language-panel"
          aria-haspopup="menu"
        >
          Languages
        </button>
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
        <aside
          id="site-side-nav"
          class="cds--side-nav"
          hidden
        >
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
      url: "https://normco.re/",
    },
  );
}

async function waitForTimers(window: TestWindow, delay = 60) {
  await new Promise((resolve) => window.setTimeout(resolve, delay));
}

function evaluateScript(window: TestWindow) {
  window.eval(SCRIPT_SOURCE);
  window.document.dispatchEvent(
    new window.Event("DOMContentLoaded", { bubbles: true }),
  );
}

function getLanguageToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".cds--header__language-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getNavToggle(window: TestWindow): HTMLButtonElement {
  const toggle = window.document.querySelector(".cds--header__menu-toggle");
  assert(toggle instanceof window.HTMLButtonElement);
  return toggle;
}

function getOutsideButton(window: TestWindow): HTMLButtonElement {
  const button = window.document.querySelector(".outside-focus");
  assert(button instanceof window.HTMLButtonElement);
  return button;
}

function getLanguagePanel(window: TestWindow): HTMLElement {
  const panel = window.document.getElementById("site-language-panel");
  assert(panel instanceof window.HTMLElement);
  return panel;
}

function getSideNav(window: TestWindow): HTMLElement {
  const sideNav = window.document.getElementById("site-side-nav");
  assert(sideNav instanceof window.HTMLElement);
  return sideNav;
}

function getSideNavOverlay(window: TestWindow): HTMLElement {
  const overlay = window.document.querySelector(".cds--side-nav__overlay");
  assert(overlay instanceof window.HTMLElement);
  return overlay;
}

function getSelectedLanguageOption(window: TestWindow): HTMLAnchorElement {
  const selectedOption = window.document.querySelector(
    '[data-language-option][aria-checked="true"]',
  );
  assert(selectedOption instanceof window.HTMLAnchorElement);
  return selectedOption;
}

function captureWindowErrors(window: TestWindow): unknown[] {
  const errors: unknown[] = [];
  window.addEventListener("error", (event: ErrorEvent) => {
    errors.push(event.error ?? event.message);
    event.preventDefault();
  });
  return errors;
}

describe("disclosure-controls.js", () => {
  it("keeps focus on the trigger when the language panel is opened with a pointer", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const panel = getLanguagePanel(window);
    toggle.focus();

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(panel.hasAttribute("hidden"), false);
    assertEquals(window.document.activeElement, toggle);
  });

  it("moves focus into the language menu when arrow navigation starts from the trigger", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const selectedOption = getSelectedLanguageOption(window);
    toggle.focus();

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await waitForTimers(window);

    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
      }),
    );
    await waitForTimers(window);

    assertEquals(window.document.activeElement, selectedOption);
  });

  it("prevents page scrolling keys from escaping to the document when the language panel is open", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const selectedOption = getSelectedLanguageOption(window);
    const outsideButton = window.document.querySelector(".outside-focus");
    assert(outsideButton instanceof window.HTMLButtonElement);

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await waitForTimers(window);

    outsideButton.focus();

    const event = new window.KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    const dispatchResult = outsideButton.dispatchEvent(event);
    await waitForTimers(window);

    assertEquals(dispatchResult, false);
    assertEquals(window.document.activeElement, selectedOption);
  });

  it("moves focus to the selected language option when the panel is opened from the keyboard", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const selectedOption = getSelectedLanguageOption(window);
    toggle.focus();

    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(window.document.activeElement, selectedOption);
  });

  it("closes the language panel and restores focus to the trigger on Escape", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const panel = getLanguagePanel(window);
    const selectedOption = getSelectedLanguageOption(window);
    toggle.focus();

    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    await waitForTimers(window);

    assertEquals(window.document.activeElement, selectedOption);

    window.document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(panel.hasAttribute("hidden"), true);
    assertEquals(window.document.activeElement, toggle);
  });

  it("closes the language panel when clicking outside the disclosure surfaces", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const panel = getLanguagePanel(window);
    const outsideButton = getOutsideButton(window);

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await waitForTimers(window);

    outsideButton.focus();
    outsideButton.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true }),
    );
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(panel.hasAttribute("hidden"), true);
    assertEquals(window.document.activeElement, outsideButton);
  });

  it("closes the side nav from the overlay and restores focus to the toggle", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const toggle = getNavToggle(window);
    const sideNav = getSideNav(window);
    const overlay = getSideNavOverlay(window);

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(sideNav.hasAttribute("hidden"), false);
    assertEquals(overlay.getAttribute("aria-hidden"), "false");
    assertEquals(window.document.body.style.overflow, "hidden");

    overlay.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(sideNav.hasAttribute("hidden"), true);
    assertEquals(overlay.getAttribute("aria-hidden"), "true");
    assertEquals(window.document.body.style.overflow, "");
    assertEquals(window.document.activeElement, toggle);
  });

  it("does not focus a language option after the panel closes before the deferred timer runs", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const errors = captureWindowErrors(window);
    evaluateScript(window);

    const toggle = getLanguageToggle(window);
    const selectedOption = getSelectedLanguageOption(window);
    selectedOption.focus = () => {
      throw new Error("language option focus should not run after close");
    };
    toggle.focus();

    toggle.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
    toggle.click();
    toggle.click();
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "false");
    assertEquals(errors.length, 0);
    assertEquals(window.document.activeElement, toggle);
  });

  it("does not focus a removed side-nav link after the deferred timer runs", async () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    const errors = captureWindowErrors(window);
    evaluateScript(window);

    const toggle = getNavToggle(window);
    const sideNav = getSideNav(window);
    const firstLink = sideNav.querySelector(
      "a.cds--side-nav__link",
    ) as HTMLAnchorElement | null;
    if (firstLink === null) {
      throw new Error("Expected side-nav link to exist");
    }
    firstLink.focus = () => {
      throw new Error("removed side-nav link should not receive focus");
    };

    toggle.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    );
    toggle.click();
    firstLink.remove();
    await waitForTimers(window);

    assertEquals(toggle.getAttribute("aria-expanded"), "true");
    assertEquals(errors.length, 0);
  });
});
