import { parseArgs } from "@std/cli";
import { contentType } from "@std/media-types";
import {
  basename,
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
} from "@std/path";

import { createUsageError, getErrorMessage } from "./_shared.ts";
import { REPO_ROOT } from "./deno_graph.ts";
import { writeGitHubJobSummary } from "./github-actions.ts";
import { buildPretextVisualHarnessSummaryMarkdown } from "./pretext-visual-harness-summary.ts";
import { PRETEXT_DISABLE_GLOBAL_FLAG } from "../src/blog/client/pretext-story-core.ts";
import {
  getLanguageDataCode,
  getLanguageTag,
  getLocalizedUrl,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../src/utils/i18n.ts";

type HarnessViewport = Readonly<{
  width: number;
  height: number;
}>;

type SelectorExpectation = Readonly<{
  selector: string;
  minCount: number;
}>;

type SelectorMetricSample = Readonly<{
  tagName: string;
  textLength: number;
  inlineSize: number;
  blockSize: number;
  lineHeight: number | null;
  minBlockSize: string | null;
  pretextTitleHeight: string | null;
  pretextSummaryHeight: string | null;
}>;

export type SelectorMetric = Readonly<{
  selector: string;
  minCount: number;
  count: number;
  samples: ReadonlyArray<SelectorMetricSample>;
}>;

type ClsMetric = Readonly<{
  value: number;
  entries: ReadonlyArray<{
    value: number;
    startTime: number;
  }>;
}>;

export type PretextHarnessVariant = "with-pretext" | "without-pretext";

export type ScenarioResult = Readonly<{
  stem: string;
  variant: PretextHarnessVariant;
  routeKind: PretextVisualHarnessRouteKind;
  language: SiteLanguage;
  languageCode: string;
  languageTag: string;
  pathname: string;
  viewportId: PretextVisualHarnessViewportId;
  viewport: HarnessViewport;
  url: string;
  status: number | null;
  documentLanguage: string | null;
  pageTitle: string | null;
  selectorMetrics: ReadonlyArray<SelectorMetric>;
  cls: ClsMetric;
  responseErrors: ReadonlyArray<string>;
  consoleErrors: ReadonlyArray<string>;
  pageErrors: ReadonlyArray<string>;
  requestFailures: ReadonlyArray<string>;
  screenshotPath: string | null;
  durationMs: number;
}>;

export type HarnessIssue = Readonly<{
  severity: "error" | "warning";
  code:
    | "console-error"
    | "http-error"
    | "missing-selector"
    | "navigation-error"
    | "page-error"
    | "request-failure"
    | "unexpected-status";
  scenarioStem: string;
  message: string;
}>;

export type HarnessReport = Readonly<{
  generatedAt: string;
  baseUrl: string;
  rootDir?: string;
  outputDir: string;
  variant: PretextHarnessVariant;
  scenarioCount: number;
  errorCount: number;
  warningCount: number;
  issues: ReadonlyArray<HarnessIssue>;
  results: ReadonlyArray<ScenarioResult>;
}>;

export type PretextVisualHarnessRunOptions = Readonly<{
  baseUrl?: string;
  disablePretext?: boolean;
  rootDir: string;
  outputDir: string;
  variant?: PretextHarnessVariant;
}>;

type ParsedCliOptions = PretextVisualHarnessRunOptions;

export type PretextVisualHarnessStaticServer = Readonly<{
  baseUrl: string;
  close: () => Promise<void>;
}>;

type RuntimePlaywright = typeof import("npm/playwright");
type RuntimeBrowser = Awaited<
  ReturnType<RuntimePlaywright["chromium"]["launch"]>
>;

type ClsWindowState = Window & {
  __pretextVisualHarness?: {
    cls: number;
    entries: Array<{ value: number; startTime: number }>;
  };
};

type ScenarioEvaluationPayload = Readonly<{
  documentLanguage: string | null;
  pageTitle: string | null;
  selectorMetrics: ReadonlyArray<SelectorMetric>;
  cls: ClsMetric;
}>;

const FALLBACK_CONTENT_TYPE = "application/octet-stream" as const;
const PLAYWRIGHT_EXECUTABLE_BASENAMES = new Set([
  "chrome-headless-shell",
  "chrome-headless-shell.exe",
  "Google Chrome for Testing",
  "chrome",
  "chrome.exe",
]);

export const PRETEXT_VISUAL_HARNESS_USAGE = [
  "Usage: deno run --allow-env --allow-net=127.0.0.1,localhost --allow-read --allow-write=.tmp/pretext-harness scripts/pretext-visual-harness.ts [options]",
  "",
  "Options:",
  "  --base-url=<url>   Reuse an already running site root instead of serving _site locally",
  "  --disable-pretext  Disable runtime Pretext hooks before page scripts execute",
  "  --root=<path>      Generated site root to serve when --base-url is omitted (default: _site)",
  "  --output=<path>    Directory for screenshots and JSON diagnostics (default: .tmp/pretext-harness)",
  "",
  "Install Chromium once with: deno task pretext:harness:install",
].join("\n");

export const PRETEXT_VISUAL_HARNESS_FIXTURES = {
  tagSlug: "software",
  postSlug: "alibaba-cloud-oss-cdn-deployment",
} as const;

export const PRETEXT_VISUAL_HARNESS_VIEWPORTS = {
  mobile: {
    width: 390,
    height: 844,
  },
  desktop: {
    width: 1440,
    height: 1200,
  },
} as const satisfies Record<string, HarnessViewport>;

export type PretextVisualHarnessViewportId =
  keyof typeof PRETEXT_VISUAL_HARNESS_VIEWPORTS;

export type PretextVisualHarnessRouteKind =
  | "home"
  | "tag"
  | "archive"
  | "post";

export type PretextVisualHarnessScenario = Readonly<{
  stem: string;
  routeKind: PretextVisualHarnessRouteKind;
  language: SiteLanguage;
  languageCode: string;
  languageTag: string;
  pathname: string;
  viewportId: PretextVisualHarnessViewportId;
  viewport: HarnessViewport;
  selectors: ReadonlyArray<SelectorExpectation>;
}>;

const PRETEXT_VISUAL_HARNESS_SELECTORS = {
  home: [
    { selector: "#home-title", minCount: 1 },
    { selector: ".editorial-home-featured-story__title", minCount: 1 },
    { selector: ".post-card-title", minCount: 1 },
    { selector: ".post-card-summary", minCount: 1 },
  ],
  tag: [
    { selector: "#tag-page-title", minCount: 1 },
    { selector: ".post-card-title", minCount: 1 },
  ],
  archive: [
    { selector: "#archive-title", minCount: 1 },
    { selector: ".blog-antd-archive-timeline__title", minCount: 1 },
    { selector: ".blog-antd-archive-timeline__summary", minCount: 1 },
  ],
  post: [
    { selector: "#post-title", minCount: 1 },
    { selector: ".post-pagehead-summary", minCount: 1 },
    { selector: ".post-outline-link", minCount: 1 },
  ],
} as const satisfies Record<
  PretextVisualHarnessRouteKind,
  ReadonlyArray<SelectorExpectation>
>;

function resolveRepoPath(path: string): string {
  return isAbsolute(path) ? normalize(path) : join(REPO_ROOT, path);
}

function createRoutePathname(
  routeKind: PretextVisualHarnessRouteKind,
  language: SiteLanguage,
): string {
  switch (routeKind) {
    case "home":
      return getLocalizedUrl("/", language);
    case "tag":
      return getLocalizedUrl(
        `/tags/${PRETEXT_VISUAL_HARNESS_FIXTURES.tagSlug}/`,
        language,
      );
    case "archive":
      return getLocalizedUrl("/posts/", language);
    case "post":
      return getLocalizedUrl(
        `/posts/${PRETEXT_VISUAL_HARNESS_FIXTURES.postSlug}/`,
        language,
      );
  }
}

export function buildPretextVisualHarnessStem(
  routeKind: PretextVisualHarnessRouteKind,
  language: SiteLanguage,
  viewportId: PretextVisualHarnessViewportId,
): string {
  return `${routeKind}-${getLanguageDataCode(language)}-${viewportId}`;
}

export function buildPretextVisualHarnessScenarios(): ReadonlyArray<
  PretextVisualHarnessScenario
> {
  const scenarios: PretextVisualHarnessScenario[] = [];
  const routeKinds = Object.keys(PRETEXT_VISUAL_HARNESS_SELECTORS) as Array<
    PretextVisualHarnessRouteKind
  >;
  const viewportEntries = Object.entries(
    PRETEXT_VISUAL_HARNESS_VIEWPORTS,
  ) as Array<[PretextVisualHarnessViewportId, HarnessViewport]>;

  for (const language of SUPPORTED_LANGUAGES) {
    const languageCode = getLanguageDataCode(language);
    const languageTag = getLanguageTag(language);

    for (const routeKind of routeKinds) {
      const pathname = createRoutePathname(routeKind, language);

      for (const [viewportId, viewport] of viewportEntries) {
        scenarios.push({
          stem: buildPretextVisualHarnessStem(routeKind, language, viewportId),
          routeKind,
          language,
          languageCode,
          languageTag,
          pathname,
          viewportId,
          viewport,
          selectors: PRETEXT_VISUAL_HARNESS_SELECTORS[routeKind],
        });
      }
    }
  }

  return scenarios;
}

export function resolveStaticSiteRelativePath(pathname: string): string {
  const initialPath = pathname.trim() === "" ? "/" : pathname;
  const urlPath = initialPath.startsWith("/") ? initialPath : `/${initialPath}`;
  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    throw new Error(`Invalid request path: "${pathname}"`);
  }

  if (decodedPath.includes("\0")) {
    throw new Error(`Invalid request path: "${pathname}"`);
  }

  const fileCandidate = decodedPath.endsWith("/")
    ? `${decodedPath}index.html`
    : extname(decodedPath) === ""
    ? `${decodedPath}/index.html`
    : decodedPath;
  const pathSegments = fileCandidate.split("/");

  if (pathSegments.some((segment) => segment === "..")) {
    throw new Error(
      `Refusing to serve path outside the static output: "${pathname}"`,
    );
  }

  const relativePath = normalize(fileCandidate)
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");

  if (
    relativePath.length === 0 ||
    relativePath === "." ||
    relativePath === ".." ||
    relativePath.startsWith("../")
  ) {
    throw new Error(
      `Refusing to serve path outside the static output: "${pathname}"`,
    );
  }

  return relativePath;
}

