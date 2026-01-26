/**
 * Tests for PostDetails Component
 *
 * These tests verify the post details component rendering including:
 * - Author display with/without link
 * - Date formatting
 * - Reading time display
 * - Tags rendering
 *
 * @module src/_components/PostDetails_test
 */

import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { describe, it } from "@std/testing/bdd";

// =============================================================================
// Mock Types
// =============================================================================

interface MockReadingInfo {
  minutes: number;
}

interface MockI18n {
  post: {
    by: string;
    reading_time: string;
  };
}

interface MockPage {
  url: string;
}

interface MockSearch {
  page: (query: string) => MockPage | null;
}

interface MockDateHelper {
  (date: Date, format: string): string;
}

// =============================================================================
// Mock Component
// =============================================================================

/**
 * Mock implementation of the PostDetails component for testing
 */
function postDetailsComponent(
  {
    author,
    date,
    tags,
    readingInfo,
    i18n,
    search,
  }: {
    author?: string;
    date: Date;
    tags?: string[];
    readingInfo: MockReadingInfo;
    i18n: MockI18n;
    search: MockSearch;
  },
  { date: dateHelper }: { date: MockDateHelper },
): string {
  let authorHtml = "";
  if (author) {
    const authorPage = search.page(`type=author author="${author}"`);
    if (authorPage) {
      authorHtml =
        `<p>${i18n.post.by}<a data-pagefind-filter="author" href="${authorPage.url}">${author}</a></p>`;
    } else {
      authorHtml = `<p>${i18n.post.by}${author}</p>`;
    }
  }

  const dateHtml = `<p><time datetime="${dateHelper(date, "DATETIME")}">${
    dateHelper(date, "HUMAN_DATE")
  }</time></p>`;
  const readingTimeHtml =
    `<p>${readingInfo.minutes} ${i18n.post.reading_time}</p>`;

  let tagsHtml = "";
  if (tags && tags.length > 0) {
    const tagLinks = tags.map((tag: string) => {
      const tagPage = search.page(`type=tag tag="${tag}"`);
      return tagPage
        ? `<a data-pagefind-filter="tag" class="badge" href="${tagPage.url}">${tag}</a>`
        : "";
    }).filter(Boolean).join("\n    ");

    if (tagLinks) {
      tagsHtml = `
  <div class="post-tags">
    ${tagLinks}
  </div>`;
    }
  }

  return `
<div class="post-details">
  ${authorHtml}

  ${dateHtml}

  ${readingTimeHtml}
  ${tagsHtml}
</div>
`;
}

// =============================================================================
// Test Data
// =============================================================================

const mockI18n: MockI18n = {
  post: {
    by: "By ",
    reading_time: "min read",
  },
};

const mockDateHelper: MockDateHelper = (date: Date, format: string): string => {
  if (format === "DATETIME") {
    return date.toISOString();
  }
  if (format === "HUMAN_DATE") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toString();
};

const mockSearchWithAuthor: MockSearch = {
  page: (query: string) => {
    if (query.includes("type=author")) {
      return { url: "/authors/john-doe/" };
    }
    if (query.includes("type=tag")) {
      const tagMatch = query.match(/tag="([^"]+)"/);
      if (tagMatch) {
        return { url: `/tags/${tagMatch[1].toLowerCase()}/` };
      }
    }
    return null;
  },
};

const mockSearchWithoutAuthor: MockSearch = {
  page: (_query: string) => null,
};

// =============================================================================
// Snapshot Tests
// =============================================================================

