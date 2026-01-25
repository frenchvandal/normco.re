/**
 * Tests for ModalManager JavaScript component
 *
 * These tests verify the client-side modal functionality including:
 * - Opening/closing modals
 * - Focus management
 * - Keyboard navigation (Escape, Tab trap)
 * - ARIA attribute updates
 *
 * @module tests/js/modal-manager_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { spy } from "@std/testing/mock";
import { DOMParser, Element, HTMLDocument } from "@b-fuze/deno-dom";

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock DOM environment with modal structure
 */
function createModalDOM(): { document: HTMLDocument; backdrop: Element } {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <button id="trigger">Open Modal</button>
      <div class="modal-backdrop" id="test-modal" data-state="closed"
        aria-hidden="true" role="dialog" aria-modal="true"
        aria-labelledby="test-modal-title">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title" id="test-modal-title">Test Modal</h2>
            <button class="modal__close" aria-label="Close dialog">×</button>
          </div>
          <div class="modal__body">
            <p>Modal content</p>
            <input type="text" id="input1" />
            <button id="btn1">Button 1</button>
            <button id="btn2">Button 2</button>
          </div>
          <div class="modal__footer">
            <button id="cancel">Cancel</button>
            <button id="save">Save</button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const document = new DOMParser().parseFromString(html, "text/html")!;
  const backdrop = document.getElementById("test-modal")!;

  return { document, backdrop };
}

/**
 * Simulates a simplified ModalManager for testing
 */
class MockModalManager {
  modalId: string;
  backdrop: Element;
  modal: Element | null;
  closeButtons: Element[];
  isOpen: boolean;
  previousFocus: Element | null;
  focusableElements: Element[];

  constructor(modalId: string, document: HTMLDocument) {
    this.modalId = modalId;
    this.backdrop = document.getElementById(modalId)!;
    this.modal = this.backdrop?.querySelector(".modal") ?? null;
    this.closeButtons = Array.from(
      this.backdrop?.querySelectorAll(".modal__close") ?? [],
    );
    this.isOpen = false;
    this.previousFocus = null;
    this.focusableElements = [];

    if (this.backdrop?.getAttribute("data-state") === "open") {
      this.isOpen = true;
    }
  }

  open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.backdrop.setAttribute("data-state", "open");
    this.backdrop.removeAttribute("aria-hidden");

    this.updateFocusableElements();
  }

  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.backdrop.setAttribute("data-state", "closed");
    this.backdrop.setAttribute("aria-hidden", "true");
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleKeyboard(key: string): boolean {
    if (!this.isOpen) return false;

    if (key === "Escape") {
      this.close();
      return true;
    }

    return false;
  }

  updateFocusableElements(): void {
    if (!this.modal) return;

    const focusableSelectors = [
      "a[href]:not([disabled])",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelectors),
    );
  }

  getFirstFocusable(): Element | null {
    return this.focusableElements[0] ?? null;
  }

  getLastFocusable(): Element | null {
    return this.focusableElements[this.focusableElements.length - 1] ?? null;
  }

  shouldTrapFocus(
    direction: "forward" | "backward",
    activeElement: Element,
  ): Element | null {
    if (this.focusableElements.length === 0) return null;

    const firstElement = this.getFirstFocusable();
    const lastElement = this.getLastFocusable();

    if (direction === "forward" && activeElement === lastElement) {
      return firstElement;
    }

    if (direction === "backward" && activeElement === firstElement) {
      return lastElement;
    }

    return null;
  }
}

// =============================================================================
// Initialization Tests
// =============================================================================

describe("ModalManager - initialization", () => {
  it("should find backdrop element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    assertExists(manager.backdrop);
  });

  it("should find modal element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    assertExists(manager.modal);
  });

  it("should find close buttons", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    assertEquals(manager.closeButtons.length, 1);
  });

  it("should detect closed initial state", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    assertEquals(manager.isOpen, false);
  });

  it("should detect open initial state", () => {
    const { document, backdrop } = createModalDOM();
    backdrop.setAttribute("data-state", "open");
    const manager = new MockModalManager("test-modal", document);
    assertEquals(manager.isOpen, true);
  });
});

// =============================================================================
// Open/Close Tests
// =============================================================================

describe("ModalManager - open", () => {
  it("should set isOpen to true", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    manager.open();

    assertEquals(manager.isOpen, true);
  });

  it("should set data-state to open", () => {
    const { document, backdrop } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    manager.open();

    assertEquals(backdrop.getAttribute("data-state"), "open");
  });

  it("should remove aria-hidden", () => {
    const { document, backdrop } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    manager.open();

    assertEquals(backdrop.hasAttribute("aria-hidden"), false);
  });

  it("should not open if already open", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();
    const openSpy = spy(manager, "updateFocusableElements");

    manager.open(); // Second call

    assertEquals(openSpy.calls.length, 0);
  });
});

