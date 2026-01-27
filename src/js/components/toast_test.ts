/**
 * Tests for ToastManager JavaScript component.
 *
 * These tests verify the client-side toast functionality including:
 * - Toast display with different variants
 * - Auto-dismiss behavior
 * - Manual dismiss via close button
 * - Queue management (max toasts)
 * - HTML escaping for XSS prevention
 * - Accessibility attributes
 *
 * @module src/js/components/toast_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { DOMParser, HTMLDocument } from "@b-fuze/deno-dom";

import { ToastManager } from "./toast.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_DOCUMENT = globalScope.document;

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_DOCUMENT;
}

/**
 * Creates a mock DOM environment with toast container.
 */
function createToastDOM(): HTMLDocument {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div id="toast-container" aria-live="polite"></div>
    </body>
    </html>
  `;

  return new DOMParser().parseFromString(html, "text/html")!;
}

/**
 * Creates a ToastManager instance with mocked document.
 */
function createTestToastManager(document: HTMLDocument): ToastManager {
  globalScope.document = document as unknown as Document;
  return new ToastManager();
}

// =============================================================================
// Initialization Tests
// =============================================================================

describe("ToastManager - initialization", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should find container element", () => {
    const document = createToastDOM();
    const manager = createTestToastManager(document);

    assertExists(manager.container);
  });

  it("should initialize with empty toasts array", () => {
    const document = createToastDOM();
    const manager = createTestToastManager(document);

    assertEquals(manager.toasts.length, 0);
  });

  it("should handle missing container gracefully", () => {
    const html = `<!DOCTYPE html><html><body></body></html>`;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    globalScope.document = document as unknown as Document;

    const manager = new ToastManager();

    assertEquals(manager.container, null);
  });

  it("should accept custom container ID", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div id="custom-toasts"></div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    globalScope.document = document as unknown as Document;

    const manager = new ToastManager("custom-toasts");

    assertExists(manager.container);
    assertEquals(manager.container?.id, "custom-toasts");
  });
});

// =============================================================================
// Show Toast Tests
// =============================================================================

describe("ToastManager - show", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should create toast element", () => {
    const toastId = manager.show({ message: "Test message" });

    assertExists(toastId);
    assertEquals(manager.toasts.length, 1);
  });

  it("should add toast to container", () => {
    manager.show({ message: "Test message" });

    const container = document.getElementById("toast-container");
    assertEquals(container?.children.length, 1);
  });

  it("should return unique toast IDs", () => {
    const id1 = manager.show({ message: "Message 1" });
    const id2 = manager.show({ message: "Message 2" });

    assertEquals(id1 !== id2, true);
  });

  it("should apply correct variant class", () => {
    manager.show({ message: "Error!", variant: "error" });

    const toast = manager.toasts[0].element;
    assertEquals(toast.classList.contains("toast--error"), true);
  });

  it("should include title when provided", () => {
    manager.show({ message: "Body text", title: "Title" });

    const toast = manager.toasts[0].element;
    const titleEl = toast.querySelector(".toast__title");
    assertExists(titleEl);
    assertEquals(titleEl.textContent?.trim(), "Title");
  });

  it("should include close button when closeable", () => {
    manager.show({ message: "Test", closeable: true });

    const toast = manager.toasts[0].element;
    const closeBtn = toast.querySelector(".toast__close");
    assertExists(closeBtn);
  });

  it("should not include close button when not closeable", () => {
    manager.show({ message: "Test", closeable: false });

    const toast = manager.toasts[0].element;
    const closeBtn = toast.querySelector(".toast__close");
    assertEquals(closeBtn, null);
  });

  it("should return null when container is missing", () => {
    manager.container = null;

    const toastId = manager.show({ message: "Test" });

    assertEquals(toastId, null);
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe("ToastManager - accessibility", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should set role='alert' on toast", () => {
    manager.show({ message: "Alert!" });

    const toast = manager.toasts[0].element;
    assertEquals(toast.getAttribute("role"), "alert");
  });

  it("should set aria-live='polite' on toast", () => {
    manager.show({ message: "Notice" });

    const toast = manager.toasts[0].element;
    assertEquals(toast.getAttribute("aria-live"), "polite");
  });

  it("should have aria-label on close button", () => {
    manager.show({ message: "Test", closeable: true });

    const toast = manager.toasts[0].element;
    const closeBtn = toast.querySelector(".toast__close");
    assertEquals(closeBtn?.getAttribute("aria-label"), "Close notification");
  });
});

// =============================================================================
// Dismiss Tests
// =============================================================================

describe("ToastManager - dismiss", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should set exiting state on dismiss", () => {
    const toastId = manager.show({ message: "Test", duration: 0 })!;

    manager.dismiss(toastId);

    const toast = manager.toasts.find((t) => t.id === toastId);
    assertEquals(toast?.element.getAttribute("data-state"), "exiting");
  });

  it("should handle dismissing non-existent toast", () => {
    // Should not throw
    manager.dismiss("non-existent-id");

    assertEquals(manager.toasts.length, 0);
  });
});

// =============================================================================
// Queue Management Tests
// =============================================================================

describe("ToastManager - queue management", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should limit toasts to maxToasts", () => {
    manager.show({ message: "Toast 1", duration: 0 });
    manager.show({ message: "Toast 2", duration: 0 });
    manager.show({ message: "Toast 3", duration: 0 });
    manager.show({ message: "Toast 4", duration: 0 });

    // Should have at most 3 toasts (maxToasts default)
    assertEquals(manager.toasts.length <= 3, true);
  });

  it("should dismiss all toasts", () => {
    manager.show({ message: "Toast 1", duration: 0 });
    manager.show({ message: "Toast 2", duration: 0 });
    manager.show({ message: "Toast 3", duration: 0 });

    manager.dismissAll();

    // All toasts should be in exiting state
    manager.toasts.forEach((t) => {
      assertEquals(t.element.getAttribute("data-state"), "exiting");
    });
  });
});

// =============================================================================
// Convenience Methods Tests
// =============================================================================

describe("ToastManager - convenience methods", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should create success toast", () => {
    manager.success("Success!");

    const toast = manager.toasts[0].element;
    assertEquals(toast.classList.contains("toast--success"), true);
  });

  it("should create error toast", () => {
    manager.error("Error!");

    const toast = manager.toasts[0].element;
    assertEquals(toast.classList.contains("toast--error"), true);
  });

  it("should create warning toast", () => {
    manager.warning("Warning!");

    const toast = manager.toasts[0].element;
    assertEquals(toast.classList.contains("toast--warning"), true);
  });

  it("should create info toast", () => {
    manager.info("Info!");

    const toast = manager.toasts[0].element;
    assertEquals(toast.classList.contains("toast--info"), true);
  });
});

// =============================================================================
// XSS Prevention Tests
// =============================================================================

describe("ToastManager - XSS prevention", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should escape HTML in message", () => {
    manager.show({ message: "<script>alert('xss')</script>" });

    const toast = manager.toasts[0].element;
    const messageEl = toast.querySelector(".toast__message");
    assertEquals(
      messageEl?.textContent?.includes("<script>"),
      false,
    );
    assertEquals(
      messageEl?.innerHTML?.includes("&lt;script&gt;"),
      true,
    );
  });

  it("should escape HTML in title", () => {
    manager.show({ message: "Test", title: "<img onerror='alert(1)'>" });

    const toast = manager.toasts[0].element;
    const titleEl = toast.querySelector(".toast__title");
    assertEquals(
      titleEl?.innerHTML?.includes("&lt;img"),
      true,
    );
  });
});

// =============================================================================
// Icon Tests
// =============================================================================

describe("ToastManager - icons", () => {
  let document: HTMLDocument;
  let manager: ToastManager;

  beforeEach(() => {
    document = createToastDOM();
    manager = createTestToastManager(document);
  });

  afterEach(() => {
    manager.destroy();
    restoreGlobals();
  });

  it("should include icon for success variant", () => {
    manager.success("Success!");

    const toast = manager.toasts[0].element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for error variant", () => {
    manager.error("Error!");

    const toast = manager.toasts[0].element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for warning variant", () => {
    manager.warning("Warning!");

    const toast = manager.toasts[0].element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for info variant", () => {
    manager.info("Info!");

    const toast = manager.toasts[0].element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });
});

// =============================================================================
// Destroy Tests
// =============================================================================

describe("ToastManager - destroy", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should clear all toasts on destroy", () => {
    const document = createToastDOM();
    const manager = createTestToastManager(document);

    manager.show({ message: "Toast 1", duration: 0 });
    manager.show({ message: "Toast 2", duration: 0 });

    manager.destroy();

    assertEquals(manager.toasts.length, 0);
  });

  it("should remove toast elements from DOM on destroy", () => {
    const document = createToastDOM();
    const manager = createTestToastManager(document);

    manager.show({ message: "Toast 1", duration: 0 });
    manager.show({ message: "Toast 2", duration: 0 });

    manager.destroy();

    const container = document.getElementById("toast-container");
    assertEquals(container?.children.length, 0);
  });
});
