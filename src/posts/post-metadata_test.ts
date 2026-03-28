import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { faker, seedTestFaker } from "../../test/faker.ts";

import {
  resolvePostCreatedDate,
  resolvePostDate,
  resolvePostGitLastCommit,
  resolvePostUpdatedDate,
  resolveReadingMinutes,
  tryResolvePostCreatedDate,
  tryResolvePostUpdatedDate,
} from "./post-metadata.ts";

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
    assertEquals(parsed.toISOString(), `${iso}T00:00:00.000Z`);
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

describe("post date priority helpers", () => {
  it("prefers git-created over editorial date for post creation", () => {
    assertEquals(
      resolvePostCreatedDate({
        git_created: "2026-03-16T00:33:44+08:00",
        date: "2026-03-10",
      }).toISOString(),
      "2026-03-15T16:33:44.000Z",
    );
  });

  it("falls back to the editorial or Lume date when git-created is absent", () => {
    assertEquals(
      tryResolvePostCreatedDate({ date: "2026-03-10" })?.toISOString(),
      "2026-03-10T00:00:00.000Z",
    );
  });

  it("prefers the last commit date over editorial update_date and date", () => {
    assertEquals(
      resolvePostUpdatedDate({
        git_created: "2026-03-16T00:33:44+08:00",
        date: "2026-03-10",
        update_date: "2026-03-12",
        git: {
          lastCommit: {
            date: "2026-03-27T10:09:39+08:00",
          },
        },
      }).toISOString(),
      "2026-03-27T02:09:39.000Z",
    );
  });

  it("falls back from update_date to the creation date when needed", () => {
    assertEquals(
      tryResolvePostUpdatedDate({ date: "2026-03-10" })?.toISOString(),
      "2026-03-10T00:00:00.000Z",
    );
  });
});

describe("resolvePostGitLastCommit()", () => {
  it("returns the normalized git metadata when present", () => {
    assertEquals(
      resolvePostGitLastCommit({
        sha: "515315d176f8c4bd88ae71d4860b676ab1b2366b",
        shortSha: "515315d",
        date: "2026-03-27T10:09:39+08:00",
        url:
          "https://github.com/frenchvandal/normco.re/commits/master/src/posts/example-post/en.md",
        commitUrl:
          "https://github.com/frenchvandal/normco.re/commit/515315d176f8c4bd88ae71d4860b676ab1b2366b",
      }),
      {
        sha: "515315d176f8c4bd88ae71d4860b676ab1b2366b",
        shortSha: "515315d",
        date: "2026-03-27T10:09:39+08:00",
        url:
          "https://github.com/frenchvandal/normco.re/commits/master/src/posts/example-post/en.md",
        commitUrl:
          "https://github.com/frenchvandal/normco.re/commit/515315d176f8c4bd88ae71d4860b676ab1b2366b",
      },
    );
  });

  it("returns undefined when the commit payload is incomplete", () => {
    assertEquals(
      resolvePostGitLastCommit({ sha: "missing-short-sha" }),
      undefined,
    );
    assertEquals(resolvePostGitLastCommit(null), undefined);
  });
});
