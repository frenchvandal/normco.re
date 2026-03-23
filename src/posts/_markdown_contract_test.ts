import { assert, assertMatch, assertStringIncludes } from "@std/assert";
import { extract } from "@std/front-matter/yaml";
import { describe, it } from "@std/testing/bdd";
import { SHIKI_OPTIONS } from "../../_config/code_highlighting.ts";
import { POST_CONTRACT_FIXTURES } from "../../test/posts_contract_fixtures.ts";

const EXPECTED_LANGUAGES = ["en", "fr", "zh-hans", "zh-hant"] as const;
const SHIKI_LANGUAGE_SET = new Set<string>(SHIKI_OPTIONS.highlighter?.langs);

function normalizeLineEndings(document: string): string {
  return document.replace(/\r\n?/g, "\n");
}

function parseFrontmatter(document: string): {
  readonly body: string;
  readonly frontmatter: string;
} {
  const normalizedDocument = normalizeLineEndings(document);
  const { body, frontMatter } = extract(normalizedDocument);
  assert(typeof frontMatter === "string");

  return {
    frontmatter: frontMatter,
    body: body.trim(),
  };
}

function extractFenceLanguages(markdownBody: string): string[] {
  const languages = new Set<string>();

  for (const match of markdownBody.matchAll(/^```([^\s`]+).*$/gmu)) {
    const language = match[1]?.trim();

    if (language) {
      languages.add(language);
    }
  }

  return [...languages];
}

describe("src/posts Markdown contract", () => {
  it("stores each post in a slug directory with shared metadata", () => {
    const slugs = POST_CONTRACT_FIXTURES.map(({ slug }) => slug);
    assert(slugs.length > 0);

    for (const { slug, metadata } of POST_CONTRACT_FIXTURES) {
      assertMatch(metadata, new RegExp(`^slug: ${slug}$`, "m"));
      assertMatch(metadata, new RegExp(`^id: ${slug}$`, "m"));
      assertMatch(metadata, new RegExp(`^url: /posts/${slug}/$`, "m"));
      assertMatch(metadata, /^date: \d{4}-\d{2}-\d{2}$/m);
    }
  });

  it("keeps one Markdown file per supported language", () => {
    for (const { slug, documents } of POST_CONTRACT_FIXTURES) {
      for (const language of EXPECTED_LANGUAGES) {
        const document = documents[language];
        const { body, frontmatter } = parseFrontmatter(document);

        assertStringIncludes(frontmatter, `slug: ${slug}`);
        assertStringIncludes(frontmatter, `lang: ${language}`);
        assertMatch(frontmatter, /^title: .+/m);
        assertMatch(frontmatter, /^description: .+/m);
        assert(
          body.length > 0,
          `/src/posts/${slug}/${language}.md should contain Markdown body`,
        );
      }
    }
  });

  it("limits fenced code blocks to languages loaded by the Shiki config", () => {
    for (const { documents, slug } of POST_CONTRACT_FIXTURES) {
      for (const language of EXPECTED_LANGUAGES) {
        const document = documents[language];
        const { body } = parseFrontmatter(document);

        for (const fenceLanguage of extractFenceLanguages(body)) {
          assert(
            SHIKI_LANGUAGE_SET.has(fenceLanguage),
            `/src/posts/${slug}/${language}.md uses \`${fenceLanguage}\`, which is missing from SHIKI_OPTIONS.languages`,
          );
        }
      }
    }
  });
});
