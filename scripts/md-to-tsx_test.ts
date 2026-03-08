import { describe, it } from "jsr/testing-bdd";
import { assertEquals, assertStringIncludes } from "jsr/assert";
import { faker } from "npm/faker-js";

import {
  escapeTsTemplateLiteral,
  generateTsx,
  markdownToHtml,
  parseDocument,
} from "./md-to-tsx.ts";

// ── parseDocument ─────────────────────────────────────────────────────────────

describe("parseDocument()", () => {
  describe("frontmatter — title and date", () => {
    it("parses title and date", () => {
      faker.seed(901);
      const title = faker.lorem.words(3);
      const { frontmatter } = parseDocument(
        `---\ntitle: ${title}\ndate: 2026-03-07\n---\n\nBody.`,
      );
      assertEquals(frontmatter.title, title);
      assertEquals(frontmatter.date, "2026-03-07");
    });

    it("strips surrounding quotes from values", () => {
      faker.seed(902);
      const title = faker.lorem.words(3);
      const { frontmatter } = parseDocument(
        `---\ntitle: "${title}"\ndate: 2026-01-01\n---\n`,
      );
      assertEquals(frontmatter.title, title);
    });

    it("normalises ISO datetime to YYYY-MM-DD", () => {
      faker.seed(903);
      const title = faker.lorem.word();
      const { frontmatter } = parseDocument(
        `---\ntitle: ${title}\ndate: 2026-03-07T10:30:00.000Z\n---\n`,
      );
      assertEquals(frontmatter.date, "2026-03-07");
    });

    it("uses 'Untitled' and today's date when there is no frontmatter", () => {
      faker.seed(904);
      const body = faker.lorem.sentence();
      const { frontmatter } = parseDocument(body);
      assertEquals(frontmatter.title, "Untitled");
      // Just check the date looks like YYYY-MM-DD.
      assertEquals(/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date), true);
    });
  });

  describe("frontmatter — description", () => {
    it("parses a description", () => {
      faker.seed(905);
      const title = faker.lorem.word();
      const description = faker.lorem.sentence();
      const { frontmatter } = parseDocument(
        `---\ntitle: ${title}\ndate: 2026-01-01\ndescription: ${description}\n---\n`,
      );
      assertEquals(frontmatter.description, description);
    });

    it("leaves description undefined when absent", () => {
      faker.seed(906);
      const title = faker.lorem.word();
      const { frontmatter } = parseDocument(
        `---\ntitle: ${title}\ndate: 2026-01-01\n---\n`,
      );
      assertEquals(frontmatter.description, undefined);
    });
  });

  describe("frontmatter — tags", () => {
    it("parses a YAML block-sequence tag list", () => {
      faker.seed(907);
      const tagA = faker.lorem.word();
      const tagB = faker.lorem.word();
      const { frontmatter } = parseDocument(
        `---\ntitle: T\ndate: 2026-01-01\ntags:\n  - ${tagA}\n  - ${tagB}\n---\n`,
      );
      assertEquals(frontmatter.tags, [tagA, tagB]);
    });

    it("parses an inline YAML array of tags", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\ntags: [design, writing]\n---\n",
      );
      assertEquals(frontmatter.tags, ["design", "writing"]);
    });

    it("leaves tags undefined when absent", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\n---\n",
      );
      assertEquals(frontmatter.tags, undefined);
    });
  });

  describe("body", () => {
    it("returns the body trimmed of leading blank lines", () => {
      faker.seed(908);
      const body = faker.lorem.sentence();
      const { body: parsedBody } = parseDocument(
        `---\ntitle: T\ndate: 2026-01-01\n---\n\n${body}`,
      );
      assertEquals(parsedBody, body);
    });

    it("treats the whole source as body when there is no frontmatter", () => {
      faker.seed(909);
      const content = faker.lorem.sentence();
      const { body } = parseDocument(content);
      assertEquals(body, content);
    });
  });
});

// ── markdownToHtml ────────────────────────────────────────────────────────────

