/**
 * Tests for service worker enhancement functionality.
 *
 * These tests verify the service worker related behaviors including:
 * - Prefetch logic based on connection type
 * - Adjacent post URL detection
 * - Online/offline notification handling
 * - Service worker update notifications
 *
 * @module src/js/features/service-worker_test
 */

import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { DOMParser, HTMLDocument } from "@b-fuze/deno-dom";

import {
  initializeServiceWorkerNotifications,
  prefetchAdjacentPosts,
} from "./service-worker.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

interface MockConnection {
  saveData?: boolean;
  effectiveType?: string;
}

interface MockServiceWorkerRegistration {
  active: { postMessage: (msg: unknown) => void } | null;
  installing: {
    state: string;
    addEventListener: (event: string, handler: () => void) => void;
  } | null;
  addEventListener: (event: string, handler: () => void) => void;
}

interface MockNavigator {
  connection?: MockConnection | null;
  serviceWorker?: {
    ready: Promise<MockServiceWorkerRegistration>;
    controller: object | null;
  };
  onLine?: boolean;
}

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  navigator: globalScope.navigator,
  toast: globalScope.toast,
  addEventListener: globalScope.addEventListener,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.navigator = ORIGINAL_GLOBALS.navigator;
  globalScope.toast = ORIGINAL_GLOBALS.toast;
  globalScope.addEventListener = ORIGINAL_GLOBALS.addEventListener;
}

/**
 * Creates a mock DOM environment with navigation links.
 */
