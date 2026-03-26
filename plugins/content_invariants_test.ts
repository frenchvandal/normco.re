import { assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { registerContentInvariants } from "./content_invariants.ts";

type Preprocessor = (pages: Page[]) => void;

function createStubSite() {
  let preprocessor: Preprocessor | undefined;

  const site = {
    preprocess(formats: string[], callback: Preprocessor): void {
      if (formats.length !== 1 || formats[0] !== ".md") {
        throw new Error(`Unexpected formats: ${formats.join(", ")}`);
      }

      preprocessor = callback;
    },
  } as unknown as Site;

  function run(pages: Page[]): void {
    if (preprocessor === undefined) {
      throw new Error("Expected content invariants preprocessor");
    }

    preprocessor(pages);
  }

  return { run, site };
}

function createPostPage(
  slug: string,
  language: "en" | "fr" | "zh-hans" | "zh-hant",
  overrides: Partial<Record<string, unknown>> = {},
): Page {
  const prefix = language === "en" ? "" : `/${language}`;

  return {
    data: {
      type: "post",
      id: slug,
      title: `${slug} ${language}`,
      description: `Description for ${slug} ${language}`,
      url: `${prefix}/posts/${slug}/`,
      lang: language,
      date: "2026-03-26",
      ...overrides,
    },
    outputPath: `${prefix}/posts/${slug}/index.html`,
    sourcePath:
      `/Users/normcore/Code/normco.re/src/posts/${slug}/${language}.md`,
  } as unknown as Page;
}

function createLocalizedPostSet(
  slug: string,
  overrides: Partial<Record<string, unknown>> = {},
): Page[] {
  return [
    createPostPage(slug, "en", overrides),
    createPostPage(slug, "fr", overrides),
    createPostPage(slug, "zh-hans", overrides),
    createPostPage(slug, "zh-hant", overrides),
  ];
}

describe("registerContentInvariants()", () => {
  it("accepts complete localized post sets", () => {
    const env = createStubSite();
    registerContentInvariants(env.site);

    env.run(createLocalizedPostSet("valid-post"));
  });

  it("fails when a localized sibling is missing", async () => {
    const env = createStubSite();
    registerContentInvariants(env.site);

    const pages = createLocalizedPostSet("missing-fr").filter((page) =>
      page.data.lang !== "fr"
    );

    await assertRejects(
      () => Promise.resolve().then(() => env.run(pages)),
      Error,
      "missing localized Markdown source for `fr`",
    );
  });

  it("fails when localized siblings disagree on id values", async () => {
    const env = createStubSite();
    registerContentInvariants(env.site);

    const pages = createLocalizedPostSet("shared-post");
    pages[1] = createPostPage("shared-post", "fr", { id: "different-id" });

    await assertRejects(
      () => Promise.resolve().then(() => env.run(pages)),
      Error,
      "localized siblings disagree on `id` values",
    );
  });

  it("fails when a post URL does not match the locale prefix", async () => {
    const env = createStubSite();
    registerContentInvariants(env.site);

    const pages = createLocalizedPostSet("bad-prefix");
    pages[1] = createPostPage("bad-prefix", "fr", {
      url: "/posts/bad-prefix/",
    });

    await assertRejects(
      () => Promise.resolve().then(() => env.run(pages)),
      Error,
      "expected post URL to start with `/fr/posts/`",
    );
  });
});
