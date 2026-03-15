import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { FEED_ITEMS } from "./feeds.ts";

describe("_config/feeds.ts", () => {
  it("maps feed content to rendered HTML children", () => {
    assertEquals(FEED_ITEMS.content, "=children");
  });
});
