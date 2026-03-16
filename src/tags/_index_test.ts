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
    assertEquals(frenchDesignPage.title, "Étiquette : design");
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
});