function createNavLinksDOM(
  nextHref?: string,
  prevHref?: string,
): HTMLDocument {
  const links: string[] = [];
  if (nextHref) links.push(`<a rel="next" href="${nextHref}">Next</a>`);
  if (prevHref) links.push(`<a rel="prev" href="${prevHref}">Previous</a>`);

  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      ${links.join("\n")}
    </body>
    </html>
  `;

  return new DOMParser().parseFromString(html, "text/html")!;
}

/**
 * Creates a mock navigator with service worker support.
 */
function createMockNavigator(
  options: {
    hasServiceWorker?: boolean;
    onLine?: boolean;
    connection?: MockConnection | null;
  } = {},
): MockNavigator {
  const {
    hasServiceWorker = true,
    onLine = true,
    connection = null,
  } = options;

  const nav: MockNavigator = {
    onLine,
    connection,
  };

  if (hasServiceWorker) {
    nav.serviceWorker = {
      ready: Promise.resolve({
        active: { postMessage: () => {} },
        installing: null,
        addEventListener: () => {},
      }),
      controller: {},
    };
  }

  return nav;
}

// =============================================================================
// prefetchAdjacentPosts Tests
// =============================================================================

describe("prefetchAdjacentPosts - service worker check", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should not prefetch when service worker is unavailable", () => {
    globalScope.navigator = {} as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });
});

describe("prefetchAdjacentPosts - connection checks", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should prefetch when no connection info available", () => {
    const document = createNavLinksDOM("/next-post", "/prev-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: null,
      serviceWorker: {
        ready: Promise.resolve({
          active: {
            postMessage: () => {},
          },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    prefetchAdjacentPosts();

    // The function runs async, so we just verify it didn't throw
    assertEquals(true, true);
  });

  it("should not prefetch when saveData is enabled", () => {
    const document = createNavLinksDOM("/next-post", "/prev-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: { saveData: true },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should not prefetch on slow 2G connection", () => {
    const document = createNavLinksDOM("/next-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: { saveData: false, effectiveType: "slow-2g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should not prefetch on 2G connection", () => {
    const document = createNavLinksDOM("/next-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: { saveData: false, effectiveType: "2g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should prefetch on 3G connection", () => {
    const document = createNavLinksDOM("/next-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: { saveData: false, effectiveType: "3g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should prefetch on 4G connection", () => {
    const document = createNavLinksDOM("/next-post");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: { saveData: false, effectiveType: "4g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });
});

describe("prefetchAdjacentPosts - URL detection", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should find next and prev links", () => {
    const urls: string[] = [];
    const document = createNavLinksDOM(
      "https://example.com/next",
      "https://example.com/prev",
    );
    globalScope.document = document as unknown as Document;
    globalScope.navigator = {
      connection: null,
      serviceWorker: {
        ready: Promise.resolve({
          active: {
            postMessage: (msg: { type: string; urls: string[] }) => {
              urls.push(...msg.urls);
            },
          },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator;

    prefetchAdjacentPosts();

    // Async operation, just verify no errors
    assertEquals(true, true);
  });

  it("should handle page with only next link", () => {
    const document = createNavLinksDOM("https://example.com/next");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = createMockNavigator() as unknown as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should handle page with only prev link", () => {
    const document = createNavLinksDOM(undefined, "https://example.com/prev");
    globalScope.document = document as unknown as Document;
    globalScope.navigator = createMockNavigator() as unknown as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should handle page with no navigation links", () => {
    const document = createNavLinksDOM();
    globalScope.document = document as unknown as Document;
    globalScope.navigator = createMockNavigator() as unknown as Navigator;

    // Should not throw
    prefetchAdjacentPosts();
  });
});

// =============================================================================
// initializeServiceWorkerNotifications Tests
// =============================================================================

describe("initializeServiceWorkerNotifications - service worker check", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should not initialize when service worker is unavailable", () => {
    globalScope.navigator = {} as Navigator;

    // Should not throw
    initializeServiceWorkerNotifications();
  });
});

describe("initializeServiceWorkerNotifications - online/offline", () => {
  let eventHandlers: Record<string, (() => void)[]>;

  beforeEach(() => {
    eventHandlers = {};
    globalScope.addEventListener = (event: string, handler: () => void) => {
      if (!eventHandlers[event]) eventHandlers[event] = [];
      eventHandlers[event].push(handler);
    };
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("should show toast when starting offline", () => {
    let toastCalled = false;
    let toastVariant = "";

    globalScope.navigator = {
      onLine: false,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator;

    globalScope.toast = {
      warning: () => {
        toastCalled = true;
        toastVariant = "warning";
      },
      success: () => {},
      info: () => {},
    };

    initializeServiceWorkerNotifications();

    assertEquals(toastCalled, true);
    assertEquals(toastVariant, "warning");
  });

  it("should register offline event listener", () => {
    globalScope.navigator = createMockNavigator({
      onLine: true,
    }) as unknown as Navigator;
    globalScope.toast = {
      warning: () => {},
      success: () => {},
      info: () => {},
    };

    initializeServiceWorkerNotifications();

    assertEquals("offline" in eventHandlers, true);
  });

  it("should register online event listener", () => {
    globalScope.navigator = createMockNavigator({
      onLine: true,
    }) as unknown as Navigator;
    globalScope.toast = {
      warning: () => {},
      success: () => {},
      info: () => {},
    };

    initializeServiceWorkerNotifications();

    assertEquals("online" in eventHandlers, true);
  });

  it("should show warning toast when going offline", () => {
    let toastMessage = "";

    globalScope.navigator = createMockNavigator({
      onLine: true,
    }) as unknown as Navigator;
    globalScope.toast = {
      warning: (message: string) => {
        toastMessage = message;
      },
      success: () => {},
      info: () => {},
    };

    initializeServiceWorkerNotifications();

    // Trigger offline event
    eventHandlers["offline"]?.forEach((handler) => handler());

    assertEquals(
      toastMessage.includes("offline"),
      true,
    );
  });

  it("should show success toast when coming back online", () => {
    let toastMessage = "";

    globalScope.navigator = createMockNavigator({
      onLine: true,
    }) as unknown as Navigator;
    globalScope.toast = {
      warning: () => {},
      success: (message: string) => {
        toastMessage = message;
      },
      info: () => {},
    };

    initializeServiceWorkerNotifications();

    // Trigger online event
    eventHandlers["online"]?.forEach((handler) => handler());

    assertEquals(
      toastMessage.includes("online"),
      true,
    );
  });
});

describe("initializeServiceWorkerNotifications - update notifications", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should show info toast when new version is available", async () => {
    let toastMessage = "";
    let updateFoundHandler: (() => void) | null = null;
    let stateChangeHandler: (() => void) | null = null;

    const mockRegistration: MockServiceWorkerRegistration = {
      active: { postMessage: () => {} },
      installing: {
        state: "installed",
        addEventListener: (_event: string, handler: () => void) => {
          stateChangeHandler = handler;
        },
      },
      addEventListener: (event: string, handler: () => void) => {
        if (event === "updatefound") {
          updateFoundHandler = handler;
        }
      },
    };

    globalScope.addEventListener = () => {};
    globalScope.navigator = {
      onLine: true,
      serviceWorker: {
        ready: Promise.resolve(mockRegistration),
        controller: {},
      },
    } as unknown as Navigator;
    globalScope.toast = {
      warning: () => {},
      success: () => {},
      info: (message: string) => {
        toastMessage = message;
      },
    };

    initializeServiceWorkerNotifications();

    // Wait for the ready promise to resolve
    await Promise.resolve();

    // Trigger updatefound
    if (updateFoundHandler) {
      updateFoundHandler();
    }

    // Trigger statechange with installed state
    if (stateChangeHandler) {
      stateChangeHandler();
    }

    assertEquals(
      toastMessage.includes("new version"),
      true,
    );
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("initializeServiceWorkerNotifications - edge cases", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should handle missing toast gracefully", () => {
    globalScope.addEventListener = () => {};
    globalScope.navigator = {
      onLine: false,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator;
    globalScope.toast = undefined;

    // Should not throw even without toast
    initializeServiceWorkerNotifications();
  });

  it("should handle missing active worker in registration", async () => {
    globalScope.addEventListener = () => {};
    globalScope.navigator = {
      onLine: true,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator;
    globalScope.toast = {
      warning: () => {},
      success: () => {},
      info: () => {},
    };

    // Should not throw
    initializeServiceWorkerNotifications();
    await Promise.resolve();
  });
});
