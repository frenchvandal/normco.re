import {
  assert,
  assertEquals,
  assertMatch,
  assertStringIncludes,
} from "jsr/assert";
import { fromFileUrl, join } from "jsr/path";
import { describe, it } from "jsr/testing-bdd";

const POSTS_DIR = fromFileUrl(new URL(".", import.meta.url));
const EXPECTED_LANGUAGES = ["en", "fr", "zh-hans", "zh-hant"] as const;

function parseFrontmatter(document: string): {
  readonly body: string;
  readonly frontmatter: string;
} {
  const match = document.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert(match, "Expected Markdown document with YAML frontmatter");
  const [, frontmatter, body] = match;
  assert(typeof frontmatter === "string");
  assert(typeof body === "string");

  return {
    frontmatter,
    body: body.trim(),
  };
}

async function listPostSlugs(): Promise<string[]> {
  const slugs: string[] = [];

  for await (const entry of Deno.readDir(POSTS_DIR)) {
    if (entry.isDirectory && !entry.name.startsWith("_")) {
      slugs.push(entry.name);
    }
  }

  return slugs.sort();
}

describe("src/posts Markdown contract", () => {
  it("stores each post in a slug directory with shared metadata", async () => {
    const slugs = await listPostSlugs();
    assert(slugs.length > 0);

    for (const slug of slugs) {
      const metadataPath = join(POSTS_DIR, slug, "_data.yml");
      const metadata = await Deno.readTextFile(metadataPath);
      assertMatch(metadata, new RegExp(`^slug: ${slug}$`, "m"));
      assertMatch(metadata, new RegExp(`^id: ${slug}$`, "m"));
      assertMatch(metadata, new RegExp(`^url: /posts/${slug}/$`, "m"));
      assertMatch(metadata, /^date: \d{4}-\d{2}-\d{2}$/m);
    }
  });

  it("keeps one Markdown file per supported language", async () => {
    const slugs = await listPostSlugs();

    for (const slug of slugs) {
      for (const language of EXPECTED_LANGUAGES) {
        const documentPath = join(POSTS_DIR, slug, `${language}.md`);
        const document = await Deno.readTextFile(documentPath);
        const { body, frontmatter } = parseFrontmatter(document);

        assertStringIncludes(frontmatter, `slug: ${slug}`);
        assertStringIncludes(frontmatter, `lang: ${language}`);
        assertMatch(frontmatter, /^title: .+/m);
        assertMatch(frontmatter, /^description: .+/m);
        assert(body.length > 0, `${documentPath} should contain Markdown body`);
      }
    }
  });

  it("does not keep legacy TSX post source files", async () => {
    const legacyPostFiles: string[] = [];

    for await (const entry of Deno.readDir(POSTS_DIR)) {
      if (
        entry.isFile &&
        entry.name.endsWith(".page.tsx") &&
        entry.name !== "index.page.tsx"
      ) {
        legacyPostFiles.push(entry.name);
      }
    }

    assertEquals(legacyPostFiles.sort(), []);
  });
});
