import { assertEquals, assertStringIncludes } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { faker, seedTestFaker } from "../test/faker.ts";

import { lintCommit } from "./lint-commit.ts";

describe("lintCommit()", () => {
  let seed = 1000;

  beforeEach(() => {
    seed += 1;
    seedTestFaker(seed);
  });

  describe("valid messages", () => {
    it("accepts a well-formed feat commit", () => {
      const scope = faker.lorem.word();
      const subject = faker.lorem.words(3);
      const report = lintCommit(`feat(${scope}): ${subject}`);
      assertEquals(report.valid, true);
      assertEquals(report.errors.length, 0);
    });

    it("accepts a commit without a scope", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}`);
      assertEquals(report.valid, true);
    });

    it("accepts a breaking change with '!'", () => {
      const scope = faker.lorem.word();
      const subject = faker.lorem.words(3);
      const report = lintCommit(`feat(${scope})!: ${subject}`);
      assertEquals(report.valid, true);
    });

    it("ignores comment lines starting with '# '", () => {
      const subject = faker.lorem.words(3);
      const comment = faker.lorem.sentence();
      const report = lintCommit(
        `fix: ${subject}\n# ${comment}\n# Another comment`,
      );
      assertEquals(report.valid, true);
    });

    it("produces only a warning (not an error) for uppercase subject start", () => {
      const subject = faker.lorem.words(3);
      const capitalized = subject.charAt(0).toUpperCase() + subject.slice(1);
      const report = lintCommit(`fix: ${capitalized}`);
      assertEquals(report.errors.length, 0);
      assertEquals(
        report.warnings.some((warning) => warning.rule === "subject-case"),
        true,
      );
    });
  });

  describe("rule: header-max-length", () => {
    it("rejects a header exceeding 100 characters", () => {
      const longSubject = faker.string.alpha(97);
      const report = lintCommit(`feat: ${longSubject}`);
      const rule = report.errors.find((error) =>
        error.rule === "header-max-length"
      );
      assertEquals(rule?.severity, "error");
      assertStringIncludes(rule?.message ?? "", "100");
    });

    it("accepts a header of exactly 100 characters", () => {
      const report = lintCommit(`feat: ${"a".repeat(94)}`);
      assertEquals(
        report.errors.some((error) => error.rule === "header-max-length"),
        false,
      );
    });
  });

  describe("rule: header-trim", () => {
    it("rejects a header with leading whitespace", () => {
      const subject = faker.lorem.words(2);
      const report = lintCommit(` feat: ${subject}`);
      const rule = report.errors.find((error) => error.rule === "header-trim");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: header-pattern", () => {
    it("rejects a message that does not match the Conventional Commits format", () => {
      const words = faker.lorem.words(4);
      const report = lintCommit(words);
      const rule = report.errors.find((error) =>
        error.rule === "header-pattern"
      );
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: type-enum", () => {
    it("rejects an unknown type", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`wip: ${subject}`);
      const rule = report.errors.find((error) => error.rule === "type-enum");
      assertEquals(rule?.severity, "error");
      assertStringIncludes(rule?.message ?? "", "wip");
    });

    it("suggests the closest allowed type when the typo is plausible", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`feature: ${subject}`);
      const rule = report.errors.find((error) => error.rule === "type-enum");
      assertStringIncludes(rule?.message ?? "", 'Did you mean "feat"?');
    });

    it("does not invent a suggestion when the type is unrelated", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`wip: ${subject}`);
      const rule = report.errors.find((error) => error.rule === "type-enum");
      assertEquals(rule?.message.includes("Did you mean"), false);
    });

    it("accepts all allowed types", () => {
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
          report.errors.some((error) => error.rule === "type-enum"),
          false,
          `Expected type "${type}" to be allowed`,
        );
      }
    });
  });

  describe("rule: type-case", () => {
    it("rejects an uppercase type", () => {
      const subject = faker.lorem.words(2);
      const report = lintCommit(`FEAT: ${subject}`);
      const rule = report.errors.find((error) => error.rule === "type-case");
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-empty", () => {
    it("rejects an empty subject", () => {
      const body = faker.lorem.sentence();
      const report = lintCommit(`feat:  \n\n${body}`);
      const rule = report.errors.find((error) =>
        error.rule === "subject-empty"
      );
      assertEquals(rule?.severity, "error");
    });
  });

  describe("rule: subject-full-stop", () => {
    it("rejects a subject ending with '.'", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}.`);
      const rule = report.errors.find((error) =>
        error.rule === "subject-full-stop"
      );
      assertEquals(rule?.severity, "error");
    });

    it("accepts a subject without a trailing period", () => {
      const subject = faker.lorem.words(3);
      const report = lintCommit(`fix: ${subject}`);
      assertEquals(
        report.errors.some((error) => error.rule === "subject-full-stop"),
        false,
      );
    });
  });

  describe("rule: scope-case", () => {
    it("rejects an uppercase scope", () => {
      const scope = faker.lorem.word().toUpperCase();
      const subject = faker.lorem.words(2);
      const report = lintCommit(`fix(${scope}): ${subject}`);
      const rule = report.errors.find((error) => error.rule === "scope-case");
      assertEquals(rule?.severity, "error");
    });

    it("accepts a lower-case scope", () => {
      const scope = faker.lorem.word().toLowerCase();
      const subject = faker.lorem.words(2);
      const report = lintCommit(`fix(${scope}): ${subject}`);
      assertEquals(
        report.errors.some((error) => error.rule === "scope-case"),
        false,
      );
    });
  });

  describe("rule: body-leading-blank", () => {
    it("warns when body is not separated from header by a blank line", () => {
      const subject = faker.lorem.words(2);
      const body = faker.lorem.sentence();
      const report = lintCommit(`fix: ${subject}\n${body}`);
      const rule = report.warnings.find((warning) =>
        warning.rule === "body-leading-blank"
      );
      assertEquals(rule?.severity, "warning");
    });

    it("does not warn when a blank line separates header and body", () => {
      const subject = faker.lorem.words(2);
      const body = faker.lorem.sentence();
      const report = lintCommit(`fix: ${subject}\n\n${body}`);
      assertEquals(
        report.warnings.some((warning) =>
          warning.rule === "body-leading-blank"
        ),
        false,
      );
    });
  });

  describe("rule: body-max-line-length", () => {
    it("rejects a body line exceeding 100 characters", () => {
      const subject = faker.lorem.words(2);
      const longLine = faker.string.alpha(101);
      const report = lintCommit(`fix: ${subject}\n\n${longLine}`);
      const rule = report.errors.find((error) =>
        error.rule === "body-max-line-length"
      );
      assertEquals(rule?.severity, "error");
    });
  });

  describe("report structure", () => {
    it("separates errors from warnings", () => {
      const subject = faker.lorem.words(2);
      const capitalized = subject.charAt(0).toUpperCase() + subject.slice(1);
      const report = lintCommit(`FIX: ${capitalized}`);
      assertEquals(
        report.errors.some((error) => error.rule === "type-case"),
        true,
      );
      assertEquals(report.valid, false);
    });

    it("returns valid=false when any error is present", () => {
      const words = faker.lorem.words(4);
      const report = lintCommit(words);
      assertEquals(report.valid, false);
    });

    it("returns the cleaned input without comment lines", () => {
      const subject = faker.lorem.words(3);
      const comment = faker.lorem.words(2);
      const report = lintCommit(`feat: ${subject}\n# ${comment}`);
      assertEquals(report.input.includes(`# ${comment}`), false);
    });
  });
});