describe("markdownToHtml()", () => {
  describe("headings", () => {
    it("converts ATX h1", () => {
      faker.seed(910);
      const word = faker.lorem.word();
      assertEquals(markdownToHtml(`# ${word}`), `<h1>${word}</h1>`);
    });

    it("converts ATX h2–h6", () => {
      faker.seed(911);
      const wordH2 = faker.lorem.word();
      faker.seed(912);
      const wordH3 = faker.lorem.word();
      assertEquals(markdownToHtml(`## ${wordH2}`), `<h2>${wordH2}</h2>`);
      assertEquals(markdownToHtml(`### ${wordH3}`), `<h3>${wordH3}</h3>`);
    });
  });

  describe("paragraphs", () => {
    it("wraps a text block in <p>", () => {
      faker.seed(913);
      const sentence = faker.lorem.sentence().replace(/\.$/, "");
      assertEquals(
        markdownToHtml(`${sentence}.`),
        `<p>${sentence}.</p>`,
      );
    });

    it("joins soft-wrapped lines with a space", () => {
      assertEquals(
        markdownToHtml("Line one\nLine two."),
        "<p>Line one Line two.</p>",
      );
    });

    it("separates two blank-line-separated blocks into two <p>", () => {
      assertEquals(
        markdownToHtml("First.\n\nSecond."),
        "<p>First.</p>\n\n<p>Second.</p>",
      );
    });
  });

  describe("code blocks", () => {
    it("wraps fenced blocks in <pre><code>", () => {
      assertStringIncludes(
        markdownToHtml("```ts\nconst x = 1;\n```"),
        '<pre><code class="language-ts">',
      );
    });

    it("escapes < and > inside code blocks", () => {
      assertStringIncludes(
        markdownToHtml("```\na < b\n```"),
        "a &lt; b",
      );
    });

    it("omits the class attribute when no language is given", () => {
      const html = markdownToHtml("```\ncode\n```");
      assertStringIncludes(html, "<pre><code>");
      assertEquals(html.includes("class="), false);
    });
  });

  describe("lists", () => {
    it("converts unordered list items to <ul><li>", () => {
      faker.seed(914);
      const itemA = faker.lorem.word();
      const itemB = faker.lorem.word();
      assertStringIncludes(
        markdownToHtml(`- ${itemA}\n- ${itemB}`),
        "<ul>",
      );
      assertStringIncludes(
        markdownToHtml(`- ${itemA}\n- ${itemB}`),
        `<li>${itemA}</li>`,
      );
    });

    it("converts ordered list items to <ol><li>", () => {
      faker.seed(915);
      const itemA = faker.lorem.word();
      const itemB = faker.lorem.word();
      assertStringIncludes(
        markdownToHtml(`1. ${itemA}\n2. ${itemB}`),
        "<ol>",
      );
      assertStringIncludes(
        markdownToHtml(`1. ${itemA}\n2. ${itemB}`),
        `<li>${itemA}</li>`,
      );
    });
  });

  describe("blockquote", () => {
    it("wraps > lines in <blockquote>", () => {
      faker.seed(916);
      const sentence = faker.lorem.sentence();
      assertStringIncludes(
        markdownToHtml(`> ${sentence}`),
        "<blockquote>",
      );
      assertStringIncludes(markdownToHtml(`> ${sentence}`), sentence);
    });
  });

  describe("horizontal rule", () => {
    it("converts --- to <hr>", () => {
      assertEquals(markdownToHtml("---"), "<hr>");
    });
  });

  describe("inline elements", () => {
    it("converts **text** to <strong>", () => {
      faker.seed(917);
      const word = faker.lorem.word();
      assertEquals(
        markdownToHtml(`**${word}**`),
        `<p><strong>${word}</strong></p>`,
      );
    });

    it("converts *text* to <em>", () => {
      faker.seed(918);
      const word = faker.lorem.word();
      assertEquals(markdownToHtml(`*${word}*`), `<p><em>${word}</em></p>`);
    });

    it("converts `code` to <code>", () => {
      faker.seed(919);
      const snippet = faker.lorem.word();
      assertEquals(
        markdownToHtml(`\`${snippet}\``),
        `<p><code>${snippet}</code></p>`,
      );
    });

    it("does not apply bold/italic rules inside code spans", () => {
      assertStringIncludes(
        markdownToHtml("`**not bold**`"),
        "<code>**not bold**</code>",
      );
    });

    it("converts [text](url) to <a>", () => {
      assertStringIncludes(
        markdownToHtml("[Deno](https://deno.land)"),
        '<a href="https://deno.land">Deno</a>',
      );
    });

    it("converts ![alt](url) to <img>", () => {
      assertStringIncludes(
        markdownToHtml("![cat](cat.jpg)"),
        '<img src="cat.jpg" alt="cat">',
      );
    });
  });
});

