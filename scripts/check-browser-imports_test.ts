import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { analyzeImportSpecifiers } from "./check-browser-imports.ts";

describe("analyzeImportSpecifiers()", () => {
  it("accepts browser-resolvable static and dynamic imports", () => {
    const source = `
      import "./local.js";
      const lazy = () => import("/scripts/runtime.js");
    `;
    const issues = analyzeImportSpecifiers(source, "_site/scripts/test.js");

    assertEquals(issues.length, 0);
  });

  it("rejects network import specifiers", () => {
    const source = `
      import "https://cdn.example.com/mod.js";
      import("http://cdn.example.com/chunk.js");
    `;
    const issues = analyzeImportSpecifiers(source, "_site/scripts/test.js");

    assertEquals(issues.length, 2);
    assertEquals(issues.map((issue) => issue.kind), [
      "network-specifier",
      "network-specifier",
    ]);
  });

  it("rejects forbidden import prefixes", () => {
    const source = `
      import "npm/pkg";
      import("jsr:@scope/pkg");
      import("node:fs");
    `;
    const issues = analyzeImportSpecifiers(source, "_site/scripts/test.js");

    assertEquals(issues.length, 3);
    assertEquals(issues.map((issue) => issue.kind), [
      "forbidden-prefix",
      "forbidden-prefix",
      "forbidden-prefix",
    ]);
  });

  it("rejects bare specifiers and non-literal dynamic imports", () => {
    const source = `
      import "lit";
      const lazy = () => import(getUrl("chunk.js"));
    `;
    const issues = analyzeImportSpecifiers(source, "_site/scripts/test.js");

    assertEquals(issues.length, 2);
    assertEquals(issues[0]?.kind, "bare-specifier");
    assertEquals(issues[1]?.kind, "dynamic-non-literal");
  });

  it("allows a dynamic expression explicitly whitelisted by the caller", () => {
    const source = `const lazy = () => import(getCarbonComponentUrl(path));`;
    const issues = analyzeImportSpecifiers(source, "_site/scripts/carbon.js", {
      allowDynamicExpression: (filePath, expression) =>
        filePath.endsWith("/scripts/carbon.js") &&
        expression.startsWith("getCarbonComponentUrl("),
    });

    assertEquals(issues.length, 0);
  });
});
