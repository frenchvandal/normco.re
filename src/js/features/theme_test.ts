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

type MockLocalStorage = Storage & {
  storage: Record<string, string>;
};

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
  addEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
  ) => void;
  getElementById: (id: string) => MockToggleButton | null;
}

interface MockToggleButton {
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
  addEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
  ) => void;
  attributes: Record<string, string>;
  clickHandler: (() => void) | null;
}

const ORIGINAL_PROPERTY_DESCRIPTORS = new Map<
  string,
  PropertyDescriptor | undefined
>([
  ["document", Object.getOwnPropertyDescriptor(globalThis, "document")],
  ["localStorage", Object.getOwnPropertyDescriptor(globalThis, "localStorage")],
  ["matchMedia", Object.getOwnPropertyDescriptor(globalThis, "matchMedia")],
  ["setTimeout", Object.getOwnPropertyDescriptor(globalThis, "setTimeout")],
  ["toast", Object.getOwnPropertyDescriptor(globalThis, "toast")],
]);

function setGlobalValue(key: string, value: unknown): void {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

beforeEach(() => {
  setGlobalValue(
    "setTimeout",
    ((handler: (...args: unknown[]) => void) => {
      handler();
      return 0;
    }) as typeof globalThis.setTimeout,
  );
});

function restoreGlobals(): void {
  ORIGINAL_PROPERTY_DESCRIPTORS.forEach((descriptor, key) => {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      delete (globalThis as Record<string, unknown>)[key];
    }
  });
}

function createMockLocalStorage(
  initialTheme: string | null = null,
): MockLocalStorage {
  const storage: Record<string, string> = {};
  if (initialTheme) {
    storage["theme"] = initialTheme;
  }
  const getStorageKeys = () => Object.keys(storage);
  return {
    storage,
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
    key: (index: number) => getStorageKeys()[index] ?? null,
    removeItem: (key: string) => {
      delete storage[key];
    },
    get length() {
      return getStorageKeys().length;
    },
  };
}

