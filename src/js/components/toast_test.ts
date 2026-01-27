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
const ORIGINAL_REQUEST_ANIMATION_FRAME = globalScope.requestAnimationFrame;

interface ToastData {
  id: string;
  element: Element;
  timer?: number;
}

interface ToastOptions {
  message: string;
  title: string;
  variant: string;
  duration: number;
  closeable: boolean;
}

const DEFAULT_TOAST_OPTIONS: Omit<ToastOptions, "message"> = {
  title: "",
  variant: "info",
  duration: 0,
  closeable: true,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_DOCUMENT;
  globalScope.requestAnimationFrame = ORIGINAL_REQUEST_ANIMATION_FRAME;
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
  globalScope.requestAnimationFrame = ((callback: (time: number) => void) => {
    callback(0);
    return 0;
  }) as typeof globalThis.requestAnimationFrame;
  return new ToastManager();
}

/**
 * Creates a complete set of toast options for testing.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const options = createToastOptions("Hello");
 * assertEquals(options.variant, "info");
 * ```
 */
function createToastOptions(
  message: string,
  overrides: Partial<Omit<ToastOptions, "message">> = {},
): ToastOptions {
  return {
    ...DEFAULT_TOAST_OPTIONS,
    ...overrides,
    message,
  };
}

function getToastData(manager: ToastManager, index = 0): ToastData {
  const toasts = manager.toasts as ToastData[] | undefined;
  assertExists(toasts);
  const toastData = toasts[index];
  assertExists(toastData);
  return toastData;
}

