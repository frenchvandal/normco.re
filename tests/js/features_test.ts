/**
 * Tests for JavaScript features
 *
 * These tests verify various JavaScript features including:
 * - Theme management logic
 * - External link enhancement
 * - Global API exposure
 *
 * @module tests/js/features_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DOMParser, HTMLDocument } from "@b-fuze/deno-dom";

// =============================================================================
// Theme Manager Tests
// =============================================================================

/**
 * Mock ThemeManager for testing
 */
class MockThemeManager {
  theme: string;
  themeToggle: Element | null;

  constructor(initialTheme: string = "light") {
    this.theme = initialTheme;
    this.themeToggle = null;
  }

  getInitialTheme(
    storedTheme: string | null,
    prefersDark: boolean,
  ): string {
    // Check localStorage first
    if (storedTheme) return storedTheme;

    // Check system preference
    return prefersDark ? "dark" : "light";
  }

  toggle(): string {
    this.theme = this.theme === "dark" ? "light" : "dark";
    return this.theme;
  }

  setTheme(theme: string): void {
    this.theme = theme;
  }

  getAriaLabel(): string {
    return this.theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";
  }
}

describe("ThemeManager - getInitialTheme", () => {
  it("should return stored theme from localStorage", () => {
    const manager = new MockThemeManager();
    const result = manager.getInitialTheme("dark", false);
    assertEquals(result, "dark");
  });

  it("should return light when no stored theme and prefers-light", () => {
    const manager = new MockThemeManager();
    const result = manager.getInitialTheme(null, false);
    assertEquals(result, "light");
  });

  it("should return dark when no stored theme and prefers-dark", () => {
    const manager = new MockThemeManager();
    const result = manager.getInitialTheme(null, true);
    assertEquals(result, "dark");
  });

  it("should prioritize stored theme over system preference", () => {
    const manager = new MockThemeManager();
    const result = manager.getInitialTheme("light", true); // System prefers dark
    assertEquals(result, "light");
  });
});

describe("ThemeManager - toggle", () => {
  it("should toggle from light to dark", () => {
    const manager = new MockThemeManager("light");
    const newTheme = manager.toggle();
    assertEquals(newTheme, "dark");
    assertEquals(manager.theme, "dark");
  });

  it("should toggle from dark to light", () => {
    const manager = new MockThemeManager("dark");
    const newTheme = manager.toggle();
    assertEquals(newTheme, "light");
    assertEquals(manager.theme, "light");
  });

  it("should toggle multiple times correctly", () => {
    const manager = new MockThemeManager("light");
    manager.toggle();
    manager.toggle();
    assertEquals(manager.theme, "light");
    manager.toggle();
    assertEquals(manager.theme, "dark");
  });
});

describe("ThemeManager - setTheme", () => {
  it("should set theme to dark", () => {
    const manager = new MockThemeManager("light");
    manager.setTheme("dark");
    assertEquals(manager.theme, "dark");
  });

  it("should set theme to light", () => {
    const manager = new MockThemeManager("dark");
    manager.setTheme("light");
    assertEquals(manager.theme, "light");
  });
});

describe("ThemeManager - getAriaLabel", () => {
  it("should return switch to light when in dark mode", () => {
    const manager = new MockThemeManager("dark");
    assertEquals(manager.getAriaLabel(), "Switch to light mode");
  });

  it("should return switch to dark when in light mode", () => {
    const manager = new MockThemeManager("light");
    assertEquals(manager.getAriaLabel(), "Switch to dark mode");
  });
});

// =============================================================================
// External Links Enhancement Tests
// =============================================================================

/**
 * Creates a DOM with various links for testing
 */
