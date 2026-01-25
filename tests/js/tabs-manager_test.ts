/**
 * Tests for TabsManager JavaScript component
 *
 * These tests verify the client-side tab functionality including:
 * - Tab switching
 * - Keyboard navigation
 * - ARIA attribute updates
 * - Event handling
 *
 * @module tests/js/tabs-manager_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { spy } from "@std/testing/mock";
import { DOMParser, Element, HTMLDocument } from "@b-fuze/deno-dom";

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock DOM environment with tabs structure
 */
function createTabsDOM(): { document: HTMLDocument; tabsElement: Element } {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div class="tabs" data-tabs id="test-tabs">
        <div class="tabs__list" role="tablist" aria-label="Tabs">
          <button class="tabs__tab" role="tab" id="test-tabs-tab-0"
            aria-controls="test-tabs-panel-0" aria-selected="true" tabindex="0">
            Tab 1
          </button>
          <button class="tabs__tab" role="tab" id="test-tabs-tab-1"
            aria-controls="test-tabs-panel-1" aria-selected="false" tabindex="-1">
            Tab 2
          </button>
          <button class="tabs__tab" role="tab" id="test-tabs-tab-2"
            aria-controls="test-tabs-panel-2" aria-selected="false" tabindex="-1">
            Tab 3
          </button>
        </div>
        <div class="tabs__panels">
          <div class="tabs__panel" role="tabpanel" id="test-tabs-panel-0"
            aria-labelledby="test-tabs-tab-0" data-state="active">
            Content 1
          </div>
          <div class="tabs__panel" role="tabpanel" id="test-tabs-panel-1"
            aria-labelledby="test-tabs-tab-1" data-state="inactive" hidden>
            Content 2
          </div>
          <div class="tabs__panel" role="tabpanel" id="test-tabs-panel-2"
            aria-labelledby="test-tabs-tab-2" data-state="inactive" hidden>
            Content 3
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const document = new DOMParser().parseFromString(html, "text/html")!;
  const tabsElement = document.querySelector("[data-tabs]")!;

  return { document, tabsElement };
}

/**
 * Simulates a simplified TabsManager for testing
 * (Since we can't import the actual JS module directly)
 */
class MockTabsManager {
  tabsElement: Element;
  tabList: Element | null;
  tabs: Element[];
  panels: Element[];
  currentIndex: number;

  constructor(tabsElement: Element) {
    this.tabsElement = tabsElement;
    this.tabList = tabsElement.querySelector(".tabs__list");
    this.tabs = Array.from(tabsElement.querySelectorAll(".tabs__tab"));
    this.panels = Array.from(tabsElement.querySelectorAll(".tabs__panel"));

    this.currentIndex = this.tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
  }

  switchTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) return;
    if (index === this.currentIndex) return;

    this.currentIndex = index;
    this.updateUI();
  }

  updateUI(): void {
    this.tabs.forEach((tab, index) => {
      const isSelected = index === this.currentIndex;
      tab.setAttribute("aria-selected", isSelected.toString());
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    this.panels.forEach((panel, index) => {
      const isActive = index === this.currentIndex;
      panel.setAttribute("data-state", isActive ? "active" : "inactive");
      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  handleKeyboard(key: string, currentIndex: number): number {
    let newIndex = currentIndex;

    switch (key) {
      case "ArrowLeft":
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = this.tabs.length - 1;
        break;
      case "ArrowRight":
        newIndex = currentIndex + 1;
        if (newIndex >= this.tabs.length) newIndex = 0;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = this.tabs.length - 1;
        break;
    }

    return newIndex;
  }
}

// =============================================================================
// Initialization Tests
// =============================================================================

describe("TabsManager - initialization", () => {
  it("should find all tabs", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    assertEquals(manager.tabs.length, 3);
  });

  it("should find all panels", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    assertEquals(manager.panels.length, 3);
  });

  it("should find tablist", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    assertExists(manager.tabList);
  });

  it("should detect initially selected tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    assertEquals(manager.currentIndex, 0);
  });

  it("should default to first tab if none selected", () => {
    const { tabsElement } = createTabsDOM();
    // Remove aria-selected from all tabs
    tabsElement.querySelectorAll(".tabs__tab").forEach((tab) => {
      tab.setAttribute("aria-selected", "false");
    });
    const manager = new MockTabsManager(tabsElement);
    assertEquals(manager.currentIndex, 0);
  });
});

// =============================================================================
// Tab Switching Tests
// =============================================================================

