/**
 * Tests for Tabs component (TypeScript template)
 *
 * @module tests/components/tabs_test
 */

import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import tabs, { type TabItem } from "../../src/_components/tabs.ts";
import {
  countElements,
  getAttribute,
  hasClass,
  hasElement,
  query,
} from "../helpers/dom.ts";

// =============================================================================
// Test fixtures
// =============================================================================

const basicTabs: TabItem[] = [
  { label: "Tab 1", content: "<p>Content 1</p>" },
  { label: "Tab 2", content: "<p>Content 2</p>" },
];

const tabsWithIcons: TabItem[] = [
  { label: "Home", content: "Home content", icon: "🏠" },
  { label: "Settings", content: "Settings content", icon: "⚙️" },
];

const tabsWithBadges: TabItem[] = [
  { label: "Inbox", content: "Inbox content", badge: 5 },
  { label: "Sent", content: "Sent content", badge: "New" },
];

const tabsWithDisabled: TabItem[] = [
  { label: "Active", content: "Active content" },
  { label: "Disabled", content: "Disabled content", disabled: true },
];

// =============================================================================
// Empty/Invalid Input Tests
// =============================================================================

describe("tabs - empty/invalid input", () => {
  it("should return empty string for undefined tabs", () => {
    const result = tabs({ tabs: undefined as unknown as TabItem[] });
    assertEquals(result, "");
  });

  it("should return empty string for empty tabs array", () => {
    const result = tabs({ tabs: [] });
    assertEquals(result, "");
  });
});

// =============================================================================
// Basic Structure Tests
// =============================================================================

describe("tabs - basic structure", () => {
  it("should render a container with tabs class", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(hasElement(result, ".tabs"), true);
  });

  it("should have data-tabs attribute", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(hasElement(result, "[data-tabs]"), true);
  });

  it("should generate a unique id", () => {
    const result = tabs({ tabs: basicTabs });
    const id = getAttribute(result, ".tabs", "id");
    assertMatch(id || "", /^tabs-[a-z0-9]+$/);
  });

  it("should use provided id", () => {
    const result = tabs({ tabs: basicTabs, id: "my-tabs" });
    assertEquals(getAttribute(result, ".tabs", "id"), "my-tabs");
  });

  it("should render tablist", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(hasElement(result, '[role="tablist"]'), true);
  });

  it("should render correct number of tabs", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(countElements(result, '[role="tab"]'), 2);
  });

  it("should render correct number of panels", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(countElements(result, '[role="tabpanel"]'), 2);
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe("tabs - accessibility", () => {
  it("should have aria-label on tablist", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(
      getAttribute(result, '[role="tablist"]', "aria-label"),
      "Tabs",
    );
  });

  it("should set aria-selected=true on first tab", () => {
    const result = tabs({ tabs: basicTabs });
    const firstTab = query(result, '[role="tab"]');
    assertEquals(firstTab?.getAttribute("aria-selected"), "true");
  });

  it("should set aria-selected=false on other tabs", () => {
    const result = tabs({ tabs: basicTabs });
    const allTabs = result.match(/aria-selected="(true|false)"/g) || [];
    assertEquals(allTabs[0], 'aria-selected="true"');
    assertEquals(allTabs[1], 'aria-selected="false"');
  });

  it("should set tabindex=0 on first tab", () => {
    const result = tabs({ tabs: basicTabs });
    const firstTab = query(result, '[role="tab"]');
    assertEquals(firstTab?.getAttribute("tabindex"), "0");
  });

  it("should set tabindex=-1 on other tabs", () => {
    const result = tabs({ tabs: basicTabs });
    assertStringIncludes(result, 'tabindex="-1"');
  });

  it("should link tabs to panels with aria-controls", () => {
    const result = tabs({ tabs: basicTabs, id: "test" });
    const firstTab = query(result, '[role="tab"]');
    assertEquals(firstTab?.getAttribute("aria-controls"), "test-panel-0");
  });

  it("should link panels to tabs with aria-labelledby", () => {
    const result = tabs({ tabs: basicTabs, id: "test" });
    const firstPanel = query(result, '[role="tabpanel"]');
    assertEquals(firstPanel?.getAttribute("aria-labelledby"), "test-tab-0");
  });
});

// =============================================================================
// Panel State Tests
// =============================================================================

describe("tabs - panel states", () => {
  it("should set data-state=active on first panel", () => {
    const result = tabs({ tabs: basicTabs });
    const firstPanel = query(result, '[role="tabpanel"]');
    assertEquals(firstPanel?.getAttribute("data-state"), "active");
  });

  it("should set data-state=inactive on other panels", () => {
    const result = tabs({ tabs: basicTabs });
    assertStringIncludes(result, 'data-state="inactive"');
  });

  it("should hide inactive panels", () => {
    const result = tabs({ tabs: basicTabs });
    assertStringIncludes(result, "hidden");
  });

  it("should not hide first panel", () => {
    const result = tabs({ tabs: basicTabs });
    const firstPanel = query(result, '[role="tabpanel"]');
    assertEquals(firstPanel?.hasAttribute("hidden"), false);
  });
});