export function resolveStaticSiteContentType(filePath: string): string {
  const extension = extname(filePath).slice(1).toLowerCase();

  return extension.length === 0
    ? FALLBACK_CONTENT_TYPE
    : contentType(extension) ?? FALLBACK_CONTENT_TYPE;
}

async function* walkDirectoryFiles(
  rootDir: string,
  maxDepth: number,
): AsyncGenerator<string> {
  const queue: Array<{ path: string; depth: number }> = [{
    path: rootDir,
    depth: 0,
  }];

  while (queue.length > 0) {
    const current = queue.pop();

    if (current === undefined) {
      continue;
    }

    for await (const entry of Deno.readDir(current.path)) {
      const entryPath = join(current.path, entry.name);

      if (entry.isFile) {
        yield entryPath;
        continue;
      }

      if (entry.isDirectory && current.depth < maxDepth) {
        queue.push({ path: entryPath, depth: current.depth + 1 });
      }
    }
  }
}

function scorePlaywrightExecutablePath(filePath: string): number {
  const normalizedPath = filePath.replaceAll("\\", "/");

  if (normalizedPath.includes("/chromium_headless_shell-")) {
    return 0;
  }

  if (normalizedPath.includes("/chromium-")) {
    return 1;
  }

  return 2;
}

export async function resolvePlaywrightChromiumExecutablePath(
  browsersPath: string,
): Promise<string | undefined> {
  const resolvedBrowsersPath = resolveRepoPath(browsersPath);
  const matches: string[] = [];

  try {
    for await (const filePath of walkDirectoryFiles(resolvedBrowsersPath, 5)) {
      if (PLAYWRIGHT_EXECUTABLE_BASENAMES.has(basename(filePath))) {
        matches.push(filePath);
      }
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return undefined;
    }

    throw error;
  }

  return matches.sort((left, right) => {
    const scoreDelta = scorePlaywrightExecutablePath(left) -
      scorePlaywrightExecutablePath(right);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.localeCompare(right);
  })[0];
}

