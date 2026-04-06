import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { registerAssets } from "./assets.ts";

describe("_config/assets.ts", () => {
  it("routes critical root icons through Lume while copying the remaining static files", () => {
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
    assertEquals(calls[2], {
      method: "copy",
      args: ["/static/contact", "/contact"],
    });
    assertEquals(calls[3], {
      method: "copy",
      args: ["/static/favicon.ico", "/favicon.ico"],
    });
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/static/favicon.svg" &&
        call.args[1] === "/favicon.svg"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/static/android-chrome-192x192.png" &&
        call.args[1] === "/android-chrome-192x192.png"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/critical/about.css"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/critical/home.css"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/critical/post.css"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/critical/syndication.css"
      ),
      true,
    );
    assertEquals(
      calls.some((call) =>
        call.method === "add" &&
        call.args[0] === "/scripts/pretext-browser-probe.js"
      ),
      true,
    );
  });
});
