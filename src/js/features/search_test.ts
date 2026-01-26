/**
 * Tests for search initialization behaviors.
 *
 * @module src/js/features/search_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { initSearch } from "./search.js";
import { initSearchModal } from "./search-modal.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  toast: globalScope.toast,
  PagefindUI: globalScope.PagefindUI,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.toast = ORIGINAL_GLOBALS.toast;
  globalScope.PagefindUI = ORIGINAL_GLOBALS.PagefindUI;
}

async function flushMicrotasks(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("initSearch", () => {
  it("initializes Pagefind and removes skeleton", async () => {
    let skeletonRemoved = false;
    let ariaBusyRemoved = false;
    let pagefindOptions: Record<string, unknown> | null = null;

    const container = {
      setAttribute: () => {},
      removeAttribute: () => {
        ariaBusyRemoved = true;
      },
      querySelector: () => ({
        remove: () => {
          skeletonRemoved = true;
        },
      }),
    };

    globalScope.document = {
      getElementById: () => container,
    } as unknown as Document;

    initSearch({
      loadPagefindUI: () => Promise.resolve(),
      PagefindUI: class {
        constructor(options: object) {
          pagefindOptions = options as Record<string, unknown>;
        }
      },
    });

    await flushMicrotasks();

    assertEquals(skeletonRemoved, true);
    assertEquals(ariaBusyRemoved, true);
    assertEquals(pagefindOptions?.["excerptLength"], 15);
    restoreGlobals();
  });

  it("shows a toast on Pagefind failure", async () => {
    let toastMessage = "";
    const container = {
      setAttribute: () => {},
      removeAttribute: () => {},
      querySelector: () => null,
    };

    globalScope.document = {
      getElementById: () => container,
    } as unknown as Document;
    globalScope.toast = {
      error: (message: string) => {
        toastMessage = message;
      },
    } as unknown as { error: (message: string) => void };

    initSearch({
      loadPagefindUI: () => Promise.reject(new Error("fail")),
      PagefindUI: class {},
      toast: globalScope.toast as { error: (message: string) => void },
    });

    await flushMicrotasks();

    assertEquals(toastMessage, "Search is unavailable right now.");
    restoreGlobals();
  });
});

describe("initSearchModal", () => {
  it("opens modal with keyboard shortcut", () => {
    let openCalled = false;
    type KeydownHandler = (event: Event) => void;
    let keydownHandler: KeydownHandler | null = null;

    const modal = {
      getAttribute: () => "open",
      setAttribute: () => {},
      removeAttribute: () => {},
      querySelector: () => ({ focus: () => {} }),
      addEventListener: () => {},
    };

    globalScope.document = {
      getElementById: () => modal,
      addEventListener: (_event: string, handler: EventListener) => {
        keydownHandler = handler as KeydownHandler;
      },
    } as unknown as Document;

    initSearchModal({
      openModal: () => {
        openCalled = true;
      },
      closeModal: () => {},
      loadPagefindUI: () => Promise.resolve(),
      PagefindUI: class {},
      setTimeout: ((handler: () => void) => {
        handler();
        return 0;
      }) as typeof globalThis.setTimeout,
    });

    if (!keydownHandler) {
      throw new Error("Keyboard handler was not registered.");
    }

    const handler = keydownHandler as KeydownHandler;
    handler({
      metaKey: true,
      ctrlKey: false,
      key: "k",
      preventDefault: () => {},
    } as unknown as Event);

    assertEquals(openCalled, true);
    restoreGlobals();
  });

  it("initializes Pagefind UI on modal open", async () => {
    let pagefindOptions: Record<string, unknown> | null = null;
    type ModalOpenHandler = (event: Event) => void;
    let modalOpenHandler: ModalOpenHandler | null = null;
    let busyRemoved = false;

    const searchContainer = {
      setAttribute: () => {},
      removeAttribute: () => {
        busyRemoved = true;
      },
    };

    const modal = {
      getAttribute: () => "open",
      setAttribute: () => {},
      removeAttribute: () => {},
      querySelector: (selector: string) => {
        if (selector === ".search-modal__content") {
          return searchContainer;
        }
        return { focus: () => {} };
      },
      addEventListener: (event: string, handler: EventListener) => {
        if (event === "modal:open") {
          modalOpenHandler = handler as ModalOpenHandler;
        }
      },
    };

    globalScope.document = {
      getElementById: () => modal,
      addEventListener: () => {},
    } as unknown as Document;

    initSearchModal({
      openModal: () => {},
      closeModal: () => {},
      loadPagefindUI: () => Promise.resolve(),
      PagefindUI: class {
        constructor(options: object) {
          pagefindOptions = options as Record<string, unknown>;
        }
      },
      setTimeout: ((handler: () => void) => {
        handler();
        return 0;
      }) as typeof globalThis.setTimeout,
    });

    if (!modalOpenHandler) {
      throw new Error("Modal open handler was not registered.");
    }

    const modalHandler = modalOpenHandler as ModalOpenHandler;
    modalHandler({} as unknown as Event);
    await flushMicrotasks();

    assertEquals(pagefindOptions?.["autofocus"], true);
    assertEquals(busyRemoved, true);
    restoreGlobals();
  });
});