// =============================================================================
// Tab Content Tests
// =============================================================================

describe("tabs - tab content", () => {
  it("should render tab labels", () => {
    const result = tabs({ tabs: basicTabs });
    assertStringIncludes(result, "Tab 1");
    assertStringIncludes(result, "Tab 2");
  });

  it("should render panel content", () => {
    const result = tabs({ tabs: basicTabs });
    assertStringIncludes(result, "<p>Content 1</p>");
    assertStringIncludes(result, "<p>Content 2</p>");
  });
});

// =============================================================================
// Icon Tests
// =============================================================================

describe("tabs - icons", () => {
  it("should render icons when provided", () => {
    const result = tabs({ tabs: tabsWithIcons });
    assertEquals(hasElement(result, ".tabs__tab-icon"), true);
  });

  it("should render icon content", () => {
    const result = tabs({ tabs: tabsWithIcons });
    assertStringIncludes(result, "🏠");
    assertStringIncludes(result, "⚙️");
  });

  it("should wrap label with icon in tabs__tab-content", () => {
    const result = tabs({ tabs: tabsWithIcons });
    assertEquals(hasElement(result, ".tabs__tab-content"), true);
  });
});

// =============================================================================
// Badge Tests
// =============================================================================

describe("tabs - badges", () => {
  it("should render badges when provided", () => {
    const result = tabs({ tabs: tabsWithBadges });
    assertEquals(hasElement(result, ".tabs__tab-badge"), true);
  });

  it("should render numeric badges", () => {
    const result = tabs({ tabs: tabsWithBadges });
    assertStringIncludes(result, ">5</span>");
  });

  it("should render string badges", () => {
    const result = tabs({ tabs: tabsWithBadges });
    assertStringIncludes(result, ">New</span>");
  });
});

// =============================================================================
// Disabled Tab Tests
// =============================================================================

describe("tabs - disabled tabs", () => {
  it("should add disabled attribute to disabled tabs", () => {
    const result = tabs({ tabs: tabsWithDisabled });
    assertStringIncludes(result, "disabled");
  });
});

// =============================================================================
// Variant Tests
// =============================================================================

describe("tabs - variants", () => {
  it("should not add variant class for default variant", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(hasClass(result, ".tabs", "tabs--default"), false);
  });

  it("should add pills variant class", () => {
    const result = tabs({ tabs: basicTabs, variant: "pills" });
    assertEquals(hasClass(result, ".tabs", "tabs--pills"), true);
  });

  it("should add boxed variant class", () => {
    const result = tabs({ tabs: basicTabs, variant: "boxed" });
    assertEquals(hasClass(result, ".tabs", "tabs--boxed"), true);
  });
});

// =============================================================================
// Vertical Layout Tests
// =============================================================================

describe("tabs - vertical layout", () => {
  it("should not add vertical class by default", () => {
    const result = tabs({ tabs: basicTabs });
    assertEquals(hasClass(result, ".tabs", "tabs--vertical"), false);
  });

  it("should add vertical class when vertical=true", () => {
    const result = tabs({ tabs: basicTabs, vertical: true });
    assertEquals(hasClass(result, ".tabs", "tabs--vertical"), true);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("tabs - edge cases", () => {
  it("should handle single tab", () => {
    const singleTab: TabItem[] = [{
      label: "Only Tab",
      content: "Only content",
    }];
    const result = tabs({ tabs: singleTab });
    assertEquals(countElements(result, '[role="tab"]'), 1);
    assertEquals(countElements(result, '[role="tabpanel"]'), 1);
  });

  it("should handle many tabs", () => {
    const manyTabs: TabItem[] = Array.from({ length: 10 }, (_, i) => ({
      label: `Tab ${i + 1}`,
      content: `Content ${i + 1}`,
    }));
    const result = tabs({ tabs: manyTabs });
    assertEquals(countElements(result, '[role="tab"]'), 10);
  });

  it("should handle HTML in content", () => {
    const htmlTabs: TabItem[] = [
      { label: "HTML", content: "<strong>Bold</strong> and <em>italic</em>" },
    ];
    const result = tabs({ tabs: htmlTabs });
    assertStringIncludes(result, "<strong>Bold</strong>");
  });

  it("should handle empty content", () => {
    const emptyContent: TabItem[] = [{ label: "Empty", content: "" }];
    const result = tabs({ tabs: emptyContent });
    assertEquals(hasElement(result, '[role="tabpanel"]'), true);
  });
});
