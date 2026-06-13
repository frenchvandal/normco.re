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

  it("ignores non-numeric image dimensions and keeps valid ones", () => {
    const document = createDocument(`
      <article class="post-content">
        <img src="/a.jpg" alt="A" width="100px" height="auto">
        <img src="/b.jpg" alt="B" width="50%">
        <img src="/c.jpg" alt="C" height="600">
        <img src="/d.jpg" alt="D" width="800" height="invalid">
        <img src="/e.jpg" alt="E" width="0" height="0">
        <img src="/f.jpg" alt="F" width="100.5" height="80.2">
      </article>
    `);

    assertEquals(parsePostContent(document), [
      { type: "image", src: "/a.jpg", alt: "A" },
      { type: "image", src: "/b.jpg", alt: "B" },
      { type: "image", src: "/c.jpg", alt: "C", height: 600 },
      { type: "image", src: "/d.jpg", alt: "D", width: 800 },
      { type: "image", src: "/e.jpg", alt: "E" },
      { type: "image", src: "/f.jpg", alt: "F" },
    ]);
  });
});
