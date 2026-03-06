import { assertEquals, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { ANTI_FLASH_SCRIPT } from "./_anti-flash.ts";

describe("ANTI_FLASH_SCRIPT", () => {
  it("is a non-empty string", () => {
    assertEquals(typeof ANTI_FLASH_SCRIPT, "string");
    assertEquals(ANTI_FLASH_SCRIPT.length > 0, true);
  });

  it("is an IIFE", () => {
    assertStringIncludes(ANTI_FLASH_SCRIPT, "(()=>{");
    assertStringIncludes(ANTI_FLASH_SCRIPT, "})();");
  });

  it("reads color-scheme from localStorage", () => {
    assertStringIncludes(
      ANTI_FLASH_SCRIPT,
      'localStorage.getItem("color-scheme")',
    );
  });

  it('sets data-color-scheme attribute for "light" or "dark"', () => {
    assertStringIncludes(ANTI_FLASH_SCRIPT, 'setAttribute("data-color-scheme"');
    assertStringIncludes(ANTI_FLASH_SCRIPT, '"light"');
    assertStringIncludes(ANTI_FLASH_SCRIPT, '"dark"');
  });

  it("is minified — no newlines", () => {
    assertEquals(ANTI_FLASH_SCRIPT.includes("\n"), false);
  });
});