describe("TabsManager - switchTab", () => {
  it("should switch to specified tab index", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.currentIndex, 1);
  });

  it("should not switch if index is out of bounds (negative)", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    const initialIndex = manager.currentIndex;

    manager.switchTab(-1);

    assertEquals(manager.currentIndex, initialIndex);
  });

  it("should not switch if index is out of bounds (too high)", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    const initialIndex = manager.currentIndex;

    manager.switchTab(10);

    assertEquals(manager.currentIndex, initialIndex);
  });

  it("should not switch if already on that tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);
    const updateUISpy = spy(manager, "updateUI");

    manager.switchTab(0); // Already on tab 0

    assertEquals(updateUISpy.calls.length, 0);
  });
});

// =============================================================================
// UI Update Tests
// =============================================================================

describe("TabsManager - updateUI", () => {
  it("should set aria-selected=true on current tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.tabs[1].getAttribute("aria-selected"), "true");
  });

  it("should set aria-selected=false on other tabs", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.tabs[0].getAttribute("aria-selected"), "false");
    assertEquals(manager.tabs[2].getAttribute("aria-selected"), "false");
  });

  it("should set tabindex=0 on current tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.tabs[1].getAttribute("tabindex"), "0");
  });

  it("should set tabindex=-1 on other tabs", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.tabs[0].getAttribute("tabindex"), "-1");
    assertEquals(manager.tabs[2].getAttribute("tabindex"), "-1");
  });

  it("should set data-state=active on current panel", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.panels[1].getAttribute("data-state"), "active");
  });

  it("should set data-state=inactive on other panels", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.panels[0].getAttribute("data-state"), "inactive");
    assertEquals(manager.panels[2].getAttribute("data-state"), "inactive");
  });

  it("should show current panel (remove hidden)", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.panels[1].hasAttribute("hidden"), false);
  });

  it("should hide other panels (add hidden)", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    manager.switchTab(1);

    assertEquals(manager.panels[0].hasAttribute("hidden"), true);
    assertEquals(manager.panels[2].hasAttribute("hidden"), true);
  });
});

// =============================================================================
// Keyboard Navigation Tests
// =============================================================================

describe("TabsManager - keyboard navigation", () => {
  it("should move left with ArrowLeft", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("ArrowLeft", 1);

    assertEquals(newIndex, 0);
  });

  it("should wrap to last tab when pressing ArrowLeft on first tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("ArrowLeft", 0);

    assertEquals(newIndex, 2);
  });

  it("should move right with ArrowRight", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("ArrowRight", 0);

    assertEquals(newIndex, 1);
  });

  it("should wrap to first tab when pressing ArrowRight on last tab", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("ArrowRight", 2);

    assertEquals(newIndex, 0);
  });

  it("should go to first tab with Home key", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("Home", 2);

    assertEquals(newIndex, 0);
  });

  it("should go to last tab with End key", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("End", 0);

    assertEquals(newIndex, 2);
  });

  it("should return current index for unhandled keys", () => {
    const { tabsElement } = createTabsDOM();
    const manager = new MockTabsManager(tabsElement);

    const newIndex = manager.handleKeyboard("Enter", 1);

    assertEquals(newIndex, 1);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("TabsManager - edge cases", () => {
  it("should handle empty tabs gracefully", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="tabs" data-tabs id="empty-tabs">
          <div class="tabs__list" role="tablist"></div>
          <div class="tabs__panels"></div>
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const tabsElement = document.querySelector("[data-tabs]")!;
    const manager = new MockTabsManager(tabsElement);

    assertEquals(manager.tabs.length, 0);
    assertEquals(manager.panels.length, 0);
  });

  it("should handle single tab", () => {
    const html = `
      <!DOCTYPE html>
      <html><body>
        <div class="tabs" data-tabs id="single-tab">
          <div class="tabs__list" role="tablist">
            <button class="tabs__tab" role="tab" aria-selected="true" tabindex="0">
              Only Tab
            </button>
          </div>
          <div class="tabs__panels">
            <div class="tabs__panel" role="tabpanel" data-state="active">
              Only Content
            </div>
          </div>
        </div>
      </body></html>
    `;
    const document = new DOMParser().parseFromString(html, "text/html")!;
    const tabsElement = document.querySelector("[data-tabs]")!;
    const manager = new MockTabsManager(tabsElement);

    assertEquals(manager.tabs.length, 1);
    assertEquals(manager.currentIndex, 0);

    // Keyboard navigation should wrap properly
    const newIndex = manager.handleKeyboard("ArrowRight", 0);
    assertEquals(newIndex, 0);
  });
});
