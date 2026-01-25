/**
 * Tests for Modal component (TypeScript template)
 *
 * @module tests/components/modal_test
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import modal, { type ModalProps } from "../../src/_components/modal.ts";
import { getAttribute, hasClass, hasElement } from "../helpers/dom.ts";

// =============================================================================
// Test fixtures
// =============================================================================

const basicProps: ModalProps = {
  id: "test-modal",
  title: "Test Modal",
  content: "<p>Modal content here</p>",
};

const fullProps: ModalProps = {
  id: "full-modal",
  title: "Full Featured Modal",
  content: "<p>Content</p>",
  footer: "<button>Cancel</button><button>Save</button>",
  size: "large",
  closeable: true,
  initialState: "open",
  closeLabel: "Fermer",
  headerExtra: "<span class='badge'>New</span>",
};

// =============================================================================
// Basic Structure Tests
// =============================================================================

describe("modal - basic structure", () => {
  it("should render modal backdrop", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal-backdrop"), true);
  });

  it("should use provided id", () => {
    const result = modal(basicProps);
    assertEquals(getAttribute(result, ".modal-backdrop", "id"), "test-modal");
  });

  it("should render modal container", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal"), true);
  });

  it("should render modal header", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__header"), true);
  });

  it("should render modal body", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__body"), true);
  });

  it("should render modal title", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__title"), true);
    assertStringIncludes(result, "Test Modal");
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe("modal - accessibility", () => {
  it("should have role=dialog", () => {
    const result = modal(basicProps);
    assertEquals(getAttribute(result, ".modal-backdrop", "role"), "dialog");
  });

  it("should have aria-modal=true", () => {
    const result = modal(basicProps);
    assertEquals(getAttribute(result, ".modal-backdrop", "aria-modal"), "true");
  });

  it("should have aria-labelledby pointing to title", () => {
    const result = modal(basicProps);
    assertEquals(
      getAttribute(result, ".modal-backdrop", "aria-labelledby"),
      "test-modal-title",
    );
  });

  it("should have id on title matching aria-labelledby", () => {
    const result = modal(basicProps);
    assertEquals(
      getAttribute(result, ".modal__title", "id"),
      "test-modal-title",
    );
  });

  it("should have aria-hidden when closed", () => {
    const result = modal({ ...basicProps, initialState: "closed" });
    assertEquals(
      getAttribute(result, ".modal-backdrop", "aria-hidden"),
      "true",
    );
  });

  it("should not have aria-hidden when open", () => {
    const result = modal({ ...basicProps, initialState: "open" });
    assertEquals(getAttribute(result, ".modal-backdrop", "aria-hidden"), null);
  });
});

// =============================================================================
// State Tests
// =============================================================================

describe("modal - initial state", () => {
  it("should default to closed state", () => {
    const result = modal(basicProps);
    assertEquals(
      getAttribute(result, ".modal-backdrop", "data-state"),
      "closed",
    );
  });

  it("should support open initial state", () => {
    const result = modal({ ...basicProps, initialState: "open" });
    assertEquals(getAttribute(result, ".modal-backdrop", "data-state"), "open");
  });

  it("should support closed initial state explicitly", () => {
    const result = modal({ ...basicProps, initialState: "closed" });
    assertEquals(
      getAttribute(result, ".modal-backdrop", "data-state"),
      "closed",
    );
  });
});

// =============================================================================
// Content Tests
// =============================================================================

describe("modal - content", () => {
  it("should render content in body", () => {
    const result = modal(basicProps);
    assertStringIncludes(result, "<p>Modal content here</p>");
  });

  it("should render HTML content correctly", () => {
    const htmlContent = {
      ...basicProps,
      content: "<div class='custom'><strong>Bold</strong></div>",
    };
    const result = modal(htmlContent);
    assertStringIncludes(result, "<strong>Bold</strong>");
  });
});

// =============================================================================
// Footer Tests
// =============================================================================

describe("modal - footer", () => {
  it("should not render footer by default", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__footer"), false);
  });

  it("should render footer when provided", () => {
    const result = modal(fullProps);
    assertEquals(hasElement(result, ".modal__footer"), true);
  });

  it("should render footer content", () => {
    const result = modal(fullProps);
    assertStringIncludes(result, "<button>Cancel</button>");
    assertStringIncludes(result, "<button>Save</button>");
  });

  it("should not render footer for empty string", () => {
    const result = modal({ ...basicProps, footer: "" });
    assertEquals(hasElement(result, ".modal__footer"), false);
  });
});

// =============================================================================
// Close Button Tests
// =============================================================================

describe("modal - close button", () => {
  it("should render close button by default", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__close"), true);
  });

  it("should have aria-label on close button", () => {
    const result = modal(basicProps);
    assertEquals(
      getAttribute(result, ".modal__close", "aria-label"),
      "Close dialog",
    );
  });

  it("should use custom close label", () => {
    const result = modal(fullProps);
    assertEquals(getAttribute(result, ".modal__close", "aria-label"), "Fermer");
  });

  it("should not render close button when closeable=false", () => {
    const result = modal({ ...basicProps, closeable: false });
    assertEquals(hasElement(result, ".modal__close"), false);
  });

  it("should render close button icon (SVG)", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".modal__close svg"), true);
  });
});

// =============================================================================
// Size Tests
// =============================================================================

describe("modal - sizes", () => {
  it("should not add size class for default size", () => {
    const result = modal(basicProps);
    assertEquals(hasClass(result, ".modal", "modal--default"), false);
  });

  it("should add small size class", () => {
    const result = modal({ ...basicProps, size: "small" });
    assertEquals(hasClass(result, ".modal", "modal--small"), true);
  });

  it("should add large size class", () => {
    const result = modal({ ...basicProps, size: "large" });
    assertEquals(hasClass(result, ".modal", "modal--large"), true);
  });

  it("should add fullscreen size class", () => {
    const result = modal({ ...basicProps, size: "fullscreen" });
    assertEquals(hasClass(result, ".modal", "modal--fullscreen"), true);
  });
});

// =============================================================================
// Header Extra Tests
// =============================================================================

describe("modal - header extra content", () => {
  it("should not render header extra by default", () => {
    const result = modal(basicProps);
    assertEquals(hasElement(result, ".badge"), false);
  });

  it("should render header extra when provided", () => {
    const result = modal(fullProps);
    assertEquals(hasElement(result, ".badge"), true);
    assertStringIncludes(result, "New");
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("modal - edge cases", () => {
  it("should handle special characters in title", () => {
    const result = modal({
      ...basicProps,
      title: "Modal <with> 'special' & \"characters\"",
    });
    assertStringIncludes(result, "Modal <with> 'special' & \"characters\"");
  });

  it("should handle empty title", () => {
    const result = modal({ ...basicProps, title: "" });
    assertEquals(hasElement(result, ".modal__title"), true);
  });

  it("should handle empty content", () => {
    const result = modal({ ...basicProps, content: "" });
    assertEquals(hasElement(result, ".modal__body"), true);
  });

  it("should handle long content", () => {
    const longContent = "Lorem ipsum ".repeat(100);
    const result = modal({ ...basicProps, content: longContent });
    assertStringIncludes(result, longContent);
  });

  it("should handle complex id", () => {
    const result = modal({ ...basicProps, id: "my-complex-modal-123" });
    assertEquals(
      getAttribute(result, ".modal-backdrop", "id"),
      "my-complex-modal-123",
    );
    assertEquals(
      getAttribute(result, ".modal__title", "id"),
      "my-complex-modal-123-title",
    );
  });
});