function parseCliOptions(args: ReadonlyArray<string>): ParsedCliOptions {
  const parsed = parseArgs(args, {
    string: ["base-url", "root", "output"],
    boolean: ["disable-pretext", "help"],
  });

  if (parsed.help) {
    throw createUsageError("", PRETEXT_VISUAL_HARNESS_USAGE);
  }

  if (parsed._.length > 0) {
    throw createUsageError(
      `Unexpected positional arguments: ${parsed._.join(" ")}`,
      PRETEXT_VISUAL_HARNESS_USAGE,
    );
  }

  const baseUrl = typeof parsed["base-url"] === "string"
    ? parsed["base-url"].trim()
    : undefined;
  const rootValue =
    typeof parsed.root === "string" && parsed.root.trim().length > 0
      ? parsed.root.trim()
      : "_site";
  const outputValue =
    typeof parsed.output === "string" && parsed.output.trim().length > 0
      ? parsed.output.trim()
      : ".tmp/pretext-harness";

  if (baseUrl !== undefined) {
    try {
      const url = new URL(baseUrl);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Only http:// and https:// base URLs are supported");
      }
    } catch (error) {
      throw createUsageError(
        `Invalid value for --base-url: ${getErrorMessage(error)}`,
        PRETEXT_VISUAL_HARNESS_USAGE,
      );
    }
  }

  return baseUrl === undefined
    ? {
      disablePretext: parsed["disable-pretext"] === true,
      rootDir: resolveRepoPath(rootValue),
      outputDir: resolveRepoPath(outputValue),
    }
    : {
      baseUrl,
      disablePretext: parsed["disable-pretext"] === true,
      rootDir: resolveRepoPath(rootValue),
      outputDir: resolveRepoPath(outputValue),
    };
}

