/**
 * Tests for CodeTabs component
 *
 * @module tests/components/code-tabs_test
 */

import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import codeTabs, { type CodeSnippet } from "../../src/_components/CodeTabs.ts";
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

const singleSnippet: CodeSnippet[] = [
  { lang: "typescript", code: "const x: number = 1;" },
];

const multipleSnippets: CodeSnippet[] = [
  { lang: "ts", code: "const x: number = 1;" },
  { lang: "js", code: "const x = 1;" },
];

const snippetsWithLabels: CodeSnippet[] = [
  { lang: "ts", label: "TypeScript Example", code: "const x = 1;" },
  { lang: "js", label: "JavaScript Example", code: "const x = 1;" },
];

// =============================================================================
// Empty/Invalid Input Tests
// =============================================================================

describe("codeTabs - empty/invalid input", () => {
  it("should return empty string for undefined snippets", () => {
    const result = codeTabs({
      snippets: undefined as unknown as CodeSnippet[],
    });
    assertEquals(result, "");
  });

  it("should return empty string for empty snippets array", () => {
    const result = codeTabs({ snippets: [] });
    assertEquals(result, "");
  });
});

// =============================================================================
// Single Snippet Tests
// =============================================================================

describe("codeTabs - single snippet", () => {
  it("should render without tabs for single snippet", () => {
    const result = codeTabs({ snippets: singleSnippet });
    assertEquals(hasElement(result, ".tabs"), false);
  });

  it("should render code-block container", () => {
    const result = codeTabs({ snippets: singleSnippet });
    assertEquals(hasElement(result, ".code-block"), true);
  });

  it("should render pre element", () => {
    const result = codeTabs({ snippets: singleSnippet });
    assertEquals(hasElement(result, "pre"), true);
  });

  it("should render code element with language class", () => {
    const result = codeTabs({ snippets: singleSnippet });
    assertEquals(hasElement(result, "code.language-typescript"), true);
  });

  it("should render code content", () => {
    const result = codeTabs({ snippets: singleSnippet });
    assertStringIncludes(result, "const x: number = 1;");
  });
});

// =============================================================================
// Multiple Snippets Tests
// =============================================================================

describe("codeTabs - multiple snippets", () => {
  it("should render tabs for multiple snippets", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(hasElement(result, ".tabs"), true);
  });

  it("should have code-tabs class", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(hasClass(result, ".tabs", "code-tabs"), true);
  });

  it("should have boxed variant", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(hasClass(result, ".tabs", "tabs--boxed"), true);
  });

  it("should have data-tabs attribute", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(hasElement(result, "[data-tabs]"), true);
  });

  it("should render correct number of tabs", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(countElements(result, '[role="tab"]'), 2);
  });

  it("should render correct number of panels", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(countElements(result, '[role="tabpanel"]'), 2);
  });
});

// =============================================================================
// Language Label Tests
// =============================================================================

describe("codeTabs - language labels", () => {
  it("should use TypeScript label for ts", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertStringIncludes(result, "TypeScript");
  });

  it("should use JavaScript label for js", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertStringIncludes(result, "JavaScript");
  });

  it("should uppercase unknown languages", () => {
    const unknownLang: CodeSnippet[] = [
      { lang: "xyz", code: "code" },
      { lang: "abc", code: "code" },
    ];
    const result = codeTabs({ snippets: unknownLang });
    assertStringIncludes(result, "XYZ");
    assertStringIncludes(result, "ABC");
  });

  it("should use custom label when provided", () => {
    const result = codeTabs({ snippets: snippetsWithLabels });
    assertStringIncludes(result, "TypeScript Example");
    assertStringIncludes(result, "JavaScript Example");
  });

  const languageMappings = [
    { lang: "typescript", expected: "TypeScript" },
    { lang: "javascript", expected: "JavaScript" },
    { lang: "deno", expected: "Deno" },
    { lang: "node", expected: "Node.js" },
    { lang: "bash", expected: "Bash" },
    { lang: "sh", expected: "Shell" },
    { lang: "json", expected: "JSON" },
    { lang: "html", expected: "HTML" },
    { lang: "css", expected: "CSS" },
    { lang: "scss", expected: "SCSS" },
    { lang: "yaml", expected: "YAML" },
    { lang: "md", expected: "Markdown" },
    { lang: "sql", expected: "SQL" },
    { lang: "py", expected: "Python" },
    { lang: "python", expected: "Python" },
    { lang: "go", expected: "Go" },
    { lang: "rust", expected: "Rust" },
    { lang: "java", expected: "Java" },
    { lang: "c", expected: "C" },
    { lang: "cpp", expected: "C++" },
    { lang: "csharp", expected: "C#" },
    { lang: "php", expected: "PHP" },
    { lang: "ruby", expected: "Ruby" },
    { lang: "swift", expected: "Swift" },
    { lang: "kotlin", expected: "Kotlin" },
  ];

  languageMappings.forEach(({ lang, expected }) => {
    it(`should map ${lang} to ${expected}`, () => {
      const snippets: CodeSnippet[] = [
        { lang, code: "code" },
        { lang: "other", code: "code" },
      ];
      const result = codeTabs({ snippets });
      assertStringIncludes(result, expected);
    });
  });
});

