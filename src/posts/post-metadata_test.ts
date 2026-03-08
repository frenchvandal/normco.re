import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";

describe("resolvePostDate()", () => {
  it("returns the same Date when already valid", () => {
    const input = new Date("2026-03-08T00:00:00.000Z");
    assertEquals(resolvePostDate(input).toISOString(), input.toISOString());
  });

  it("parses ISO strings", () => {
    const parsed = resolvePostDate("2026-03-08");
    assertEquals(parsed.toISOString().startsWith("2026-03-08"), true);
  });

  it("falls back when input is invalid", () => {
    const fallback = new Date("2024-01-01T00:00:00.000Z");
    assertEquals(
      resolvePostDate("not-a-date", fallback).toISOString(),
      fallback.toISOString(),
    );
  });
});

describe("resolveReadingMinutes()", () => {
  it("rounds up reading minutes", () => {
    assertEquals(resolveReadingMinutes({ minutes: 2.1 }), 3);
  });

  it("returns undefined when minutes is missing", () => {
    assertEquals(resolveReadingMinutes({}), undefined);
  });
});
