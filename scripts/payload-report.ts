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

type RouteAssetKind = "js" | "css";

type RouteAsset = {
  url: string;
  kind: RouteAssetKind;
  bytes: number;
};

type RoutePayload = {
  route: string;
  jsBytes: number;
  cssBytes: number;
  totalBytes: number;
  assets: ReadonlyArray<RouteAsset>;
};

type PayloadReport = {
  generatedAt: string;
  rootDir: string;
  routes: ReadonlyArray<RoutePayload>;
  totals: {
    jsBytes: number;
    cssBytes: number;
    totalBytes: number;
  };
};

type CliOptions = {
  rootDir: string;
  routes: ReadonlyArray<string>;
  baselinePath?: string;
  outputPath?: string;
  markdownPath?: string;
  requireBaseline: boolean;
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
    ].join("\n"),
  );
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

  const totalDelta = report.totals.totalBytes -
    baselineReport.totals.totalBytes;
  lines.push(
    `| **Total** | **${report.totals.jsBytes}** | **${report.totals.cssBytes}** | **${report.totals.totalBytes}** | **${
      formatDelta(totalDelta)
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

  lines.push("");
  lines.push(renderMarkdownTable(report, baselineReport));

  return lines.join("\n");
}

async function main(): Promise<void> {
  const options = parseCliOptions(Deno.args);

  if (options.requireBaseline && options.baselinePath === undefined) {
    throw new Error(
      "Missing required option: --baseline=<file> (enforced by --require-baseline)",
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

  console.info(markdownReport);
}

await main();
