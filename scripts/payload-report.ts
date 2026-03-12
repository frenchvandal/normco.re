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
const PAYLOAD_REPORT_SCHEMA_VERSION = 2 as const;
const PAYLOAD_POLICY_VERSION = 1 as const;
const POLICY_FIELDS = [
  "rootDir",
  "routes",
  "requireBaseline",
  "outputPath",
  "markdownPath",
  "maxTotalDeltaBytes",
  "maxRouteDeltaBytes",
] as const satisfies ReadonlyArray<PolicyField>;
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

/** Baseline/policy metadata used to ensure comparisons are unambiguous. */
export type PayloadReportMetadata = {
  schemaVersion: number;
  routeSetHash: string;
  routeCount: number;
  policyMode?: "policy";
  baselineKind?: "policy-baseline";
  policyVersion?: number;
  policyFingerprint?: string;
};

/** Full payload report for a single build output snapshot. */
export type PayloadReport = {
  generatedAt: string;
  rootDir: string;
  metadata: PayloadReportMetadata;
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

/** Versioned payload policy for PR/CI thresholds and outputs. */
export type PayloadPolicy = {
  version: number;
  rootDir?: string;
  routes?: ReadonlyArray<string>;
  requireBaseline?: boolean;
  outputPath?: string;
  markdownPath?: string;
  maxTotalDeltaBytes?: number;
  maxRouteDeltaBytes?: number;
};

/** Resolved execution options for payload report/guard runs. */
export type CliOptions = {
  rootDir: string;
  routes: ReadonlyArray<string>;
  baselinePath?: string;
  outputPath?: string;
  markdownPath?: string;
  requireBaseline: boolean;
  maxTotalDeltaBytes?: number;
  maxRouteDeltaBytes?: number;
  policyPath?: string;
  policyVersion?: number;
  policyFingerprint?: string;
  policyBaselineMode: boolean;
};

/** Configurable option keys that can be sourced from a payload policy file. */
export type PolicyField =
  | "rootDir"
  | "routes"
  | "requireBaseline"
  | "outputPath"
  | "markdownPath"
  | "maxTotalDeltaBytes"
  | "maxRouteDeltaBytes";

type ParsedCliOptions = {
  options: CliOptions;
  configuredFields: ReadonlySet<PolicyField>;
};

type RouteBuildIssue = {
  route: string;
  path: string;
  reason: "missing" | "not-file";
};

/** Reads file stats for a given path, used by route validation. */
export type FileStatReader = (path: string) => Promise<Deno.FileInfo>;

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
      "  --policy=<file>     Apply a versioned JSON policy (routes/thresholds/outputs)",
      "  --policy-baseline   Generate a policy-compatible baseline report (disables baseline/guard checks)",
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

function validateByteThreshold(optionName: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(
      `Invalid value for ${optionName}: expected a non-negative integer`,
    );
  }

  return value;
}