function resolveHarnessVariant(
  options: Readonly<{
    disablePretext?: boolean;
    variant?: PretextHarnessVariant;
  }>,
): PretextHarnessVariant {
  return options.variant ??
    (options.disablePretext ? "without-pretext" : "with-pretext");
}

async function serveStaticSiteRequest(
  rootDir: string,
  request: Request,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "allow": "GET, HEAD",
        "content-type": "text/plain; charset=UTF-8",
      },
    });
  }

  let relativePath: string;

  try {
    relativePath = resolveStaticSiteRelativePath(new URL(request.url).pathname);
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=UTF-8" },
    });
  }

  const filePath = join(rootDir, relativePath);

  try {
    const fileInfo = await Deno.stat(filePath);

    if (!fileInfo.isFile) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=UTF-8" },
      });
    }

    const body = request.method === "HEAD"
      ? null
      : await Deno.readFile(filePath);

    return new Response(body, {
      headers: {
        "cache-control": "no-store",
        "content-type": resolveStaticSiteContentType(filePath),
      },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=UTF-8" },
      });
    }

    throw error;
  }
}

export async function startPretextVisualHarnessStaticServer(
  rootDir: string,
): Promise<PretextVisualHarnessStaticServer> {
  const rootInfo = await Deno.stat(rootDir);

  if (!rootInfo.isDirectory) {
    throw new Error(`Static site root is not a directory: ${rootDir}`);
  }

  const abortController = new AbortController();
  const server = Deno.serve(
    {
      hostname: "127.0.0.1",
      port: 0,
      signal: abortController.signal,
      onListen() {},
    },
    (request) => serveStaticSiteRequest(rootDir, request),
  );
  const address = server.addr;

  if (address.transport !== "tcp") {
    abortController.abort();
    await server.finished;
    throw new Error("Expected a TCP address for the static harness server");
  }

  return {
    baseUrl: `http://${address.hostname}:${address.port}`,
    async close(): Promise<void> {
      abortController.abort();
      await server.finished;
    },
  };
}

async function importPlaywright(): Promise<RuntimePlaywright> {
  try {
    return await import("npm/playwright");
  } catch (error) {
    throw new Error(
      `${
        getErrorMessage(error)
      }\n\nInstall Chromium with: deno task pretext:harness:install`,
    );
  }
}

