/**
 * Tests for the Pagefind loader.
 *
 * @module tests/js/pagefind_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  loadPagefindUI,
  resetPagefindLoader,
} from "../../src/js/core/pagefind.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  PagefindUI: globalScope.PagefindUI,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.PagefindUI = ORIGINAL_GLOBALS.PagefindUI;
}

describe("loadPagefindUI", () => {
  it("resolves immediately when Pagefind UI is already present", async () => {
    resetPagefindLoader();
    globalScope.PagefindUI = class {};
    globalScope.document = {
      querySelector: () => null,
      createElement: () => ({}),
      head: { appendChild: () => {} },
    } as unknown as Document;

    await loadPagefindUI();

    assertEquals(typeof loadPagefindUI, "function");
    restoreGlobals();
  });

  it("reuses an existing script tag", async () => {
    resetPagefindLoader();
    type LoadHandler = () => void;
    let loadHandler: LoadHandler | null = null;
    const existingScript = {
      addEventListener: (event: string, handler: LoadHandler) => {
        if (event === "load") {
          loadHandler = handler;
        }
      },
    };

    globalScope.document = {
      querySelector: () => existingScript,
      createElement: () => ({}),
      head: { appendChild: () => {} },
    } as unknown as Document;

    const promise = loadPagefindUI();

    if (!loadHandler) {
      throw new Error("Load handler was not registered.");
    }

    const handler = loadHandler as LoadHandler;
    handler();

    await promise;

    assertEquals(typeof promise.then, "function");
    restoreGlobals();
  });

  it("injects a script tag when needed", async () => {
    resetPagefindLoader();
    let appendedScript:
      | { src?: string; dataset?: Record<string, string> }
      | null = null;
    type LoadHandler = () => void;
    let loadHandler: LoadHandler | null = null;

    const script: {
      dataset: Record<string, string>;
      addEventListener: (event: string, handler: LoadHandler) => void;
      src?: string;
    } = {
      dataset: {},
      addEventListener: (event: string, handler: LoadHandler) => {
        if (event === "load") {
          loadHandler = handler;
        }
      },
    };

    globalScope.document = {
      querySelector: () => null,
      createElement: () => script,
      head: {
        appendChild: (node: typeof script) => {
          appendedScript = node;
        },
      },
    } as unknown as Document;

    const promise = loadPagefindUI();

    if (!loadHandler) {
      throw new Error("Load handler was not registered.");
    }

    const handler = loadHandler as LoadHandler;
    handler();

    await promise;

    const appended = appendedScript as
      | { src?: string; dataset?: Record<string, string> }
      | null;
    assertEquals(appended?.src, "/pagefind/pagefind-ui.js");
    assertEquals(appended?.dataset?.pagefindUi, "true");
    restoreGlobals();
  });
});