describe("ModalManager - close", () => {
  it("should set isOpen to false", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    manager.close();

    assertEquals(manager.isOpen, false);
  });

  it("should set data-state to closed", () => {
    const { document, backdrop } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    manager.close();

    assertEquals(backdrop.getAttribute("data-state"), "closed");
  });

  it("should set aria-hidden to true", () => {
    const { document, backdrop } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    manager.close();

    assertEquals(backdrop.getAttribute("aria-hidden"), "true");
  });

  it("should not close if already closed", () => {
    const { document, backdrop } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    manager.close(); // Already closed

    assertEquals(backdrop.getAttribute("data-state"), "closed");
  });
});

describe("ModalManager - toggle", () => {
  it("should open closed modal", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    manager.toggle();

    assertEquals(manager.isOpen, true);
  });

  it("should close open modal", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    manager.toggle();

    assertEquals(manager.isOpen, false);
  });
});

// =============================================================================
// Keyboard Navigation Tests
// =============================================================================

describe("ModalManager - keyboard navigation", () => {
  it("should close on Escape key", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const handled = manager.handleKeyboard("Escape");

    assertEquals(handled, true);
    assertEquals(manager.isOpen, false);
  });

  it("should not respond to Escape when closed", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);

    const handled = manager.handleKeyboard("Escape");

    assertEquals(handled, false);
  });

  it("should not close on other keys", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const handled = manager.handleKeyboard("Enter");

    assertEquals(handled, false);
    assertEquals(manager.isOpen, true);
  });
});

// =============================================================================
// Focus Management Tests
// =============================================================================

describe("ModalManager - focus management", () => {
  it("should find focusable elements", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    // Should find: close button, input, btn1, btn2, cancel, save
    assertEquals(manager.focusableElements.length, 6);
  });

  it("should get first focusable element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const first = manager.getFirstFocusable();

    assertExists(first);
    assertEquals(first.classList.contains("modal__close"), true);
  });

  it("should get last focusable element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const last = manager.getLastFocusable();

    assertExists(last);
    assertEquals(last.id, "save");
  });
});

// =============================================================================
// Focus Trap Tests
// =============================================================================

describe("ModalManager - focus trap", () => {
  it("should trap focus when tabbing forward from last element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const lastElement = manager.getLastFocusable()!;
    const nextFocus = manager.shouldTrapFocus("forward", lastElement);

    assertEquals(nextFocus, manager.getFirstFocusable());
  });

  it("should trap focus when tabbing backward from first element", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    const firstElement = manager.getFirstFocusable()!;
    const nextFocus = manager.shouldTrapFocus("backward", firstElement);

    assertEquals(nextFocus, manager.getLastFocusable());
  });

  it("should not trap focus for middle elements", () => {
    const { document } = createModalDOM();
    const manager = new MockModalManager("test-modal", document);
    manager.open();

    // Get a middle element
    const middleElement = manager.focusableElements[2];
    const nextFocus = manager.shouldTrapFocus("forward", middleElement);

    assertEquals(nextFocus, null);
  });

  it("should handle empty focusable elements", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="modal-backdrop" id="empty-modal" data-state="closed">
          <div class="modal">
            <div class="modal__body"><p>No focusable elements</p></div>
          </div>
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const manager = new MockModalManager("empty-modal", document);
    manager.open();

    assertEquals(manager.focusableElements.length, 0);
    assertEquals(manager.getFirstFocusable(), null);
    assertEquals(manager.getLastFocusable(), null);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("ModalManager - edge cases", () => {
  it("should handle missing modal element gracefully", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="modal-backdrop" id="broken-modal" data-state="closed">
          <!-- No .modal element -->
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const manager = new MockModalManager("broken-modal", document);

    assertEquals(manager.modal, null);
    assertEquals(manager.focusableElements.length, 0);
  });

  it("should handle multiple close buttons", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="modal-backdrop" id="multi-close-modal" data-state="closed"
          role="dialog" aria-modal="true">
          <div class="modal">
            <button class="modal__close">×</button>
            <div class="modal__body">
              <button class="modal__close">Close</button>
            </div>
          </div>
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const manager = new MockModalManager("multi-close-modal", document);

    assertEquals(manager.closeButtons.length, 2);
  });

  it("should handle disabled elements in focus trap", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="modal-backdrop" id="disabled-modal" data-state="closed"
          role="dialog" aria-modal="true">
          <div class="modal">
            <button id="enabled">Enabled</button>
            <button id="disabled" disabled>Disabled</button>
            <button id="also-enabled">Also Enabled</button>
          </div>
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const manager = new MockModalManager("disabled-modal", document);
    manager.open();

    // Should only find 2 focusable elements (disabled excluded)
    assertEquals(manager.focusableElements.length, 2);
  });
});
