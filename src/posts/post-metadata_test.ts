import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { faker, seedTestFaker } from "../../test/faker.ts";

import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";

describe("resolvePostDate()", () => {
  it("returns the same Date when already valid", () => {
    seedTestFaker(801);
    const input = faker.date.past();
    assertEquals(resolvePostDate(input).toISOString(), input.toISOString());
  });

  it("parses ISO strings", () => {
    seedTestFaker(802);
    const date = faker.date.past();
    const iso = date.toISOString().slice(0, 10);
    const parsed = resolvePostDate(iso);
    assertEquals(parsed.toISOString().startsWith(iso), true);
  });

  it("falls back when input is invalid", () => {
    seedTestFaker(803);
    const fallback = faker.date.past();
    assertEquals(
      resolvePostDate("not-a-date", fallback).toISOString(),
      fallback.toISOString(),
    );
  });
});

describe("resolveReadingMinutes()", () => {
  it("rounds up reading minutes", () => {
    seedTestFaker(804);
    const base = faker.number.int({ min: 1, max: 10 });
    const fractional = base + 0.1;
    assertEquals(resolveReadingMinutes({ minutes: fractional }), base + 1);
  });

  it("returns undefined when minutes is missing", () => {
    assertEquals(resolveReadingMinutes({}), undefined);
  });
});
