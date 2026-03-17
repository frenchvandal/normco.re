import { assert, assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

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
  it("generates one localized page per tag slug with plural basenames", () => {
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
    const frenchDesignPage = pages.find((page) =>
      page.url === "/fr/tags/design/"
    );

    assert(designPage);
    assert(frenchDesignPage);
    assertEquals(designPage.type, "tag");
    assertEquals(designPage.title, "Tag: design");
    assertEquals(frenchDesignPage.title, "Étiquette\u00a0: design");
    const alternates = designPage.alternates as Array<{
      lang: string;
      url: string;
    }>;
    assertEquals(alternates.length, 2);
    assertEquals(alternates[0]?.lang, "en");
    assertEquals(alternates[0]?.url, "/tags/design/");
    assertEquals(alternates[1]?.lang, "fr");
    assertEquals(alternates[1]?.url, "/fr/tags/design/");
  });

  it("normalizes tag slugs, ignores blank tags, and aggregates posts by slug", () => {
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
    assertEquals(
      pages.some((page) => page.url === "/tags//"),
      false,
    );

    const alternates = designSystemsPage.alternates as Array<{
      lang: string;
      url: string;
    }>;
    assertEquals(alternates, [
      { lang: "en", url: "/tags/design-systems/" },
      { lang: "fr", url: "/fr/tags/design-systems/" },
    ]);
  });

  it("sorts generated tag pages alphabetically by display tag name inside each language", () => {
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
    const englishTagUrls = pages
      .filter((page) =>
        typeof page.url === "string" && !page.url.startsWith("/fr/")
      )
      .filter((page) =>
        typeof page.url === "string" && !page.url.startsWith("/zh-")
      )
      .map((page) => page.url);

    assertEquals(englishTagUrls, [
      "/tags/alibaba-cloud/",
      "/tags/design/",
      "/tags/writing/",
    ]);
  });
});
