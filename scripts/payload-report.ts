import { extname, join } from "jsr/path";

const DEFAULT_ROUTES = [
  "/index.html",
  "/about/index.html",
  "/posts/index.html",
  "/posts/vestibulum-ante/index.html",
  "/posts/lorem-ipsum/index.html",
  "/feed.xsl",
  "/sitemap.xsl",
] as const;
const SUPPORTED_ASSET_EXTENSIONS = new Set([".js", ".css"]);
const ASSET_REFERENCE_PATTERNS = [
  /<script[^>]*\ssrc="([^"]+)"[^>]*>/g,
  /<link[^>]*\shref="([^"]+)"[^>]*>/g,
] as const;

/** Supported asset kinds included in payload accounting. */
export type RouteAssetKind = "js" | "css";

/** Serialized payload entry for one JS or CSS asset file. */
export type RouteAsset = {
  url: string;
  kind: RouteAssetKind;
  bytes: number;
};

/** Aggregated payload metrics for one rendered route file. */
export type RoutePayload = {
  route: string;
  jsBytes: number;
  cssBytes: number;
  totalBytes: number;
  assets: ReadonlyArray<RouteAsset>;
};

/** Full payload report for a single build output snapshot. */
export type PayloadReport = {
  generatedAt: string;
  rootDir: string;
  routes: ReadonlyArray<RoutePayload>;
  totals: {
    jsBytes: number;
    cssBytes: number;
    totalBytes: number;
  };
};

/** Delta summary for one route when compared with a baseline report. */
export type PayloadDelta = {
  route: string;
  deltaBytes: number;
};

/** Optional regression thresholds enforced against payload deltas. */
export type PayloadRegressionThresholds = {
  maxTotalDeltaBytes?: number;
  maxRouteDeltaBytes?: number;
};

type CliOptions = {
  rootDir: string;
  routes: ReadonlyArray<string>;
  baselinePath?: string;
  outputPath?: string;
  markdownPath?: string;
  requireBaseline: boolean;
  maxTotalDeltaBytes?: number;
  maxRouteDeltaBytes?: number;
};

function printUsage(): void {
  console.info(
    [
      "Usage: deno run --allow-read scripts/payload-report.ts [options]",
      "",
      "Options:",
      "  --root=<path>      Site output directory (default: _site)",
      "  --routes=<csv>      Comma-separated route files to inspect",
      "  --baseline=<file>   Compare against a previous JSON report",
      "  --output=<file>     Write the current JSON report to a file",
      "  --markdown=<file>   Write a reusable markdown report to a file",
      "  --require-baseline  Fail when --baseline is not provided",
      "  --max-total-delta=<bytes>  Fail when total bytes delta exceeds this value",
      "  --max-route-delta=<bytes>  Fail when any per-route delta exceeds this value",
    ].join("\n"),
  );
}

function parseByteThreshold(optionName: string, value: string): number {
  const threshold = Number(value);

  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error(
      `Invalid value for ${optionName}: expected a non-negative integer, received "${value}"`,
    );
  }

  return threshold;
}

function normalizeRoute(route: string): string {
  const trimmedRoute = route.trim();

  if (trimmedRoute.length === 0) {
    throw new Error("Route values cannot be empty");
  }

  return trimmedRoute.startsWith("/") ? trimmedRoute : `/${trimmedRoute}`;
}

function parseRoutes(value: string): ReadonlyArray<string> {
  const routes = value.split(",").map(normalizeRoute);

  if (routes.length === 0) {
    throw new Error("At least one route is required");
  }

  return routes;
}

