import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  collectBrokenOutputLinks,
  extractHtmlLocalReferences,
} from "./check-output-links.ts";
import { createDirEntry, withPatchedDeno } from "../test/mock_deno.ts";

type VirtualFileMap = Readonly<Record<string, string>>;

function collectDirectoryEntries(
  files: VirtualFileMap,
): Map<string, Deno.DirEntry[]> {
  const directories = new Map<string, Deno.DirEntry[]>();

  for (const filePath of Object.keys(files)) {
    const segments = filePath.split("/").filter(Boolean);

    for (let index = 0; index < segments.length; index += 1) {
      const parent = `/${segments.slice(0, index).join("/")}` || "/";
      const name = segments[index];

      if (!name) {
        continue;
      }

      const isLeaf = index === segments.length - 1;
      const entries = directories.get(parent) ?? [];

      if (!entries.some((entry) => entry.name === name)) {
        entries.push(createDirEntry(name, isLeaf ? "file" : "directory"));
        directories.set(parent, entries);
      }
    }
  }

  return directories;
}

async function withVirtualOutput<T>(
  files: VirtualFileMap,
  callback: (rootDir: string) => Promise<T>,
): Promise<T> {
  const rootDir = "/virtual/site";
  const rootedFiles = Object.fromEntries(
    Object.entries(files).map((
      [path, content],
    ) => [`${rootDir}${path}`, content]),
  );
  const directories = collectDirectoryEntries(rootedFiles);

  return await withPatchedDeno({
    readDir: (path: string | URL) =>
      (async function* () {
        yield* directories.get(String(path)) ?? [];
      })(),
    readTextFile: (path: string | URL) => {
      const content = rootedFiles[String(path)];

      if (content === undefined) {
        return Promise.reject(new Deno.errors.NotFound(String(path)));
      }

      return Promise.resolve(content);
    },
    stat: (path: string | URL) => {
      const filePath = String(path);

      if (rootedFiles[filePath] !== undefined) {
        return Promise.resolve({
          isDirectory: false,
          isFile: true,
          isSymlink: false,
        } as Deno.FileInfo);
      }

      if (directories.has(filePath)) {
        return Promise.resolve({
          isDirectory: true,
          isFile: false,
          isSymlink: false,
        } as Deno.FileInfo);
      }

      return Promise.reject(new Deno.errors.NotFound(filePath));
    },
  }, async () => await callback(rootDir));
}

describe("extractHtmlLocalReferences()", () => {
  it("collects local href and src references while skipping external targets", () => {
    const source = `
      <link rel="stylesheet" href="/style.123.css">
      <script src="/scripts/app.456.js"></script>
      <a href="./rss.xml?lang=en#top">Feed</a>
      <a href="https://example.com">External</a>
      <a href="#content">Skip</a>
    `;

    assertEquals(extractHtmlLocalReferences(source), [
      "/style.123.css",
      "/scripts/app.456.js",
      "./rss.xml",
    ]);
  });
});

describe("collectBrokenOutputLinks()", () => {
  it("accepts root-relative fingerprinted assets that exist in the final output", async () => {
    await withVirtualOutput({
      "/index.html": [
        '<link rel="stylesheet" href="/style.123.css">',
        '<script src="/scripts/app.456.js"></script>',
      ].join("\n"),
      "/style.123.css": "",
      "/scripts/app.456.js": "",
    }, async (rootDir) => {
      const report = await collectBrokenOutputLinks(rootDir);

      assertEquals(report, {});
    });
  });

  it("reports broken targets from final HTML output", async () => {
    await withVirtualOutput({
      "/index.html": '<script src="/scripts/missing.js"></script>',
      "/posts/hello/index.html": '<a href="/missing-page/">Missing page</a>',
    }, async (rootDir) => {
      const report = await collectBrokenOutputLinks(rootDir);

      assertEquals(report, {
        "/missing-page/": ["/posts/hello/"],
        "/scripts/missing.js": ["/"],
      });
    });
  });
});