function assertPolicyString(
  optionName: string,
  value: unknown,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Invalid value for ${optionName}: expected a non-empty string`,
    );
  }

  return value;
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

function getSortedUniqueRoutes(
  routes: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return [...new Set(routes)].sort((left, right) => left.localeCompare(right));
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function getRouteSetHash(routes: ReadonlyArray<string>): string {
  return hashString(getSortedUniqueRoutes(routes).join("\n"));
}

function isPayloadReportMetadata(
  value: unknown,
): value is PayloadReportMetadata {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.schemaVersion !== "number" ||
    !Number.isInteger(candidate.schemaVersion)
  ) {
    return false;
  }

  if (
    typeof candidate.routeSetHash !== "string" ||
    candidate.routeSetHash.length === 0
  ) {
    return false;
  }

  if (
    typeof candidate.routeCount !== "number" ||
    !Number.isInteger(candidate.routeCount) ||
    candidate.routeCount < 0
  ) {
    return false;
  }

  if (
    candidate.policyVersion !== undefined &&
    (typeof candidate.policyVersion !== "number" ||
      !Number.isInteger(candidate.policyVersion))
  ) {
    return false;
  }

  if (candidate.policyMode !== undefined && candidate.policyMode !== "policy") {
    return false;
  }

  if (
    candidate.baselineKind !== undefined &&
    candidate.baselineKind !== "policy-baseline"
  ) {
    return false;
  }

  if (
    candidate.policyFingerprint !== undefined &&
    (typeof candidate.policyFingerprint !== "string" ||
      candidate.policyFingerprint.length === 0)
  ) {
    return false;
  }

  return true;
}

/** Creates deterministic metadata used to validate baseline/policy coherence. */
export function createPayloadReportMetadata(
  routes: ReadonlyArray<string>,
  policyMode?: "policy",
  policyVersion?: number,
  policyFingerprint?: string,
  baselineKind?: "policy-baseline",
): PayloadReportMetadata {
  const canonicalRoutes = getSortedUniqueRoutes(routes);
  const metadata: PayloadReportMetadata = {
    schemaVersion: PAYLOAD_REPORT_SCHEMA_VERSION,
    routeSetHash: getRouteSetHash(canonicalRoutes),
    routeCount: canonicalRoutes.length,
  };

  if (policyMode !== undefined) {
    metadata.policyMode = policyMode;
  }

  if (policyVersion !== undefined) {
    metadata.policyVersion = policyVersion;
  }

  if (policyFingerprint !== undefined) {
    metadata.policyFingerprint = policyFingerprint;
  }

  if (baselineKind !== undefined) {
    metadata.baselineKind = baselineKind;
  }

  return metadata;
}

function parseCliOptions(args: ReadonlyArray<string>): ParsedCliOptions {
  const options: CliOptions = {
    rootDir: "_site",
    routes: DEFAULT_ROUTES,
    requireBaseline: false,
    policyBaselineMode: false,
  };
  const configuredFields = new Set<PolicyField>();

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      printUsage();
      Deno.exit(0);
    }

    if (arg === "--require-baseline") {
      options.requireBaseline = true;
      continue;
    }

    if (arg === "--policy-baseline") {
      options.policyBaselineMode = true;
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
        configuredFields.add("outputPath");
        break;
      case "--markdown":
        options.markdownPath = value;
        configuredFields.add("markdownPath");
        break;
      case "--policy":
        options.policyPath = value;
        break;
      case "--max-total-delta":
        options.maxTotalDeltaBytes = parseByteThreshold(key, value);
        configuredFields.add("maxTotalDeltaBytes");
        break;
      case "--max-route-delta":
        options.maxRouteDeltaBytes = parseByteThreshold(key, value);
        configuredFields.add("maxRouteDeltaBytes");
        break;
      default:
        throw new Error(`Unknown option: ${key}`);
    }

    if (key === "--root") {
      configuredFields.add("rootDir");
    } else if (key === "--routes") {
      configuredFields.add("routes");
    }
  }

  if (options.requireBaseline) {
    configuredFields.add("requireBaseline");
  }

  return {
    options,
    configuredFields,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePolicyRoutes(value: unknown): ReadonlyArray<string> {
  if (!Array.isArray(value)) {
    throw new Error(
      "Invalid policy field `routes`: expected an array of strings",
    );
  }

  return value.map((route, index) => {
    if (typeof route !== "string") {
      throw new Error(
        `Invalid policy field \`routes\`: entry at index ${index} must be a string`,
      );
    }

    return normalizeRoute(route);
  });
}

