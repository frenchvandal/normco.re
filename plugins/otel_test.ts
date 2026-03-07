import { describe, it } from "jsr/testing-bdd";
import { assertEquals } from "jsr/assert";

import type Site from "lume/core/site.ts";

import otelPlugin from "./otel.ts";

type OTelEvent = { files?: Set<string> };

function withStubSite() {
  const events: Map<string, (event?: OTelEvent) => void> = new Map();
  const stubSite = {
    addEventListener(type: string, fn: (event?: OTelEvent) => void): void {
      events.set(type, fn);
    },
  } as unknown as Site;

  return { events, stubSite };
}

describe("otelPlugin()", () => {
  it("returns a site plugin function", () => {
    const plugin = otelPlugin();
    assertEquals(typeof plugin, "function");
  });

  it("plugin function accepts one argument (site)", () => {
    const plugin = otelPlugin();
    assertEquals(plugin.length, 1);
  });

  it("registers lifecycle listeners and runs without throwing", () => {
    const { events, stubSite } = withStubSite();
    const plugin = otelPlugin();
    plugin(stubSite);

    assertEquals(events.has("beforeBuild"), true);
    assertEquals(events.has("afterBuild"), true);
    assertEquals(events.has("beforeUpdate"), true);
    assertEquals(events.has("afterUpdate"), true);

    events.get("beforeBuild")?.();
    events.get("afterBuild")?.();
    events.get("beforeUpdate")?.({ files: new Set(["/index.page.ts"]) });
    events.get("afterUpdate")?.();
  });
});