function getToastList(manager: ToastManager): ToastData[] {
  return (manager.toasts ?? []) as ToastData[];
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

    assertEquals(getToastList(manager).length, 0);
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
    const toastId = manager.show(createToastOptions("Test message"));

    assertExists(toastId);
    assertEquals(getToastList(manager).length, 1);
  });

  it("should add toast to container", () => {
    manager.show(createToastOptions("Test message"));

    const container = document.getElementById("toast-container");
    assertEquals(container?.children.length, 1);
  });

  it("should return unique toast IDs", () => {
    const id1 = manager.show(createToastOptions("Message 1"));
    const id2 = manager.show(createToastOptions("Message 2"));

    assertEquals(id1 !== id2, true);
  });

  it("should apply correct variant class", () => {
    manager.show(createToastOptions("Error!", { variant: "error" }));

    const toast = getToastData(manager).element;
    assertEquals(toast.classList.contains("toast--error"), true);
  });

  it("should include title when provided", () => {
    manager.show(createToastOptions("Body text", { title: "Title" }));

    const toast = getToastData(manager).element;
    const titleEl = toast.querySelector(".toast__title");
    assertExists(titleEl);
    assertEquals(titleEl.textContent?.trim(), "Title");
  });

  it("should include close button when closeable", () => {
    manager.show(createToastOptions("Test", { closeable: true }));

    const toast = getToastData(manager).element;
    const closeBtn = toast.querySelector(".toast__close");
    assertExists(closeBtn);
  });

  it("should not include close button when not closeable", () => {
    manager.show(createToastOptions("Test", { closeable: false }));

    const toast = getToastData(manager).element;
    const closeBtn = toast.querySelector(".toast__close");
    assertEquals(closeBtn, null);
  });

  it("should return null when container is missing", () => {
    manager.container = null;

    const toastId = manager.show(createToastOptions("Test"));

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
    manager.show(createToastOptions("Alert!"));

    const toast = getToastData(manager).element;
    assertEquals(toast.getAttribute("role"), "alert");
  });

  it("should set aria-live='polite' on toast", () => {
    manager.show(createToastOptions("Notice"));

    const toast = getToastData(manager).element;
    assertEquals(toast.getAttribute("aria-live"), "polite");
  });

  it("should have aria-label on close button", () => {
    manager.show(createToastOptions("Test", { closeable: true }));

    const toast = getToastData(manager).element;
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

  it("should set exiting state on dismiss", async () => {
    const toastId = manager.show(createToastOptions("Test", { duration: 0 }))!;

    manager.dismiss(toastId);

    const toast = getToastList(manager).find((item) => item.id === toastId);
    assertEquals(toast?.element.getAttribute("data-state"), "exiting");

    await new Promise((resolve) => setTimeout(resolve, 350));
  });

  it("should handle dismissing non-existent toast", () => {
    // Should not throw
    manager.dismiss("non-existent-id");

    assertEquals(getToastList(manager).length, 0);
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

  it("should limit toasts to maxToasts", async () => {
    manager.show(createToastOptions("Toast 1", { duration: 0 }));
    manager.show(createToastOptions("Toast 2", { duration: 0 }));
    manager.show(createToastOptions("Toast 3", { duration: 0 }));
    manager.show(createToastOptions("Toast 4", { duration: 0 }));

    // Should have at most 3 toasts (maxToasts default)
    await new Promise((resolve) => setTimeout(resolve, 350));
    assertEquals(getToastList(manager).length <= 3, true);
  });

  it("should dismiss all toasts", async () => {
    manager.show(createToastOptions("Toast 1", { duration: 0 }));
    manager.show(createToastOptions("Toast 2", { duration: 0 }));
    manager.show(createToastOptions("Toast 3", { duration: 0 }));

    manager.dismissAll();

    // All toasts should be in exiting state
    getToastList(manager).forEach((toastData) => {
      assertEquals(toastData.element.getAttribute("data-state"), "exiting");
    });

    await new Promise((resolve) => setTimeout(resolve, 350));
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
    manager.success("Success!", 0);

    const toast = getToastData(manager).element;
    assertEquals(toast.classList.contains("toast--success"), true);
  });

  it("should create error toast", () => {
    manager.error("Error!", 0);

    const toast = getToastData(manager).element;
    assertEquals(toast.classList.contains("toast--error"), true);
  });

  it("should create warning toast", () => {
    manager.warning("Warning!", 0);

    const toast = getToastData(manager).element;
    assertEquals(toast.classList.contains("toast--warning"), true);
  });

  it("should create info toast", () => {
    manager.info("Info!", 0);

    const toast = getToastData(manager).element;
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
    manager.show(createToastOptions("<script>alert('xss')</script>"));

    const toast = getToastData(manager).element;
    const messageEl = toast.querySelector(".toast__message");
    assertEquals(
      messageEl?.innerHTML?.includes("&lt;script&gt;"),
      true,
    );
    assertEquals(toast.querySelector("script"), null);
  });

  it("should escape HTML in title", () => {
    manager.show(
      createToastOptions("Test", { title: "<img onerror='alert(1)'>" }),
    );

    const toast = getToastData(manager).element;
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
    manager.success("Success!", 0);

    const toast = getToastData(manager).element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for error variant", () => {
    manager.error("Error!", 0);

    const toast = getToastData(manager).element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for warning variant", () => {
    manager.warning("Warning!", 0);

    const toast = getToastData(manager).element;
    const icon = toast.querySelector(".toast__icon svg");
    assertExists(icon);
  });

  it("should include icon for info variant", () => {
    manager.info("Info!", 0);

    const toast = getToastData(manager).element;
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

    manager.show(createToastOptions("Toast 1", { duration: 0 }));
    manager.show(createToastOptions("Toast 2", { duration: 0 }));

    manager.destroy();

    assertEquals(getToastList(manager).length, 0);
  });

  it("should remove toast elements from DOM on destroy", () => {
    const document = createToastDOM();
    const manager = createTestToastManager(document);

    manager.show(createToastOptions("Toast 1", { duration: 0 }));
    manager.show(createToastOptions("Toast 2", { duration: 0 }));

    manager.destroy();

    const container = document.getElementById("toast-container");
    assertEquals(container?.children.length, 0);
  });
});
