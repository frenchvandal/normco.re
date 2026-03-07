import { assertEquals, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { lintCommit } from "./lint-commit.ts";

describe("lintCommit()", () => {
  describe("valid messages", () => {
    it("accepts a well-formed feat commit", () => {
      const report = lintCommit("feat(auth): add OAuth2 support");
      assertEquals(report.valid, true);
      assertEquals(report.errors.length, 0);
    });

    it("accepts a commit without a scope", () => {
      const report = lintCommit("fix: correct typo in README");
      assertEquals(report.valid, true);
    });

    it("accepts a breaking change with '!'", () => {
      const report = lintCommit("feat(api)!: remove deprecated endpoints");
      assertEquals(report.valid, true);
    });

    it("ignores comment lines starting with '# '", () => {
      const report = lintCommit(
        "fix: correct typo\n# This is a git comment\n# Another comment",
      );
      assertEquals(report.valid, true);
    });

    it("produces only a warning (not an error) for uppercase subject start", () => {
      const report = lintCommit("fix: Correct typo");
      assertEquals(report.errors.length, 0);
      assertEquals(
        report.warnings.some((w) => w.rule === "subject-case"),
        true,
      );
    });
  });

  describe("rule: header-max-length", () => {
    it("rejects a header exceeding 100 characters", () => {
      const longSubject = "a".repeat(97);
      const report = lintCommit(`feat: ${longSubject}`);
      const rule = report.errors.find((e) => e.rule === "header-max-length");
      assertEquals(rule?.severity, "error");
      assertStringIncludes(rule?.message ?? "", "100");
    });

    it("accepts a header of exactly 100 characters", () => {
      // "feat: " = 6 chars + 94 = 100
      const report = lintCommit(`feat: ${"a".repeat(94)}`);
      assertEquals(
        report.errors.some((e) => e.rule === "header-max-length"),
        false,
      );
    });
  });

  describe("rule: header-trim", () => {
    it("rejects a header with leading whitespace", () => {
      const report = lintCommit(" feat: leading space");
      const rule = report.errors.find((e) => e.rule === "header-trim");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: header-pattern", () => {
    it("rejects a message that does not match the Conventional Commits format", () => {
      const report = lintCommit("this is not conventional");
      const rule = report.errors.find((e) => e.rule === "header-pattern");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: type-enum", () => {
    it("rejects an unknown type", () => {
      const report = lintCommit("wip: work in progress");
      const rule = report.errors.find((e) => e.rule === "type-enum");
      assertEquals(rule?.severity, "error");
      assertStringIncludes(rule?.message ?? "", "wip");
    });

    it("accepts all allowed types", () => {
      const allowedTypes = [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ];
      for (const type of allowedTypes) {
        const report = lintCommit(`${type}: valid subject`);
        assertEquals(
          report.errors.some((e) => e.rule === "type-enum"),
          false,
          `Expected type "${type}" to be allowed`,
        );
      }
    });
  });

  describe("rule: type-case", () => {
    it("rejects an uppercase type", () => {
      const report = lintCommit("FEAT: something");
      const rule = report.errors.find((e) => e.rule === "type-case");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-empty", () => {
    it("rejects an empty subject", () => {
      // Use a body so trimEnd() doesn't strip the trailing spaces from the header.
      const report = lintCommit("feat:  \n\nbody line");
      const rule = report.errors.find((e) => e.rule === "subject-empty");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-full-stop", () => {
    it("rejects a subject ending with '.'", () => {
      const report = lintCommit("fix: correct typo.");
      const rule = report.errors.find((e) => e.rule === "subject-full-stop");
      assertEquals(rule?.severity, "error");
    });

    it("accepts a subject without a trailing period", () => {
      const report = lintCommit("fix: correct typo");
      assertEquals(
        report.errors.some((e) => e.rule === "subject-full-stop"),
        false,
      );
    });
  });

  describe("rule: scope-case", () => {
    it("rejects an uppercase scope", () => {
      const report = lintCommit("fix(API): correct typo");
      const rule = report.errors.find((e) => e.rule === "scope-case");
      assertEquals(rule?.severity, "error");
    });

    it("accepts a lower-case scope", () => {
      const report = lintCommit("fix(api): correct typo");
      assertEquals(
        report.errors.some((e) => e.rule === "scope-case"),
        false,
      );
    });
  });

  describe("rule: body-leading-blank", () => {
    it("warns when body is not separated from header by a blank line", () => {
      const report = lintCommit("fix: typo\nThis body has no blank line");
      const rule = report.warnings.find((w) => w.rule === "body-leading-blank");
      assertEquals(rule?.severity, "warning");
    });

    it("does not warn when a blank line separates header and body", () => {
      const report = lintCommit(
        "fix: typo\n\nThis body is correctly separated",
      );
      assertEquals(
        report.warnings.some((w) => w.rule === "body-leading-blank"),
        false,
      );
    });
  });

  describe("rule: body-max-line-length", () => {
    it("rejects a body line exceeding 100 characters", () => {
      const longLine = "b".repeat(101);
      const report = lintCommit(`fix: typo\n\n${longLine}`);
      const rule = report.errors.find((e) => e.rule === "body-max-line-length");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("report structure", () => {
    it("separates errors from warnings", () => {
      // type-case is an error; subject-case is a warning
      const report = lintCommit("FIX: Something");
      assertEquals(report.errors.some((e) => e.rule === "type-case"), true);
      assertEquals(report.valid, false);
    });

    it("returns valid=false when any error is present", () => {
      const report = lintCommit("bad message");
      assertEquals(report.valid, false);
    });

    it("returns the cleaned input without comment lines", () => {
      const report = lintCommit("feat: add feature\n# git comment");
      assertEquals(report.input.includes("# git comment"), false);
    });
  });
});
