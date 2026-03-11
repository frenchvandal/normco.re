import { basename, extname, join } from "jsr/path";

const HASH_LENGTH = 10;
const TEXT_EXTENSIONS = new Set([".html", ".xml", ".xsl", ".js", ".css"]);
const CANONICAL_ASSET_URLS = [
  "/style.css",
  "/scripts/theme-toggle.js",
  "/scripts/disclosure-controls.js",
  "/scripts/anti-flash.js",
  "/scripts/language-preference.js",
  "/scripts/feed-copy.js",
  "/scripts/sw-register.js",
  "/scripts/archive-year-nav.js",
  "/scripts/pagefind-lazy-init.js",
] as const;
const SERVICE_WORKER_VERSION_PLACEHOLDER = "__SW_VERSION__";

type AssetRewrite = {
  sourceUrl: string;
  fingerprintedUrl: string;
  sourceMapUrl?: string;
  fingerprintedMapUrl?: string;
};

function toOutputPath(rootDir: string, urlPath: string): string {
  return join(
    rootDir,
    ...urlPath.split("/").filter((segment) => segment.length > 0),
  );
}

function toFingerprintedUrl(urlPath: string, hash: string): string {
  const extension = extname(urlPath);
  const basePath = extension.length > 0
    ? urlPath.slice(0, -extension.length)
    : urlPath;

  return `${basePath}.${hash}${extension}`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

async function hashContent(content: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", content.slice());
  const bytes = Array.from(new Uint8Array(digest));
  const hash = bytes.map((value) => value.toString(16).padStart(2, "0")).join(
    "",
  );

  return hash.slice(0, HASH_LENGTH);
}

function updateSourceMapReference(code: string, mapFileName: string): string {
  return code.replace(
    /sourceMappingURL=(?:\.\/)?[^\s*]+/g,
    `sourceMappingURL=./${mapFileName}`,
  );
}

async function fingerprintAsset(
  rootDir: string,
  sourceUrl: string,
): Promise<AssetRewrite> {
  const sourcePath = toOutputPath(rootDir, sourceUrl);
  const sourceBytes = await Deno.readFile(sourcePath);
  const hash = await hashContent(sourceBytes);
  const fingerprintedUrl = toFingerprintedUrl(sourceUrl, hash);
  const fingerprintedPath = toOutputPath(rootDir, fingerprintedUrl);

  await Deno.rename(sourcePath, fingerprintedPath);

  const sourceMapPath = `${sourcePath}.map`;
  const sourceMapExists = await fileExists(sourceMapPath);

  if (!sourceMapExists) {
    return {
      sourceUrl,
      fingerprintedUrl,
    };
  }

  const sourceMapUrl = `${sourceUrl}.map`;
  const fingerprintedMapUrl = `${fingerprintedUrl}.map`;
  const fingerprintedMapPath = `${fingerprintedPath}.map`;
  const mapFileName = basename(fingerprintedMapPath);

  await Deno.rename(sourceMapPath, fingerprintedMapPath);

  const fingerprintedCode = await Deno.readTextFile(fingerprintedPath);
  const codeWithUpdatedSourceMap = updateSourceMapReference(
    fingerprintedCode,
    mapFileName,
  );

  if (codeWithUpdatedSourceMap !== fingerprintedCode) {
    await Deno.writeTextFile(fingerprintedPath, codeWithUpdatedSourceMap);
  }

  return {
    sourceUrl,
    fingerprintedUrl,
    sourceMapUrl,
    fingerprintedMapUrl,
  };
}

async function* walkFiles(rootDir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(rootDir)) {
    const path = join(rootDir, entry.name);

    if (entry.isDirectory) {
      yield* walkFiles(path);
      continue;
    }

    if (entry.isFile) {
      yield path;
    }
  }
}

function isTextFile(path: string): boolean {
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase());
}

function applyRewrites(
  content: string,
  rewrites: ReadonlyArray<[string, string]>,
): string {
  let nextContent = content;

  for (const [sourceValue, targetValue] of rewrites) {
    nextContent = nextContent.replaceAll(sourceValue, targetValue);
  }

  return nextContent;
}

async function rewriteUrlsInSiteOutput(
  rootDir: string,
  rewrites: ReadonlyArray<[string, string]>,
): Promise<void> {
  for await (const path of walkFiles(rootDir)) {
    if (!isTextFile(path)) {
      continue;
    }

    const original = await Deno.readTextFile(path);
    const rewritten = applyRewrites(original, rewrites);

    if (rewritten !== original) {
      await Deno.writeTextFile(path, rewritten);
    }
  }
}

async function injectServiceWorkerVersion(rootDir: string): Promise<string> {
  const swPath = toOutputPath(rootDir, "/sw.js");
  const swCode = await Deno.readTextFile(swPath);
  const swVersion = await hashContent(new TextEncoder().encode(swCode));
  const versionedSwCode = swCode.replaceAll(
    SERVICE_WORKER_VERSION_PLACEHOLDER,
    swVersion,
  );

  if (versionedSwCode !== swCode) {
    await Deno.writeTextFile(swPath, versionedSwCode);
  }

  return swVersion;
}

async function main(): Promise<void> {
  const rootDir = Deno.args[0] ?? "_site";
  const rewrites: [string, string][] = [];

  for (const sourceUrl of CANONICAL_ASSET_URLS) {
    const rewrite = await fingerprintAsset(rootDir, sourceUrl);
    rewrites.push([rewrite.sourceUrl, rewrite.fingerprintedUrl]);

    if (
      rewrite.sourceMapUrl !== undefined &&
      rewrite.fingerprintedMapUrl !== undefined
    ) {
      rewrites.push([rewrite.sourceMapUrl, rewrite.fingerprintedMapUrl]);
    }
  }

  const orderedRewrites = rewrites.sort(([left], [right]) =>
    right.length - left.length
  );

  await rewriteUrlsInSiteOutput(rootDir, orderedRewrites);
  const swVersion = await injectServiceWorkerVersion(rootDir);

  for (const [sourceUrl, fingerprintedUrl] of orderedRewrites) {
    console.info(`[fingerprint] ${sourceUrl} -> ${fingerprintedUrl}`);
  }
  console.info(`[fingerprint] /sw.js version -> ${swVersion}`);
}

await main();