/** Parses and validates a payload policy object. */
export function parsePayloadPolicy(rawPolicy: unknown): PayloadPolicy {
  if (!isRecord(rawPolicy)) {
    throw new Error("Invalid payload policy: expected a JSON object");
  }

  const allowedKeys = new Set([
    "version",
    ...POLICY_FIELDS,
  ]);

  for (const key of Object.keys(rawPolicy)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`Invalid payload policy field: ${key}`);
    }
  }

  const version = rawPolicy["version"];
  if (version !== PAYLOAD_POLICY_VERSION) {
    throw new Error(
      `Unsupported payload policy version: expected ${PAYLOAD_POLICY_VERSION}, received ${
        String(version)
      }`,
    );
  }

  const policy: PayloadPolicy = {
    version: PAYLOAD_POLICY_VERSION,
  };

  if (rawPolicy["rootDir"] !== undefined) {
    policy.rootDir = assertPolicyString("rootDir", rawPolicy["rootDir"]);
  }

  if (rawPolicy["routes"] !== undefined) {
    policy.routes = parsePolicyRoutes(rawPolicy["routes"]);
  }

  if (rawPolicy["requireBaseline"] !== undefined) {
    if (typeof rawPolicy["requireBaseline"] !== "boolean") {
      throw new Error(
        "Invalid policy field `requireBaseline`: expected a boolean",
      );
    }
    policy.requireBaseline = rawPolicy["requireBaseline"];
  }

  if (rawPolicy["outputPath"] !== undefined) {
    policy.outputPath = assertPolicyString(
      "outputPath",
      rawPolicy["outputPath"],
    );
  }

  if (rawPolicy["markdownPath"] !== undefined) {
    policy.markdownPath = assertPolicyString(
      "markdownPath",
      rawPolicy["markdownPath"],
    );
  }

  if (rawPolicy["maxTotalDeltaBytes"] !== undefined) {
    policy.maxTotalDeltaBytes = validateByteThreshold(
      "maxTotalDeltaBytes",
      rawPolicy["maxTotalDeltaBytes"],
    );
  }

  if (rawPolicy["maxRouteDeltaBytes"] !== undefined) {
    policy.maxRouteDeltaBytes = validateByteThreshold(
      "maxRouteDeltaBytes",
      rawPolicy["maxRouteDeltaBytes"],
    );
  }

  return policy;
}

/** Builds a stable hash from policy fields that affect report/guard semantics. */
export function createPayloadPolicyFingerprint(policy: PayloadPolicy): string {
  const canonicalPolicy = {
    version: policy.version,
    rootDir: policy.rootDir ?? null,
    routes: policy.routes === undefined
      ? null
      : getSortedUniqueRoutes(policy.routes),
    requireBaseline: policy.requireBaseline ?? null,
    maxTotalDeltaBytes: policy.maxTotalDeltaBytes ?? null,
    maxRouteDeltaBytes: policy.maxRouteDeltaBytes ?? null,
  } as const;

  return hashString(JSON.stringify(canonicalPolicy));
}

async function readPayloadPolicy(path: string): Promise<PayloadPolicy> {
  const raw = await Deno.readTextFile(path);
  return parsePayloadPolicy(JSON.parse(raw));
}

