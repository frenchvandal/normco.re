import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { registerAssets } from "./assets.ts";

describe("_config/assets.ts", () => {
  it("copies the static directory verbatim before registering transformable assets", () => {
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const siteStub = {
      ignore(...args: unknown[]) {
        calls.push({ method: "ignore", args });
        return this;
      },
      copy(...args: unknown[]) {
        calls.push({ method: "copy", args });
        return this;
      },
      add(...args: unknown[]) {
        calls.push({ method: "add", args });
        return this;
      },
    };

    registerAssets(siteStub as unknown as import("lume/core/site.ts").default);

    assertEquals(calls[0], { method: "ignore", args: ["/static"] });
    assertEquals(calls[1], {
      method: "ignore",
      args: ["/blog/client/node_modules"],
    });
    assertEquals(calls[2], { method: "copy", args: ["/static", "."] });
  });

  it("registers the mobile header tab bar entry alongside the shared scripts", () => {
    const adds: string[] = [];
    const siteStub = {
      ignore() {
        return this;
      },
      copy() {
        return this;
      },
      add(arg: unknown) {
        if (typeof arg === "string") {
          adds.push(arg);
        }
        return this;
      },
    };

    registerAssets(siteStub as unknown as import("lume/core/site.ts").default);

    assertEquals(adds.includes("/scripts/header-mobile-tabbar.js"), true);
  });
});
