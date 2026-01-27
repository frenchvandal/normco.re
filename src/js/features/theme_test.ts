/**
 * Tests for ThemeManager JavaScript component.
 *
 * These tests verify the client-side theme functionality including:
 * - Theme detection from localStorage and system preference
 * - Theme switching and persistence
 * - ARIA attribute updates
 * - System preference listening
 *
 * @module src/js/features/theme_test
 */

import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

import { createThemeManager } from "./theme.js";

type ThemeManager = ReturnType<typeof createThemeManager>;

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

interface MockMediaQueryList {
  matches: boolean;
  addEventListener: (
    event: string,
    handler: (e: { matches: boolean }) => void,
  ) => void;
}

interface MockLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  storage: Record<string, string>;
}

interface MockDocument {
  documentElement: {
    dataset: Record<string, string>;
    classList: {
      add: (cls: string) => void;
      remove: (cls: string) => void;
      classes: string[];
    };
  };
  readyState: string;
  addEventListener: (event: string, handler: () => void) => void;
  getElementById: (id: string) => MockToggleButton | null;
}

interface MockToggleButton {
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
  addEventListener: (event: string, handler: () => void) => void;
  attributes: Record<string, string>;
  clickHandler: (() => void) | null;
}

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
  localStorage: globalScope.localStorage,
  matchMedia: globalScope.matchMedia,
  toast: globalScope.toast,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
  globalScope.localStorage = ORIGINAL_GLOBALS.localStorage;
  globalScope.matchMedia = ORIGINAL_GLOBALS.matchMedia;
  globalScope.toast = ORIGINAL_GLOBALS.toast;
}

function createMockLocalStorage(
  initialTheme: string | null = null,
): MockLocalStorage {
  const storage: Record<string, string> = {};
  if (initialTheme) {
    storage["theme"] = initialTheme;
  }
  return {
    storage,
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
  };
}

function createMockMatchMedia(prefersDark = false): (
  query: string,
) => MockMediaQueryList {
  return (_query: string) => ({
    matches: prefersDark,
    addEventListener: () => {},
  });
}

function createMockDocument(readyState = "complete"): MockDocument {
  return {
    documentElement: {
      dataset: {},
      classList: {
        classes: [],
        add(cls: string) {
          this.classes.push(cls);
        },
        remove(cls: string) {
          const index = this.classes.indexOf(cls);
          if (index > -1) this.classes.splice(index, 1);
        },
      },
    },
    readyState,
    addEventListener: (_event: string, handler: () => void) => {
      if (readyState === "loading") {
        handler();
      }
    },
    getElementById: () => null,
  };
}

function createMockToggleButton(): MockToggleButton {
  return {
    attributes: {},
    clickHandler: null,
    setAttribute(name: string, value: string) {
      this.attributes[name] = value;
    },
    getAttribute(name: string) {
      return this.attributes[name] ?? null;
    },
    addEventListener(_event: string, handler: () => void) {
      this.clickHandler = handler;
    },
  };
}

// =============================================================================
// Theme Detection Tests
// =============================================================================

describe("ThemeManager - theme detection", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should use localStorage theme when available", () => {
    globalScope.localStorage = createMockLocalStorage("dark");
    globalScope.matchMedia = createMockMatchMedia(false);

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
  });

  it("should use system preference when localStorage is empty", () => {
    globalScope.localStorage = createMockLocalStorage(null);
    globalScope.matchMedia = createMockMatchMedia(true);

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
  });

  it("should default to light when system prefers light", () => {
    globalScope.localStorage = createMockLocalStorage(null);
    globalScope.matchMedia = createMockMatchMedia(false);

    const manager = createThemeManager();

    assertEquals(manager.theme, "light");
  });

  it("should default to light when localStorage throws", () => {
    globalScope.localStorage = {
      getItem: () => {
        throw new Error("Storage unavailable");
      },
      setItem: () => {},
    };
    globalScope.matchMedia = createMockMatchMedia(false);

    const manager = createThemeManager();

    assertEquals(manager.theme, "light");
  });

  it("should default to light when matchMedia throws", () => {
    globalScope.localStorage = createMockLocalStorage(null);
    globalScope.matchMedia = () => {
      throw new Error("matchMedia unavailable");
    };

    const manager = createThemeManager();

    assertEquals(manager.theme, "light");
  });
});

