import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { registerContentContract } from "./content-contract.ts";
import { getJSDOM } from "../test/jsdom.ts";

const JSDOM = await getJSDOM();

type Processor = (pages: Page[], allPages: Page[]) => void;

function createStubSite() {
  let processor: Processor | undefined;

  const site = {
    process(formats: string[], callback: Processor): void {
      assertEquals(formats, [".html"]);
      processor = callback;
    },
  } as unknown as Site;

  function run(pages: Page[], allPages = [...pages]): Page[] {
    if (processor === undefined) {
      throw new Error("Expected content-contract processor to be registered");
    }

    processor(pages, allPages);
    return allPages;
  }

  return { run, site };
}

function createDocument(markup: string): Document {
  return new JSDOM(
    `<!doctype html><html><body>${markup}</body></html>`,
  ).window.document;
}

function createPostPage(
  options: {
    document?: unknown;
    tags?: unknown;
    lang?: string;
    readingInfo?: unknown;
  } = {},
): Page {
  const hasExplicitDocument = Object.hasOwn(options, "document");

  return {
    data: {
      type: "post",
      id: "example-post",
      title: "Example post",
      date: new Date("2026-03-16T00:00:00.000Z"),
      lang: options.lang ?? "en",
      ...(options.tags !== undefined ? { tags: options.tags } : {}),
      ...(options.readingInfo !== undefined
        ? { readingInfo: options.readingInfo }
        : {}),
    },
    document: hasExplicitDocument ? options.document : createDocument(`
        <article class="post-content">
          <p>Hello contract.</p>
        </article>
      `),
    sourcePath: "/src/posts/example-post/en.md",
  } as unknown as Page;
}

function getGeneratedContractPage(pages: Page[]): Page & { content: string } {
  const generatedPages = pages.filter((page) =>
    page.sourcePath === "(generated)"
  );
  assertEquals(generatedPages.length, 1);
  return generatedPages[0] as Page & { content: string };
}

describe("registerContentContract()", () => {
  it("filters tags down to strings before emitting post contract JSON", () => {
    const env = createStubSite();
    registerContentContract(env.site);

    const page = createPostPage({
      lang: "fr",
      tags: ["design", 42, "writing", { label: "ignored" }],
      readingInfo: { minutes: 1.2 },
    });

    const allPages = env.run([page]);
    const generatedPage = getGeneratedContractPage(allPages);
    const json = JSON.parse(generatedPage.content) as {
      readonly blocks: ReadonlyArray<
        { readonly text?: string; readonly type: string }
      >;
      readonly lang: string;
      readonly readingTime?: number;
      readonly tags?: ReadonlyArray<string>;
    };

    assertEquals(generatedPage.data.url, "/fr/api/posts/example-post.json");
    assertEquals(json.lang, "fr");
    assertEquals(json.tags, ["design", "writing"]);
    assertEquals(json.readingTime, 1);
    assertEquals(json.blocks, [{ type: "paragraph", text: "Hello contract." }]);
  });

  it("skips post pages that do not expose a parseable document", () => {
    const env = createStubSite();
    registerContentContract(env.site);

    const page = createPostPage({ document: undefined, tags: ["design"] });
    const allPages = env.run([page]);

    assertEquals(
      allPages.some((candidate) => candidate.sourcePath === "(generated)"),
      false,
    );
  });
});
