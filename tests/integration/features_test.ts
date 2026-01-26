/**
 * Tests for JavaScript features.
 *
 * These tests verify various JavaScript features including:
 * - Theme management logic
 * - External link enhancement
 * - Global API exposure
 * - Toast helper utilities
 *
 * @module tests/integration/features_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DOMParser } from "@b-fuze/deno-dom";

import { exposeThemeGlobals } from "../../src/js/core/globals.js";
import { enhanceExternalLinks } from "../../src/js/features/external-links.js";
import { createThemeManager } from "../../src/js/features/theme.js";
import { ToastManager } from "../../src/js/components/toast.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  location: globalScope.location,
  localStorage: globalScope.localStorage,
  matchMedia: globalScope.matchMedia,
  changeTheme: globalScope.changeTheme,
  themeManager: globalScope.themeManager,
  toast: globalScope.toast,
  setTimeout: globalScope.setTimeout,
};
const ORIGINAL_DESCRIPTORS = {
  localStorage: Object.getOwnPropertyDescriptor(globalThis, "localStorage"),
  toast: Object.getOwnPropertyDescriptor(globalThis, "toast"),
};

function defineGlobalProperty<T>(key: string, value: T): void {
  Object.defineProperty(globalThis, key, {
    value,
    configurable: true,
    writable: true,
  });
}

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.location = ORIGINAL_GLOBALS.location;
  globalScope.localStorage = ORIGINAL_GLOBALS.localStorage;
  globalScope.matchMedia = ORIGINAL_GLOBALS.matchMedia;
  globalScope.changeTheme = ORIGINAL_GLOBALS.changeTheme;
  globalScope.themeManager = ORIGINAL_GLOBALS.themeManager;
  globalScope.toast = ORIGINAL_GLOBALS.toast;
  globalScope.setTimeout = ORIGINAL_GLOBALS.setTimeout;

  if (ORIGINAL_DESCRIPTORS.localStorage) {
    Object.defineProperty(
      globalThis,
      "localStorage",
      ORIGINAL_DESCRIPTORS.localStorage,
    );
  } else {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  }

  if (ORIGINAL_DESCRIPTORS.toast) {
    Object.defineProperty(
      globalThis,
      "toast",
      ORIGINAL_DESCRIPTORS.toast,
    );
  } else {
    delete (globalThis as { toast?: { info?: () => void } }).toast;
  }
}

// =============================================================================
// Theme Manager Tests
// =============================================================================

describe("ThemeManager", () => {
  it("uses stored theme when available", () => {
    defineGlobalProperty("localStorage", {
      getItem: () => "dark",
      setItem: () => {},
    } as unknown as Storage);
    globalScope.matchMedia = (() => ({
      matches: false,
      addEventListener: () => {},
    })) as unknown as typeof globalThis.matchMedia;

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
    restoreGlobals();
  });

  it("falls back to system preference when storage is empty", () => {
    defineGlobalProperty("localStorage", {
      getItem: () => null,
      setItem: () => {},
    } as unknown as Storage);
    globalScope.matchMedia = (() => ({
      matches: true,
      addEventListener: () => {},
    })) as unknown as typeof globalThis.matchMedia;

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
    restoreGlobals();
  });

  it("updates dataset and persistence when setting theme", () => {
    const calls: string[] = [];
    const documentElement = {
      dataset: {} as { theme?: string },
      classList: {
        add: () => calls.push("add"),
        remove: () => calls.push("remove"),
      },
    };

    globalScope.document = {
      documentElement,
    } as unknown as Document;
    defineGlobalProperty("localStorage", {
      getItem: () => null,
      setItem: (_key: string, value: string) => calls.push(value),
    } as unknown as Storage);
    globalScope.matchMedia = (() => ({
      matches: false,
      addEventListener: () => {},
    })) as unknown as typeof globalThis.matchMedia;
    defineGlobalProperty("toast", {
      info: () => calls.push("toast"),
    } as { info: () => void });
    globalScope.setTimeout = ((handler: () => void) => {
      handler();
      return 0;
    }) as typeof globalThis.setTimeout;

    const manager = createThemeManager();
    manager.setTheme("dark", true);

    assertEquals(documentElement.dataset.theme, "dark");
    assertEquals(calls.includes("dark"), true);
    assertEquals(calls.includes("toast"), true);
    restoreGlobals();
  });
});

// =============================================================================
// External Links Enhancement Tests
// =============================================================================

interface MockLink {
  hostname: string;
  attributes: Map<string, string>;
  classList: {
    add: (value: string) => void;
    contains: (value: string) => boolean;
  };
  children: { className: string; textContent: string }[];
  hasAttribute: (name: string) => boolean;
  setAttribute: (name: string, value: string) => void;
  querySelector: (
    selector: string,
  ) => { className: string; textContent: string } | null;
  appendChild: (node: { className: string; textContent: string }) => void;
}

function createMockLink(
  hostname: string,
  hasScreenReaderText = false,
): MockLink {
  const attributes = new Map<string, string>();
  const classValues = new Set<string>();
  const children = hasScreenReaderText
    ? [{ className: "sr-only", textContent: " (opens in new tab)" }]
    : [];

  return {
    hostname,
    attributes,
    children,
    classList: {
      add: (value: string) => classValues.add(value),
      contains: (value: string) => classValues.has(value),
    },
    hasAttribute: (name: string) => attributes.has(name),
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    querySelector: (selector: string) => {
      if (selector === ".sr-only") {
        return children.find((child) => child.className === "sr-only") ?? null;
      }
      return null;
    },
    appendChild: (node: { className: string; textContent: string }) => {
      children.push(node);
    },
  };
}

describe("enhanceExternalLinks", () => {
  it("adds external link affordances", () => {
    const link = createMockLink("example.com");

    globalScope.location = { hostname: "localhost" } as Location;
    globalScope.document = {
      querySelectorAll: () => [link],
      createElement: () => ({ className: "", textContent: "" }),
    } as unknown as Document;

    enhanceExternalLinks();

    assertEquals(link.attributes.get("target"), "_blank");
    assertEquals(link.attributes.get("rel"), "noopener noreferrer");
    assertEquals(link.attributes.get("data-tooltip"), "Opens in new tab");
    assertEquals(link.classList.contains("external-link"), true);
    assertExists(link.querySelector(".sr-only"));
    restoreGlobals();
  });

  it("skips internal links", () => {
    const link = createMockLink("localhost");

    globalScope.location = { hostname: "localhost" } as Location;
    globalScope.document = {
      querySelectorAll: () => [link],
      createElement: () => ({ className: "", textContent: "" }),
    } as unknown as Document;

    enhanceExternalLinks();

    assertEquals(link.attributes.size, 0);
    assertEquals(link.classList.contains("external-link"), false);
    restoreGlobals();
  });

  it("avoids duplicating screen reader text", () => {
    const link = createMockLink("example.com", true);

    globalScope.location = { hostname: "localhost" } as Location;
    globalScope.document = {
      querySelectorAll: () => [link],
      createElement: () => ({ className: "", textContent: "" }),
    } as unknown as Document;

    enhanceExternalLinks();

    assertEquals(link.children.length, 1);
    restoreGlobals();
  });
});

// =============================================================================
// Global API Exposure Tests
// =============================================================================

describe("globals - exposeThemeGlobals", () => {
  it("exposes theme manager and changeTheme on global scope", () => {
    const manager = { toggle: () => {} };

    exposeThemeGlobals(manager);

    assertExists(globalScope.themeManager);
    assertExists(globalScope.changeTheme);
    restoreGlobals();
  });

  it("invokes theme toggle through changeTheme", () => {
    let toggled = false;
    const manager = {
      toggle: () => {
        toggled = true;
      },
    };

    exposeThemeGlobals(manager);
    (globalScope.changeTheme as () => void)();

    assertEquals(toggled, true);
    restoreGlobals();
  });
});

// =============================================================================
// Toast Manager Utility Tests
// =============================================================================

describe("ToastManager utilities", () => {
  it("escapes HTML content", () => {
    const document = new DOMParser().parseFromString(
      "<!DOCTYPE html><html><body><div id='toast-container'></div></body></html>",
      "text/html",
    )!;

    globalScope.document = document as unknown as Document;

    const manager = new ToastManager();

    assertEquals(
      manager.escapeHtml("<script>alert('xss')</script>"),
      "&lt;script&gt;alert('xss')&lt;/script&gt;",
    );
    restoreGlobals();
  });

  it("returns icons for known variants", () => {
    const document = new DOMParser().parseFromString(
      "<!DOCTYPE html><html><body><div id='toast-container'></div></body></html>",
      "text/html",
    )!;

    globalScope.document = document as unknown as Document;

    const manager = new ToastManager();

    assertEquals(manager.getIcon("success").includes("<svg"), true);
    assertEquals(manager.getIcon("info").includes("<svg"), true);
    restoreGlobals();
  });
});
