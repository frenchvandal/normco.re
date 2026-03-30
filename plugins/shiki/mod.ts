import { pooledMap } from "@std/async/pool";
import type { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";
import type { Plugin } from "lume/core/site.ts";
import {
  type BundledLanguage,
  type BundledTheme,
  type CodeToHastOptions,
  type Highlighter,
} from "shiki";

import type {
  ShikiHighlighterOptions,
  ShikiPluginOptions,
  ShikiRenderOptions,
} from "./types.ts";

interface ResolvedShikiPluginOptions {
  readonly extensions: readonly string[];
  readonly cssSelector: string;
  readonly highlighter: Partial<ShikiHighlighterOptions>;
  readonly render: ShikiRenderOptions;
  readonly concurrency: number;
  readonly onError: "ignore" | "warn";
  readonly resolveLanguage: (element: Element) => string | undefined;
}

type ShikiModule = typeof import("shiki");

const SHIKI_DEBUG_ENV_NAME = "VSCODE_TEXTMATE_DEBUG";
let shikiModulePromise: Promise<ShikiModule> | undefined;
let processEnvMutationQueue = Promise.resolve();

export const defaults = {
  extensions: [".html"],
  cssSelector: "pre > code[class*='language-']",
  concurrency: 4,
  onError: "warn",
} as const satisfies Pick<
  ResolvedShikiPluginOptions,
  "concurrency" | "cssSelector" | "extensions" | "onError"
>;

function mergeClassNames(
  currentClassName: string | null,
  nextClassName: string | null,
): string | undefined {
  const mergedClassNames = new Set(
    `${currentClassName ?? ""} ${nextClassName ?? ""}`.trim().split(/\s+/)
      .filter(Boolean),
  );

  return mergedClassNames.size > 0
    ? Array.from(mergedClassNames).join(" ")
    : undefined;
}

function applyRenderedAttributes(target: Element, source: Element): void {
  for (const attributeName of source.getAttributeNames()) {
    if (attributeName === "class") {
      const mergedClassName = mergeClassNames(
        target.getAttribute("class"),
        source.getAttribute("class"),
      );

      if (mergedClassName) {
        target.setAttribute("class", mergedClassName);
      }

      continue;
    }

    target.setAttribute(
      attributeName,
      source.getAttribute(attributeName) ?? "",
    );
  }
}

function defaultResolveLanguage(element: Element): string | undefined {
  const languageMatch = element.getAttribute("class")?.match(
    /(?:^|\s)language-([A-Za-z0-9_+-]+)/,
  );

  return languageMatch?.[1];
}

function dedupe<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function extractConfiguredThemes(render: ShikiRenderOptions): unknown[] {
  if (
    "themes" in render && render.themes && typeof render.themes === "object"
  ) {
    return Object.values(render.themes);
  }

  if ("theme" in render && render.theme !== undefined) {
    return [render.theme];
  }

  return [];
}

function resolveRenderOptions(
  userOptions: ShikiPluginOptions,
): ShikiRenderOptions {
  const render = {
    defaultColor: false,
    ...(userOptions.render ?? {}),
  } as Record<string, unknown>;

  if (!("theme" in render) && !("themes" in render)) {
    const fallbackTheme = userOptions.highlighter?.themes?.[0] ??
      "vitesse-light";
    render.theme = fallbackTheme;
  }

  return render as unknown as ShikiRenderOptions;
}

async function getOptionalEnvVariable(
  variable: string,
): Promise<string | undefined> {
  const permission = await Deno.permissions.query(
    {
      name: "env",
      variable,
    } as const,
  );

  if (permission.state !== "granted") {
    return undefined;
  }

  return Deno.env.get(variable) ?? undefined;
}

async function withTemporaryProcessEnv<T>(
  env: Readonly<Record<string, string>>,
  callback: () => Promise<T>,
): Promise<T> {
  const previousMutation = processEnvMutationQueue;
  let releaseMutation: (() => void) | undefined;
  const nextMutation = new Promise<void>((resolve) => {
    releaseMutation = resolve;
  });
  if (!releaseMutation) {
    throw new Error(
      "Failed to initialize the Shiki process env mutation gate.",
    );
  }
  processEnvMutationQueue = nextMutation;

  await previousMutation;

  const processDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "process",
  );
  const currentProcess = Reflect.get(globalThis, "process") as unknown as
    | Record<string, unknown>
    | undefined;
  const nextProcess =
    typeof currentProcess === "object" && currentProcess !== null
      ? Object.assign(Object.create(currentProcess), { env: { ...env } })
      : { env: { ...env } };

  Object.defineProperty(globalThis, "process", {
    configurable: processDescriptor?.configurable ?? true,
    enumerable: processDescriptor?.enumerable ?? true,
    writable: processDescriptor?.writable ?? true,
    value: nextProcess,
  });

  try {
    return await callback();
  } finally {
    if (processDescriptor) {
      Object.defineProperty(globalThis, "process", processDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "process");
    }

    releaseMutation();
  }
}

function importShikiModule(): Promise<ShikiModule> {
  if (!shikiModulePromise) {
    shikiModulePromise = import("shiki").catch((error) => {
      shikiModulePromise = undefined;
      throw error;
    });
  }

  return shikiModulePromise;
}

