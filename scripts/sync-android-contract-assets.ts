import { parseArgs } from "jsr/cli";
import { join } from "jsr/path";

const REPO_ROOT = join(import.meta.dirname ?? ".", "..");
const DEFAULT_SITE_DIR = join(REPO_ROOT, "_site");
const DEFAULT_ASSETS_DIR = join(
  REPO_ROOT,
  "apps",
  "android",
  "app",
  "src",
  "main",
  "assets",
  "bootstrap",
);

type ContractAssetCopy = {
  readonly source: string;
  readonly destination: string;
};

const POSTS_INDEX_ASSET_INPUTS = [
  { lang: "en", pathPrefix: "" },
  { lang: "fr", pathPrefix: "fr" },
  { lang: "zh-hans", pathPrefix: "zh-hans" },
  { lang: "zh-hant", pathPrefix: "zh-hant" },
] as const;

export function getAndroidContractAssetCopies(
  siteDir: string = DEFAULT_SITE_DIR,
  assetsDir: string = DEFAULT_ASSETS_DIR,
): ReadonlyArray<ContractAssetCopy> {
  return [
    {
      source: join(siteDir, "api", "app-manifest.json"),
      destination: join(assetsDir, "app-manifest.json"),
    },
    ...POSTS_INDEX_ASSET_INPUTS.map(({ lang, pathPrefix }) => ({
      source: pathPrefix.length > 0
        ? join(siteDir, pathPrefix, "api", "posts", "index.json")
        : join(siteDir, "api", "posts", "index.json"),
      destination: join(assetsDir, `posts-index-${lang}.json`),
    })),
  ];
}

function normalizeComparableJson(
  content: string,
  options: { readonly ignoreGeneratedAt?: boolean } = {},
): string {
  const parsed = JSON.parse(content) as Record<string, unknown>;

  if (options.ignoreGeneratedAt) {
    delete parsed.generatedAt;
  }

  return JSON.stringify(parsed);
}

export function needsAndroidContractAssetWrite(
  sourceContent: string,
  destinationContent: string,
  destinationPath: string,
): boolean {
  const ignoreGeneratedAt = destinationPath.endsWith("app-manifest.json");

  return normalizeComparableJson(sourceContent, { ignoreGeneratedAt }) !==
    normalizeComparableJson(destinationContent, { ignoreGeneratedAt });
}

async function shouldWriteAssetCopy(copy: ContractAssetCopy): Promise<boolean> {
  const sourceContent = await Deno.readTextFile(copy.source);

  try {
    const destinationContent = await Deno.readTextFile(copy.destination);
    return needsAndroidContractAssetWrite(
      sourceContent,
      destinationContent,
      copy.destination,
    );
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return true;
    }

    throw error;
  }
}

export async function syncAndroidContractAssets(
  siteDir: string = DEFAULT_SITE_DIR,
  assetsDir: string = DEFAULT_ASSETS_DIR,
): Promise<void> {
  const copies = getAndroidContractAssetCopies(siteDir, assetsDir);

  await Deno.mkdir(assetsDir, { recursive: true });

  for (const { source, destination } of copies) {
    if (!(await shouldWriteAssetCopy({ source, destination }))) {
      console.info(`[android-contracts] up-to-date ${destination}`);
      continue;
    }

    const content = await Deno.readTextFile(source);
    await Deno.writeTextFile(destination, content);
    console.info(`[android-contracts] ${source} -> ${destination}`);
  }
}

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    string: ["site-dir", "assets-dir"],
    default: {
      "site-dir": DEFAULT_SITE_DIR,
      "assets-dir": DEFAULT_ASSETS_DIR,
    },
  });

  const siteDir = typeof args["site-dir"] === "string"
    ? args["site-dir"]
    : DEFAULT_SITE_DIR;
  const assetsDir = typeof args["assets-dir"] === "string"
    ? args["assets-dir"]
    : DEFAULT_ASSETS_DIR;

  await syncAndroidContractAssets(siteDir, assetsDir);
}
