import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { join } from "jsr/path";

import {
  collectBrokenOutputLinks,
  extractHtmlLocalReferences,
} from "./check-output-links.ts";

describe("extractHtmlLocalReferences()", () => {
  it("collects local href and src references while skipping external targets", () => {
    const source = `
      <link rel="stylesheet" href="/style.123.css">
      <script src="/scripts/app.456.js"></script>
      <a href="./feed.xml?lang=en#top">Feed</a>
      <a href="https://example.com">External</a>
      <a href="#content">Skip</a>
    `;

    assertEquals(extractHtmlLocalReferences(source), [
      "/style.123.css",
      "/scripts/app.456.js",
      "./feed.xml",
    ]);
  });
});

describe("collectBrokenOutputLinks()", () => {
  it("accepts root-relative fingerprinted assets that exist in the final output", async () => {
    const rootDir = await Deno.makeTempDir();

    try {
      await Deno.writeTextFile(
        join(rootDir, "index.html"),
        [
          '<link rel="stylesheet" href="/style.123.css">',
          '<script src="/scripts/app.456.js"></script>',
        ].join("\n"),
      );
      await Deno.writeTextFile(join(rootDir, "style.123.css"), "");
      await Deno.mkdir(join(rootDir, "scripts"), { recursive: true });
      await Deno.writeTextFile(join(rootDir, "scripts", "app.456.js"), "");

      const report = await collectBrokenOutputLinks(rootDir);

      assertEquals(report, {});
    } finally {
      await Deno.remove(rootDir, { recursive: true });
    }
  });

  it("reports broken targets from final HTML output", async () => {
    const rootDir = await Deno.makeTempDir();

    try {
      await Deno.writeTextFile(
        join(rootDir, "index.html"),
        '<script src="/scripts/missing.js"></script>',
      );
      await Deno.mkdir(join(rootDir, "posts", "hello"), { recursive: true });
      await Deno.writeTextFile(
        join(rootDir, "posts", "hello", "index.html"),
        '<a href="/missing-page/">Missing page</a>',
      );

      const report = await collectBrokenOutputLinks(rootDir);

      assertEquals(report, {
        "/missing-page/": ["/posts/hello/"],
        "/scripts/missing.js": ["/"],
      });
    } finally {
      await Deno.remove(rootDir, { recursive: true });
    }
  });
});
