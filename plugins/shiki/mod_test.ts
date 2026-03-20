import { assertEquals, assertStringIncludes } from "jsr/assert";

import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

type Processor = (pages: Page[]) => void | Promise<void>;

function createStubSite() {
  let processor: Processor | undefined;

  const site = {
    _data: {},
    process(formats: string[], callback: Processor): void {
      assertEquals(formats, [".html"]);
      processor = callback;
    },
  } as unknown as Site & { _data: Record<string, unknown> };

  async function run(pages: Page[]): Promise<Page[]> {
    if (processor === undefined) {
      throw new Error("Expected shiki processor to be registered");
    }

    await processor(pages);
    return pages;
  }

  return { run, site };
}

function createDocument(markup: string): Document {
  return new JSDOM(
    `<!doctype html><html><body>${markup}</body></html>`,
  ).window.document;
}

function createPage(markup: string, sourcePath = "/src/example.md"): Page {
  return {
    document: createDocument(markup),
    sourcePath,
  } as unknown as Page;
}

Deno.test({
  name:
    "shiki() highlights code blocks with Shiki render options while preserving classes",
  async fn() {
    const { default: shiki } = await import("./mod.ts");
    const env = createStubSite();
    shiki({
      highlighter: {
        langs: ["ts"],
      },
      render: {
        themes: {
          light: "vitesse-light",
          dark: "vitesse-dark",
        },
      },
    })(env.site);

    const page = createPage(`
      <pre class="code-shell"><code class="language-ts user-code">const answer = 42;</code></pre>
    `);

    await env.run([page]);

    const pre = page.document.querySelector("pre");
    const code = page.document.querySelector("code");

    assertEquals(pre?.classList.contains("code-shell"), true);
    assertEquals(pre?.classList.contains("shiki"), true);
    assertEquals(code?.classList.contains("user-code"), true);
    assertStringIncludes(pre?.outerHTML ?? "", "--shiki-light");
    assertStringIncludes(code?.innerHTML ?? "", "line");
  },
});

Deno.test({
  name: "shiki() supports custom selectors and language resolution",
  async fn() {
    const { default: shiki } = await import("./mod.ts");
    const env = createStubSite();
    shiki({
      cssSelector: "pre > code[class*='lang-']",
      highlighter: {
        langs: ["yaml"],
      },
      render: {
        theme: "vitesse-light",
      },
      resolveLanguage(element) {
        return element.getAttribute("class")?.match(/lang-([A-Za-z0-9_+-]+)/)
          ?.[1];
      },
    })(env.site);

    const page = createPage(`
      <pre><code class="lang-yaml">title: Example</code></pre>
    `);

    await env.run([page]);

    const pre = page.document.querySelector("pre");
    const code = page.document.querySelector("code");
    assertEquals(pre?.classList.contains("shiki"), true);
    assertStringIncludes(code?.innerHTML ?? "", "<span");
  },
});

Deno.test({
  name: "shiki() keeps one highlighter cache per plugin instance",
  async fn() {
    const { default: shiki } = await import("./mod.ts");
    const first = createStubSite();
    shiki({
      highlighter: {
        langs: ["ts"],
        themes: ["vitesse-light"],
      },
      render: {
        theme: "vitesse-light",
      },
    })(first.site);

    const firstPage = createPage(`
      <pre><code class="language-ts">const light = true;</code></pre>
    `);

    await first.run([firstPage]);
    assertEquals(
      firstPage.document.querySelector("pre")?.classList.contains("shiki"),
      true,
    );

    const second = createStubSite();
    shiki({
      highlighter: {
        langs: ["ts"],
        themes: ["vitesse-dark"],
      },
      render: {
        theme: "vitesse-dark",
      },
    })(second.site);

    const secondPage = createPage(`
      <pre><code class="language-ts">const dark = true;</code></pre>
    `);

    await second.run([secondPage]);

    const secondPre = secondPage.document.querySelector("pre");
    const secondCode = secondPage.document.querySelector("code");
    assertEquals(secondPre?.classList.contains("shiki"), true);
    assertStringIncludes(secondCode?.innerHTML ?? "", "<span");
  },
});