async function createShikiHighlighter(
  options: ResolvedShikiPluginOptions,
): Promise<Highlighter> {
  const debugValue = await getOptionalEnvVariable(SHIKI_DEBUG_ENV_NAME);
  const safeEnv = debugValue === undefined
    ? {}
    : { [SHIKI_DEBUG_ENV_NAME]: debugValue };

  // Shiki's vscode-textmate dependency reads `process.env` while its
  // highlighter stack initializes. In plain `deno test` runs we may not have
  // env permission for that variable, so cover both module import and
  // highlighter construction with a temporary process shim.
  return await withTemporaryProcessEnv(safeEnv, async () => {
    const shikiModule = await importShikiModule();
    return await shikiModule.createHighlighter(
      resolveHighlighterOptions(
        options.highlighter,
        options.render,
        shikiModule,
      ),
    );
  });
}

function resolveHighlighterOptions(
  highlighter: Partial<ShikiHighlighterOptions>,
  render: ShikiRenderOptions,
  shikiModule: ShikiModule,
): ShikiHighlighterOptions {
  const configuredThemes = dedupe(extractConfiguredThemes(render));
  const configuredLanguages = highlighter.langs?.length
    ? [...highlighter.langs]
    : Object.keys(shikiModule.bundledLanguages) as BundledLanguage[];

  return {
    ...highlighter,
    langs: configuredLanguages,
    themes: highlighter.themes?.length
      ? dedupe([...highlighter.themes])
      : (configuredThemes.length > 0 ? configuredThemes : ["vitesse-light"]),
  } as ShikiHighlighterOptions;
}

function resolveOptions(
  userOptions: ShikiPluginOptions = {},
): ResolvedShikiPluginOptions {
  const render = resolveRenderOptions(userOptions);

  return {
    concurrency: Math.max(
      1,
      Math.trunc(userOptions.concurrency ?? defaults.concurrency),
    ),
    cssSelector: userOptions.cssSelector ?? defaults.cssSelector,
    extensions: userOptions.extensions ?? defaults.extensions,
    highlighter: userOptions.highlighter ?? {},
    onError: userOptions.onError ?? defaults.onError,
    render,
    resolveLanguage: userOptions.resolveLanguage ?? defaultResolveLanguage,
  };
}

function reportHighlightError(
  page: Page,
  options: ResolvedShikiPluginOptions,
  error: unknown,
  language?: string,
): void {
  if (options.onError !== "warn") {
    return;
  }

  const languageLabel = language ? ` (${language})` : "";
  console.warn(
    `[shiki plugin] Error highlighting code block in ${page.sourcePath}${languageLabel}: ${error}`,
  );
}

async function highlightPage(
  page: Page,
  options: ResolvedShikiPluginOptions,
  loadHighlighter: () => Promise<Highlighter>,
): Promise<void> {
  const document = page.document;

  if (!document) {
    return;
  }

  const sourceBlocks = document.querySelectorAll(options.cssSelector);

  if (sourceBlocks.length === 0) {
    return;
  }

  const highlighter = await loadHighlighter();

  for (const sourceCode of sourceBlocks) {
    const sourcePre = sourceCode.parentElement;

    if (!sourcePre) {
      continue;
    }

    const code = sourceCode.textContent ?? "";
    const language = options.resolveLanguage(sourceCode);

    if (code.length === 0 || !language) {
      continue;
    }

    const container = document.createElement("div");

    try {
      container.innerHTML = highlighter.codeToHtml(
        code,
        {
          ...options.render,
          lang: language,
        } as CodeToHastOptions<BundledLanguage, BundledTheme>,
      );
    } catch (error) {
      reportHighlightError(page, options, error, language);
      continue;
    }

    const renderedPre = container.querySelector("pre");
    const renderedCode = renderedPre?.querySelector("code");

    if (!renderedPre || !renderedCode) {
      continue;
    }

    sourceCode.innerHTML = renderedCode.innerHTML;
    applyRenderedAttributes(sourcePre, renderedPre);
    applyRenderedAttributes(sourceCode, renderedCode);
  }
}

/** A Lume plugin to syntax-highlight code using Shiki. */
export default function shiki(userOptions: ShikiPluginOptions = {}): Plugin {
  const options = resolveOptions(userOptions);
  let highlighterPromise: Promise<Highlighter> | undefined;

  function loadHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
      highlighterPromise = createShikiHighlighter(options).catch((error) => {
        highlighterPromise = undefined;
        throw error;
      });
    }

    return highlighterPromise;
  }

  return (site: Site) => {
    if (site._data.codeHighlight) {
      console.error(
        `[shiki plugin] The plugin "${site._data.codeHighlight}" is already registered for the same purpose as "shiki". Registering "shiki" may lead to conflicts and unpredictable behavior.`,
      );
    }
    site._data.codeHighlight = "shiki";

    site.process([...options.extensions], async (pages) => {
      for await (
        const _ of pooledMap(
          options.concurrency,
          pages,
          (page: Page) => highlightPage(page, options, loadHighlighter),
        )
      ) {
        // Exhaust the pooled iterator to keep processing bounded but ordered.
      }
    });
  };
}

export type {
  ShikiHighlighterOptions,
  ShikiPluginOptions,
  ShikiRenderOptions,
} from "./types.ts";
