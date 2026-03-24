import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import tagsPage from "./index.page.ts";

function makePost(
  url: string,
  lang: string,
  tags: string[],
): Lume.Data {
  return {
    url,
    lang,
    tags,
    title: `Post for ${url}`,
    date: new Date("2026-03-10"),
  } as unknown as Lume.Data;
}

describe("tags/index.page.ts", () => {
  it("generates one multilingual descriptor per tag slug", () => {
    const search = {
      pages: (query: string) => {
        if (query === "type=post lang=en") {
          return [
            makePost("/posts/alibaba/", "en", ["devops", "github-actions"]),
            makePost("/posts/design/", "en", ["design"]),
          ];
        }

        if (query === "type=post lang=fr") {
          return [
            makePost("/fr/posts/alibaba/", "fr", ["devops", "github-actions"]),
            makePost("/fr/posts/design/", "fr", ["design"]),
          ];
        }

        return [];
      },
    };

    const pages = [...tagsPage({ search } as unknown as Lume.Data)];
    const designPage = pages.find((page) => page.url === "/tags/design/");

    assert(designPage);
    assertEquals(designPage.searchIndexed, false);
    assertEquals(designPage.type, "tag");
    assertEquals(designPage.id, "tag:design");
    const designPageLanguages = designPage.lang;
    if (!Array.isArray(designPageLanguages)) {
      throw new Error("Expected design tag page languages to be an array");
    }
    assertEquals(Array.from(designPageLanguages), ["en", "fr"]);
    assertEquals(designPage.title, "Tag: design");
    assertEquals(
      (designPage.fr as Record<string, unknown>).title,
      "Étiquette\u00a0: design",
    );
  });

  it("normalizes tag slugs, ignores blank tags, and stores localized page data for the plugin", () => {
    const search = {
      pages: (query: string) => {
        if (query === "type=post lang=en") {
          return [
            makePost("/posts/alpha/", "en", [
              "  Design Systems  ",
              "",
              "   ",
            ]),
            makePost("/posts/beta/", "en", ["design-systems", "Café Ops"]),
          ];
        }

        if (query === "type=post lang=fr") {
          return [
            makePost("/fr/posts/alpha/", "fr", ["Design Systems"]),
          ];
        }

        return [];
      },
    };

    const pages = [...tagsPage({ search } as unknown as Lume.Data)];
    const designSystemsPage = pages.find((page) =>
      page.url === "/tags/design-systems/"
    );
    const cafeOpsPage = pages.find((page) => page.url === "/tags/cafe-ops/");

    assert(designSystemsPage);
    assert(cafeOpsPage);
    assertEquals(designSystemsPage.tagName, "Design Systems");
    assertEquals((designSystemsPage.posts as Lume.Data[]).length, 2);
    assertEquals(cafeOpsPage.tagName, "Café Ops");
    assertEquals((cafeOpsPage.posts as Lume.Data[]).length, 1);
    assertEquals(designSystemsPage.id, "tag:design-systems");
    const designSystemsPageLanguages = designSystemsPage.lang;
    if (!Array.isArray(designSystemsPageLanguages)) {
      throw new Error(
        "Expected design-systems tag page languages to be an array",
      );
    }
    assertEquals(Array.from(designSystemsPageLanguages), ["en", "fr"]);
    assertEquals(
      ((designSystemsPage.fr as Record<string, unknown>).posts as Lume.Data[])
        .length,
      1,
    );
    assertEquals(
      pages.some((page) => page.url === "/tags//"),
      false,
    );
  });

  it("sorts generated tag descriptors alphabetically by their primary display tag name", () => {
    const search = {
      pages: (query: string) => {
        if (query === "type=post lang=en") {
          return [
            makePost("/posts/one/", "en", ["writing"]),
            makePost("/posts/two/", "en", ["design"]),
            makePost("/posts/three/", "en", ["alibaba cloud"]),
          ];
        }

        return [];
      },
    };

    const pages = [...tagsPage({ search } as unknown as Lume.Data)];
    const tagUrls = pages.map((page) => page.url);

    assertEquals(tagUrls, [
      "/tags/alibaba-cloud/",
      "/tags/design/",
      "/tags/writing/",
    ]);
  });
});