function parseCliOptions(args: ReadonlyArray<string>): CliOptions {
  const options: CliOptions = {
    rootDir: "_site",
    routes: DEFAULT_ROUTES,
    requireBaseline: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      printUsage();
      Deno.exit(0);
    }

    if (arg === "--require-baseline") {
      options.requireBaseline = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unknown positional argument: ${arg}`);
    }

    const [key, value] = arg.split("=", 2);

    if (value === undefined || value.length === 0) {
      throw new Error(`Missing value for option: ${key}`);
    }

    switch (key) {
      case "--root":
        options.rootDir = value;
        break;
      case "--routes":
        options.routes = parseRoutes(value);
        break;
      case "--baseline":
        options.baselinePath = value;
        break;
      case "--output":
        options.outputPath = value;
        break;
      case "--markdown":
        options.markdownPath = value;
        break;
      case "--max-total-delta":
        options.maxTotalDeltaBytes = parseByteThreshold(key, value);
        break;
      case "--max-route-delta":
        options.maxRouteDeltaBytes = parseByteThreshold(key, value);
        break;
      default:
        throw new Error(`Unknown option: ${key}`);
    }
  }

  return options;
}

function stripQueryAndHash(url: string): string {
  const queryOrHashIndex = url.search(/[?#]/);

  if (queryOrHashIndex === -1) {
    return url;
  }

  return url.slice(0, queryOrHashIndex);
}

function toOutputPath(rootDir: string, url: string): string {
  return join(
    rootDir,
    ...url.split("/").filter((segment) => segment.length > 0),
  );
}

function isSupportedAssetUrl(url: string): boolean {
  if (!url.startsWith("/")) {
    return false;
  }

  const extension = extname(url).toLowerCase();
  return SUPPORTED_ASSET_EXTENSIONS.has(extension);
}

function getAssetKind(url: string): RouteAssetKind {
  return extname(url).toLowerCase() === ".css" ? "css" : "js";
}

function extractAssetUrls(markup: string): ReadonlyArray<string> {
  const assetUrls = new Set<string>();

  for (const pattern of ASSET_REFERENCE_PATTERNS) {
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(markup)) !== null) {
      const candidate = stripQueryAndHash(match[1] ?? "");

      if (!isSupportedAssetUrl(candidate)) {
        continue;
      }

      assetUrls.add(candidate);
    }
  }

  return [...assetUrls].sort((left, right) => left.localeCompare(right));
}

async function collectRoutePayload(
  rootDir: string,
  route: string,
): Promise<RoutePayload> {
  const routePath = toOutputPath(rootDir, route);
  const markup = await Deno.readTextFile(routePath);
  const assetUrls = extractAssetUrls(markup);
  const assets: RouteAsset[] = [];
  let jsBytes = 0;
  let cssBytes = 0;

  for (const assetUrl of assetUrls) {
    const assetPath = toOutputPath(rootDir, assetUrl);
    const bytes = (await Deno.stat(assetPath)).size;
    const kind = getAssetKind(assetUrl);
    assets.push({
      url: assetUrl,
      kind,
      bytes,
    });

    if (kind === "css") {
      cssBytes += bytes;
    } else {
      jsBytes += bytes;
    }
  }

  return {
    route,
    jsBytes,
    cssBytes,
    totalBytes: jsBytes + cssBytes,
    assets,
  };
}

async function collectPayloadReport(
  rootDir: string,
  routes: ReadonlyArray<string>,
): Promise<PayloadReport> {
  const routeReports = await Promise.all(
    routes.map((route) => collectRoutePayload(rootDir, route)),
  );
  const totals = routeReports.reduce(
    (accumulator, routeReport) => ({
      jsBytes: accumulator.jsBytes + routeReport.jsBytes,
      cssBytes: accumulator.cssBytes + routeReport.cssBytes,
      totalBytes: accumulator.totalBytes + routeReport.totalBytes,
    }),
    {
      jsBytes: 0,
      cssBytes: 0,
      totalBytes: 0,
    },
  );

  return {
    generatedAt: new Date().toISOString(),
    rootDir,
    routes: routeReports,
    totals,
  };
}

function formatDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }

  return `${delta}`;
}

function indexRoutesByPath(
  report: PayloadReport,
): ReadonlyMap<string, RoutePayload> {
  return new Map(report.routes.map((route) => [route.route, route]));
}

/** Returns route-level and total deltas between the current report and a baseline. */
export function getPayloadDeltas(
  report: PayloadReport,
  baselineReport: PayloadReport,
): {
  routeDeltas: ReadonlyArray<PayloadDelta>;
  totalDeltaBytes: number;
} {
  const baselineByRoute = indexRoutesByPath(baselineReport);
  const routeDeltas = report.routes.map((routeReport) => {
    const baselineRoute = baselineByRoute.get(routeReport.route);

    if (!baselineRoute) {
      throw new Error(
        `Baseline report is missing route: ${routeReport.route}. Re-run with matching routes.`,
      );
    }

    return {
      route: routeReport.route,
      deltaBytes: routeReport.totalBytes - baselineRoute.totalBytes,
    };
  });

  return {
    routeDeltas,
    totalDeltaBytes: report.totals.totalBytes -
      baselineReport.totals.totalBytes,
  };
}

/** Throws when the payload delta exceeds configured thresholds. */
export function assertPayloadRegressionThresholds(
  deltas: {
    routeDeltas: ReadonlyArray<PayloadDelta>;
    totalDeltaBytes: number;
  },
  thresholds: PayloadRegressionThresholds,
): void {
  const violations: string[] = [];

  if (
    thresholds.maxTotalDeltaBytes !== undefined &&
    deltas.totalDeltaBytes > thresholds.maxTotalDeltaBytes
  ) {
    violations.push(
      `total delta ${
        formatDelta(deltas.totalDeltaBytes)
      } exceeds max-total-delta=${thresholds.maxTotalDeltaBytes}`,
    );
  }

  if (thresholds.maxRouteDeltaBytes !== undefined) {
    for (const routeDelta of deltas.routeDeltas) {
      if (routeDelta.deltaBytes <= thresholds.maxRouteDeltaBytes) {
        continue;
      }

      violations.push(
        `${routeDelta.route}: delta ${
          formatDelta(routeDelta.deltaBytes)
        } exceeds max-route-delta=${thresholds.maxRouteDeltaBytes}`,
      );
    }
  }

  if (violations.length === 0) {
    return;
  }

  throw new Error(
    [
      "[payload-regression] Regression guard failed",
      ...violations.map((violation) => `- ${violation}`),
    ].join("\n"),
  );
}

function renderMarkdownTable(
  report: PayloadReport,
  baselineReport: PayloadReport | undefined,
): string {
  const lines: string[] = [];
  const baselineByRoute = baselineReport
    ? indexRoutesByPath(baselineReport)
    : undefined;

  if (baselineByRoute) {
    lines.push(
      "| Route | JS (bytes) | CSS (bytes) | Total (bytes) | Delta (bytes) |",
    );
    lines.push("| --- | ---: | ---: | ---: | ---: |");
  } else {
    lines.push("| Route | JS (bytes) | CSS (bytes) | Total (bytes) |");
    lines.push("| --- | ---: | ---: | ---: |");
  }

  for (const routeReport of report.routes) {
    if (!baselineByRoute) {
      lines.push(
        `| \`${routeReport.route}\` | ${routeReport.jsBytes} | ${routeReport.cssBytes} | ${routeReport.totalBytes} |`,
      );
      continue;
    }

    const baselineRoute = baselineByRoute.get(routeReport.route);

    if (!baselineRoute) {
      throw new Error(
        `Baseline report is missing route: ${routeReport.route}. Re-run with matching routes.`,
      );
    }

    const delta = routeReport.totalBytes - baselineRoute.totalBytes;
    lines.push(
      `| \`${routeReport.route}\` | ${routeReport.jsBytes} | ${routeReport.cssBytes} | ${routeReport.totalBytes} | ${
        formatDelta(delta)
      } |`,
    );
  }

  if (!baselineReport) {
    lines.push(
      `| **Total** | **${report.totals.jsBytes}** | **${report.totals.cssBytes}** | **${report.totals.totalBytes}** |`,
    );
    return lines.join("\n");
  }

  const { totalDeltaBytes } = getPayloadDeltas(report, baselineReport);
  lines.push(
    `| **Total** | **${report.totals.jsBytes}** | **${report.totals.cssBytes}** | **${report.totals.totalBytes}** | **${
      formatDelta(totalDeltaBytes)
    }** |`,
  );

  return lines.join("\n");
}

