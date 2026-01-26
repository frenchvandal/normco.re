/**
 * Tests for anchor enhancements.
 *
 * @module src/js/features/anchors_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { enhanceAnchors } from "./anchors.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  history: globalScope.history,
  matchMedia: globalScope.matchMedia,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.history = ORIGINAL_GLOBALS.history;
  globalScope.matchMedia = ORIGINAL_GLOBALS.matchMedia;
}

describe("enhanceAnchors", () => {
  it("scrolls to target and updates history", () => {
    type ClickHandler = (event: Event) => void;
    let clickHandler: ClickHandler | null = null;
    let prevented = false;
    let historyHref = "";
    let scrolledWith: ScrollIntoViewOptions | null = null;
    let focusCalls = 0;

    const target = {
      setAttribute: (_name: string, _value: string) => {},
      focus: (_options?: { preventScroll?: boolean }) => {
        focusCalls += 1;
      },
      scrollIntoView: (options: ScrollIntoViewOptions) => {
        scrolledWith = options;
      },
    };

    const anchor = {
      getAttribute: (name: string) => (name === "href" ? "#section" : null),
    };

    globalScope.matchMedia =
      (() => ({ matches: false })) as unknown as typeof globalThis.matchMedia;
    globalScope.document = ({
      addEventListener: (_event: string, handler: EventListener) => {
        clickHandler = handler as ClickHandler;
      },
      querySelector: (
        selector: string,
      ) => (selector === "#section" ? target : null),
    }) as unknown as Document;
    globalScope.history = ({
      pushState: (_state: unknown, _title: string, url: string) => {
        historyHref = url;
      },
    }) as unknown as History;

    enhanceAnchors();

    if (!clickHandler) {
      throw new Error("Click handler was not registered.");
    }

    const handler = clickHandler as ClickHandler;
    handler({
      target: { closest: () => anchor },
      preventDefault: () => {
        prevented = true;
      },
    } as unknown as Event);

    assertEquals(prevented, true);
    assertEquals(historyHref, "#section");
    const scrollOptions = scrolledWith as { behavior?: string } | null;
    assertEquals(scrollOptions?.behavior, "smooth");
    assertEquals(focusCalls >= 1, true);
    restoreGlobals();
  });
});