/** Applies policy defaults while preserving explicitly configured CLI fields. */
export function applyPayloadPolicy(
  options: CliOptions,
  policy: PayloadPolicy,
  configuredFields: ReadonlySet<PolicyField>,
): CliOptions {
  const merged: CliOptions = {
    ...options,
    policyVersion: policy.version,
    policyFingerprint: createPayloadPolicyFingerprint(policy),
  };

  if (!configuredFields.has("rootDir") && policy.rootDir !== undefined) {
    merged.rootDir = policy.rootDir;
  }

  if (!configuredFields.has("routes") && policy.routes !== undefined) {
    merged.routes = policy.routes;
  }

  if (
    !configuredFields.has("requireBaseline") &&
    policy.requireBaseline !== undefined
  ) {
    merged.requireBaseline = policy.requireBaseline;
  }

  if (!configuredFields.has("outputPath") && policy.outputPath !== undefined) {
    merged.outputPath = policy.outputPath;
  }

  if (
    !configuredFields.has("markdownPath") &&
    policy.markdownPath !== undefined
  ) {
    merged.markdownPath = policy.markdownPath;
  }

  if (
    !configuredFields.has("maxTotalDeltaBytes") &&
    policy.maxTotalDeltaBytes !== undefined
  ) {
    merged.maxTotalDeltaBytes = policy.maxTotalDeltaBytes;
  }

  if (
    !configuredFields.has("maxRouteDeltaBytes") &&
    policy.maxRouteDeltaBytes !== undefined
  ) {
    merged.maxRouteDeltaBytes = policy.maxRouteDeltaBytes;
  }

  return merged;
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
  policyMode?: "policy",
  policyVersion?: number,
  policyFingerprint?: string,
  baselineKind?: "policy-baseline",
): Promise<PayloadReport> {
  const routeReports = await Promise.all(
    routes.map((route) => collectRoutePayload(rootDir, route)),
  );
  const metadata = createPayloadReportMetadata(
    routeReports.map((routeReport) => routeReport.route),
    policyMode,
    policyVersion,
    policyFingerprint,
    baselineKind,
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
    metadata,
    routes: routeReports,
    totals,
  };
}

async function getRouteBuildIssue(
  rootDir: string,
  route: string,
  readFileStat: FileStatReader,
): Promise<RouteBuildIssue | undefined> {
  const routePath = toOutputPath(rootDir, route);

  try {
    const routeStat = await readFileStat(routePath);

    if (routeStat.isFile) {
      return undefined;
    }

    return {
      route,
      path: routePath,
      reason: "not-file",
    };
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return {
        route,
        path: routePath,
        reason: "missing",
      };
    }

    throw error;
  }
}