// =============================================================================
// Initialization Tests
// =============================================================================

describe("ThemeManager - initialization", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should apply theme to documentElement on init", () => {
    globalScope.localStorage = createMockLocalStorage("dark");
    globalScope.matchMedia = createMockMatchMedia(false);

    const mockDoc = createMockDocument();
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    assertEquals(mockDoc.documentElement.dataset.theme, "dark");
  });

  it("should set up when DOM is ready", () => {
    globalScope.localStorage = createMockLocalStorage("light");
    globalScope.matchMedia = createMockMatchMedia(false);

    const mockToggle = createMockToggleButton();
    const mockDoc = createMockDocument("complete");
    mockDoc.getElementById = (id: string) =>
      id === "theme-toggle" ? mockToggle : null;
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    assertEquals(mockToggle.attributes["data-theme"], "light");
    assertEquals(mockToggle.attributes["aria-label"], "Switch to dark mode");
  });

  it("should set up listener for DOMContentLoaded when loading", () => {
    globalScope.localStorage = createMockLocalStorage("light");
    globalScope.matchMedia = createMockMatchMedia(false);

    let domContentLoadedHandler: (() => void) | null = null;
    const mockToggle = createMockToggleButton();
    const mockDoc: MockDocument = {
      documentElement: {
        dataset: {},
        classList: {
          classes: [],
          add() {},
          remove() {},
        },
      },
      readyState: "loading",
      addEventListener: (_event: string, handler: () => void) => {
        domContentLoadedHandler = handler;
      },
      getElementById: (id: string) => id === "theme-toggle" ? mockToggle : null,
    };
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    // Simulate DOMContentLoaded
    if (domContentLoadedHandler) {
      domContentLoadedHandler();
    }

    assertEquals(mockToggle.attributes["data-theme"], "light");
  });
});

// =============================================================================
// Theme Toggle Tests
// =============================================================================

describe("ThemeManager - toggle", () => {
  let manager: ThemeManager;
  let mockDoc: MockDocument;
  let mockToggle: MockToggleButton;
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage("light");
    globalScope.localStorage = mockStorage;
    globalScope.matchMedia = createMockMatchMedia(false);
    globalScope.toast = undefined;

    mockToggle = createMockToggleButton();
    mockDoc = createMockDocument();
    mockDoc.getElementById = (id: string) =>
      id === "theme-toggle" ? mockToggle : null;
    globalScope.document = mockDoc as unknown as Document;

    manager = createThemeManager();
    manager.init();
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("should toggle from light to dark", () => {
    manager.toggle();

    assertEquals(manager.theme, "dark");
    assertEquals(mockDoc.documentElement.dataset.theme, "dark");
  });

  it("should toggle from dark to light", () => {
    manager.toggle(); // light -> dark
    manager.toggle(); // dark -> light

    assertEquals(manager.theme, "light");
    assertEquals(mockDoc.documentElement.dataset.theme, "light");
  });

  it("should save theme to localStorage", () => {
    manager.toggle();

    assertEquals(mockStorage.storage["theme"], "dark");
  });

  it("should update toggle button attributes", () => {
    manager.toggle();

    assertEquals(mockToggle.attributes["data-theme"], "dark");
    assertEquals(mockToggle.attributes["aria-label"], "Switch to light mode");
  });

  it("should add transitioning class temporarily", () => {
    manager.toggle();

    assertEquals(
      mockDoc.documentElement.classList.classes.includes(
        "theme-transitioning",
      ),
      true,
    );
  });
});

