import { assertEquals, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker, seedTestFaker } from "../test/faker.ts";

import { lintCommit } from "./lint-commit.ts";

describe("lintCommit()", () => {
  describe("valid messages", () => {
    it("accepts a well-formed feat commit", () => {
      seedTestFaker(1001);
      const scope = faker.lorem.word();
      const subject = faker.lorem.words(3);
      const report = lintCommit(`feat(${scope}): ${subject}`);
      assertEquals(report.valid, true);
      assertEquals(report.errors.length, 0);
    });

    it("accepts a commit without a scope", () => {
      seedTestFaker(1002);
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}`);
      assertEquals(report.valid, true);
    });

    it("accepts a breaking change with '!'", () => {
      seedTestFaker(1003);
      const scope = faker.lorem.word();
      const subject = faker.lorem.words(3);
      const report = lintCommit(`feat(${scope})!: ${subject}`);
      assertEquals(report.valid, true);
    });

    it("ignores comment lines starting with '# '", () => {
      seedTestFaker(1004);
      const subject = faker.lorem.words(3);
      const comment = faker.lorem.sentence();
      const report = lintCommit(
        `fix: ${subject}\n# ${comment}\n# Another comment`,
      );
      assertEquals(report.valid, true);
    });

    it("produces only a warning (not an error) for uppercase subject start", () => {
      seedTestFaker(1005);
      const subject = faker.lorem.words(3);
      const capitalized = subject.charAt(0).toUpperCase() + subject.slice(1);
      const report = lintCommit(`fix: ${capitalized}`);
      assertEquals(report.errors.length, 0);
      assertEquals(
        report.warnings.some((w) => w.rule === "subject-case"),
        true,
      );
    });
  });

  describe("rule: header-max-length", () => {
    it("rejects a header exceeding 100 characters", () => {
      seedTestFaker(1006);
      const longSubject = faker.string.alpha(97);
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
      seedTestFaker(1007);
      const subject = faker.lorem.words(2);
      const report = lintCommit(` feat: ${subject}`);
      const rule = report.errors.find((e) => e.rule === "header-trim");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: header-pattern", () => {
    it("rejects a message that does not match the Conventional Commits format", () => {
      seedTestFaker(1008);
      const words = faker.lorem.words(4);
      const report = lintCommit(words);
      const rule = report.errors.find((e) => e.rule === "header-pattern");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: type-enum", () => {
    it("rejects an unknown type", () => {
      seedTestFaker(1009);
      const subject = faker.lorem.words(3);
      const report = lintCommit(`wip: ${subject}`);
      const rule = report.errors.find((e) => e.rule === "type-enum");
      assertEquals(rule?.severity, "error");
      assertStringIncludes(rule?.message ?? "", "wip");
    });

    it("accepts all allowed types", () => {
      seedTestFaker(1010);
      const subject = faker.lorem.words(2);
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
        const report = lintCommit(`${type}: ${subject}`);
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
      seedTestFaker(1011);
      const subject = faker.lorem.words(2);
      const report = lintCommit(`FEAT: ${subject}`);
      const rule = report.errors.find((e) => e.rule === "type-case");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-empty", () => {
    it("rejects an empty subject", () => {
      // Use a body so trimEnd() doesn't strip the trailing spaces from the header.
      seedTestFaker(1012);
      const body = faker.lorem.sentence();
      const report = lintCommit(`feat:  \n\n${body}`);
      const rule = report.errors.find((e) => e.rule === "subject-empty");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-full-stop", () => {
    it("rejects a subject ending with '.'", () => {
      seedTestFaker(1013);
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}.`);
      const rule = report.errors.find((e) => e.rule === "subject-full-stop");
      assertEquals(rule?.severity, "error");
    });

    it("accepts a subject without a trailing period", () => {
      seedTestFaker(1014);
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}`);
      assertEquals(
        report.errors.some((e) => e.rule === "subject-full-stop"),
        false,
      );
    });
  });

  describe("rule: scope-case", () => {
    it("rejects an uppercase scope", () => {
      seedTestFaker(1015);
      const scope = faker.lorem.word().toUpperCase();
      const subject = faker.lorem.words(2);
      const report = lintCommit(`fix(${scope}): ${subject}`);
      const rule = report.errors.find((e) => e.rule === "scope-case");
      assertEquals(rule?.severity, "error");
    });

    it("accepts a lower-case scope", () => {
      seedTestFaker(1016);
      const scope = faker.lorem.word().toLowerCase();
      const subject = faker.lorem.words(2);
      const report = lintCommit(`fix(${scope}): ${subject}`);
      assertEquals(
        report.errors.some((e) => e.rule === "scope-case"),
        false,
      );
    });
  });

  describe("rule: body-leading-blank", () => {
    it("warns when body is not separated from header by a blank line", () => {
      seedTestFaker(1017);
      const subject = faker.lorem.words(2);
      const body = faker.lorem.sentence();
      const report = lintCommit(`fix: ${subject}\n${body}`);
      const rule = report.warnings.find((w) => w.rule === "body-leading-blank");
      assertEquals(rule?.severity, "warning");
    });

    it("does not warn when a blank line separates header and body", () => {
      seedTestFaker(1018);
      const subject = faker.lorem.words(2);
      const body = faker.lorem.sentence();
      const report = lintCommit(`fix: ${subject}\n\n${body}`);
      assertEquals(
        report.warnings.some((w) => w.rule === "body-leading-blank"),
        false,
      );
    });
  });

  describe("rule: body-max-line-length", () => {
    it("rejects a body line exceeding 100 characters", () => {
      seedTestFaker(1019);
      const subject = faker.lorem.words(2);
      const longLine = faker.string.alpha(101);
      const report = lintCommit(`fix: ${subject}\n\n${longLine}`);
      const rule = report.errors.find((e) => e.rule === "body-max-line-length");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("report structure", () => {
    it("separates errors from warnings", () => {
      seedTestFaker(1020);
      const subject = faker.lorem.words(2);
      const capitalized = subject.charAt(0).toUpperCase() + subject.slice(1);
      // type-case is an error; subject-case is a warning
      const report = lintCommit(`FIX: ${capitalized}`);
      assertEquals(report.errors.some((e) => e.rule === "type-case"), true);
      assertEquals(report.valid, false);
    });

    it("returns valid=false when any error is present", () => {
      seedTestFaker(1021);
      const words = faker.lorem.words(4);
      const report = lintCommit(words);
      assertEquals(report.valid, false);
    });

    it("returns the cleaned input without comment lines", () => {
      seedTestFaker(1022);
      const subject = faker.lorem.words(3);
      const comment = faker.lorem.words(2);
      const report = lintCommit(`feat: ${subject}\n# ${comment}`);
      assertEquals(report.input.includes(`# ${comment}`), false);
    });
  });
});
