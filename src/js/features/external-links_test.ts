/**
 * Tests for external link enhancement functionality.
 *
 * These tests verify the client-side external link behavior including:
 * - Adding target="_blank" and rel attributes
 * - Adding accessibility indicators
 * - Skipping internal links
 * - Screen reader text for external links
 *
 * @module src/js/features/external-links_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { DOMParser, HTMLDocument } from "@b-fuze/deno-dom";

import { enhanceExternalLinks } from "./external-links.js";

const ORIGINAL_PROPERTY_DESCRIPTORS = new Map<
  string,
  PropertyDescriptor | undefined
>([
  ["document", Object.getOwnPropertyDescriptor(globalThis, "document")],
  ["location", Object.getOwnPropertyDescriptor(globalThis, "location")],
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
 * Creates a mock DOM environment with links.
 */
function createLinksDOM(links: string[]): HTMLDocument {
  const linkElements = links
    .map((href) => `<a href="${href}">Link</a>`)
    .join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      ${linkElements}
    </body>
    </html>
  `;

  return new DOMParser().parseFromString(html, "text/html")!;
}

/**
 * Sets up the mock environment for external link tests.
 */
function setupMockEnvironment(
  document: HTMLDocument,
  hostname = "localhost",
): void {
  setGlobalValue("document", document as unknown as Document);
  setGlobalValue("location", { hostname } as Location);

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("http")) {
      const url = new URL(href);
      Object.defineProperty(link, "hostname", {
        configurable: true,
        value: url.hostname,
      });
    }
  });
}

// =============================================================================
// External Link Detection Tests
// =============================================================================

describe("enhanceExternalLinks - detection", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should identify external links", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("target"), "_blank");
  });

  it("should skip internal links", () => {
    const document = createLinksDOM(["https://localhost/page"]);
    setupMockEnvironment(document, "localhost");

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("target"), null);
  });

  it("should handle multiple external links", () => {
    const document = createLinksDOM([
      "https://example.com",
      "https://another.com",
      "https://third.com",
    ]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const links = document.querySelectorAll("a[target='_blank']");
    assertEquals(links.length, 3);
  });

  it("should handle mixed internal and external links", () => {
    const document = createLinksDOM([
      "https://localhost/about",
      "https://external.com",
      "https://localhost/contact",
    ]);
    setupMockEnvironment(document, "localhost");

    enhanceExternalLinks();

    const externalLinks = document.querySelectorAll("a[target='_blank']");
    assertEquals(externalLinks.length, 1);
  });
});

// =============================================================================
// Attribute Tests
// =============================================================================

describe("enhanceExternalLinks - attributes", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should add target='_blank' to external links", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("target"), "_blank");
  });

  it("should add rel='noopener noreferrer' to external links", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("rel"), "noopener noreferrer");
  });

  it("should add data-tooltip attribute", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("data-tooltip"), "Opens in new tab");
  });

  it("should add external-link class", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.classList.contains("external-link"), true);
  });

  it("should not override existing target attribute", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <a href="https://example.com" target="_self">Link</a>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("target"), "_self");
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe("enhanceExternalLinks - accessibility", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should add screen reader text", () => {
    const document = createLinksDOM(["https://example.com"]);
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    const srText = link?.querySelector(".sr-only");
    assertExists(srText);
    assertEquals(srText.textContent, " (opens in new tab)");
  });

  it("should not duplicate screen reader text", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <a href="https://example.com">
          Link
          <span class="sr-only"> (opens in new tab)</span>
        </a>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const link = document.querySelector("a");
    const srTexts = link?.querySelectorAll(".sr-only");
    assertEquals(srTexts?.length, 1);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("enhanceExternalLinks - edge cases", () => {
  afterEach(() => {
    restoreGlobals();
  });

  it("should handle empty page with no links", () => {
    const html =
      `<!DOCTYPE html><html><body><p>No links here</p></body></html>`;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    setupMockEnvironment(document);

    // Should not throw
    enhanceExternalLinks();

    const links = document.querySelectorAll("a");
    assertEquals(links.length, 0);
  });

  it("should only process http/https links", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <a href="mailto:test@example.com">Email</a>
        <a href="tel:+1234567890">Phone</a>
        <a href="/relative">Relative</a>
        <a href="#anchor">Anchor</a>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    setupMockEnvironment(document);

    enhanceExternalLinks();

    const externalLinks = document.querySelectorAll("a[target='_blank']");
    assertEquals(externalLinks.length, 0);
  });

  it("should handle subdomain as different host", () => {
    const document = createLinksDOM(["https://blog.example.com"]);
    setupMockEnvironment(document, "example.com");

    enhanceExternalLinks();

    const link = document.querySelector("a");
    assertEquals(link?.getAttribute("target"), "_blank");
  });

  it("should handle www prefix correctly", () => {
    const document = createLinksDOM(["https://www.example.com"]);
    setupMockEnvironment(document, "example.com");

    enhanceExternalLinks();

    const link = document.querySelector("a");
    // www.example.com !== example.com, so it's external
    assertEquals(link?.getAttribute("target"), "_blank");
  });
});
