/**
 * TSX migration study for the Lume template stack.
 *
 * This script produces an inventory of the current template surface and a
 * concrete migration plan from ESM TypeScript render files to TSX.
 */

interface FileInventory {
  pageTs: string[];
  pageTsx: string[];
  includeTs: string[];
  includeTsx: string[];
  componentTs: string[];
  componentTsx: string[];
  directComponentImports: string[];
}

interface StudyResult {
  inventory: FileInventory;
  configFindings: string[];
  migrationPhases: string[];
  risks: string[];
  quickWins: string[];
}

const SCAN_ROOT = "src";

async function main(): Promise<void> {
  const inventory = await collectInventory(SCAN_ROOT);
  const configFindings = await collectConfigFindings();

  const result: StudyResult = {
    inventory,
    configFindings,
    migrationPhases: buildMigrationPhases(inventory),
    risks: buildRiskList(inventory),
    quickWins: buildQuickWins(inventory, configFindings),
  };

  printReport(result);
}

async function collectInventory(root: string): Promise<FileInventory> {
  const files = await listFiles(root);

  const pageTs = files.filter((path) => path.endsWith(".page.ts"));
  const pageTsx = files.filter((path) => path.endsWith(".page.tsx"));
  const includeTs = files.filter((path) =>
    path.startsWith("src/_includes/") && path.endsWith(".ts")
  );
  const includeTsx = files.filter((path) =>
    path.startsWith("src/_includes/") && path.endsWith(".tsx")
  );
  const componentTs = files.filter((path) =>
    path.startsWith("src/_components/") && path.endsWith(".ts")
  );
  const componentTsx = files.filter((path) =>
    path.startsWith("src/_components/") && path.endsWith(".tsx")
  );

  const directComponentImports: string[] = [];

  for (
    const filePath of files.filter((path) =>
      path.endsWith(".ts") || path.endsWith(".tsx")
    )
  ) {
    const source = await Deno.readTextFile(filePath);
    const hasDirectImport = /from\s+["'][^"']*_components\//.test(source);

    if (hasDirectImport) {
      directComponentImports.push(filePath);
    }
  }

  return {
    pageTs,
    pageTsx,
    includeTs,
    includeTsx,
    componentTs,
    componentTsx,
    directComponentImports,
  };
}

async function collectConfigFindings(): Promise<string[]> {
  const config = await Deno.readTextFile("_config.ts");
  const denoConfig = await Deno.readTextFile("deno.json");
  const findings: string[] = [];

  if (/import\s+jsx\s+from\s+["']lume\/plugins\/jsx\.ts["']/.test(config)) {
    findings.push("JSX plugin import is present in _config.ts.");
  } else {
    findings.push("JSX plugin import is missing in _config.ts.");
  }

  if (/site\.use\(\s*jsx\(/s.test(config)) {
    findings.push("site.use(jsx()) is configured.");
  } else {
    findings.push("site.use(jsx()) is not configured.");
  }

  if (/preprocess\(\["\.ts"\]/.test(config)) {
    findings.push(
      "Reading-time preprocess only targets .ts files (TSX pages would be skipped).",
    );
  }

  if (/"jsx"\s*:\s*"react-jsx"/.test(denoConfig)) {
    findings.push("deno.json compilerOptions.jsx is already set to react-jsx.");
  }

  if (/"jsxImportSource"\s*:\s*"lume"/.test(denoConfig)) {
    findings.push(
      "deno.json compilerOptions.jsxImportSource is already set to lume.",
    );
  }

  if (/"lume\/jsx-runtime"\s*:/.test(denoConfig)) {
    findings.push("lume/jsx-runtime import mapping is present.");
  }

  return findings;
}

function buildMigrationPhases(inventory: FileInventory): string[] {
  return [
    "Phase 0 — Preconditions: enable and verify JSX plugin in _config.ts, then confirm .tsx files are discovered by Lume.",
    "Phase 1 — Layout migration: move files under src/_includes from .ts render functions to .tsx and replace string concatenation with JSX nodes where needed.",
    `Phase 2 — Page migration: convert ${inventory.pageTs.length} .page.ts files incrementally to .page.tsx, starting with low-risk static pages.`,
    "Phase 3 — Component migration: move shared render helpers in src/_components to .tsx and enforce rendering via comp.* to preserve live-reload behavior.",
    "Phase 4 — Behavior parity: ensure preprocess/process hooks in _config.ts include both .ts and .tsx extensions.",
    "Phase 5 — Validation: run fmt, lint, type-check, tests, and build after each batch; add visual smoke checks for changed routes.",
  ];
}

function buildRiskList(inventory: FileInventory): string[] {
  const risks: string[] = [
    "If JSX plugin is not enabled, .page.tsx and .tsx layouts will not render at build time.",
    "TSX cannot use client-side handlers (onClick, etc.) for static rendering without additional browser bundling.",
    "children must be used in TSX layouts instead of content to avoid escaped output.",
    "Mixed templates increase cognitive load during transition; enforce a short migration window.",
  ];

  if (inventory.directComponentImports.length > 0) {
    risks.push(
      "Direct imports from _components were detected; these can reduce live-reload reliability and should be migrated to comp.* usage.",
    );
  }

  return risks;
}

function buildQuickWins(
  inventory: FileInventory,
  configFindings: string[],
): string[] {
  const quickWins: string[] = [];

  if (configFindings.some((item) => item.includes("not configured"))) {
    quickWins.push("Add jsx plugin registration in _config.ts immediately.");
  }

  if (configFindings.some((item) => item.includes("only targets .ts"))) {
    quickWins.push(
      "Expand preprocess extension lists from [.ts] to [.ts, .tsx] where applicable.",
    );
  }

  if (inventory.pageTsx.length === 0) {
    quickWins.push(
      "Create one pilot .page.tsx page to validate rendering pipeline before full migration.",
    );
  }

  quickWins.push(
    "Define codemod rules for extension renames and default export JSX signatures.",
  );

  return quickWins;
}

async function listFiles(root: string): Promise<string[]> {
  const acc: string[] = [];
  await walkDirectory(root, acc);
  return acc.sort();
}

async function walkDirectory(dir: string, acc: string[]): Promise<void> {
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`;

    if (entry.isDirectory) {
      await walkDirectory(fullPath, acc);
      continue;
    }

    if (entry.isFile) {
      acc.push(fullPath);
    }
  }
}

function printReport(result: StudyResult): void {
  console.log("=== TSX MIGRATION STUDY (LUME) ===");
  console.log("");
  console.log("Inventory");
  console.log(`- .page.ts: ${result.inventory.pageTs.length}`);
  console.log(`- .page.tsx: ${result.inventory.pageTsx.length}`);
  console.log(`- _includes/*.ts: ${result.inventory.includeTs.length}`);
  console.log(`- _includes/*.tsx: ${result.inventory.includeTsx.length}`);
  console.log(`- _components/*.ts: ${result.inventory.componentTs.length}`);
  console.log(`- _components/*.tsx: ${result.inventory.componentTsx.length}`);
  console.log(
    `- files with direct _components imports: ${result.inventory.directComponentImports.length}`,
  );

  console.log("");
  console.log("Configuration findings");
  for (const finding of result.configFindings) {
    console.log(`- ${finding}`);
  }

  console.log("");
  console.log("Recommended migration phases");
  for (const phase of result.migrationPhases) {
    console.log(`- ${phase}`);
  }

  console.log("");
  console.log("Risks and watchpoints");
  for (const risk of result.risks) {
    console.log(`- ${risk}`);
  }

  console.log("");
  console.log("Quick wins");
  for (const item of result.quickWins) {
    console.log(`- ${item}`);
  }

  if (result.inventory.directComponentImports.length > 0) {
    console.log("");
    console.log("Files using direct _components imports");
    for (const filePath of result.inventory.directComponentImports) {
      console.log(`- ${filePath}`);
    }
  }
}

if (import.meta.main) {
  await main();
}
