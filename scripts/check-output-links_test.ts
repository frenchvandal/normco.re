import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  collectBrokenOutputLinks,
  extractHtmlLocalReferences,
} from "./check-output-links.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

type VirtualFileMap = Readonly<Record<string, string>>;

async function writeTempOutput(
  rootDir: string,
  files: VirtualFileMap,
): Promise<void> {
  await writeTextTree(
    rootDir,
    Object.fromEntries(
      Object.entries(files).map(([path, content]) => [path.slice(1), content]),
    ),
  );
}

async function withTempOutput<T>(
  files: VirtualFileMap,
  callback: (rootDir: string) => Promise<T>,
): Promise<T> {
  return await withTempDir("check-output-links-", async (rootDir) => {
    await writeTempOutput(rootDir, files);
    return await callback(rootDir);
  });
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

  it("supports single-quoted attributes after parsing HTML", () => {
    const source = `
      <img src='/images/hero.png?size=2x#figure'>
      <a href='/posts/example/'>Example</a>
    `;

    assertEquals(extractHtmlLocalReferences(source), [
      "/images/hero.png",
      "/posts/example/",
    ]);
  });
});

describe("collectBrokenOutputLinks()", () => {
  it("accepts root-relative fingerprinted assets that exist in the final output", async () => {
    await withTempOutput({
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
    await withTempOutput({
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
