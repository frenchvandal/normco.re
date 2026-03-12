import { assertEquals, assertThrows } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  assertPayloadRegressionThresholds,
  getPayloadDeltas,
} from "./payload-report.ts";

type PayloadReportFixture = {
  generatedAt: string;
  rootDir: string;
  routes: ReadonlyArray<{
    route: string;
    jsBytes: number;
    cssBytes: number;
    totalBytes: number;
    assets: ReadonlyArray<{
      url: string;
      kind: "js" | "css";
      bytes: number;
    }>;
  }>;
  totals: {
    jsBytes: number;
    cssBytes: number;
    totalBytes: number;
  };
};

function createReport(
  totalByRoute: ReadonlyArray<[string, number]>,
): PayloadReportFixture {
  const routes = totalByRoute.map(([route, totalBytes]) => ({
    route,
    jsBytes: totalBytes,
    cssBytes: 0,
    totalBytes,
    assets: [] as const,
  }));
  const totalBytes = routes.reduce(
    (accumulator, route) => accumulator + route.totalBytes,
    0,
  );

  return {
    generatedAt: new Date("2026-03-12T00:00:00.000Z").toISOString(),
    rootDir: "_site",
    routes,
    totals: {
      jsBytes: totalBytes,
      cssBytes: 0,
      totalBytes,
    },
  };
}

describe("payload regression guard", () => {
  it("computes route and total deltas against baseline", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const current = createReport([
      ["/index.html", 980],
      ["/posts/index.html", 1400],
    ]);

    const deltas = getPayloadDeltas(
      current as Parameters<typeof getPayloadDeltas>[0],
      baseline as Parameters<typeof getPayloadDeltas>[1],
    );

    assertEquals(deltas.totalDeltaBytes, 80);
    assertEquals(deltas.routeDeltas.length, 2);
    assertEquals(deltas.routeDeltas[0], {
      route: "/index.html",
      deltaBytes: -20,
    });
    assertEquals(deltas.routeDeltas[1], {
      route: "/posts/index.html",
      deltaBytes: 100,
    });
  });

  it("passes when both total and route deltas stay within thresholds", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const current = createReport([
      ["/index.html", 1010],
      ["/posts/index.html", 1315],
    ]);

    const deltas = getPayloadDeltas(
      current as Parameters<typeof getPayloadDeltas>[0],
      baseline as Parameters<typeof getPayloadDeltas>[1],
    );

    assertPayloadRegressionThresholds(deltas, {
      maxTotalDeltaBytes: 30,
      maxRouteDeltaBytes: 20,
    });
  });

  it("fails when a route delta exceeds the configured route threshold", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const current = createReport([
      ["/index.html", 1005],
      ["/posts/index.html", 1335],
    ]);

    const deltas = getPayloadDeltas(
      current as Parameters<typeof getPayloadDeltas>[0],
      baseline as Parameters<typeof getPayloadDeltas>[1],
    );

    assertThrows(
      () =>
        assertPayloadRegressionThresholds(deltas, {
          maxRouteDeltaBytes: 20,
        }),
      Error,
      "max-route-delta",
    );
  });

  it("fails when total delta exceeds the configured total threshold", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const current = createReport([
      ["/index.html", 1030],
      ["/posts/index.html", 1325],
    ]);

    const deltas = getPayloadDeltas(
      current as Parameters<typeof getPayloadDeltas>[0],
      baseline as Parameters<typeof getPayloadDeltas>[1],
    );

    assertThrows(
      () =>
        assertPayloadRegressionThresholds(deltas, {
          maxTotalDeltaBytes: 40,
        }),
      Error,
      "max-total-delta",
    );
  });
});