// =============================================================================
// setTheme Tests
// =============================================================================

describe("ThemeManager - setTheme", () => {
  let manager: ThemeManager;
  let mockDoc: MockDocument;
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage("light");
    globalScope.localStorage = mockStorage;
    globalScope.matchMedia = createMockMatchMedia(false);
    globalScope.toast = undefined;

    mockDoc = createMockDocument();
    globalScope.document = mockDoc as unknown as Document;

    manager = createThemeManager();
    manager.init();
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("should set theme without saving when saveToStorage is false", () => {
    manager.setTheme("dark", false);

    assertEquals(manager.theme, "dark");
    assertEquals(mockStorage.storage["theme"], undefined);
  });

  it("should show toast when saveToStorage is true and toast exists", () => {
    let toastMessage = "";
    globalScope.toast = {
      info: (message: string) => {
        toastMessage = message;
      },
    };

    manager.setTheme("dark", true);

    assertEquals(toastMessage, "Dark theme enabled");
  });

  it("should handle localStorage errors gracefully", () => {
    globalScope.localStorage = {
      getItem: () => "light",
      setItem: () => {
        throw new Error("Storage full");
      },
    };

    // Should not throw
    manager.setTheme("dark", true);

    assertEquals(manager.theme, "dark");
  });
});

// =============================================================================
// System Theme Listener Tests
// =============================================================================

describe("ThemeManager - system theme listener", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should respond to system theme changes when no stored preference", () => {
    let themeChangeHandler:
      | ((e: { matches: boolean }) => void)
      | null = null;

    globalScope.localStorage = createMockLocalStorage(null);
    globalScope.matchMedia = (_query: string) => ({
      matches: false,
      addEventListener: (
        _event: string,
        handler: (e: { matches: boolean }) => void,
      ) => {
        themeChangeHandler = handler;
      },
    });
    globalScope.toast = undefined;

    const mockDoc = createMockDocument();
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    // Simulate system theme change
    if (themeChangeHandler) {
      themeChangeHandler({ matches: true });
    }

    assertEquals(manager.theme, "dark");
  });

  it("should not respond to system changes when user has stored preference", () => {
    let themeChangeHandler:
      | ((e: { matches: boolean }) => void)
      | null = null;

    globalScope.localStorage = createMockLocalStorage("light");
    globalScope.matchMedia = (_query: string) => ({
      matches: false,
      addEventListener: (
        _event: string,
        handler: (e: { matches: boolean }) => void,
      ) => {
        themeChangeHandler = handler;
      },
    });
    globalScope.toast = undefined;

    const mockDoc = createMockDocument();
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    // Simulate system theme change
    if (themeChangeHandler) {
      themeChangeHandler({ matches: true });
    }

    // Should stay light because user has stored preference
    assertEquals(manager.theme, "light");
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("ThemeManager - edge cases", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should handle missing toggle button gracefully", () => {
    globalScope.localStorage = createMockLocalStorage("light");
    globalScope.matchMedia = createMockMatchMedia(false);

    const mockDoc = createMockDocument();
    mockDoc.getElementById = () => null;
    globalScope.document = mockDoc as unknown as Document;

    const manager = createThemeManager();
    manager.init();

    // Should not throw
    manager.toggle();

    assertEquals(manager.theme, "dark");
  });

  it("should handle matchMedia listener setup failure", () => {
    globalScope.localStorage = createMockLocalStorage(null);
    globalScope.matchMedia = (_query: string) => ({
      matches: false,
      addEventListener: () => {
        throw new Error("Listener setup failed");
      },
    });

    const mockDoc = createMockDocument();
    globalScope.document = mockDoc as unknown as Document;

    // Should not throw
    const manager = createThemeManager();
    manager.init();

    assertEquals(manager.theme, "light");
  });
});
