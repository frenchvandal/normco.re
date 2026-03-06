import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import themeTogglePage from "./theme-toggle.page.ts";

describe("theme-toggle.page.ts", () => {
  it("returns a non-empty IIFE script", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, "(function(){");
    assertStringIncludes(js, "})();");
  });

  it("targets the #theme-toggle button by ID", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, '"theme-toggle"');
  });

  it("reads the data-color-scheme attribute", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, '"data-color-scheme"');
  });

  it("persists the user's choice to localStorage", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, "localStorage.setItem");
    assertStringIncludes(js, '"color-scheme"');
  });

  it("sets descriptive aria-labels for both theme states", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, "Switch to light theme");
    assertStringIncludes(js, "Switch to dark theme");
  });

  it("detects the system color scheme preference as fallback", () => {
    const js = themeTogglePage();
    assertStringIncludes(js, "prefers-color-scheme");
  });
});