/** Ensures every configured route resolves to a real file in the build output. */
export async function assertRouteFilesExist(
  rootDir: string,
  routes: ReadonlyArray<string>,
  policyPath?: string,
  readFileStat: FileStatReader = Deno.stat,
): Promise<void> {
  const routeIssues = (
    await Promise.all(
      routes.map((route) => getRouteBuildIssue(rootDir, route, readFileStat)),
    )
  ).filter((issue) => issue !== undefined);

  if (routeIssues.length === 0) {
    return;
  }

  const issueDetails = routeIssues.map((issue) => {
    const reason = issue.reason === "missing" ? "missing file" : "not a file";
    return `- ${issue.route} -> ${issue.path} (${reason})`;
  });
  const commandHint = policyPath
    ? `Update \`${policyPath}\` routes (or override with \`--routes\`) to match generated files.`
    : "Update `--routes` to match generated files.";

  throw new Error(
    [
      "[payload-report] Route validation failed: some configured routes are not present in the build output",
      ...issueDetails,
      "Run `deno task build` before generating payload reports.",
      commandHint,
    ].join("\n"),
  );
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

function getSortedRouteSet(report: PayloadReport): ReadonlyArray<string> {
  return getSortedUniqueRoutes(report.routes.map((route) => route.route));
}

function getReportMetadata(
  report: PayloadReport,
  reportName: "current report" | "baseline report",
  baselinePath?: string,
): PayloadReportMetadata {
  const metadata = (report as { metadata?: unknown }).metadata;

  if (!isPayloadReportMetadata(metadata)) {
    const lines = [
      `[payload-report] ${reportName} metadata is missing or invalid`,
      "Regenerate the report with this repository revision before comparing payload deltas.",
    ];

    if (reportName === "baseline report" && baselinePath !== undefined) {
      lines.push(
        `Regenerate baseline \`${baselinePath}\` with the same routes/policy used for the current report.`,
      );
    }

    throw new Error(lines.join("\n"));
  }

  const routeSet = getSortedRouteSet(report);
  const expectedRouteSetHash = getRouteSetHash(routeSet);
  if (
    metadata.routeSetHash !== expectedRouteSetHash ||
    metadata.routeCount !== routeSet.length
  ) {
    throw new Error(
      [
        `[payload-report] ${reportName} metadata is out of sync with route payload entries`,
        `- Expected route hash: ${expectedRouteSetHash}`,
        `- Received route hash: ${metadata.routeSetHash}`,
        `- Expected route count: ${routeSet.length}`,
        `- Received route count: ${metadata.routeCount}`,
        "Regenerate the report before comparing payload deltas.",
      ].join("\n"),
    );
  }

  return metadata;
}

function getMissingPolicyMetadataFields(
  metadata: PayloadReportMetadata,
  options?: {
    requireBaselineKind?: boolean;
  },
): ReadonlyArray<string> {
  const missingFields: string[] = [];
  const requireBaselineKind = options?.requireBaselineKind ?? false;

  if (metadata.policyMode !== "policy") {
    missingFields.push("policyMode");
  }

  if (metadata.policyVersion === undefined) {
    missingFields.push("policyVersion");
  }

  if (metadata.policyFingerprint === undefined) {
    missingFields.push("policyFingerprint");
  }

  if (metadata.routeSetHash.length === 0) {
    missingFields.push("routeSetHash");
  }

  if (!Number.isInteger(metadata.routeCount)) {
    missingFields.push("routeCount");
  }

  if (requireBaselineKind && metadata.baselineKind !== "policy-baseline") {
    missingFields.push("baselineKind");
  }

  return missingFields;
}

/** Ensures baseline and current reports expose exactly the same route set. */
export function assertBaselineRouteParity(
  report: PayloadReport,
  baselineReport: PayloadReport,
  baselinePath?: string,
): void {
  const reportRoutes = new Set(getSortedRouteSet(report));
  const baselineRoutes = new Set(getSortedRouteSet(baselineReport));
  const missingInBaseline = [...reportRoutes].filter((route) =>
    !baselineRoutes.has(route)
  );
  const missingInCurrent = [...baselineRoutes].filter((route) =>
    !reportRoutes.has(route)
  );

  if (missingInBaseline.length === 0 && missingInCurrent.length === 0) {
    return;
  }

  const lines = [
    "[payload-report] Baseline route set mismatch",
  ];

  if (missingInBaseline.length > 0) {
    lines.push("- Routes missing from baseline:");
    lines.push(...missingInBaseline.map((route) => `  - ${route}`));
  }

  if (missingInCurrent.length > 0) {
    lines.push("- Routes missing from current report:");
    lines.push(...missingInCurrent.map((route) => `  - ${route}`));
  }

  if (baselinePath !== undefined) {
    lines.push(
      `Rebuild and regenerate baseline \`${baselinePath}\` with the same --routes/policy before comparing.`,
    );
  } else {
    lines.push(
      "Rebuild and regenerate the baseline with the same --routes/policy before comparing.",
    );
  }

  throw new Error(lines.join("\n"));
}

/**
 * Ensures baseline metadata aligns with the current report and active policy context.
 * This prevents ambiguous comparisons when report schema or route metadata drift.
 */
export function assertBaselineMetadataCoherence(
  report: PayloadReport,
  baselineReport: PayloadReport,
  options: {
    baselinePath: string | undefined;
    policyPath: string | undefined;
    policyVersion: number | undefined;
    policyFingerprint: string | undefined;
  },
): void {
  const currentMetadata = getReportMetadata(
    report,
    "current report",
    options.baselinePath,
  );
  const baselineMetadata = getReportMetadata(
    baselineReport,
    "baseline report",
    options.baselinePath,
  );

  if (baselineMetadata.schemaVersion !== currentMetadata.schemaVersion) {
    throw new Error(
      [
        "[payload-report] Baseline schema version mismatch",
        `- Current schema version: ${currentMetadata.schemaVersion}`,
        `- Baseline schema version: ${baselineMetadata.schemaVersion}`,
        "Regenerate the baseline with the same payload-report schema version before comparing.",
      ].join("\n"),
    );
  }

  if (
    baselineMetadata.routeSetHash !== currentMetadata.routeSetHash ||
    baselineMetadata.routeCount !== currentMetadata.routeCount
  ) {
    throw new Error(
      [
        "[payload-report] Baseline route metadata mismatch",
        `- Current route hash: ${currentMetadata.routeSetHash}`,
        `- Baseline route hash: ${baselineMetadata.routeSetHash}`,
        `- Current route count: ${currentMetadata.routeCount}`,
        `- Baseline route count: ${baselineMetadata.routeCount}`,
        "Regenerate the baseline with the same routes/policy before comparing.",
      ].join("\n"),
    );
  }

  if (options.policyPath === undefined) {
    return;
  }

  const missingCurrentPolicyFields = getMissingPolicyMetadataFields(
    currentMetadata,
  );
  if (missingCurrentPolicyFields.length > 0) {
    throw new Error(
      [
        "[payload-report] Current policy report metadata completeness check failed",
        `- Policy: ${options.policyPath}`,
        "- Missing or incompatible fields:",
        ...missingCurrentPolicyFields.map((field) => `  - ${field}`),
        "This current report is not fully policy-compatible and cannot be compared in policy mode.",
        "Regenerate the current policy report with `deno task payload:policy --baseline=/path/to/policy-baseline.json`, then rerun the comparison.",
      ].join("\n"),
    );
  }

  const missingBaselinePolicyFields = getMissingPolicyMetadataFields(
    baselineMetadata,
    { requireBaselineKind: true },
  );
  if (missingBaselinePolicyFields.length > 0) {
    throw new Error(
      [
        "[payload-report] Policy baseline metadata completeness check failed",
        `- Baseline: ${options.baselinePath ?? "unknown"}`,
        `- Policy: ${options.policyPath}`,
        "- Missing or incompatible fields:",
        ...missingBaselinePolicyFields.map((field) => `  - ${field}`),
        "This baseline is not fully policy-baseline compatible and cannot be compared in policy mode.",
        "Regenerate a policy-compatible baseline with `deno task payload:baseline --output=/tmp/payload-policy-baseline.json --markdown=/tmp/payload-policy-baseline.md`, then rerun the comparison with that baseline file.",
      ].join("\n"),
    );
  }

  if (options.policyVersion === undefined) {
    throw new Error(
      "[payload-report] Policy metadata validation failed: current run has no resolved policy version",
    );
  }

  if (options.policyFingerprint === undefined) {
    throw new Error(
      "[payload-report] Policy metadata validation failed: current run has no resolved policy fingerprint",
    );
  }

  if (currentMetadata.policyVersion !== options.policyVersion) {
    throw new Error(
      [
        "[payload-report] Current report policy metadata mismatch",
        `- Resolved policy version: ${options.policyVersion}`,
        `- Current report policy version: ${
          String(currentMetadata.policyVersion)
        }`,
        "Regenerate the current report with the active policy.",
      ].join("\n"),
    );
  }

  if (currentMetadata.policyFingerprint !== options.policyFingerprint) {
    throw new Error(
      [
        "[payload-report] Current report policy fingerprint mismatch",
        `- Active policy fingerprint: ${options.policyFingerprint}`,
        `- Current report policy fingerprint: ${
          String(currentMetadata.policyFingerprint)
        }`,
        "Regenerate the current report with the active policy.",
      ].join("\n"),
    );
  }

  if (
    baselineMetadata.policyVersion !== options.policyVersion
  ) {
    throw new Error(
      [
        "[payload-report] Baseline policy version mismatch",
        `- Active policy version: ${options.policyVersion}`,
        `- Baseline policy version: ${baselineMetadata.policyVersion}`,
        "Regenerate the baseline with the active policy version before comparing.",
      ].join("\n"),
    );
  }

  if (baselineMetadata.policyFingerprint !== options.policyFingerprint) {
    throw new Error(
      [
        "[payload-report] Baseline policy fingerprint mismatch",
        `- Active policy fingerprint: ${options.policyFingerprint}`,
        `- Baseline policy fingerprint: ${baselineMetadata.policyFingerprint}`,
        `- Baseline: ${options.baselinePath ?? "unknown"}`,
        "Regenerate the baseline with the active policy before comparing.",
      ].join("\n"),
    );
  }
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
    `- Report schema: v${report.metadata.schemaVersion}`,
    `- Route set hash: \`${report.metadata.routeSetHash}\``,
  ];

  if (report.metadata.policyVersion !== undefined) {
    lines.push(`- Report policy version: ${report.metadata.policyVersion}`);
  }

  if (report.metadata.policyMode !== undefined) {
    lines.push(`- Report policy mode: ${report.metadata.policyMode}`);
  }

  if (report.metadata.baselineKind !== undefined) {
    lines.push(`- Report baseline kind: ${report.metadata.baselineKind}`);
  }

  if (report.metadata.policyFingerprint !== undefined) {
    lines.push(
      `- Report policy fingerprint: \`${report.metadata.policyFingerprint}\``,
    );
  }

  if (options.baselinePath) {
    lines.push(`- Baseline: \`${options.baselinePath}\``);
  }

  if (options.outputPath) {
    lines.push(`- Output JSON: \`${options.outputPath}\``);
  }

  if (options.markdownPath) {
    lines.push(`- Output Markdown: \`${options.markdownPath}\``);
  }

  if (options.policyPath) {
    const policyVersion = options.policyVersion ?? "unknown";
    lines.push(`- Policy: \`${options.policyPath}\` (v${policyVersion})`);
  }

  if (options.policyBaselineMode) {
    lines.push("- Policy baseline mode: enabled");
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
  const parsedCliOptions = parseCliOptions(Deno.args);
  let options = parsedCliOptions.options;

  if (options.policyPath !== undefined) {
    const policy = await readPayloadPolicy(options.policyPath);
    options = applyPayloadPolicy(
      options,
      policy,
      parsedCliOptions.configuredFields,
    );
  }

  if (options.policyBaselineMode && options.policyPath === undefined) {
    throw new Error(
      "Missing required option: --policy=<file> (required by --policy-baseline)",
    );
  }

  if (options.policyBaselineMode && options.baselinePath !== undefined) {
    throw new Error(
      "Invalid option combination: --policy-baseline cannot be combined with --baseline=<file>",
    );
  }

  if (options.policyBaselineMode) {
    const {
      baselinePath: _unusedBaselinePath,
      maxTotalDeltaBytes: _unusedMaxTotalDeltaBytes,
      maxRouteDeltaBytes: _unusedMaxRouteDeltaBytes,
      ...policyBaselineOptions
    } = options;
    options = {
      ...policyBaselineOptions,
      requireBaseline: false,
    };
  }

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

  await assertRouteFilesExist(
    options.rootDir,
    options.routes,
    options.policyPath,
  );

  const report = await collectPayloadReport(
    options.rootDir,
    options.routes,
    options.policyPath !== undefined ? "policy" : undefined,
    options.policyVersion,
    options.policyFingerprint,
    options.policyBaselineMode ? "policy-baseline" : undefined,
  );
  const baselineReport = options.baselinePath
    ? await readBaselineReport(options.baselinePath)
    : undefined;

  if (baselineReport !== undefined) {
    assertBaselineRouteParity(report, baselineReport, options.baselinePath);

    if (options.policyPath !== undefined) {
      assertBaselineMetadataCoherence(report, baselineReport, {
        baselinePath: options.baselinePath,
        policyPath: options.policyPath,
        policyVersion: options.policyVersion,
        policyFingerprint: options.policyFingerprint,
      });
    }
  }

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