function createLinksDOM(): HTMLDocument {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <a href="https://example.com" id="external1">External Link</a>
      <a href="https://other.com" id="external2" target="_blank">Already has target</a>
      <a href="/internal" id="internal">Internal Link</a>
      <a href="http://insecure.com" id="http">HTTP Link</a>
      <a href="https://example.com" class="external-link" id="already-enhanced">
        <span class="sr-only"> (opens in new tab)</span>
      </a>
    </body>
    </html>
  `;

  return new DOMParser().parseFromString(html, "text/html")!;
}

/**
 * Mock function that simulates enhanceExternalLinks behavior
 */
function mockEnhanceExternalLinks(
  document: HTMLDocument,
  currentHostname: string,
): void {
  const links = document.querySelectorAll("a[href^='http']");

  links.forEach((link) => {
    // Parse hostname from href
    const href = link.getAttribute("href") || "";
    let hostname = "";
    try {
      const url = new URL(href);
      hostname = url.hostname;
    } catch {
      return;
    }

    // Skip if it's a link to the current domain
    if (hostname === currentHostname) return;

    // Add external indicator
    if (!link.hasAttribute("target")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }

    // Add tooltip for external links (CSS-driven)
    link.setAttribute("data-tooltip", "Opens in new tab");
    link.classList.add("external-link");

    // Add screen reader text
    if (!link.querySelector(".sr-only")) {
      const srText = document.createElement("span");
      srText.className = "sr-only";
      srText.textContent = " (opens in new tab)";
      link.appendChild(srText);
    }
  });
}

describe("enhanceExternalLinks - basic functionality", () => {
  it("should add target=_blank to external links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external1");
    assertEquals(link?.getAttribute("target"), "_blank");
  });

  it("should add rel=noopener noreferrer to external links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external1");
    assertEquals(link?.getAttribute("rel"), "noopener noreferrer");
  });

  it("should add data-tooltip to external links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external1");
    assertEquals(link?.getAttribute("data-tooltip"), "Opens in new tab");
  });

  it("should add external-link class to external links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external1");
    assertEquals(link?.classList.contains("external-link"), true);
  });

  it("should add screen reader text to external links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external1");
    const srText = link?.querySelector(".sr-only");
    assertExists(srText);
    assertEquals(srText?.textContent, " (opens in new tab)");
  });
});

describe("enhanceExternalLinks - skip conditions", () => {
  it("should not modify links with existing target", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("external2");
    // Should keep existing target but still enhance
    assertEquals(link?.getAttribute("target"), "_blank");
    assertEquals(link?.classList.contains("external-link"), true);
  });

  it("should not add duplicate screen reader text", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("already-enhanced");
    const srTexts = link?.querySelectorAll(".sr-only");
    assertEquals(srTexts?.length, 1);
  });

  it("should not modify internal links", () => {
    const document = createLinksDOM();
    mockEnhanceExternalLinks(document, "localhost");

    const link = document.getElementById("internal");
    assertEquals(link?.hasAttribute("target"), false);
    assertEquals(link?.classList.contains("external-link"), false);
  });
});

describe("enhanceExternalLinks - same domain detection", () => {
  it("should not enhance links to the same domain", () => {
    const document = createLinksDOM();
    // Pretend example.com is current domain
    mockEnhanceExternalLinks(document, "example.com");

    const link = document.getElementById("external1");
    // Should not be enhanced because it's the same domain
    assertEquals(link?.classList.contains("external-link"), false);
  });
});

// =============================================================================
// Global API Exposure Tests
// =============================================================================

describe("globals - exposeThemeGlobals", () => {
  /**
   * Mock function that simulates exposeThemeGlobals
   */
  function mockExposeThemeGlobals(
    target: Record<string, unknown>,
    themeManager: MockThemeManager,
  ): void {
    target.themeManager = themeManager;
    target.changeTheme = () => themeManager.toggle();
  }

  it("should expose themeManager on target", () => {
    const target: Record<string, unknown> = {};
    const manager = new MockThemeManager();

    mockExposeThemeGlobals(target, manager);

    assertExists(target.themeManager);
    assertEquals(target.themeManager, manager);
  });

  it("should expose changeTheme function on target", () => {
    const target: Record<string, unknown> = {};
    const manager = new MockThemeManager();

    mockExposeThemeGlobals(target, manager);

    assertExists(target.changeTheme);
    assertEquals(typeof target.changeTheme, "function");
  });

  it("should toggle theme when changeTheme is called", () => {
    const target: Record<string, unknown> = {};
    const manager = new MockThemeManager("light");

    mockExposeThemeGlobals(target, manager);
    (target.changeTheme as () => void)();

    assertEquals(manager.theme, "dark");
  });
});

// =============================================================================
// Toast Manager Logic Tests
// =============================================================================

describe("ToastManager - escapeHtml", () => {
  /**
   * Mock escapeHtml function
   */
  function escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
  }

  it("should escape ampersand", () => {
    assertEquals(escapeHtml("A & B"), "A &amp; B");
  });

  it("should escape less than", () => {
    assertEquals(escapeHtml("A < B"), "A &lt; B");
  });

  it("should escape greater than", () => {
    assertEquals(escapeHtml("A > B"), "A &gt; B");
  });

  it("should escape double quotes", () => {
    assertEquals(escapeHtml('say "hello"'), "say &quot;hello&quot;");
  });

  it("should escape single quotes", () => {
    assertEquals(escapeHtml("it's"), "it&#039;s");
  });

  it("should escape multiple characters", () => {
    assertEquals(
      escapeHtml("<script>alert('xss')</script>"),
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
    );
  });

  it("should return unchanged string without special chars", () => {
    assertEquals(escapeHtml("Hello World"), "Hello World");
  });
});

describe("ToastManager - getIcon", () => {
  const icons: Record<string, boolean> = {
    success: true,
    error: true,
    warning: true,
    info: true,
  };

  function hasIcon(variant: string): boolean {
    return icons[variant] ?? false;
  }

  it("should have icon for success variant", () => {
    assertEquals(hasIcon("success"), true);
  });

  it("should have icon for error variant", () => {
    assertEquals(hasIcon("error"), true);
  });

  it("should have icon for warning variant", () => {
    assertEquals(hasIcon("warning"), true);
  });

  it("should have icon for info variant", () => {
    assertEquals(hasIcon("info"), true);
  });

  it("should not have icon for unknown variant", () => {
    assertEquals(hasIcon("custom"), false);
  });
});
