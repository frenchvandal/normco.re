import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { faker, seedTestFaker } from "../test/faker.ts";

import { formatLintCommitReport, lintCommit } from "./lint-commit.ts";

describe("lintCommit()", () => {
  let seed = 1000;

  beforeEach(() => {
    seed += 1;
    seedTestFaker(seed);
  });

  it("accepts a well-formed feat commit", () => {
    const scope = faker.lorem.word();
    const subject = faker.lorem.words(3);
    const report = lintCommit(`feat(${scope}): ${subject}`);

    assertEquals(report.valid, true);
    assertEquals(report.errors.length, 0);
  });

  it("accepts a breaking change marker in the header", () => {
    const scope = faker.lorem.word();
    const subject = faker.lorem.words(3);
    const report = lintCommit(`feat(${scope})!: ${subject}`);

    assertEquals(report.valid, true);
  });

  it("ignores git comment lines from COMMIT_EDITMSG files", () => {
    const subject = faker.lorem.words(3);
    const comment = faker.lorem.sentence();
    const report = lintCommit(
      `fix: ${subject}\n# ${comment}\n# branch.onto-main`,
    );

    assertEquals(report.valid, true);
    assertEquals(report.input.includes(comment), false);
  });

  it("rejects unknown commit types", () => {
    const subject = faker.lorem.words(3);
    const report = lintCommit(`wip: ${subject}`);
    const rule = report.errors.find((error) => error.rule === "type-enum");

    assertEquals(rule?.severity, "error");
    assertStringIncludes(rule?.message ?? "", '"wip"');
  });

  it("rejects upper-case types", () => {
    const subject = faker.lorem.words(2);
    const report = lintCommit(`FEAT: ${subject}`);
    const rule = report.errors.find((error) => error.rule === "type-case");

    assertEquals(rule?.severity, "error");
  });

  it("treats an upper-case subject start as an error", () => {
    const subject = faker.lorem.words(3);
    const capitalized = subject.charAt(0).toUpperCase() + subject.slice(1);
    const report = lintCommit(`fix: ${capitalized}`);
    const rule = report.errors.find((error) => error.rule === "subject-case");

    assertEquals(rule?.severity, "error");
    assertEquals(report.valid, false);
  });

  it("does not enforce scope case", () => {
    const scope = faker.lorem.word().toUpperCase();
    const subject = faker.lorem.words(2);
    const report = lintCommit(`fix(${scope}): ${subject}`);

    assertEquals(report.valid, true);
    assertEquals(
      report.errors.some((error) => error.rule === "scope-case"),
      false,
    );
  });

  it("warns when the body is not separated from the header by a blank line", () => {
    const subject = faker.lorem.words(2);
    const body = faker.lorem.sentence();
    const report = lintCommit(`fix: ${subject}\n${body}`);
    const rule = report.warnings.find((warning) =>
      warning.rule === "body-leading-blank"
    );

    assertEquals(rule?.severity, "warning");
    assertEquals(report.valid, true);
  });

  it("warns when the footer is not separated by a blank line", () => {
    const subject = faker.lorem.words(2);
    const report = lintCommit(`fix: ${subject}\nRefs: #123`);
    const rule = report.warnings.find((warning) =>
      warning.rule === "footer-leading-blank"
    );

    assertEquals(rule?.severity, "warning");
    assertEquals(report.valid, true);
  });

  it("rejects a body line exceeding 100 characters", () => {
    const subject = faker.lorem.words(2);
    const longLine = faker.string.alpha(101);
    const report = lintCommit(`fix: ${subject}\n\n${longLine}`);
    const rule = report.errors.find((error) =>
      error.rule === "body-max-line-length"
    );

    assertEquals(rule?.severity, "error");
  });

  it("rejects a footer line exceeding 100 characters", () => {
    const subject = faker.lorem.words(2);
    const longFooter = faker.string.alpha(95);
    const report = lintCommit(
      `fix: ${subject}\n\nRefs: ${longFooter}`,
    );
    const rule = report.errors.find((error) =>
      error.rule === "footer-max-line-length"
    );

    assertEquals(rule?.severity, "error");
  });
});

describe("formatLintCommitReport()", () => {
  it("strips ANSI escape sequences when color output is disabled", () => {
    const output = formatLintCommitReport(
      lintCommit("feat: add search"),
      { color: false },
    );

    assertStringIncludes(output, "commit message is valid");
    assertEquals(stripAnsiCode(output), output);
  });

  it("preserves ANSI escape sequences when color output is enabled", () => {
    const output = formatLintCommitReport(
      lintCommit("feat: add search"),
      { color: true },
    );

    assert(stripAnsiCode(output) !== output);
  });
});