// ── escapeTsTemplateLiteral ───────────────────────────────────────────────────

describe("escapeTsTemplateLiteral()", () => {
  it("escapes backticks", () => {
    assertEquals(escapeTsTemplateLiteral("a`b"), "a\\`b");
  });

  it("escapes template expressions", () => {
    assertEquals(escapeTsTemplateLiteral("${x}"), "\\${x}");
  });

  it("escapes backslashes before other escapes", () => {
    assertEquals(escapeTsTemplateLiteral("a\\b"), "a\\\\b");
  });

  it("leaves regular HTML untouched", () => {
    faker.seed(920);
    const word = faker.lorem.word();
    const html = `<p>Hello &amp; ${word}.</p>`;
    assertEquals(escapeTsTemplateLiteral(html), html);
  });
});

// ── generateTsx ──────────────────────────────────────────────────────────────

describe("generateTsx()", () => {
  faker.seed(921);
  const title = faker.lorem.words(3);
  faker.seed(922);
  const htmlBody = `<p>${faker.lorem.sentence()}</p>`;

  const base = {
    title,
    date: "2026-03-07",
    description: undefined,
    tags: undefined,
  } as const;

  it("includes the title export", () => {
    assertStringIncludes(
      generateTsx(base, htmlBody, "my-post.md"),
      `export const title = "${title}"`,
    );
  });

  it("includes the date export", () => {
    assertStringIncludes(
      generateTsx(base, htmlBody, "my-post.md"),
      'export const date = new Date("2026-03-07")',
    );
  });

  it("omits description when undefined", () => {
    const src = generateTsx(base, "", "my-post.md");
    assertEquals(src.includes("description"), false);
  });

  it("includes description when provided", () => {
    faker.seed(923);
    const description = faker.lorem.sentence();
    assertStringIncludes(
      generateTsx({ ...base, description }, "", "my-post.md"),
      "export const description",
    );
  });

  it("omits tags when undefined", () => {
    assertEquals(generateTsx(base, "", "my-post.md").includes("tags"), false);
  });

  it("includes tags when provided", () => {
    faker.seed(924);
    const tagA = faker.lorem.word();
    const tagB = faker.lorem.word();
    assertStringIncludes(
      generateTsx({ ...base, tags: [tagA, tagB] }, "", "my-post.md"),
      `export const tags = ["${tagA}", "${tagB}"]`,
    );
  });

  it("embeds the HTML in the default export template literal", () => {
    assertStringIncludes(
      generateTsx(base, htmlBody, "my-post.md"),
      htmlBody,
    );
  });

  it("escapes backticks in the HTML body", () => {
    faker.seed(925);
    const word = faker.lorem.word();
    const src = generateTsx(base, `a\`${word}`, "my-post.md");
    assertStringIncludes(src, `a\\\`${word}`);
  });

  it("references the source filename in the file-level JSDoc", () => {
    faker.seed(926);
    const filename = `${faker.lorem.slug(2)}.md`;
    assertStringIncludes(
      generateTsx(base, "", filename),
      filename,
    );
  });
});