function createMockMatchMedia(prefersDark = false): (
  query: string,
) => MediaQueryList {
  return (query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
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
    addEventListener: (
      _event: string,
      handler: EventListenerOrEventListenerObject,
    ) => {
      if (readyState === "loading" && typeof handler === "function") {
        handler(new Event("DOMContentLoaded"));
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
    addEventListener(
      _event: string,
      handler: EventListenerOrEventListenerObject,
    ) {
      if (typeof handler === "function") {
        this.clickHandler = () => handler(new Event("click"));
      }
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
    setGlobalValue("localStorage", createMockLocalStorage("dark"));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
  });

  it("should use system preference when localStorage is empty", () => {
    setGlobalValue("localStorage", createMockLocalStorage(null));
    setGlobalValue("matchMedia", createMockMatchMedia(true));

    const manager = createThemeManager();

    assertEquals(manager.theme, "dark");
  });

  it("should default to light when system prefers light", () => {
    setGlobalValue("localStorage", createMockLocalStorage(null));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const manager = createThemeManager();

    assertEquals(manager.theme, "light");
  });

  it("should default to light when localStorage throws", () => {
    const mockStorage = createMockLocalStorage(null);
    mockStorage.getItem = () => {
      throw new Error("Storage unavailable");
    };
    setGlobalValue("localStorage", mockStorage);
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const manager = createThemeManager();

    assertEquals(manager.theme, "light");
  });

  it("should default to light when matchMedia throws", () => {
    setGlobalValue("localStorage", createMockLocalStorage(null));
    setGlobalValue(
      "matchMedia",
      (() => {
        throw new Error("matchMedia unavailable");
      }) as typeof globalThis.matchMedia,
    );

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
    setGlobalValue("localStorage", createMockLocalStorage("dark"));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const mockDoc = createMockDocument();
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    assertEquals(mockDoc.documentElement.dataset.theme, "dark");
  });

  it("should set up when DOM is ready", () => {
    setGlobalValue("localStorage", createMockLocalStorage("light"));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const mockToggle = createMockToggleButton();
    const mockDoc = createMockDocument("complete");
    mockDoc.getElementById = (id: string) =>
      id === "theme-toggle" ? mockToggle : null;
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    assertEquals(mockToggle.attributes["data-theme"], "light");
    assertEquals(mockToggle.attributes["aria-label"], "Switch to dark mode");
  });

  it("should set up listener for DOMContentLoaded when loading", () => {
    setGlobalValue("localStorage", createMockLocalStorage("light"));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const domContentLoadedHandlers: Array<(event: Event) => void> = [];
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
      addEventListener: (
        _event: string,
        handler: EventListenerOrEventListenerObject,
      ) => {
        if (typeof handler === "function") {
          domContentLoadedHandlers.push(
            handler as (event: Event) => void,
          );
        }
      },
      getElementById: (id: string) => id === "theme-toggle" ? mockToggle : null,
    };
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    // Simulate DOMContentLoaded
    domContentLoadedHandlers.forEach((handler) => {
      handler(new Event("DOMContentLoaded"));
    });

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
    setGlobalValue("localStorage", mockStorage);
    setGlobalValue("matchMedia", createMockMatchMedia(false));
    setGlobalValue("toast", undefined);

    mockToggle = createMockToggleButton();
    mockDoc = createMockDocument();
    mockDoc.getElementById = (id: string) =>
      id === "theme-toggle" ? mockToggle : null;
    setGlobalValue("document", mockDoc as unknown as Document);

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
    const timeoutHandlers: Array<() => void> = [];
    setGlobalValue(
      "setTimeout",
      ((handler: () => void) => {
        timeoutHandlers.push(handler);
        return 0;
      }) as typeof globalThis.setTimeout,
    );

    manager.toggle();

    assertEquals(
      mockDoc.documentElement.classList.classes.includes(
        "theme-transitioning",
      ),
      true,
    );

    timeoutHandlers.forEach((handler) => handler());
    assertEquals(
      mockDoc.documentElement.classList.classes.includes(
        "theme-transitioning",
      ),
      false,
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
    setGlobalValue("localStorage", mockStorage);
    setGlobalValue("matchMedia", createMockMatchMedia(false));
    setGlobalValue("toast", undefined);

    mockDoc = createMockDocument();
    setGlobalValue("document", mockDoc as unknown as Document);

    manager = createThemeManager();
    manager.init();
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("should set theme without saving when saveToStorage is false", () => {
    manager.setTheme("dark", false);

    assertEquals(manager.theme, "dark");
    assertEquals(mockStorage.storage["theme"], "light");
  });

  it("should show toast when saveToStorage is true and toast exists", () => {
    let toastMessage = "";
    setGlobalValue("toast", {
      info: (message: string) => {
        toastMessage = message;
      },
    });

    manager.setTheme("dark", true);

    assertEquals(toastMessage, "Dark theme enabled");
  });

  it("should handle localStorage errors gracefully", () => {
    const mockStorage = createMockLocalStorage("light");
    mockStorage.setItem = () => {
      throw new Error("Storage full");
    };
    setGlobalValue("localStorage", mockStorage);

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
    const themeChangeHandlers: Array<(event: MediaQueryListEvent) => void> = [];

    setGlobalValue("localStorage", createMockLocalStorage(null));
    setGlobalValue("matchMedia", (_query: string) => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (
        _event: string,
        handler: EventListenerOrEventListenerObject,
      ) => {
        if (typeof handler === "function") {
          themeChangeHandlers.push(
            handler as (event: MediaQueryListEvent) => void,
          );
        }
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    setGlobalValue("toast", undefined);

    const mockDoc = createMockDocument();
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    // Simulate system theme change
    themeChangeHandlers.forEach((handler) => {
      handler({ matches: true } as MediaQueryListEvent);
    });

    assertEquals(manager.theme, "dark");
  });

  it("should not respond to system changes when user has stored preference", () => {
    const themeChangeHandlers: Array<(event: MediaQueryListEvent) => void> = [];

    setGlobalValue("localStorage", createMockLocalStorage("light"));
    setGlobalValue("matchMedia", (_query: string) => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (
        _event: string,
        handler: EventListenerOrEventListenerObject,
      ) => {
        if (typeof handler === "function") {
          themeChangeHandlers.push(
            handler as (event: MediaQueryListEvent) => void,
          );
        }
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    setGlobalValue("toast", undefined);

    const mockDoc = createMockDocument();
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    // Simulate system theme change
    themeChangeHandlers.forEach((handler) => {
      handler({ matches: true } as MediaQueryListEvent);
    });

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
    setGlobalValue("localStorage", createMockLocalStorage("light"));
    setGlobalValue("matchMedia", createMockMatchMedia(false));

    const mockDoc = createMockDocument();
    mockDoc.getElementById = () => null;
    setGlobalValue("document", mockDoc as unknown as Document);

    const manager = createThemeManager();
    manager.init();

    // Should not throw
    manager.toggle();

    assertEquals(manager.theme, "dark");
  });

  it("should handle matchMedia listener setup failure", () => {
    setGlobalValue("localStorage", createMockLocalStorage(null));
    setGlobalValue("matchMedia", (_query: string) => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {
        throw new Error("Listener setup failed");
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    const mockDoc = createMockDocument();
    setGlobalValue("document", mockDoc as unknown as Document);

    // Should not throw
    const manager = createThemeManager();
    manager.init();

    assertEquals(manager.theme, "light");
  });
});
