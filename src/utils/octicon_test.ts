import { assertEquals, assertMatch } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  getOcticonData,
  hasOcticon,
  listOcticonNames,
  OCTICON_NAMES,
  OCTICON_SIZES,
} from "./octicon.ts";

describe("octicon utility", () => {
  it("exposes a complete Octicons catalog", () => {
    assertEquals(OCTICON_NAMES.length >= 300, true);
    assertEquals(hasOcticon("sun"), true);
    assertEquals(hasOcticon("moon"), true);
    assertEquals(hasOcticon("rss"), true);
    assertEquals(hasOcticon("mark-github"), true);
  });

  it("returns valid SVG data for all supported icon names", () => {
    for (const iconName of OCTICON_NAMES) {
      const icon = getOcticonData(iconName);
      assertEquals(icon.availableSizes.length > 0, true);
      assertMatch(icon.viewBox, /^\d+ \d+ \d+ \d+$/);
      assertMatch(icon.path, /[A-Za-z]/);
      assertEquals(icon.paths.length > 0, true);
    }
  });

  it("supports explicit size selection when available", () => {
    const icon = getOcticonData("x", 24);
    assertEquals(icon.size, 24);
    assertEquals(OCTICON_SIZES.includes(icon.size), true);
    assertEquals(listOcticonNames().length, OCTICON_NAMES.length);
  });
});