// =============================================================================
// HTML Escaping Tests
// =============================================================================

describe("codeTabs - HTML escaping", () => {
  it("should escape ampersand", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: "a && b" }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&amp;&amp;");
  });

  it("should escape less than", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: "if (a < b)" }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&lt;");
  });

  it("should escape greater than", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: "if (a > b)" }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&gt;");
  });

  it("should escape double quotes", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: 'const x = "test"' }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&quot;");
  });

  it("should escape single quotes", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: "const x = 'test'" }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&#039;");
  });

  it("should escape HTML tags in code", () => {
    const snippets: CodeSnippet[] = [{
      lang: "html",
      code: '<div class="test"></div>',
    }];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "&lt;div");
    assertStringIncludes(result, "&gt;");
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe("codeTabs - accessibility", () => {
  it("should have aria-label on tablist", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    assertEquals(
      getAttribute(result, '[role="tablist"]', "aria-label"),
      "Code examples",
    );
  });

  it("should set aria-selected on tabs", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    const allTabs = result.match(/aria-selected="(true|false)"/g) || [];
    assertEquals(allTabs[0], 'aria-selected="true"');
    assertEquals(allTabs[1], 'aria-selected="false"');
  });

  it("should link tabs to panels", () => {
    const result = codeTabs({ snippets: multipleSnippets, id: "test" });
    const firstTab = query(result, '[role="tab"]');
    assertEquals(firstTab?.getAttribute("aria-controls"), "test-panel-0");
  });
});

// =============================================================================
// ID Tests
// =============================================================================

describe("codeTabs - id generation", () => {
  it("should generate unique id when not provided", () => {
    const result = codeTabs({ snippets: multipleSnippets });
    const id = getAttribute(result, ".tabs", "id");
    assertMatch(id || "", /^code-tabs-[a-z0-9]+$/);
  });

  it("should use provided id", () => {
    const result = codeTabs({ snippets: multipleSnippets, id: "my-code" });
    assertEquals(getAttribute(result, ".tabs", "id"), "my-code");
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("codeTabs - edge cases", () => {
  it("should handle empty code string", () => {
    const snippets: CodeSnippet[] = [{ lang: "js", code: "" }];
    const result = codeTabs({ snippets });
    assertEquals(hasElement(result, "code"), true);
  });

  it("should handle multiline code", () => {
    const snippets: CodeSnippet[] = [
      {
        lang: "js",
        code: `function test() {
  return true;
}`,
      },
    ];
    const result = codeTabs({ snippets });
    assertStringIncludes(result, "function test()");
    assertStringIncludes(result, "return true;");
  });

  it("should handle many snippets", () => {
    const manySnippets: CodeSnippet[] = Array.from({ length: 5 }, (_, i) => ({
      lang: `lang${i}`,
      code: `code ${i}`,
    }));
    const result = codeTabs({ snippets: manySnippets });
    assertEquals(countElements(result, '[role="tab"]'), 5);
  });
});
