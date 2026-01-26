/**
 * Tests for Breadcrumbs component
 *
 * @module src/_components/Breadcrumbs_test
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { describe, it } from "@std/testing/bdd";

import breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs.ts";
import {
  countElements,
  getAttribute,
  getTextContents,
  hasClass,
  hasElement,
} from "../../tests/fixtures/dom.ts";

// =============================================================================
// Test fixtures
// =============================================================================

const defaultItems: BreadcrumbItem[] = [
  { label: "Blog", url: "/blog/" },
  { label: "Article Title" },
];

const itemsWithIcons: BreadcrumbItem[] = [
  { label: "Blog", url: "/blog/", icon: "📝" },
  { label: "Article", icon: "📄" },
];

// =============================================================================
// Snapshot Tests
// =============================================================================

Deno.test("breadcrumbs snapshot - default items", async (t) => {
  const result = breadcrumbs({ items: defaultItems });
  await assertSnapshot(t, result);
});

Deno.test("breadcrumbs snapshot - icons and compact variant", async (t) => {
  const result = breadcrumbs({
    items: itemsWithIcons,
    variant: "compact",
    separator: ">",
  });
  await assertSnapshot(t, result);
});

// =============================================================================
// Empty/Invalid Input Tests
// =============================================================================

describe("breadcrumbs - empty/invalid input", () => {
  it("should return empty string for undefined items", () => {
    const result = breadcrumbs({
      items: undefined as unknown as BreadcrumbItem[],
    });
    assertEquals(result, "");
  });

  it("should return empty string for empty items array", () => {
    const result = breadcrumbs({ items: [] });
    assertEquals(result, "");
  });
});

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe("breadcrumbs - basic rendering", () => {
  it("should render a nav element", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(hasElement(result, "nav"), true);
  });

  it("should have breadcrumbs class", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(hasClass(result, "nav", "breadcrumbs"), true);
  });

  it("should have aria-label for accessibility", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(getAttribute(result, "nav", "aria-label"), "Breadcrumb");
  });

  it("should render an ordered list", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(hasElement(result, "ol.breadcrumbs__list"), true);
  });

  it("should render correct number of items including home", () => {
    const result = breadcrumbs({ items: defaultItems });
    // Home + Blog + Article = 3 items
    assertEquals(countElements(result, ".breadcrumbs__item"), 3);
  });
});

// =============================================================================
// Home Link Tests
// =============================================================================

describe("breadcrumbs - home link", () => {
  it("should include home link by default", () => {
    const result = breadcrumbs({ items: defaultItems });
    const texts = getTextContents(
      result,
      ".breadcrumbs__link, .breadcrumbs__current",
    );
    assertEquals(texts[0], "Home");
  });

  it("should use custom home label", () => {
    const result = breadcrumbs({ items: defaultItems, homeLabel: "Accueil" });
    const texts = getTextContents(
      result,
      ".breadcrumbs__link, .breadcrumbs__current",
    );
    assertEquals(texts[0], "Accueil");
  });

  it("should use custom home URL", () => {
    const result = breadcrumbs({ items: defaultItems, homeUrl: "/fr/" });
    assertEquals(getAttribute(result, ".breadcrumbs__link", "href"), "/fr/");
  });

  it("should link home to / by default", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(getAttribute(result, ".breadcrumbs__link", "href"), "/");
  });
});

// =============================================================================
// Item Rendering Tests
// =============================================================================

describe("breadcrumbs - items", () => {
  it("should render links for items with URL", () => {
    const result = breadcrumbs({ items: defaultItems });
    const links = countElements(result, ".breadcrumbs__link");
    // Home + Blog = 2 links
    assertEquals(links, 2);
  });

  it("should render current item without link", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(hasElement(result, ".breadcrumbs__current"), true);
  });

  it("should mark last item as current", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(
      getAttribute(result, ".breadcrumbs__current", "aria-current"),
      "page",
    );
  });

  it("should render correct href for linked items", () => {
    const result = breadcrumbs({ items: defaultItems });
    // Verify the Blog link is present with correct href
    assertStringIncludes(result, 'href="/blog/"');
  });
});

// =============================================================================
// Separator Tests
// =============================================================================

describe("breadcrumbs - separators", () => {
  it("should render separators between items", () => {
    const result = breadcrumbs({ items: defaultItems });
    const separators = countElements(result, ".breadcrumbs__separator");
    // Between Home-Blog and Blog-Article = 2 separators
    assertEquals(separators, 2);
  });

  it("should use / as default separator", () => {
    const result = breadcrumbs({ items: defaultItems });
    const texts = getTextContents(result, ".breadcrumbs__separator");
    assertEquals(texts[0], "/");
  });

  it("should use custom separator", () => {
    const result = breadcrumbs({ items: defaultItems, separator: ">" });
    const texts = getTextContents(result, ".breadcrumbs__separator");
    assertEquals(texts[0], ">");
  });

  it("should hide separators from screen readers", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(
      getAttribute(result, ".breadcrumbs__separator", "aria-hidden"),
      "true",
    );
  });
});

// =============================================================================
// Variant Tests
// =============================================================================

describe("breadcrumbs - variants", () => {
  it("should not add variant class for default variant", () => {
    const result = breadcrumbs({ items: defaultItems });
    assertEquals(hasClass(result, "nav", "breadcrumbs--default"), false);
  });

  it("should add boxed variant class", () => {
    const result = breadcrumbs({ items: defaultItems, variant: "boxed" });
    assertEquals(hasClass(result, "nav", "breadcrumbs--boxed"), true);
  });

  it("should add compact variant class", () => {
    const result = breadcrumbs({ items: defaultItems, variant: "compact" });
    assertEquals(hasClass(result, "nav", "breadcrumbs--compact"), true);
  });
});

// =============================================================================
// Icon Tests
// =============================================================================

describe("breadcrumbs - icons", () => {
  it("should render icons when provided", () => {
    const result = breadcrumbs({ items: itemsWithIcons });
    assertEquals(hasElement(result, ".breadcrumbs__icon"), true);
  });

  it("should hide icons from screen readers", () => {
    const result = breadcrumbs({ items: itemsWithIcons });
    assertEquals(
      getAttribute(result, ".breadcrumbs__icon", "aria-hidden"),
      "true",
    );
  });

  it("should not render icon element when no icon provided", () => {
    const result = breadcrumbs({ items: defaultItems });
    // Only Home has no icon by default
    const iconCount = countElements(result, ".breadcrumbs__icon");
    assertEquals(iconCount, 0);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("breadcrumbs - edge cases", () => {
  it("should handle single item", () => {
    const result = breadcrumbs({ items: [{ label: "Current Page" }] });
    // Home + Current = 2 items
    assertEquals(countElements(result, ".breadcrumbs__item"), 2);
  });

  it("should handle many items", () => {
    const manyItems: BreadcrumbItem[] = [
      { label: "Level 1", url: "/1/" },
      { label: "Level 2", url: "/2/" },
      { label: "Level 3", url: "/3/" },
      { label: "Level 4", url: "/4/" },
      { label: "Current" },
    ];
    const result = breadcrumbs({ items: manyItems });
    // Home + 5 items = 6
    assertEquals(countElements(result, ".breadcrumbs__item"), 6);
  });

  it("should handle items without URL (treated as current)", () => {
    const items: BreadcrumbItem[] = [
      { label: "Section", url: "/section/" },
      { label: "No URL Item" },
    ];
    const result = breadcrumbs({ items });
    assertEquals(hasElement(result, ".breadcrumbs__current"), true);
  });

  it("should handle special characters in labels", () => {
    const items: BreadcrumbItem[] = [
      { label: "Crème brûlée & Co.", url: "/creme/" },
      { label: "<script>alert('xss')</script>" },
    ];
    const result = breadcrumbs({ items });
    assertStringIncludes(result, "Crème brûlée & Co.");
  });
});
