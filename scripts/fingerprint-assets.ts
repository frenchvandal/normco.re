import { parseArgs } from "@std/cli";
import { encodeHex } from "@std/encoding/hex";
import { walk } from "@std/fs";
import { basename, extname, join } from "@std/path";
import { fileExists, getErrorMessage } from "./_shared.ts";

const HASH_LENGTH = 10;
const TEXT_EXTENSIONS = new Set([".html", ".xml", ".xsl", ".js", ".css"]);

/**
 * Canonical asset URLs to fingerprint.
 * Must match the canonical asset paths emitted by the Lume asset pipeline in
 * _config/assets.ts, whether they originate from site.add() or site.copy().
 * Service worker files are excluded — they use internal versioning instead.
 */
const CANONICAL_ASSET_URLS = [
  "/style.css",
  "/scripts/header-client.js",
  "/scripts/header-client/init.js",
  "/scripts/header-client/search.js",
  "/scripts/header-client/theme.js",
  "/scripts/about-contact-toggletips.js",
  "/scripts/language-preference.js",
  "/scripts/feed-copy.js",
  "/scripts/post-code-copy.js",
  "/scripts/surface-controls.js",
  "/scripts/link-prefetch-intent.js",
  "/scripts/sw-register.js",
] as const;
const SERVICE_WORKER_VERSION_PLACEHOLDER = "__SW_VERSION__";
const SERVICE_WORKER_VERSION_SOURCES = [
  "/sw.js",
] as const;

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

function normalizeSlashes(value: string): string {
  return value.replaceAll("\\", "/");
}

function toSiteUrl(rootDir: string, outputPath: string): string {
  const normalizedRootDir = normalizeSlashes(rootDir).replace(/\/+$/, "");
  const normalizedOutputPath = normalizeSlashes(outputPath);
  const relativePath = normalizedOutputPath.startsWith(`${normalizedRootDir}/`)
    ? normalizedOutputPath.slice(normalizedRootDir.length + 1)
    : normalizedOutputPath;
  return `/${relativePath}`;
}

function getUrlDirectory(urlPath: string): string {
  const lastSlash = urlPath.lastIndexOf("/");
  return lastSlash > 0 ? urlPath.slice(0, lastSlash) : "/";
}

function toRelativeUrlPath(fromDir: string, toPath: string): string {
  const fromSegments = fromDir.split("/").filter((segment) =>
    segment.length > 0
  );
  const toSegments = toPath.split("/").filter((segment) => segment.length > 0);
  let sharedLength = 0;

  while (
    sharedLength < fromSegments.length &&
    sharedLength < toSegments.length &&
    fromSegments[sharedLength] === toSegments[sharedLength]
  ) {
    sharedLength += 1;
  }

  const upSegments = new Array(fromSegments.length - sharedLength).fill("..");
  const downSegments = toSegments.slice(sharedLength);
  const relativePath = [...upSegments, ...downSegments].join("/");

  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

async function hashContent(content: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", content.slice());
  const hash = encodeHex(new Uint8Array(digest));

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

  try {
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
  } catch (error) {
    throw new Error(
      `Failed to fingerprint asset ${sourceUrl} (${sourcePath}): ${
        getErrorMessage(error)
      }`,
      { cause: error },
    );
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
  for await (
    const entry of walk(rootDir, {
      includeDirs: false,
    })
  ) {
    if (!isTextFile(entry.path)) {
      continue;
    }

    const original = await Deno.readTextFile(entry.path);
    const currentUrl = toSiteUrl(rootDir, entry.path);
    const currentDir = getUrlDirectory(currentUrl);
    const scopedRewrites = extname(entry.path).toLowerCase() === ".js"
      ? [
        ...rewrites,
        ...rewrites.map(([sourceValue, targetValue]) => {
          return [
            toRelativeUrlPath(currentDir, sourceValue),
            toRelativeUrlPath(currentDir, targetValue),
          ] as [string, string];
        }),
      ].sort(([left], [right]) => right.length - left.length)
      : rewrites;
    const rewritten = applyRewrites(original, scopedRewrites);

    if (rewritten !== original) {
      await Deno.writeTextFile(entry.path, rewritten);
    }
  }
}

function parseCliArgs(args: ReadonlyArray<string>): { rootDir: string } {
  const parsedArgs = parseArgs(args);
  const rootDirArg = parsedArgs._[0];

  return {
    rootDir: typeof rootDirArg === "string" ? rootDirArg : "_site",
  };
}

async function injectServiceWorkerVersion(rootDir: string): Promise<string> {
  const swPath = toOutputPath(rootDir, "/sw.js");
  const swCode = await Deno.readTextFile(swPath);
  const swVersionInputs = await Promise.all(
    SERVICE_WORKER_VERSION_SOURCES.map(async (sourcePath) => {
      const sourceCode = await Deno.readTextFile(
        toOutputPath(rootDir, sourcePath),
      );

      return `// ${sourcePath}\n${sourceCode}`;
    }),
  );
  const swVersionMaterial = swVersionInputs.join("\n\n");
  const swVersion = await hashContent(
    new TextEncoder().encode(swVersionMaterial),
  );
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
  const { rootDir } = parseCliArgs(Deno.args);
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
  console.info(`[fingerprint] service worker graph version -> ${swVersion}`);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(`[fingerprint] ${getErrorMessage(error)}`);
    Deno.exit(1);
  }
}
