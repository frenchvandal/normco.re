import { assertEquals } from "jsr:@std/assert@^1.0.19";
import { describe, it } from "jsr:@std/testing@^1.0.17/bdd";
import { parseBlogAppData } from "./bootstrap-data.ts";

describe("parseBlogAppData()", () => {
  it("returns parsed data for valid JSON", () => {
    const result = parseBlogAppData<{ title: string }>('{"title":"Archive"}');

    assertEquals(result, { title: "Archive" });
  });

  it("returns undefined for invalid JSON", () => {
    const result = parseBlogAppData<{ title: string }>("{");

    assertEquals(result, undefined);
  });
});
