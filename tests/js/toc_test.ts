/**
 * Tests for table of contents enhancements.
 *
 * @module tests/js/toc_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { enhanceTOC } from "../../src/js/features/toc.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  addEventListener: globalScope.addEventListener,
  IntersectionObserver: globalScope.IntersectionObserver,
  requestAnimationFrame: globalScope.requestAnimationFrame,
  scrollY: globalScope.scrollY,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.addEventListener = ORIGINAL_GLOBALS.addEventListener;
  globalScope.IntersectionObserver = ORIGINAL_GLOBALS.IntersectionObserver;
  globalScope.requestAnimationFrame = ORIGINAL_GLOBALS.requestAnimationFrame;
  globalScope.scrollY = ORIGINAL_GLOBALS.scrollY;
}

describe("enhanceTOC", () => {
  it("toggles sticky state on scroll", () => {
    const classes = new Set<string>();
    type ScrollHandler = (event: Event) => void;
    let scrollHandler: ScrollHandler | null = null;

    const toc = {
      offsetTop: 100,
      classList: {
        add: (value: string) => classes.add(value),
        remove: (value: string) => classes.delete(value),
      },
      querySelector: () => null,
    };

    globalScope.scrollY = 200;
    globalScope.document = {
      querySelector: () => toc,
      querySelectorAll: () => [],
    } as unknown as Document;
    globalScope.addEventListener =
      ((_event: string, handler: EventListener) => {
        scrollHandler = handler as ScrollHandler;
      }) as Window["addEventListener"];
    globalScope.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof globalThis.requestAnimationFrame;
    globalScope.IntersectionObserver = class implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = "";
      thresholds: ReadonlyArray<number> = [];
      constructor(_callback: IntersectionObserverCallback) {}
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      unobserve() {}
    };

    enhanceTOC();

    if (!scrollHandler) {
      throw new Error("Scroll handler was not registered.");
    }

    const handler = scrollHandler as ScrollHandler;
    handler({} as Event);

    assertEquals(classes.has("toc-sticky"), true);
    restoreGlobals();
  });

  it("highlights active heading links", () => {
    const tocClasses = new Set<string>();
    const linkClasses = new Set<string>();
    let observerCallback: IntersectionObserverCallback | null = null;

    const tocLink = {
      classList: {
        add: (value: string) => linkClasses.add(value),
        remove: (value: string) => linkClasses.delete(value),
      },
    };

    const toc = {
      offsetTop: 0,
      classList: {
        add: (value: string) => tocClasses.add(value),
        remove: (value: string) => tocClasses.delete(value),
      },
      querySelector: () => tocLink,
    };

    const heading = {
      getAttribute: () => "section",
    };

    globalScope.document = {
      querySelector: () => toc,
      querySelectorAll: () => [heading],
    } as unknown as Document;
    globalScope.addEventListener = (() => {}) as Window["addEventListener"];
    globalScope.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof globalThis.requestAnimationFrame;
    globalScope.IntersectionObserver = class implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = "";
      thresholds: ReadonlyArray<number> = [];
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      unobserve() {}
    };

    enhanceTOC();

    if (!observerCallback) {
      throw new Error("Intersection observer was not created.");
    }

    const callback = observerCallback as IntersectionObserverCallback;
    callback(
      [
        {
          target: heading as unknown as Element,
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );

    assertEquals(linkClasses.has("active"), true);
    restoreGlobals();
  });
});