function createIssue(
  severity: HarnessIssue["severity"],
  code: HarnessIssue["code"],
  scenarioStem: string,
  message: string,
): HarnessIssue {
  return { severity, code, scenarioStem, message };
}

function isGenericNetworkConsoleError(message: string): boolean {
  return message.startsWith(
    "Failed to load resource: the server responded with a status of ",
  );
}

async function evaluateScenarioPage(
  page: Awaited<ReturnType<RuntimeBrowser["newPage"]>>,
  selectors: ReadonlyArray<SelectorExpectation>,
): Promise<ScenarioEvaluationPayload> {
  return await page.evaluate((selectorExpectations) => {
    const getSamples = (selector: string): Array<SelectorMetricSample> => {
      return Array.from(document.querySelectorAll(selector))
        .slice(0, 3)
        .map((element) => {
          const style = globalThis.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const rawLineHeight = Number.parseFloat(style.lineHeight);
          const resolveCustomProperty = (name: string): string | null => {
            const value = style.getPropertyValue(name).trim();
            return value.length > 0 ? value : null;
          };

          return {
            tagName: element.tagName.toLowerCase(),
            textLength: element.textContent?.trim().length ?? 0,
            inlineSize: Number(rect.width.toFixed(2)),
            blockSize: Number(rect.height.toFixed(2)),
            lineHeight: Number.isFinite(rawLineHeight)
              ? Number(rawLineHeight.toFixed(2))
              : null,
            minBlockSize:
              style.minBlockSize === "0px" || style.minBlockSize.length === 0
                ? null
                : style.minBlockSize,
            pretextTitleHeight: resolveCustomProperty(
              "--pretext-title-height",
            ),
            pretextSummaryHeight: resolveCustomProperty(
              "--pretext-summary-height",
            ),
          };
        });
    };
    const selectorMetrics = selectorExpectations.map((selectorExpectation) => {
      const count =
        document.querySelectorAll(selectorExpectation.selector).length;

      return {
        selector: selectorExpectation.selector,
        minCount: selectorExpectation.minCount,
        count,
        samples: getSamples(selectorExpectation.selector),
      };
    });
    const clsState = (window as ClsWindowState).__pretextVisualHarness;

    return {
      documentLanguage: document.documentElement.lang || null,
      pageTitle: document.title || null,
      selectorMetrics,
      cls: {
        value: Number((clsState?.cls ?? 0).toFixed(6)),
        entries: (clsState?.entries ?? []).map((entry) => ({
          value: Number(entry.value.toFixed(6)),
          startTime: Number(entry.startTime.toFixed(2)),
        })),
      },
    };
  }, selectors);
}

