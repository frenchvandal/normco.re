import { describe, it } from "jsr/testing-bdd";
import { assertEquals, assertStringIncludes } from "jsr/assert";

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
      const { frontmatter } = parseDocument(
        "---\ntitle: My Post\ndate: 2026-03-07\n---\n\nBody.",
      );
      assertEquals(frontmatter.title, "My Post");
      assertEquals(frontmatter.date, "2026-03-07");
    });

    it("strips surrounding quotes from values", () => {
      const { frontmatter } = parseDocument(
        '---\ntitle: "Quoted Title"\ndate: 2026-01-01\n---\n',
      );
      assertEquals(frontmatter.title, "Quoted Title");
    });

    it("normalises ISO datetime to YYYY-MM-DD", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-03-07T10:30:00.000Z\n---\n",
      );
      assertEquals(frontmatter.date, "2026-03-07");
    });

    it("uses 'Untitled' and today's date when there is no frontmatter", () => {
      const { frontmatter } = parseDocument("No frontmatter here.");
      assertEquals(frontmatter.title, "Untitled");
      // Just check the date looks like YYYY-MM-DD.
      assertEquals(/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date), true);
    });
  });

  describe("frontmatter — description", () => {
    it("parses a description", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\ndescription: A short desc.\n---\n",
      );
      assertEquals(frontmatter.description, "A short desc.");
    });

    it("leaves description undefined when absent", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\n---\n",
      );
      assertEquals(frontmatter.description, undefined);
    });
  });

  describe("frontmatter — tags", () => {
    it("parses a YAML block-sequence tag list", () => {
      const { frontmatter } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\ntags:\n  - design\n  - writing\n---\n",
      );
      assertEquals(frontmatter.tags, ["design", "writing"]);
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
      const { body } = parseDocument(
        "---\ntitle: T\ndate: 2026-01-01\n---\n\nHello.",
      );
      assertEquals(body, "Hello.");
    });

    it("treats the whole source as body when there is no frontmatter", () => {
      const { body } = parseDocument("Just content.");
      assertEquals(body, "Just content.");
    });
  });
});

// ── markdownToHtml ────────────────────────────────────────────────────────────

describe("markdownToHtml()", () => {
  describe("headings", () => {
    it("converts ATX h1", () => {
      assertEquals(markdownToHtml("# Title"), "<h1>Title</h1>");
    });

    it("converts ATX h2–h6", () => {
      assertEquals(markdownToHtml("## Two"), "<h2>Two</h2>");
      assertEquals(markdownToHtml("### Three"), "<h3>Three</h3>");
    });
  });

  describe("paragraphs", () => {
    it("wraps a text block in <p>", () => {
      assertEquals(markdownToHtml("Hello world."), "<p>Hello world.</p>");
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
      assertStringIncludes(markdownToHtml("- Alpha\n- Beta"), "<ul>");
      assertStringIncludes(markdownToHtml("- Alpha\n- Beta"), "<li>Alpha</li>");
    });

    it("converts ordered list items to <ol><li>", () => {
      assertStringIncludes(markdownToHtml("1. First\n2. Second"), "<ol>");
      assertStringIncludes(
        markdownToHtml("1. First\n2. Second"),
        "<li>First</li>",
      );
    });
  });

  describe("blockquote", () => {
    it("wraps > lines in <blockquote>", () => {
      assertStringIncludes(
        markdownToHtml("> A quote."),
        "<blockquote>",
      );
      assertStringIncludes(markdownToHtml("> A quote."), "A quote.");
    });
  });

  describe("horizontal rule", () => {
    it("converts --- to <hr>", () => {
      assertEquals(markdownToHtml("---"), "<hr>");
    });
  });

  describe("inline elements", () => {
    it("converts **text** to <strong>", () => {
      assertEquals(
        markdownToHtml("**bold**"),
        "<p><strong>bold</strong></p>",
      );
    });

    it("converts *text* to <em>", () => {
      assertEquals(markdownToHtml("*italic*"), "<p><em>italic</em></p>");
    });

    it("converts `code` to <code>", () => {
      assertEquals(
        markdownToHtml("`snippet`"),
        "<p><code>snippet</code></p>",
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
    const html = "<p>Hello &amp; world.</p>";
    assertEquals(escapeTsTemplateLiteral(html), html);
  });
});

// ── generateTsx ──────────────────────────────────────────────────────────────

describe("generateTsx()", () => {
  const base = {
    title: "My Post",
    date: "2026-03-07",
    description: undefined,
    tags: undefined,
  } as const;

  it("includes the title export", () => {
    assertStringIncludes(
      generateTsx(base, "<p>Hello.</p>", "my-post.md"),
      'export const title = "My Post"',
    );
  });

  it("includes the date export", () => {
    assertStringIncludes(
      generateTsx(base, "<p>Hello.</p>", "my-post.md"),
      'export const date = new Date("2026-03-07")',
    );
  });

  it("omits description when undefined", () => {
    const src = generateTsx(base, "", "my-post.md");
    assertEquals(src.includes("description"), false);
  });

  it("includes description when provided", () => {
    assertStringIncludes(
      generateTsx({ ...base, description: "A short desc." }, "", "my-post.md"),
      "export const description",
    );
  });

  it("omits tags when undefined", () => {
    assertEquals(generateTsx(base, "", "my-post.md").includes("tags"), false);
  });

  it("includes tags when provided", () => {
    assertStringIncludes(
      generateTsx({ ...base, tags: ["design", "writing"] }, "", "my-post.md"),
      'export const tags = ["design", "writing"]',
    );
  });

  it("embeds the HTML in the default export template literal", () => {
    assertStringIncludes(
      generateTsx(base, "<p>Hello.</p>", "my-post.md"),
      "<p>Hello.</p>",
    );
  });

  it("escapes backticks in the HTML body", () => {
    const src = generateTsx(base, "a`b", "my-post.md");
    assertStringIncludes(src, "a\\`b");
  });

  it("references the source filename in the file-level JSDoc", () => {
    assertStringIncludes(
      generateTsx(base, "", "my-post.md"),
      "my-post.md",
    );
  });
});
