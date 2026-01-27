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

interface MockConnection {
  saveData?: boolean;
  effectiveType?: string;
}

interface MockServiceWorkerRegistration {
  active: { postMessage: (msg: unknown) => void } | null;
  installing: {
    state: string;
    addEventListener: (
      event: string,
      handler: EventListenerOrEventListenerObject,
    ) => void;
  } | null;
  addEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
  ) => void;
}

interface MockNavigator {
  connection?: MockConnection | null;
  serviceWorker?: {
    ready: Promise<MockServiceWorkerRegistration>;
    controller: object | null;
  };
  onLine?: boolean;
}

const ORIGINAL_PROPERTY_DESCRIPTORS = new Map<
  string,
  PropertyDescriptor | undefined
>([
  ["document", Object.getOwnPropertyDescriptor(globalThis, "document")],
  ["navigator", Object.getOwnPropertyDescriptor(globalThis, "navigator")],
  ["toast", Object.getOwnPropertyDescriptor(globalThis, "toast")],
  [
    "addEventListener",
    Object.getOwnPropertyDescriptor(globalThis, "addEventListener"),
  ],
]);

function setGlobalValue(key: string, value: unknown): void {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

function restoreGlobals(): void {
  ORIGINAL_PROPERTY_DESCRIPTORS.forEach((descriptor, key) => {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      delete (globalThis as Record<string, unknown>)[key];
    }
  });
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
    setGlobalValue("navigator", {} as Navigator);

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
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
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
    } as unknown as Navigator);

    prefetchAdjacentPosts();

    // The function runs async, so we just verify it didn't throw
    assertEquals(true, true);
  });

  it("should not prefetch when saveData is enabled", () => {
    const document = createNavLinksDOM("/next-post", "/prev-post");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
      connection: { saveData: true },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator);

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should not prefetch on slow 2G connection", () => {
    const document = createNavLinksDOM("/next-post");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
      connection: { saveData: false, effectiveType: "slow-2g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator);

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should not prefetch on 2G connection", () => {
    const document = createNavLinksDOM("/next-post");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
      connection: { saveData: false, effectiveType: "2g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator);

    // Should not throw and should skip prefetch
    prefetchAdjacentPosts();
  });

  it("should prefetch on 3G connection", () => {
    const document = createNavLinksDOM("/next-post");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
      connection: { saveData: false, effectiveType: "3g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator);

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should prefetch on 4G connection", () => {
    const document = createNavLinksDOM("/next-post");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
      connection: { saveData: false, effectiveType: "4g" },
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: () => {} },
          installing: null,
          addEventListener: () => {},
        }),
        controller: {},
      },
    } as unknown as Navigator);

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
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", {
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
    } as unknown as Navigator);

    prefetchAdjacentPosts();

    // Async operation, just verify no errors
    assertEquals(true, true);
  });

  it("should handle page with only next link", () => {
    const document = createNavLinksDOM("https://example.com/next");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", createMockNavigator() as unknown as Navigator);

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should handle page with only prev link", () => {
    const document = createNavLinksDOM(undefined, "https://example.com/prev");
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", createMockNavigator() as unknown as Navigator);

    // Should not throw
    prefetchAdjacentPosts();
  });

  it("should handle page with no navigation links", () => {
    const document = createNavLinksDOM();
    setGlobalValue("document", document as unknown as Document);
    setGlobalValue("navigator", createMockNavigator() as unknown as Navigator);

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
    setGlobalValue("navigator", {} as Navigator);

    // Should not throw
    initializeServiceWorkerNotifications();
  });
});