async function runScenario(
  browser: RuntimeBrowser,
  baseUrl: string,
  disablePretext: boolean,
  outputDir: string,
  scenario: PretextVisualHarnessScenario,
  variant: PretextHarnessVariant,
): Promise<{ result: ScenarioResult; issues: ReadonlyArray<HarnessIssue> }> {
  const scenarioIssues: HarnessIssue[] = [];
  const screenshotPath = join(outputDir, "screenshots", `${scenario.stem}.png`);
  const screenshotPathRelative = relative(outputDir, screenshotPath).replaceAll(
    "\\",
    "/",
  );
  const url = new URL(scenario.pathname, baseUrl).toString();
  const context = await browser.newContext({
    locale: scenario.languageTag,
    viewport: scenario.viewport,
  });
  const page = await context.newPage();
  const responseErrors: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const startedAt = performance.now();

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() < 400) {
      return;
    }

    const responseUrl = new URL(response.url());
    responseErrors.push(`${response.status()} ${responseUrl.pathname}`);
  });
  page.on("pageerror", (error) => {
    pageErrors.push(getErrorMessage(error));
  });
  page.on("requestfailed", (request) => {
    requestFailures.push(
      `${request.method()} ${request.url()} (${
        request.failure()?.errorText ?? "failed"
      })`,
    );
  });

  if (disablePretext) {
    await page.addInitScript((flagName) => {
      const runtimeFlags = window as unknown as Partial<
        Record<string, boolean>
      >;
      runtimeFlags[flagName] = true;
    }, PRETEXT_DISABLE_GLOBAL_FLAG);
  }

  await page.addInitScript(() => {
    (window as ClsWindowState).__pretextVisualHarness = {
      cls: 0,
      entries: [],
    };

    if (typeof PerformanceObserver === "undefined") {
      return;
    }

    const observer = new PerformanceObserver((entryList) => {
      const state = (window as ClsWindowState).__pretextVisualHarness;

      if (!state) {
        return;
      }

      for (
        const entry of entryList.getEntries() as Array<
          PerformanceEntry & { value: number; hadRecentInput?: boolean }
        >
      ) {
        if (entry.hadRecentInput) {
          continue;
        }

        state.cls += entry.value;
        state.entries.push({
          value: entry.value,
          startTime: entry.startTime,
        });
      }
    });

    observer.observe({ type: "layout-shift", buffered: true });
  });

  try {
    const response = await page.goto(url, { waitUntil: "networkidle" });

    await page.evaluate(async () => {
      if ("fonts" in document) {
        await document.fonts.ready;
      }
    });
    await page.waitForTimeout(120);

    const status = response?.status() ?? null;

    if (status === null || status < 200 || status >= 400) {
      scenarioIssues.push(
        createIssue(
          "error",
          "unexpected-status",
          scenario.stem,
          `Unexpected navigation status for ${scenario.pathname}: ${
            status ?? "null"
          }`,
        ),
      );
    }

    const evaluation = await evaluateScenarioPage(page, scenario.selectors);

    for (const selectorMetric of evaluation.selectorMetrics) {
      if (selectorMetric.count < selectorMetric.minCount) {
        scenarioIssues.push(
          createIssue(
            "error",
            "missing-selector",
            scenario.stem,
            `Selector ${selectorMetric.selector} matched ${selectorMetric.count} node(s); expected at least ${selectorMetric.minCount}`,
          ),
        );
      }
    }

    for (const responseError of responseErrors) {
      scenarioIssues.push(
        createIssue("error", "http-error", scenario.stem, responseError),
      );
    }

    for (const consoleError of consoleErrors) {
      if (isGenericNetworkConsoleError(consoleError)) {
        continue;
      }

      scenarioIssues.push(
        createIssue("error", "console-error", scenario.stem, consoleError),
      );
    }

    for (const pageError of pageErrors) {
      scenarioIssues.push(
        createIssue("error", "page-error", scenario.stem, pageError),
      );
    }

    for (const requestFailure of requestFailures) {
      scenarioIssues.push(
        createIssue("error", "request-failure", scenario.stem, requestFailure),
      );
    }

    await page.screenshot({ fullPage: true, path: screenshotPath });

    return {
      result: {
        stem: scenario.stem,
        variant,
        routeKind: scenario.routeKind,
        language: scenario.language,
        languageCode: scenario.languageCode,
        languageTag: scenario.languageTag,
        pathname: scenario.pathname,
        viewportId: scenario.viewportId,
        viewport: scenario.viewport,
        url,
        status,
        documentLanguage: evaluation.documentLanguage,
        pageTitle: evaluation.pageTitle,
        selectorMetrics: evaluation.selectorMetrics,
        cls: evaluation.cls,
        responseErrors,
        consoleErrors,
        pageErrors,
        requestFailures,
        screenshotPath: screenshotPathRelative,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      },
      issues: scenarioIssues,
    };
  } catch (error) {
    scenarioIssues.push(
      createIssue(
        "error",
        "navigation-error",
        scenario.stem,
        getErrorMessage(error),
      ),
    );

    return {
      result: {
        stem: scenario.stem,
        variant,
        routeKind: scenario.routeKind,
        language: scenario.language,
        languageCode: scenario.languageCode,
        languageTag: scenario.languageTag,
        pathname: scenario.pathname,
        viewportId: scenario.viewportId,
        viewport: scenario.viewport,
        url,
        status: null,
        documentLanguage: null,
        pageTitle: null,
        selectorMetrics: [],
        cls: { value: 0, entries: [] },
        responseErrors,
        consoleErrors,
        pageErrors,
        requestFailures,
        screenshotPath: null,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      },
      issues: scenarioIssues,
    };
  } finally {
    await context.close();
  }
}