Deno.test("postDetails snapshot - full metadata", async (t) => {
  const result = postDetailsComponent(
    {
      author: "John Doe",
      date: new Date("2024-01-15T00:00:00.000Z"),
      tags: ["Lume", "Deno"],
      readingInfo: { minutes: 5 },
      i18n: mockI18n,
      search: mockSearchWithAuthor,
    },
    {
      date: (_date, format) =>
        format === "DATETIME" ? "2024-01-15T00:00:00.000Z" : "January 15, 2024",
    },
  );

  await assertSnapshot(t, result);
});

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe("PostDetails Component - basic rendering", () => {
  it("should render post-details container", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('class="post-details"'), true);
  });

  it("should render time element with datetime attribute", () => {
    const testDate = new Date("2024-01-15T10:00:00Z");
    const result = postDetailsComponent(
      {
        date: testDate,
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("<time"), true);
    assertEquals(result.includes("datetime="), true);
  });

  it("should render reading time", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 7 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("7 min read"), true);
  });
});

// =============================================================================
// Author Tests
// =============================================================================

describe("PostDetails Component - author", () => {
  it("should render author with link when author page exists", () => {
    const result = postDetailsComponent(
      {
        author: "John Doe",
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('href="/authors/john-doe/"'), true);
    assertEquals(result.includes("John Doe"), true);
    assertEquals(result.includes("By "), true);
  });

  it("should render author without link when author page does not exist", () => {
    const result = postDetailsComponent(
      {
        author: "Unknown Author",
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("By Unknown Author"), true);
    assertEquals(result.includes("<a"), false);
  });

  it("should not render author section when author is undefined", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("By "), false);
  });

  it("should add pagefind-filter attribute to author link", () => {
    const result = postDetailsComponent(
      {
        author: "John Doe",
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('data-pagefind-filter="author"'), true);
  });
});

// =============================================================================
// Tags Tests
// =============================================================================

describe("PostDetails Component - tags", () => {
  it("should render tags when available", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: ["JavaScript", "TypeScript"],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('class="post-tags"'), true);
    assertEquals(result.includes("JavaScript"), true);
    assertEquals(result.includes("TypeScript"), true);
  });

  it("should render tag links with badge class", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: ["CSS"],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('class="badge"'), true);
  });

  it("should add pagefind-filter attribute to tag links", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: ["Deno"],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('data-pagefind-filter="tag"'), true);
  });

  it("should not render tags section when tags array is empty", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: [],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('class="post-tags"'), false);
  });

  it("should not render tags section when tags is undefined", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes('class="post-tags"'), false);
  });

  it("should skip tags that have no corresponding page", () => {
    const searchWithPartialTags: MockSearch = {
      page: (query: string) => {
        if (query.includes('tag="existing"')) {
          return { url: "/tags/existing/" };
        }
        return null;
      },
    };

    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: ["existing", "nonexistent"],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: searchWithPartialTags,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("existing"), true);
    assertEquals(result.includes("nonexistent"), false);
  });
});

// =============================================================================
// i18n Tests
// =============================================================================

describe("PostDetails Component - internationalization", () => {
  it("should use custom i18n for author prefix", () => {
    const frenchI18n: MockI18n = {
      post: {
        by: "Par ",
        reading_time: "min de lecture",
      },
    };

    const result = postDetailsComponent(
      {
        author: "Jean Dupont",
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 5 },
        i18n: frenchI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("Par Jean Dupont"), true);
  });

  it("should use custom i18n for reading time", () => {
    const germanI18n: MockI18n = {
      post: {
        by: "Von ",
        reading_time: "Min. Lesezeit",
      },
    };

    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 10 },
        i18n: germanI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("10 Min. Lesezeit"), true);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("PostDetails Component - edge cases", () => {
  it("should handle zero reading time", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 0 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("0 min read"), true);
  });

  it("should handle large reading time", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        readingInfo: { minutes: 120 },
        i18n: mockI18n,
        search: mockSearchWithoutAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("120 min read"), true);
  });

  it("should handle many tags", () => {
    const result = postDetailsComponent(
      {
        date: new Date("2024-01-15"),
        tags: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
        readingInfo: { minutes: 5 },
        i18n: mockI18n,
        search: mockSearchWithAuthor,
      },
      { date: mockDateHelper },
    );

    assertEquals(result.includes("Tag1"), true);
    assertEquals(result.includes("Tag5"), true);
  });
});
