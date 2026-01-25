/**
 * Tests for SourceInfo component
 *
 * @module tests/components/source-info_test
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import sourceInfo from "../../src/_components/SourceInfo.ts";
import {
  countElements,
  getAttribute,
  hasClass,
  hasElement,
} from "../helpers/dom.ts";

// =============================================================================
// Test fixtures
// =============================================================================

const defaultI18n = {
  source: {
    view_source: "View source",
    revision: "rev",
  },
};

const frenchI18n = {
  source: {
    view_source: "Voir la source",
    revision: "rév",
  },
};

const basicProps = {
  sourceCommit: "abc123def456789012345678901234567890abcd",
  sourcePath: "src/posts/my-post.md",
  repo: {
    baseUrl: "https://github.com",
    owner: "user",
    name: "repo",
    branch: "master",
  },
  i18n: defaultI18n,
};

// =============================================================================
// Empty/Invalid Input Tests
// =============================================================================

describe("sourceInfo - empty/invalid input", () => {
  it("should render fallback when sourceCommit is missing", () => {
    const result = sourceInfo({
      sourcePath: "test.md",
      repo: basicProps.repo,
      i18n: defaultI18n,
    });
    assertStringIncludes(result, "View source");
    assertEquals(/rev [a-f0-9]{8}/i.test(result), true);
    assertEquals(countElements(result, "a"), 0);
  });

  it("should return empty string when sourcePath is missing", () => {
    const result = sourceInfo({
      sourceCommit: "abc123",
      repo: basicProps.repo,
      i18n: defaultI18n,
    });
    assertEquals(result, "");
  });

  it("should return empty string when both are missing", () => {
    const result = sourceInfo({
      repo: basicProps.repo,
      i18n: defaultI18n,
    });
    assertEquals(result, "");
  });

  it("should render fallback when sourceCommit is undefined", () => {
    const result = sourceInfo({
      sourceCommit: undefined,
      sourcePath: "test.md",
      repo: basicProps.repo,
      i18n: defaultI18n,
    });
    assertStringIncludes(result, "View source");
    assertEquals(/rev [a-f0-9]{8}/i.test(result), true);
    assertEquals(countElements(result, "a"), 0);
  });

  it("should return empty string when sourcePath is undefined", () => {
    const result = sourceInfo({
      sourceCommit: "abc123",
      sourcePath: undefined,
      repo: basicProps.repo,
      i18n: defaultI18n,
    });
    assertEquals(result, "");
  });
});

// =============================================================================
// Basic Structure Tests
// =============================================================================

describe("sourceInfo - basic structure", () => {
  it("should render aside element", () => {
    const result = sourceInfo(basicProps);
    assertEquals(hasElement(result, "aside"), true);
  });

  it("should have source-info class", () => {
    const result = sourceInfo(basicProps);
    assertEquals(hasClass(result, "aside", "source-info"), true);
  });

  it("should have aria-label for accessibility", () => {
    const result = sourceInfo(basicProps);
    assertEquals(
      getAttribute(result, "aside", "aria-label"),
      "Source information",
    );
  });

  it("should render two links", () => {
    const result = sourceInfo(basicProps);
    assertEquals(countElements(result, "a"), 2);
  });

  it("should render separator", () => {
    const result = sourceInfo(basicProps);
    assertEquals(hasElement(result, ".source-info__separator"), true);
  });
});

// =============================================================================
// Source Link Tests
// =============================================================================

describe("sourceInfo - source link", () => {
  it("should render source link with correct href", () => {
    const result = sourceInfo(basicProps);
    const expectedUrl =
      "https://github.com/user/repo/blob/master/src/posts/my-post.md";
    assertStringIncludes(result, `href="${expectedUrl}"`);
  });

  it("should render source link text from i18n", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "View source");
  });

  it("should open source link in new tab", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, 'target="_blank"');
  });

  it("should have noopener noreferrer for security", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, 'rel="noopener noreferrer"');
  });
});

// =============================================================================
// Commit Link Tests
// =============================================================================

describe("sourceInfo - commit link", () => {
  it("should render commit link with correct href", () => {
    const result = sourceInfo(basicProps);
    const expectedUrl =
      `https://github.com/user/repo/commit/${basicProps.sourceCommit}`;
    assertStringIncludes(result, `href="${expectedUrl}"`);
  });

  it("should show short SHA (8 characters)", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "abc123de");
  });

  it("should render revision label from i18n", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "rev abc123de");
  });

  it("should open commit link in new tab", () => {
    const result = sourceInfo(basicProps);
    // Both links should have target="_blank"
    const targetCount = (result.match(/target="_blank"/g) || []).length;
    assertEquals(targetCount, 2);
  });
});

// =============================================================================
// Internationalization Tests
// =============================================================================

describe("sourceInfo - internationalization", () => {
  it("should use French i18n labels", () => {
    const result = sourceInfo({ ...basicProps, i18n: frenchI18n });
    assertStringIncludes(result, "Voir la source");
    assertStringIncludes(result, "rév");
  });

  it("should render custom view_source text", () => {
    const customI18n = {
      source: {
        view_source: "Open in GitHub",
        revision: "commit",
      },
    };
    const result = sourceInfo({ ...basicProps, i18n: customI18n });
    assertStringIncludes(result, "Open in GitHub");
  });

  it("should render custom revision label", () => {
    const customI18n = {
      source: {
        view_source: "View",
        revision: "SHA:",
      },
    };
    const result = sourceInfo({ ...basicProps, i18n: customI18n });
    assertStringIncludes(result, "SHA:");
  });
});

// =============================================================================
// URL Construction Tests
// =============================================================================

describe("sourceInfo - URL construction", () => {
  it("should handle GitHub URLs", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "github.com");
  });

  it("should handle GitLab URLs", () => {
    const gitlabProps = {
      ...basicProps,
      repo: {
        baseUrl: "https://gitlab.com",
        owner: "user",
        name: "repo",
        branch: "master",
      },
    };
    const result = sourceInfo(gitlabProps);
    assertStringIncludes(result, "gitlab.com/user/repo/blob/master");
  });

  it("should handle different source paths", () => {
    const nestedPath = {
      ...basicProps,
      sourcePath: "src/deep/nested/path/file.ts",
    };
    const result = sourceInfo(nestedPath);
    assertStringIncludes(result, "blob/master/src/deep/nested/path/file.ts");
  });

  it("should handle URLs without trailing slash", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "repo/blob/master");
  });

  it("should handle different file extensions", () => {
    const tsPath = { ...basicProps, sourcePath: "src/component.ts" };
    const result = sourceInfo(tsPath);
    assertStringIncludes(result, "component.ts");
  });
});

// =============================================================================
// Short SHA Tests
// =============================================================================

describe("sourceInfo - short SHA", () => {
  it("should truncate long SHA to 8 characters", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "abc123de");
    // Should not include the full SHA in the visible text
    const shortSha = basicProps.sourceCommit.substring(0, 8);
    assertStringIncludes(result, shortSha);
  });

  it("should handle short SHA (less than 8 chars)", () => {
    const shortShaProps = {
      ...basicProps,
      sourceCommit: "abc12",
    };
    const result = sourceInfo(shortShaProps);
    assertStringIncludes(result, "abc12");
  });

  it("should handle exactly 8 character SHA", () => {
    const exactShaProps = {
      ...basicProps,
      sourceCommit: "abc123de",
    };
    const result = sourceInfo(exactShaProps);
    assertStringIncludes(result, "abc123de");
  });
});

// =============================================================================
// Separator Tests
// =============================================================================

describe("sourceInfo - separator", () => {
  it("should render middot separator", () => {
    const result = sourceInfo(basicProps);
    assertStringIncludes(result, "&middot;");
  });

  it("should hide separator from screen readers", () => {
    const result = sourceInfo(basicProps);
    assertEquals(
      getAttribute(result, ".source-info__separator", "aria-hidden"),
      "true",
    );
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("sourceInfo - edge cases", () => {
  it("should handle special characters in path", () => {
    const specialPath = {
      ...basicProps,
      sourcePath: "src/posts/hello-world (copy).md",
    };
    const result = sourceInfo(specialPath);
    assertStringIncludes(result, "hello-world (copy).md");
  });

  it("should handle root-level files", () => {
    const rootFile = {
      ...basicProps,
      sourcePath: "README.md",
    };
    const result = sourceInfo(rootFile);
    assertStringIncludes(result, "blob/master/README.md");
  });

  it("should handle enterprise GitHub URLs", () => {
    const enterpriseProps = {
      ...basicProps,
      repo: {
        baseUrl: "https://github.enterprise.com",
        owner: "org",
        name: "repo",
        branch: "master",
      },
    };
    const result = sourceInfo(enterpriseProps);
    assertStringIncludes(result, "github.enterprise.com");
  });
});
