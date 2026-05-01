import { assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { withTempDir } from "../test/temp_fs.ts";

import {
  CANONICAL_ASSET_URLS,
  runFingerprintPipeline,
  SERVICE_WORKER_VERSION_PLACEHOLDER,
} from "./fingerprint-assets.ts";
import { toOutputPath } from "./_url_paths.ts";

const TARGETED_SCRIPT_URLS = [
  "/scripts/gallery.js",
  "/scripts/post-mobile-tools-loader.js",
  "/scripts/pretext-browser-probe.js",
] as const;

const SW_FIXTURE = [
  `// fixture sw.js`,
  `const SW_VERSION = "${SERVICE_WORKER_VERSION_PLACEHOLDER}";`,
  `const ASSETS = ${JSON.stringify(CANONICAL_ASSET_URLS, null, 2)};`,
  `console.log(SW_VERSION, ASSETS);`,
  ``,
].join("\n");

async function writeFixtureFile(
  rootDir: string,
  urlPath: string,
  content: string,
): Promise<void> {
  const target = toOutputPath(rootDir, urlPath);
  const targetDir = target.slice(0, target.lastIndexOf("/"));
  await Deno.mkdir(targetDir, { recursive: true });
  await Deno.writeTextFile(target, content);
}

async function captureSwVersionWithBodies(
  scriptBodies: ReadonlyMap<string, string>,
): Promise<string> {
  return await withTempDir("fingerprint-assets-", async (rootDir) => {
    for (const url of CANONICAL_ASSET_URLS) {
      const body = scriptBodies.get(url) ?? `/* fixture stub for ${url} */\n`;
      await writeFixtureFile(rootDir, url, body);
    }

    await writeFixtureFile(rootDir, "/sw.js", SW_FIXTURE);

    const { swVersion } = await runFingerprintPipeline(rootDir);
    return swVersion;
  });
}

describe("fingerprint-assets cascade invariant", () => {
  it("propagates body changes from gallery.js into the service worker version", async () => {
    const baselineVersion = await captureSwVersionWithBodies(
      new Map([[
        "/scripts/gallery.js",
        "/* baseline */ export const v = 1;\n",
      ]]),
    );
    const mutatedVersion = await captureSwVersionWithBodies(
      new Map([["/scripts/gallery.js", "/* mutated */ export const v = 2;\n"]]),
    );

    assertNotEquals(baselineVersion, mutatedVersion);
  });

  it("propagates body changes from post-mobile-tools-loader.js into the service worker version", async () => {
    const baselineVersion = await captureSwVersionWithBodies(
      new Map([
        [
          "/scripts/post-mobile-tools-loader.js",
          "/* baseline */ export const v = 1;\n",
        ],
      ]),
    );
    const mutatedVersion = await captureSwVersionWithBodies(
      new Map([
        [
          "/scripts/post-mobile-tools-loader.js",
          "/* mutated */ export const v = 2;\n",
        ],
      ]),
    );

    assertNotEquals(baselineVersion, mutatedVersion);
  });

  it("propagates body changes from pretext-browser-probe.js into the service worker version", async () => {
    const baselineVersion = await captureSwVersionWithBodies(
      new Map([
        [
          "/scripts/pretext-browser-probe.js",
          "/* baseline */ export const v = 1;\n",
        ],
      ]),
    );
    const mutatedVersion = await captureSwVersionWithBodies(
      new Map([
        [
          "/scripts/pretext-browser-probe.js",
          "/* mutated */ export const v = 2;\n",
        ],
      ]),
    );

    assertNotEquals(baselineVersion, mutatedVersion);
  });

  it("guards the three targeted scripts against accidentally being dropped from the canonical set", () => {
    for (const url of TARGETED_SCRIPT_URLS) {
      if (!CANONICAL_ASSET_URLS.includes(url)) {
        throw new Error(
          `Expected ${url} to be fingerprinted (present in CANONICAL_ASSET_URLS).`,
        );
      }
    }
  });
});
