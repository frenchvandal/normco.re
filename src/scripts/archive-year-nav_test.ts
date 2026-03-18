import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./archive-year-nav.js" with { type: "text" };
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type TestWindow = InstanceType<typeof JSDOM>["window"] & {
  IntersectionObserver: typeof FakeIntersectionObserver;
};

class FakeIntersectionObserver {
  static latest: FakeIntersectionObserver | undefined;

  readonly observed: Element[] = [];
  readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.latest = this;
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  disconnect() {}
  unobserve(_target: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entries: Array<{ target: Element; isIntersecting: boolean }>) {
    this.callback(
      entries.map((entry) =>
        ({
          target: entry.target,
          isIntersecting: entry.isIntersecting,
        }) as IntersectionObserverEntry
      ),
      this as unknown as IntersectionObserver,
    );
  }
}

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <nav class="archive-year-nav">
          <ol class="archive-year-nav-list">
            <li class="archive-year-nav-item">
              <a
                href="#archive-year-2026"
                class="archive-year-nav-link"
                data-archive-year-link=""
                aria-current="location"
              >
                2026
              </a>
            </li>
            <li class="archive-year-nav-item">
              <a
                href="#archive-year-2025"
                class="archive-year-nav-link"
                data-archive-year-link=""
              >
                2025
              </a>
            </li>
          </ol>
        </nav>
        <section id="archive-year-2026" data-archive-year-section=""></section>
        <section id="archive-year-2025" data-archive-year-section=""></section>
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
  window.IntersectionObserver = FakeIntersectionObserver;
  window.eval(SCRIPT_SOURCE);
  window.document.dispatchEvent(
    new window.Event("DOMContentLoaded", { bubbles: true }),
  );
}

function getYearLink(window: TestWindow, year: string): HTMLAnchorElement {
  const link = window.document.querySelector(
    `[href="#archive-year-${year}"]`,
  );
  assert(link instanceof window.HTMLAnchorElement);
  return link;
}

describe("archive-year-nav.js", () => {
  it("tracks the visible year section and mirrors it in the rail", () => {
    const dom = createDom();
    const window = dom.window as TestWindow;
    evaluateScript(window);

    const link2026 = getYearLink(window, "2026");
    const link2025 = getYearLink(window, "2025");
    const observer = FakeIntersectionObserver.latest;
    assert(observer instanceof FakeIntersectionObserver);

    assertEquals(link2026.getAttribute("aria-current"), "location");
    assertEquals(link2025.hasAttribute("aria-current"), false);

    const section2025 = window.document.getElementById("archive-year-2025");
    assert(section2025 instanceof window.HTMLElement);
    observer.trigger([{ target: section2025, isIntersecting: true }]);

    assertEquals(link2026.hasAttribute("aria-current"), false);
    assertEquals(link2025.getAttribute("aria-current"), "location");
  });
});
