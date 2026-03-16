import { assertEquals, assertRejects, assertThrows } from "jsr/assert";
import { join } from "jsr/path";
import { describe, it } from "jsr/testing-bdd";

import {
  applyPayloadPolicy,
  assertBaselineMetadataCoherence,
  assertBaselineRouteParity,
  assertPayloadRegressionThresholds,
  assertRouteFilesExist,
  createPayloadPolicyFingerprint,
  createPayloadReportMetadata,
  getPayloadDeltas,
  parsePayloadPolicy,
  parsePayloadReport,
} from "./payload-report.ts";

type PayloadReportFixture = {
  generatedAt: string;
  rootDir: string;
  metadata: {
    schemaVersion: number;
    routeSetHash: string;
    routeCount: number;
    policyMode?: "policy";
    baselineKind?: "policy-baseline";
    policyVersion?: number;
    policyFingerprint?: string;
  };
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
  policyVersion?: number,
  policyFingerprint?: string,
  policyMode?: "policy",
  baselineKind?: "policy-baseline",
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
    metadata: createPayloadReportMetadata(
      totalByRoute.map(([route]) => route),
      policyMode,
      policyVersion,
      policyFingerprint,
      baselineKind,
    ),
    routes,
    totals: {
      jsBytes: totalBytes,
      cssBytes: 0,
      totalBytes,
    },
  };
}

function asPolicyBaseline(
  report: PayloadReportFixture,
): PayloadReportFixture {
  return {
    ...report,
    metadata: {
      ...report.metadata,
      baselineKind: "policy-baseline",
    },
  };
}

