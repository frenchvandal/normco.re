import { join } from "jsr/path";

import { SELECTIVE_CARBON_COMPONENTS } from "../src/scripts/carbon.js";

const CARBON_COMPONENT_ENTRY_ROOT =
  "npm:@carbon/web-components@2.50.0/es/components";
const CARBON_VENDOR_OUTPUT_DIR = "scripts/carbon-vendor";

/** One selective Carbon component registration entry. */
export type SelectiveCarbonComponent = {
  readonly modulePath: string;
};

/** Returns the deterministic vendor bundle entry file name for a component module path. */
export function getCarbonVendorEntryFileName(modulePath: string): string {
  const entryFileName = modulePath.replace(/^\/+/, "");

  if (entryFileName.length === 0 || entryFileName.endsWith("/")) {
    throw new Error(`Invalid Carbon component module path: ${modulePath}`);
  }

  return entryFileName;
}

/**
 * Builds the module-path -> entry-file map and throws when two modules would
 * overwrite the same bundled entry output file.
 */
export function buildCarbonVendorEntryMap(
  components: ReadonlyArray<SelectiveCarbonComponent>,
): ReadonlyMap<string, string> {
  const entryByModulePath = new Map<string, string>();
  const modulePathByEntry = new Map<string, string>();

  for (const { modulePath } of components) {
    const entryFileName = getCarbonVendorEntryFileName(modulePath);
    const existingModulePath = modulePathByEntry.get(entryFileName);

    if (existingModulePath !== undefined) {
      throw new Error(
        [
          "Cannot build self-hosted Carbon vendor bundles due to duplicate entry path",
          `Entry path: ${entryFileName}`,
          `First module: ${existingModulePath}`,
          `Conflicting module: ${modulePath}`,
        ].join("\n"),
      );
    }

    modulePathByEntry.set(entryFileName, modulePath);
    entryByModulePath.set(modulePath, entryFileName);
  }

  return entryByModulePath;
}

function createEntrypoints(entryMap: ReadonlyMap<string, string>): string[] {
  return Array.from(entryMap.keys()).map((modulePath) =>
    `${CARBON_COMPONENT_ENTRY_ROOT}/${modulePath}`
  );
}

async function removeDirectoryIfPresent(path: string): Promise<void> {
  try {
    await Deno.remove(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

async function runBundle(
  outputDir: string,
  entrypoints: ReadonlyArray<string>,
): Promise<void> {
  const command = new Deno.Command("deno", {
    args: [
      "bundle",
      "--platform",
      "browser",
      "--code-splitting",
      "--outdir",
      outputDir,
      ...entrypoints,
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await command.output();

  if (output.success) {
    return;
  }

  const stderr = new TextDecoder().decode(output.stderr).trim();
  throw new Error(
    [
      "Failed to build self-hosted Carbon vendor modules",
      stderr.length > 0 ? stderr : "No stderr output was produced",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const siteRoot = Deno.args[0] ?? "_site";
  const outputDir = join(siteRoot, CARBON_VENDOR_OUTPUT_DIR);
  const entryMap = buildCarbonVendorEntryMap(SELECTIVE_CARBON_COMPONENTS);
  const entrypoints = createEntrypoints(entryMap);

  await removeDirectoryIfPresent(outputDir);
  await Deno.mkdir(outputDir, { recursive: true });
  await runBundle(outputDir, entrypoints);

  console.info(
    `[carbon-vendor] Bundled ${entryMap.size} selective Carbon entries into ${outputDir}`,
  );

  for (const [modulePath, entryFileName] of entryMap) {
    console.info(
      `[carbon-vendor] ${modulePath} -> /scripts/carbon-vendor/${entryFileName}`,
    );
  }
}

if (import.meta.main) {
  await main();
}
