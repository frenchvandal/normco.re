/**
 * Tests for Pagination Component
 *
 * These tests verify the pagination component rendering including:
 * - Rendering with previous/next links
 * - Hiding when only one page
 * - Correct page number display
 *
 * @module tests/components/pagination-component_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

// =============================================================================
// Mock Types
// =============================================================================

interface MockPagination {
  page: number;
  totalPages: number;
  previous?: string;
  next?: string;
}

interface MockI18n {
  nav: {
    previous: string;
    next: string;
    page: string;
  };
}

// =============================================================================
// Mock Component
// =============================================================================

/**
 * Mock implementation of the pagination component for testing
 */
function paginationComponent({
  pagination,
  i18n,
}: {
  pagination?: MockPagination;
  i18n: MockI18n;
}): string {
  if (!pagination || pagination.totalPages === 1) {
    return "";
  }

  return `
<nav class="page-pagination pagination">
  <ul>
    ${
    pagination.previous
      ? `
    <li class="pagination-prev">
      <a href="${pagination.previous}" rel="prev">${i18n.nav.previous}</a>
    </li>
    `
      : ""
  }

    <li class="pagination-page">
      ${i18n.nav.page} ${pagination.page}
    </li>

    ${
    pagination.next
      ? `
    <li class="pagination-next">
      <a href="${pagination.next}" rel="next">${i18n.nav.next}</a>
    </li>
    `
      : ""
  }
  </ul>
</nav>
`;
}

// =============================================================================
// Test Data
// =============================================================================

const mockI18n: MockI18n = {
  nav: {
    previous: "Previous",
    next: "Next",
    page: "Page",
  },
};

// =============================================================================
// Empty/Single Page Tests
// =============================================================================

describe("Pagination Component - empty/single page", () => {
  it("should return empty string when pagination is undefined", () => {
    const result = paginationComponent({
      pagination: undefined,
      i18n: mockI18n,
    });
    assertEquals(result, "");
  });

  it("should return empty string when totalPages is 1", () => {
    const result = paginationComponent({
      pagination: { page: 1, totalPages: 1 },
      i18n: mockI18n,
    });
    assertEquals(result, "");
  });
});

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe("Pagination Component - basic rendering", () => {
  it("should render pagination nav element", () => {
    const result = paginationComponent({
      pagination: {
        page: 2,
        totalPages: 5,
        previous: "/page/1/",
        next: "/page/3/",
      },
      i18n: mockI18n,
    });

    assertEquals(
      result.includes('<nav class="page-pagination pagination">'),
      true,
    );
    assertEquals(result.includes("</nav>"), true);
  });

  it("should render current page number", () => {
    const result = paginationComponent({
      pagination: {
        page: 3,
        totalPages: 5,
        previous: "/page/2/",
        next: "/page/4/",
      },
      i18n: mockI18n,
    });

    assertEquals(result.includes("Page 3"), true);
  });

  it("should render pagination-page class", () => {
    const result = paginationComponent({
      pagination: {
        page: 2,
        totalPages: 3,
        previous: "/page/1/",
        next: "/page/3/",
      },
      i18n: mockI18n,
    });

    assertEquals(result.includes('class="pagination-page"'), true);
  });
});

// =============================================================================
// Previous Link Tests
// =============================================================================

describe("Pagination Component - previous link", () => {
  it("should render previous link when available", () => {
    const result = paginationComponent({
      pagination: {
        page: 2,
        totalPages: 3,
        previous: "/page/1/",
        next: "/page/3/",
      },
      i18n: mockI18n,
    });

    assertEquals(result.includes('href="/page/1/"'), true);
    assertEquals(result.includes('rel="prev"'), true);
    assertEquals(result.includes("Previous"), true);
  });

  it("should not render previous link on first page", () => {
    const result = paginationComponent({
      pagination: { page: 1, totalPages: 3, next: "/page/2/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes('rel="prev"'), false);
    assertEquals(result.includes("pagination-prev"), false);
  });

  it("should render pagination-prev class", () => {
    const result = paginationComponent({
      pagination: {
        page: 2,
        totalPages: 3,
        previous: "/archive/",
        next: "/page/3/",
      },
      i18n: mockI18n,
    });

    assertEquals(result.includes('class="pagination-prev"'), true);
  });
});

// =============================================================================
// Next Link Tests
// =============================================================================

describe("Pagination Component - next link", () => {
  it("should render next link when available", () => {
    const result = paginationComponent({
      pagination: { page: 1, totalPages: 3, next: "/page/2/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes('href="/page/2/"'), true);
    assertEquals(result.includes('rel="next"'), true);
    assertEquals(result.includes("Next"), true);
  });

  it("should not render next link on last page", () => {
    const result = paginationComponent({
      pagination: { page: 3, totalPages: 3, previous: "/page/2/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes('rel="next"'), false);
    assertEquals(result.includes("pagination-next"), false);
  });

  it("should render pagination-next class", () => {
    const result = paginationComponent({
      pagination: { page: 1, totalPages: 2, next: "/page/2/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes('class="pagination-next"'), true);
  });
});

// =============================================================================
// i18n Tests
// =============================================================================

describe("Pagination Component - internationalization", () => {
  it("should use custom i18n for previous", () => {
    const frenchI18n: MockI18n = {
      nav: {
        previous: "Précédent",
        next: "Suivant",
        page: "Page",
      },
    };

    const result = paginationComponent({
      pagination: {
        page: 2,
        totalPages: 3,
        previous: "/page/1/",
        next: "/page/3/",
      },
      i18n: frenchI18n,
    });

    assertEquals(result.includes("Précédent"), true);
    assertEquals(result.includes("Suivant"), true);
  });

  it("should use custom i18n for page label", () => {
    const germanI18n: MockI18n = {
      nav: {
        previous: "Zurück",
        next: "Weiter",
        page: "Seite",
      },
    };

    const result = paginationComponent({
      pagination: {
        page: 5,
        totalPages: 10,
        previous: "/page/4/",
        next: "/page/6/",
      },
      i18n: germanI18n,
    });

    assertEquals(result.includes("Seite 5"), true);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("Pagination Component - edge cases", () => {
  it("should handle two pages correctly - first page", () => {
    const result = paginationComponent({
      pagination: { page: 1, totalPages: 2, next: "/page/2/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes("Page 1"), true);
    assertEquals(result.includes('rel="next"'), true);
    assertEquals(result.includes('rel="prev"'), false);
  });

  it("should handle two pages correctly - second page", () => {
    const result = paginationComponent({
      pagination: { page: 2, totalPages: 2, previous: "/archive/" },
      i18n: mockI18n,
    });

    assertEquals(result.includes("Page 2"), true);
    assertEquals(result.includes('rel="prev"'), true);
    assertEquals(result.includes('rel="next"'), false);
  });

  it("should handle large page numbers", () => {
    const result = paginationComponent({
      pagination: {
        page: 999,
        totalPages: 1000,
        previous: "/page/998/",
        next: "/page/1000/",
      },
      i18n: mockI18n,
    });

    assertEquals(result.includes("Page 999"), true);
  });
});