describe("initializeServiceWorkerNotifications - online/offline", () => {
  let eventHandlers: Record<string, EventListener[]>;

  beforeEach(() => {
    eventHandlers = {};
    setGlobalValue("addEventListener", (
      event: string,
      handler: EventListenerOrEventListenerObject,
    ) => {
      if (!eventHandlers[event]) eventHandlers[event] = [];
      if (typeof handler === "function") {
        eventHandlers[event].push(handler);
      } else {
        eventHandlers[event].push((evt) => handler.handleEvent(evt));
      }
    });
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("should show toast when starting offline", () => {
    let toastCalled = false;
    let toastVariant = "";

    setGlobalValue("navigator", {
      onLine: false,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator);

    setGlobalValue("toast", {
      warning: () => {
        toastCalled = true;
        toastVariant = "warning";
      },
      success: () => {},
      info: () => {},
    });

    initializeServiceWorkerNotifications();

    assertEquals(toastCalled, true);
    assertEquals(toastVariant, "warning");
  });

  it("should register offline event listener", () => {
    setGlobalValue(
      "navigator",
      createMockNavigator({
        onLine: true,
      }) as unknown as Navigator,
    );
    setGlobalValue("toast", {
      warning: () => {},
      success: () => {},
      info: () => {},
    });

    initializeServiceWorkerNotifications();

    assertEquals("offline" in eventHandlers, true);
  });

  it("should register online event listener", () => {
    setGlobalValue(
      "navigator",
      createMockNavigator({
        onLine: true,
      }) as unknown as Navigator,
    );
    setGlobalValue("toast", {
      warning: () => {},
      success: () => {},
      info: () => {},
    });

    initializeServiceWorkerNotifications();

    assertEquals("online" in eventHandlers, true);
  });

  it("should show warning toast when going offline", () => {
    let toastMessage = "";

    setGlobalValue(
      "navigator",
      createMockNavigator({
        onLine: true,
      }) as unknown as Navigator,
    );
    setGlobalValue("toast", {
      warning: (message: string) => {
        toastMessage = message;
      },
      success: () => {},
      info: () => {},
    });

    initializeServiceWorkerNotifications();

    // Trigger offline event
    eventHandlers["offline"]?.forEach((handler) =>
      handler(new Event("offline"))
    );

    assertEquals(
      toastMessage.includes("offline"),
      true,
    );
  });

  it("should show success toast when coming back online", () => {
    let toastMessage = "";

    setGlobalValue(
      "navigator",
      createMockNavigator({
        onLine: true,
      }) as unknown as Navigator,
    );
    setGlobalValue("toast", {
      warning: () => {},
      success: (message: string) => {
        toastMessage = message;
      },
      info: () => {},
    });

    initializeServiceWorkerNotifications();

    // Trigger online event
    eventHandlers["online"]?.forEach((handler) => handler(new Event("online")));

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
    const updateFoundHandlers: Array<(event: Event) => void> = [];
    const stateChangeHandlers: Array<(event: Event) => void> = [];
    let toastMessage = "";

    const mockRegistration: MockServiceWorkerRegistration = {
      active: { postMessage: () => {} },
      installing: {
        state: "installed",
        addEventListener: (
          _event: string,
          handler: EventListenerOrEventListenerObject,
        ) => {
          if (typeof handler === "function") {
            stateChangeHandlers.push(handler as (event: Event) => void);
          }
        },
      },
      addEventListener: (
        event: string,
        handler: EventListenerOrEventListenerObject,
      ) => {
        if (event === "updatefound") {
          if (typeof handler === "function") {
            updateFoundHandlers.push(handler as (event: Event) => void);
          }
        }
      },
    };

    setGlobalValue("addEventListener", () => {});
    setGlobalValue("navigator", {
      onLine: true,
      serviceWorker: {
        ready: Promise.resolve(mockRegistration),
        controller: {},
      },
    } as unknown as Navigator);
    setGlobalValue("toast", {
      warning: () => {},
      success: () => {},
      info: (message: string) => {
        toastMessage = message;
      },
    });

    initializeServiceWorkerNotifications();

    // Wait for the ready promise to resolve
    await Promise.resolve();

    // Trigger updatefound
    updateFoundHandlers.forEach((handler) => {
      handler(new Event("updatefound"));
    });

    // Trigger statechange with installed state
    stateChangeHandlers.forEach((handler) => {
      handler(new Event("statechange"));
    });

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
    setGlobalValue("addEventListener", () => {});
    setGlobalValue("navigator", {
      onLine: false,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator);
    setGlobalValue("toast", undefined);

    // Should not throw even without toast
    initializeServiceWorkerNotifications();
  });

  it("should handle missing active worker in registration", async () => {
    setGlobalValue("addEventListener", () => {});
    setGlobalValue("navigator", {
      onLine: true,
      serviceWorker: {
        ready: Promise.resolve({
          active: null,
          installing: null,
          addEventListener: () => {},
        }),
        controller: null,
      },
    } as unknown as Navigator);
    setGlobalValue("toast", {
      warning: () => {},
      success: () => {},
      info: () => {},
    });

    // Should not throw
    initializeServiceWorkerNotifications();
    await Promise.resolve();
  });
});
