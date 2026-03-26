import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { registerPostLinkGraph } from "./post_link_graph.ts";

type Preprocessor = (pages: Page[]) => void;

function createStubSite() {
  let preprocessor: Preprocessor | undefined;

  const site = {
    preprocess(formats: string[], callback: Preprocessor): void {
      assertEquals(formats, [".md"]);
      preprocessor = callback;
    },
  } as unknown as Site;

  function run(pages: Page[]): void {
    if (preprocessor === undefined) {
      throw new Error("Expected post link graph preprocessor");
    }

    preprocessor(pages);
  }

  return { run, site };
}

function createPostPage(
  url: string,
  title: string,
  content: string,
  date = "2026-03-26",
): Page {
  return {
    data: {
      type: "post",
      title,
      url,
      date,
      content,
    },
    outputPath: `${url}index.html`,
    sourcePath: `/Users/normcore/Code/normco.re/src${url}index.md`,
  } as unknown as Page;
}

describe("registerPostLinkGraph()", () => {
  it("derives backlinks from markdown and HTML links", () => {
    const env = createStubSite();
    registerPostLinkGraph(env.site);

    const alpha = createPostPage(
      "/posts/alpha/",
      "Alpha",
      [
        "[Read Beta](/posts/beta/)",
        '[Read Beta again](../beta/ "duplicate")',
        '<a href="/posts/gamma/">Read Gamma</a>',
      ].join("\n"),
      "2026-03-28",
    );
    const beta = createPostPage(
      "/posts/beta/",
      "Beta",
      "No internal links here.",
      "2026-03-27",
    );
    const gamma = createPostPage(
      "/posts/gamma/",
      "Gamma",
      "[Back to beta](/posts/beta/)",
      "2026-03-26",
    );

    env.run([alpha, beta, gamma]);

    assertEquals(alpha.data.outboundInternalLinks, [
      { title: "Beta", url: "/posts/beta/" },
      { title: "Gamma", url: "/posts/gamma/" },
    ]);
    assertEquals(beta.data.backlinks, [
      { title: "Alpha", url: "/posts/alpha/" },
      { title: "Gamma", url: "/posts/gamma/" },
    ]);
    assertEquals(gamma.data.backlinks, [
      { title: "Alpha", url: "/posts/alpha/" },
    ]);
  });

  it("ignores self-links and external links", () => {
    const env = createStubSite();
    registerPostLinkGraph(env.site);

    const page = createPostPage(
      "/posts/solo/",
      "Solo",
      [
        "[Self](/posts/solo/)",
        "[External](https://example.com/elsewhere)",
        "[Mail](mailto:test@example.com)",
      ].join("\n"),
    );

    env.run([page]);

    assertEquals(page.data.outboundInternalLinks, []);
    assertEquals(page.data.backlinks, []);
  });
});