async function readBaselineReport(path: string): Promise<PayloadReport> {
  const raw = await Deno.readTextFile(path);
  return JSON.parse(raw) as PayloadReport;
}

function renderMarkdownReport(
  options: CliOptions,
  report: PayloadReport,
  baselineReport: PayloadReport | undefined,
): string {
  const lines = [
    "# Payload Report",
    `- Root: \`${report.rootDir}\``,
    `- Routes: ${report.routes.length}`,
  ];

  if (options.baselinePath) {
    lines.push(`- Baseline: \`${options.baselinePath}\``);
  }

  if (options.outputPath) {
    lines.push(`- Output JSON: \`${options.outputPath}\``);
  }

  if (options.markdownPath) {
    lines.push(`- Output Markdown: \`${options.markdownPath}\``);
  }

  if (options.maxTotalDeltaBytes !== undefined) {
    lines.push(`- Max total delta: ${options.maxTotalDeltaBytes} bytes`);
  }

  if (options.maxRouteDeltaBytes !== undefined) {
    lines.push(`- Max route delta: ${options.maxRouteDeltaBytes} bytes`);
  }

  lines.push("");
  lines.push(renderMarkdownTable(report, baselineReport));

  return lines.join("\n");
}

async function main(): Promise<void> {
  const options = parseCliOptions(Deno.args);
  const usesRegressionGuard = options.maxTotalDeltaBytes !== undefined ||
    options.maxRouteDeltaBytes !== undefined;

  if (options.requireBaseline && options.baselinePath === undefined) {
    throw new Error(
      "Missing required option: --baseline=<file> (enforced by --require-baseline)",
    );
  }

  if (usesRegressionGuard && options.baselinePath === undefined) {
    throw new Error(
      "Missing required option: --baseline=<file> (needed for payload regression guard)",
    );
  }

  const report = await collectPayloadReport(options.rootDir, options.routes);
  const baselineReport = options.baselinePath
    ? await readBaselineReport(options.baselinePath)
    : undefined;

  if (options.outputPath) {
    await Deno.writeTextFile(
      options.outputPath,
      JSON.stringify(report, null, 2),
    );
  }

  const markdownReport = renderMarkdownReport(options, report, baselineReport);

  if (options.markdownPath) {
    await Deno.writeTextFile(options.markdownPath, `${markdownReport}\n`);
  }

  if (baselineReport && usesRegressionGuard) {
    const thresholds: PayloadRegressionThresholds = {};

    if (options.maxTotalDeltaBytes !== undefined) {
      thresholds.maxTotalDeltaBytes = options.maxTotalDeltaBytes;
    }

    if (options.maxRouteDeltaBytes !== undefined) {
      thresholds.maxRouteDeltaBytes = options.maxRouteDeltaBytes;
    }

    assertPayloadRegressionThresholds(
      getPayloadDeltas(report, baselineReport),
      thresholds,
    );
  }

  console.info(markdownReport);
}

if (import.meta.main) {
  await main();
}
