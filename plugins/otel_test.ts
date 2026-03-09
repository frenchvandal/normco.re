import { describe, it } from "jsr/testing-bdd";
import { assertEquals } from "jsr/assert";

import otelPlugin, { type OTelPluginSite } from "./otel.ts";

type OTelEvent = { files?: Set<string> };
type OTelDebugBarItem = { title: string; description?: string };
type OTelDebugBarCollection = { icon?: string; items?: OTelDebugBarItem[] };

function withStubSite() {
  const events: Map<string, (event?: OTelEvent) => void> = new Map();
  const collection: OTelDebugBarCollection = {};

  const stubSite: OTelPluginSite = {
    addEventListener(type: string, fn: (event?: OTelEvent) => void): void {
      events.set(type, fn);
    },
    debugBar: {
      collection(_name: string): OTelDebugBarCollection {
        return collection;
      },
    },
  };

  return { collection, events, stubSite };
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
    assertEquals(events.has("beforeSave"), true);

    events.get("beforeBuild")?.();
    events.get("afterBuild")?.();
    events.get("beforeUpdate")?.({ files: new Set(["/index.page.ts"]) });
    events.get("afterUpdate")?.();
    events.get("beforeSave")?.();
  });

  it("renders an OTEL disabled state in the debug bar", () => {
    const { collection, events, stubSite } = withStubSite();
    const plugin = otelPlugin();
    plugin(stubSite);

    events.get("beforeSave")?.();

    assertEquals(collection.icon, "activity");
    assertEquals(collection.items?.[0]?.title, "OpenTelemetry disabled");
  });

  it("adds lifecycle records to the debug bar collection", () => {
    const { collection, events, stubSite } = withStubSite();
    const plugin = otelPlugin((name) => {
      if (name === "OTEL_DENO") return "true";
      if (name === "OTEL_EXPORTER_OTLP_PROTOCOL") return "http/json";
      if (name === "OTEL_SERVICE_NAME") return "test service";
      if (name === "LUME_LOGS") return "critical";
      return undefined;
    });

    plugin(stubSite);

    events.get("beforeBuild")?.();
    events.get("afterBuild")?.();
    events.get("beforeSave")?.();

    assertEquals(collection.icon, "activity");
    assertEquals((collection.items?.length ?? 0) > 0, true);
    assertEquals(collection.items?.[0]?.title.includes("#1 build"), true);
    assertEquals(
      collection.items?.[0]?.description?.includes("Service: test service"),
      true,
    );
  });
});
