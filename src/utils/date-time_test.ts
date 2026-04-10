import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  isValidRfc3339DateTime,
  parseDateValue,
  tryParseRfc3339Instant,
} from "./date-time.ts";

describe("parseDateValue()", () => {
  it("parses plain ISO dates through Temporal for stable UTC semantics", () => {
    assertEquals(
      parseDateValue("2026-03-10")?.toISOString(),
      "2026-03-10T00:00:00.000Z",
    );
  });

  it("parses RFC 3339 date-times through Temporal before legacy Date fallback", () => {
    assertEquals(
      parseDateValue("2026-03-10T12:34:56+08:00")?.toISOString(),
      "2026-03-10T04:34:56.000Z",
    );
  });

  it("still accepts legacy date strings through the Date fallback", () => {
    assertEquals(
      parseDateValue("Tue, 10 Mar 2026 12:34:56 GMT")?.toISOString(),
      "2026-03-10T12:34:56.000Z",
    );
  });
});

describe("tryParseRfc3339Instant()", () => {
  it("returns a Temporal instant for valid RFC 3339 strings", () => {
    assertEquals(
      tryParseRfc3339Instant("2026-03-10T12:34:56Z")?.toString(),
      "2026-03-10T12:34:56Z",
    );
  });

  it("rejects non-RFC 3339 date strings", () => {
    assertEquals(
      tryParseRfc3339Instant("Tue, 10 Mar 2026 12:34:56 GMT"),
      undefined,
    );
    assertEquals(
      tryParseRfc3339Instant("2026-03-10T12:34:56"),
      undefined,
    );
  });
});

describe("isValidRfc3339DateTime()", () => {
  it("accepts offset and Zulu RFC 3339 values", () => {
    assertEquals(isValidRfc3339DateTime("2026-03-10T12:34:56Z"), true);
    assertEquals(
      isValidRfc3339DateTime("2026-03-10T12:34:56.123+08:00"),
      true,
    );
  });

  it("rejects values that would require legacy Date parsing rules", () => {
    assertEquals(isValidRfc3339DateTime("2026-03-10T12:34:56"), false);
    assertEquals(
      isValidRfc3339DateTime("Tue, 10 Mar 2026 12:34:56 GMT"),
      false,
    );
  });
});
