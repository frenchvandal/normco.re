import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { parsePostContent } from "./post-content-blocks.ts";
import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

function createDocument(markup: string): Document {
  return new JSDOM(
    `<!doctype html><html><body>${markup}</body></html>`,
  ).window.document;
}

describe("parsePostContent()", () => {
  it("parses the supported post block shapes from .post-content", () => {
    const document = createDocument(`
      <article class="post-content">
        <p>Hello contract.</p>
        <h2>Section</h2>
        <pre><code class="language-ts">console.log("hi")</code></pre>
        <figure>
          <img src="/images/hero.jpg" alt="Hero" width="1200" height="800">
        </figure>
        <blockquote>
          <p>Quoted line</p>
          <cite>Author</cite>
        </blockquote>
        <ol>
          <li>First</li>
          <li>Second</li>
        </ol>
      </article>
    `);

    assertEquals(parsePostContent(document), [
      { type: "paragraph", text: "Hello contract." },
      { type: "heading", level: 2, text: "Section" },
      { type: "code", content: 'console.log("hi")', language: "ts" },
      {
        type: "image",
        src: "/images/hero.jpg",
        alt: "Hero",
        width: 1200,
        height: 800,
      },
      { type: "quote", text: "Quoted line", attribution: "Author" },
      { type: "list", ordered: true, items: ["First", "Second"] },
    ]);
  });

  it("falls back to article and main containers when .post-content is absent", () => {
    const articleDocument = createDocument(`
      <article>
        <p>From article</p>
      </article>
    `);
    const mainDocument = createDocument(`
      <main>
        <p>From main</p>
      </main>
    `);

    assertEquals(parsePostContent(articleDocument), [{
      type: "paragraph",
      text: "From article",
    }]);
    assertEquals(parsePostContent(mainDocument), [{
      type: "paragraph",
      text: "From main",
    }]);
  });
});