export async function writePretextVisualHarnessOutputs(
  report: HarnessReport,
): Promise<string> {
  const reportPath = join(report.outputDir, "report.json");
  const summaryPath = join(report.outputDir, "summary.md");
  const summaryMarkdown = buildPretextVisualHarnessSummaryMarkdown(report);

  await Deno.writeTextFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await Deno.writeTextFile(summaryPath, `${summaryMarkdown}\n`);

  return summaryPath;
}

async function publishHarnessOutputsToGitHubActions(
  report: HarnessReport,
): Promise<void> {
  await writeGitHubJobSummary(buildPretextVisualHarnessSummaryMarkdown(report));
}

export async function runPretextVisualHarness(
  options: PretextVisualHarnessRunOptions,
): Promise<HarnessReport> {
  const variant = resolveHarnessVariant(options);
  await Deno.mkdir(join(options.outputDir, "screenshots"), { recursive: true });
  await Deno.mkdir(join(options.outputDir, "tmp"), { recursive: true });

  const server = options.baseUrl === undefined
    ? await startPretextVisualHarnessStaticServer(options.rootDir)
    : undefined;
  const baseUrl = options.baseUrl ?? server?.baseUrl;
  const playwright = await importPlaywright();
  const playwrightBrowsersPath = resolveRepoPath(
    Deno.env.get("PLAYWRIGHT_BROWSERS_PATH") ?? ".tmp/playwright-browsers",
  );
  const executablePath = await resolvePlaywrightChromiumExecutablePath(
    playwrightBrowsersPath,
  );
  let browser: RuntimeBrowser | undefined;

  try {
    if (baseUrl === undefined) {
      throw new Error(
        "Unable to resolve a base URL for the Pretext visual harness",
      );
    }

    if (executablePath === undefined) {
      throw new Error(
        `Could not find a Chromium executable under ${playwrightBrowsersPath}\n\nInstall Chromium with: deno task pretext:harness:install`,
      );
    }

    try {
      browser = await playwright.chromium.launch({
        executablePath,
        headless: true,
      });
    } catch (error) {
      throw new Error(
        `${
          getErrorMessage(error)
        }\n\nInstall Chromium with: deno task pretext:harness:install`,
      );
    }

    const scenarios = buildPretextVisualHarnessScenarios();
    const results: ScenarioResult[] = [];
    const issues: HarnessIssue[] = [];

    for (const scenario of scenarios) {
      const scenarioRun = await runScenario(
        browser,
        baseUrl,
        options.disablePretext === true,
        options.outputDir,
        scenario,
        variant,
      );

      results.push(scenarioRun.result);
      issues.push(...scenarioRun.issues);
    }

    const report: HarnessReport = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      outputDir: options.outputDir,
      variant,
      scenarioCount: results.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) =>
        issue.severity === "warning"
      ).length,
      issues,
      results,
      ...(options.baseUrl === undefined ? { rootDir: options.rootDir } : {}),
    };

    return report;
  } finally {
    await browser?.close();
    await server?.close();
  }
}

if (import.meta.main) {
  if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
    console.info(PRETEXT_VISUAL_HARNESS_USAGE);
    Deno.exit(0);
  }

  try {
    const options = parseCliOptions(Deno.args);
    const report = await runPretextVisualHarness(options);
    const summaryPath = await writePretextVisualHarnessOutputs(report);
    const failureMessages: string[] = [];

    try {
      await publishHarnessOutputsToGitHubActions(report);
    } catch (error) {
      failureMessages.push(
        `GitHub Actions publication failed: ${getErrorMessage(error)}`,
      );
    }

    if (report.errorCount > 0) {
      failureMessages.push(
        `Pretext visual harness found ${report.errorCount} error(s). See ${
          join(report.outputDir, "report.json")
        }`,
      );
    }

    if (failureMessages.length > 0) {
      throw new Error(failureMessages.join("\n\n"));
    }

    console.info(
      [
        `Pretext visual harness captured ${report.scenarioCount} scenario(s).`,
        `Report: ${join(report.outputDir, "report.json")}`,
        `Summary: ${summaryPath}`,
      ].join("\n"),
    );
  } catch (error) {
    console.error(getErrorMessage(error));
    Deno.exit(1);
  }
}
