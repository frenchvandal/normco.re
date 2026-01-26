/**
 * Tests for UI component initialization.
 *
 * @module src/js/core/ui-components_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { initializeUIComponents } from "./ui-components.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  toast: globalScope.toast,
  openModal: globalScope.openModal,
  closeModal: globalScope.closeModal,
  toggleModal: globalScope.toggleModal,
};

function restoreGlobals(): void {
  globalScope.toast = ORIGINAL_GLOBALS.toast;
  globalScope.openModal = ORIGINAL_GLOBALS.openModal;
  globalScope.closeModal = ORIGINAL_GLOBALS.closeModal;
  globalScope.toggleModal = ORIGINAL_GLOBALS.toggleModal;
}

describe("initializeUIComponents", () => {
  it("initializes tabs, toasts, and modals", () => {
    const calls: string[] = [];

    const dependencies = {
      TabsManager: { initAll: () => calls.push("tabs") },
      ToastManager: class {
        constructor() {
          calls.push("toast");
        }
      },
      ModalManager: { initAll: () => calls.push("modals") },
      openModal: () => {},
      closeModal: () => {},
      toggleModal: () => {},
    };

    initializeUIComponents(dependencies);

    assertEquals(calls, ["tabs", "toast", "modals"]);
    restoreGlobals();
  });

  it("exposes modal helpers globally", () => {
    const dependencies = {
      TabsManager: { initAll: () => {} },
      ToastManager: class {},
      ModalManager: { initAll: () => {} },
      openModal: () => {},
      closeModal: () => {},
      toggleModal: () => {},
    };

    initializeUIComponents(dependencies);

    assertExists(globalScope.openModal);
    assertExists(globalScope.closeModal);
    assertExists(globalScope.toggleModal);
    restoreGlobals();
  });
});
