import { assertEquals, assertThrows } from "jsr/assert";

import {
  buildCarbonVendorEntryMap,
  getCarbonVendorEntryFileName,
} from "./build-carbon-vendor.ts";

Deno.test("getCarbonVendorEntryFileName() preserves component subdirectories", () => {
  assertEquals(
    getCarbonVendorEntryFileName("ui-shell/header-menu-button.js"),
    "ui-shell/header-menu-button.js",
  );
});

Deno.test("buildCarbonVendorEntryMap() creates a deterministic entry map", () => {
  const entryMap = buildCarbonVendorEntryMap([
    { modulePath: "ui-shell/header.js" },
    { modulePath: "ui-shell/header-menu-button.js" },
  ]);

  assertEquals(entryMap.get("ui-shell/header.js"), "ui-shell/header.js");
  assertEquals(
    entryMap.get("ui-shell/header-menu-button.js"),
    "ui-shell/header-menu-button.js",
  );
});

Deno.test("buildCarbonVendorEntryMap() throws on duplicate entry paths", () => {
  assertThrows(
    () =>
      buildCarbonVendorEntryMap([
        { modulePath: "ui-shell/header.js" },
        { modulePath: "/ui-shell/header.js" },
      ]),
    Error,
    "duplicate entry path",
  );
});
