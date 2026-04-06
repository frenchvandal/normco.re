import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { assertHtmlValidationReport } from "./assert-html-validation.ts";

describe("assertHtmlValidationReport()", () => {
  it("accepts a clean report", () => {
    assertEquals(
      assertHtmlValidationReport({
        valid: true,
        results: [
          {
            filePath: "/",
            errorCount: 0,
            warningCount: 0,
            messages: [],
          },
        ],
      }),
      undefined,
    );
  });

  it("fails when the report contains errors", () => {
    assertThrows(
      () =>
        assertHtmlValidationReport({
          valid: false,
          results: [
            {
              filePath: "/posts/example/",
              errorCount: 2,
              warningCount: 0,
              messages: [{ severity: 2 }],
            },
          ],
        }),
      Error,
      "HTML validation failed with 2 error(s) and 0 warning(s). First issue: /posts/example/",
    );
  });

  it("fails when the report contains warnings even without errors", () => {
    assertThrows(
      () =>
        assertHtmlValidationReport({
          valid: true,
          results: [
            {
              filePath: "/gallery/",
              errorCount: 0,
              warningCount: 1,
              messages: [{ severity: 1 }],
            },
          ],
        }),
      Error,
      "HTML validation failed with 0 error(s) and 1 warning(s). First issue: /gallery/",
    );
  });
});
