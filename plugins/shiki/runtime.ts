/**
 * The import map now resolves `"shiki"` to this wrapper instead of pointing
 * straight at the npm package.
 *
 * We do that because Shiki's `@shikijs/vscode-textmate` dependency touches
 * `process.env.VSCODE_TEXTMATE_DEBUG` during module initialization. In plain
 * Deno runs, especially tests, that can throw `NotCapable` when env permission
 * for that variable has not been granted.
 *
 * By funneling all `shiki` imports through this file, we can query the specific
 * env permission first and temporarily expose a minimal `process.env` shim while
 * the npm module initializes and creates highlighters. That keeps the rest of
 * the codebase using the normal `"shiki"` specifier without baking permission
 * workarounds into every caller.
 *
 * The actual npm dependency stays declared in the import map as `"npm/shiki"`,
 * so `deno outdated --update --latest` can still update it cleanly.
 */
import type { createHighlighter as createHighlighterType } from "npm/shiki";

const SHIKI_DEBUG_ENV_NAME = "VSCODE_TEXTMATE_DEBUG";

type NpmShikiModule = typeof import("npm/shiki");

let npmShikiModulePromise: Promise<NpmShikiModule> | undefined;
// Serialize temporary `globalThis.process` shims so concurrent imports or
// highlighter creation cannot stomp on each other's minimal env state.
let processEnvMutationQueue = Promise.resolve();

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

async function getSafeEnv(): Promise<Record<string, string>> {
  const debugValue = await getOptionalEnvVariable(SHIKI_DEBUG_ENV_NAME);

  return debugValue === undefined ? {} : { [SHIKI_DEBUG_ENV_NAME]: debugValue };
}

function importNpmShiki(): Promise<NpmShikiModule> {
  if (!npmShikiModulePromise) {
    npmShikiModulePromise = (async () => {
      const safeEnv = await getSafeEnv();

      return await withTemporaryProcessEnv(
        safeEnv,
        () => import("npm/shiki"),
      );
    })().catch((error) => {
      // Reset the cache on failure so a later call can retry after permissions
      // or dependency issues have been fixed.
      npmShikiModulePromise = undefined;
      throw error;
    });
  }

  return npmShikiModulePromise;
}

const npmShiki = await importNpmShiki();

export const bundledLanguages = npmShiki.bundledLanguages;

export async function createHighlighter(
  ...args: Parameters<typeof createHighlighterType>
): ReturnType<typeof createHighlighterType> {
  const safeEnv = await getSafeEnv();

  // Shiki can consult the debug env during highlighter construction as well as
  // module initialization, so we reapply the same narrow shim here.
  return await withTemporaryProcessEnv(
    safeEnv,
    () => npmShiki.createHighlighter(...args),
  );
}

export type {
  BundledHighlighterOptions,
  BundledLanguage,
  BundledTheme,
  CodeOptionsMultipleThemes,
  CodeOptionsSingleTheme,
  CodeToHastOptions,
  Highlighter,
} from "npm/shiki";