function createStatReader(
  entries: ReadonlyMap<string, "file" | "other">,
): (path: string) => Promise<Deno.FileInfo> {
  return (path: string) => {
    const entry = entries.get(path);

    if (entry === undefined) {
      return Promise.reject(new Deno.errors.NotFound(path));
    }

    if (entry === "file") {
      return Promise.resolve({ isFile: true } as Deno.FileInfo);
    }

    return Promise.resolve({ isFile: false } as Deno.FileInfo);
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

describe("payload policy mode", () => {
  it("parses a valid policy document", () => {
    const policy = parsePayloadPolicy({
      version: 1,
      rootDir: "_site",
      routes: ["/index.html", "/posts/index.html"],
      requireBaseline: true,
      maxTotalDeltaBytes: 10,
      maxRouteDeltaBytes: 4,
      outputPath: "/tmp/current.json",
      markdownPath: "/tmp/comment.md",
    });

    assertEquals(policy, {
      version: 1,
      rootDir: "_site",
      routes: ["/index.html", "/posts/index.html"],
      requireBaseline: true,
      maxTotalDeltaBytes: 10,
      maxRouteDeltaBytes: 4,
      outputPath: "/tmp/current.json",
      markdownPath: "/tmp/comment.md",
    });
  });

  it("rejects unsupported policy versions", () => {
    assertThrows(
      () =>
        parsePayloadPolicy({
          version: 2,
        }),
      Error,
      "Unsupported payload policy version",
    );
  });

  it("applies policy defaults without overriding explicit CLI fields", () => {
    const policy = parsePayloadPolicy({
      version: 1,
      rootDir: "_site",
      routes: ["/index.html", "/posts/index.html"],
      requireBaseline: true,
      maxTotalDeltaBytes: 0,
      maxRouteDeltaBytes: 0,
      outputPath: "/tmp/policy-output.json",
      markdownPath: "/tmp/policy-markdown.md",
    });
    const merged = applyPayloadPolicy(
      {
        rootDir: "_site-preview",
        routes: ["/custom.html"],
        requireBaseline: false,
        baselinePath: "/tmp/baseline.json",
        policyPath: "scripts/payload-policy.json",
        policyBaselineMode: false,
      },
      policy,
      new Set([
        "rootDir",
        "routes",
      ]),
    );

    assertEquals(merged.rootDir, "_site-preview");
    assertEquals(merged.routes, ["/custom.html"]);
    assertEquals(merged.requireBaseline, true);
    assertEquals(merged.maxTotalDeltaBytes, 0);
    assertEquals(merged.maxRouteDeltaBytes, 0);
    assertEquals(merged.outputPath, "/tmp/policy-output.json");
    assertEquals(merged.markdownPath, "/tmp/policy-markdown.md");
    assertEquals(merged.policyVersion, 1);
    assertEquals(
      merged.policyFingerprint,
      createPayloadPolicyFingerprint(policy),
    );
  });

  it("creates a stable fingerprint for equivalent policy semantics", () => {
    const firstPolicy = parsePayloadPolicy({
      version: 1,
      rootDir: "_site",
      routes: ["/posts/index.html", "/index.html"],
      requireBaseline: true,
      maxTotalDeltaBytes: 0,
      maxRouteDeltaBytes: 0,
    });
    const secondPolicy = parsePayloadPolicy({
      version: 1,
      rootDir: "_site",
      routes: ["/index.html", "/posts/index.html"],
      requireBaseline: true,
      maxTotalDeltaBytes: 0,
      maxRouteDeltaBytes: 0,
    });

    assertEquals(
      createPayloadPolicyFingerprint(firstPolicy),
      createPayloadPolicyFingerprint(secondPolicy),
    );
  });
});

describe("payload route validation", () => {
  it("passes when all configured routes exist in the build output", async () => {
    const rootDir = "_site";
    const readFileStat = createStatReader(
      new Map<string, "file" | "other">([
        [join(rootDir, "index.html"), "file"],
        [join(rootDir, "posts", "index.html"), "file"],
      ]),
    );

    await assertRouteFilesExist(
      rootDir,
      ["/index.html", "/posts/index.html"],
      undefined,
      readFileStat,
    );
  });

  it("fails with actionable guidance when routes are missing", async () => {
    const rootDir = "_site";
    const readFileStat = createStatReader(
      new Map<string, "file" | "other">([
        [join(rootDir, "index.html"), "file"],
      ]),
    );

    await assertRejects(
      () =>
        assertRouteFilesExist(
          rootDir,
          ["/index.html", "/posts/index.html"],
          "scripts/payload-policy.json",
          readFileStat,
        ),
      Error,
      "Route validation failed",
    );
  });
});

describe("payload baseline route parity", () => {
  it("passes when baseline and current reports expose identical route sets", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const current = createReport([
      ["/posts/index.html", 1250],
      ["/index.html", 980],
    ]);

    assertBaselineRouteParity(
      current as Parameters<typeof assertBaselineRouteParity>[0],
      baseline as Parameters<typeof assertBaselineRouteParity>[1],
      "/tmp/baseline.json",
    );
  });

  it("fails when baseline is missing a route from the current report", () => {
    const baseline = createReport([
      ["/index.html", 1000],
    ]);
    const current = createReport([
      ["/index.html", 980],
      ["/posts/index.html", 1250],
    ]);

    assertThrows(
      () =>
        assertBaselineRouteParity(
          current as Parameters<typeof assertBaselineRouteParity>[0],
          baseline as Parameters<typeof assertBaselineRouteParity>[1],
          "/tmp/baseline.json",
        ),
      Error,
      "Routes missing from baseline",
    );
  });

  it("fails when baseline contains a route missing from the current report", () => {
    const baseline = createReport([
      ["/index.html", 1000],
      ["/about/index.html", 900],
    ]);
    const current = createReport([
      ["/index.html", 980],
    ]);

    assertThrows(
      () =>
        assertBaselineRouteParity(
          current as Parameters<typeof assertBaselineRouteParity>[0],
          baseline as Parameters<typeof assertBaselineRouteParity>[1],
          "/tmp/baseline.json",
        ),
      Error,
      "Routes missing from current report",
    );
  });
});

describe("payload baseline metadata coherence", () => {
  it("passes when schema/hash metadata matches the active policy context", () => {
    const policyFingerprint = "ff1ce00a";
    const baseline = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    ));
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );

    assertBaselineMetadataCoherence(
      current as Parameters<typeof assertBaselineMetadataCoherence>[0],
      baseline as Parameters<typeof assertBaselineMetadataCoherence>[1],
      {
        baselinePath: "/tmp/baseline.json",
        policyPath: "scripts/payload-policy.json",
        policyVersion: 1,
        policyFingerprint,
      },
    );
  });

  it("fails when baseline metadata is missing", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithoutMetadata = {
      ...createReport(
        [
          ["/index.html", 1000],
          ["/posts/index.html", 1300],
        ],
        1,
        policyFingerprint,
        "policy",
      ),
      metadata: undefined,
    };

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithoutMetadata as unknown as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "baseline report metadata is missing or invalid",
    );
  });

  it("fails when baseline route hash metadata does not match current report", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baseline = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    ));
    const baselineWithWrongHash = {
      ...baseline,
      metadata: {
        ...baseline.metadata,
        routeSetHash: "deadbeef",
      },
    };

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithWrongHash as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "baseline report metadata is out of sync",
    );
  });

  it("fails when current policy compatibility marker is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const currentWithoutPolicyMode = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
    );
    const baseline = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          currentWithoutPolicyMode as Parameters<
            typeof assertBaselineMetadataCoherence
          >[0],
          baseline as Parameters<typeof assertBaselineMetadataCoherence>[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyMode",
    );
  });

  it("fails when current policy metadata is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const currentWithoutPolicyMetadata = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      undefined,
      undefined,
      "policy",
    );
    const baseline = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          currentWithoutPolicyMetadata as Parameters<
            typeof assertBaselineMetadataCoherence
          >[0],
          baseline as Parameters<typeof assertBaselineMetadataCoherence>[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyVersion",
    );
  });

  it("fails when current policy fingerprint is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const currentWithoutPolicyFingerprint = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      undefined,
      "policy",
    );
    const baseline = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          currentWithoutPolicyFingerprint as Parameters<
            typeof assertBaselineMetadataCoherence
          >[0],
          baseline as Parameters<typeof assertBaselineMetadataCoherence>[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyFingerprint",
    );
  });

  it("fails when baseline policy compatibility marker is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithoutPolicyMode = createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
    );

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithoutPolicyMode as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyMode",
    );
  });

  it("fails when baseline policy provenance marker is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithoutPolicyProvenance = createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      policyFingerprint,
      "policy",
    );

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithoutPolicyProvenance as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "baselineKind",
    );
  });

  it("fails when baseline policy metadata is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithoutPolicyMetadata = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      undefined,
      undefined,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithoutPolicyMetadata as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyVersion",
    );
  });

  it("fails when baseline policy fingerprint is missing in policy mode", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithoutPolicyFingerprint = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      1,
      undefined,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithoutPolicyFingerprint as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "policyFingerprint",
    );
  });

  it("fails when baseline policy version conflicts with the active policy", () => {
    const policyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      policyFingerprint,
      "policy",
    );
    const baselineWithDifferentPolicyVersion = asPolicyBaseline(createReport(
      [
        ["/index.html", 1000],
        ["/posts/index.html", 1300],
      ],
      2,
      policyFingerprint,
      "policy",
    ));

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithDifferentPolicyVersion as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint,
          },
        ),
      Error,
      "Baseline policy version mismatch",
    );
  });

  it("fails when baseline policy fingerprint conflicts with the active policy", () => {
    const currentPolicyFingerprint = "ff1ce00a";
    const current = createReport(
      [
        ["/index.html", 980],
        ["/posts/index.html", 1250],
      ],
      1,
      currentPolicyFingerprint,
      "policy",
    );
    const baselineWithDifferentPolicyFingerprint = asPolicyBaseline(
      createReport(
        [
          ["/index.html", 1000],
          ["/posts/index.html", 1300],
        ],
        1,
        "deafbeef",
        "policy",
      ),
    );

    assertThrows(
      () =>
        assertBaselineMetadataCoherence(
          current as Parameters<typeof assertBaselineMetadataCoherence>[0],
          baselineWithDifferentPolicyFingerprint as Parameters<
            typeof assertBaselineMetadataCoherence
          >[1],
          {
            baselinePath: "/tmp/baseline.json",
            policyPath: "scripts/payload-policy.json",
            policyVersion: 1,
            policyFingerprint: currentPolicyFingerprint,
          },
        ),
      Error,
      "Baseline policy fingerprint mismatch",
    );
  });
});

describe("payload report parsing", () => {
  it("accepts structurally valid reports", () => {
    const report = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);

    assertEquals(
      parsePayloadReport(report as Parameters<typeof parsePayloadReport>[0]),
      report,
    );
  });

  it("rejects reports with malformed route payload entries", () => {
    const invalidReport = {
      ...createReport([
        ["/index.html", 1000],
      ]),
      routes: [
        {
          route: "/index.html",
          jsBytes: 1000,
          cssBytes: 0,
          totalBytes: 1000,
          assets: [
            {
              url: "/style.css",
              kind: "image",
              bytes: 1000,
            },
          ],
        },
      ],
    };

    assertThrows(
      () => parsePayloadReport(invalidReport, "baseline report"),
      Error,
      "Invalid baseline report",
    );
  });

  it("rejects reports whose totals disagree with route payload entries", () => {
    const report = createReport([
      ["/index.html", 1000],
      ["/posts/index.html", 1300],
    ]);
    const invalidReport = {
      ...report,
      totals: {
        jsBytes: 0,
        cssBytes: 0,
        totalBytes: 0,
      },
    };

    assertThrows(
      () => parsePayloadReport(invalidReport, "baseline report"),
      Error,
      "totals do not match route payload entries",
    );
  });
});
