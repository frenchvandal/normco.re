import { assertEquals, assertThrows } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import type Site from "lume/core/site.ts";
import type { Data } from "lume/core/file.ts";

import {
  APP_CONTRACT_VERSION,
  APP_MANIFEST_API_PATH,
  createAppManifestDocument,
  createPostsIndexDocument,
  createPostsIndexPage,
  POSTS_INDEX_API_PATH,
  registerMobileContentApi,
} from "./mobile_content_api.ts";

describe("_config/mobile_content_api.ts", () => {
  it("builds the app manifest with one posts-index pointer per language", () => {
    const manifest = createAppManifestDocument(
      new Date("2026-03-20T12:00:00Z"),
    );

    assertEquals(manifest, {
      version: APP_CONTRACT_VERSION,
      generatedAt: "2026-03-20T12:00:00Z",
      defaultLanguage: "en",
      languages: ["en", "fr", "zh-hans", "zh-hant"],
      postsIndex: [
        { lang: "en", apiUrl: "/api/posts/index.json" },
        { lang: "fr", apiUrl: "/fr/api/posts/index.json" },
        { lang: "zh-hans", apiUrl: "/zh-hans/api/posts/index.json" },
        { lang: "zh-hant", apiUrl: "/zh-hant/api/posts/index.json" },
      ],
    });
  });

  it("builds localized posts-index items from post data without synthesizing updatedAt", () => {
    const siteStub = {
      url(path: string, absolute: boolean): string {
        if (!absolute) {
          throw new Error("Expected absolute URL resolution");
        }

        return `https://normco.re${path}`;
      },
    };

    const index = createPostsIndexDocument(siteStub, "en", [
      {
        id: "example-post",
        slug: "example-post",
        title: "Example post",
        description: "Contract-backed summary.",
        date: new Date("2026-03-16T00:00:00Z"),
        url: "/posts/example-post/",
        tags: ["android", 42, "compose"],
        readingInfo: { minutes: 1.2 },
      } as unknown as Data,
    ]);

    assertEquals(index, {
      version: APP_CONTRACT_VERSION,
      lang: "en",
      items: [
        {
          id: "example-post",
          slug: "example-post",
          title: "Example post",
          summary: "Contract-backed summary.",
          publishedAt: "2026-03-16T00:00:00Z",
          readingTime: 2,
          tags: ["android", "compose"],
          detailApiUrl: "/api/posts/example-post.json",
          webUrl: "https://normco.re/posts/example-post/",
        },
      ],
    });
  });

  it("fails loudly when a post is missing a localized summary", () => {
    const siteStub = {
      url(path: string, _absolute: boolean): string {
        return `https://normco.re${path}`;
      },
    };

    assertThrows(
      () => {
        createPostsIndexDocument(siteStub, "en", [
          {
            slug: "missing-summary",
            title: "Missing summary",
            date: new Date("2026-03-16T00:00:00Z"),
            url: "/posts/missing-summary/",
          } as unknown as Data,
        ]);
      },
      Error,
      'missing "description"',
    );
  });

  it("registers generated app-manifest and posts-index pages in the Lume build", () => {
    let processor: (() => void) | undefined;
    const queries: string[] = [];
    const site = {
      pages: [],
      process(callback: () => void): void {
        processor = callback;
      },
      search: {
        pages(query: string): unknown[] {
          queries.push(query);

          return [{
            slug: "example-post",
            title: "Example post",
            description: "Contract-backed summary.",
            date: new Date("2026-03-16T00:00:00Z"),
            url: "/posts/example-post/",
          }];
        },
      },
      url(path: string, absolute: boolean): string {
        if (!absolute) {
          throw new Error("Expected absolute URL resolution");
        }

        return `https://normco.re${path}`;
      },
    } as unknown as Site;

    registerMobileContentApi(site);

    if (processor === undefined) {
      throw new Error("Expected mobile content API processor to be registered");
    }

    processor();

    assertEquals(queries, [
      "type=post lang=en",
      "type=post lang=fr",
      "type=post lang=zh-hans",
      "type=post lang=zh-hant",
    ]);

    const generatedUrls = (site.pages as Array<{ data: { url: string } }>).map((
      page,
    ) => page.data.url);

    assertEquals(generatedUrls, [
      APP_MANIFEST_API_PATH,
      POSTS_INDEX_API_PATH,
      "/fr/api/posts/index.json",
      "/zh-hans/api/posts/index.json",
      "/zh-hant/api/posts/index.json",
    ]);
  });

  it("creates localized posts-index pages from the shared serializer", () => {
    const page = createPostsIndexPage(
      {
        url(path: string, _absolute: boolean): string {
          return `https://normco.re${path}`;
        },
      },
      {
        language: "fr",
        pathPrefix: "/fr",
        title: "unused",
        description: "unused",
      },
      [
        {
          slug: "bonjour",
          title: "Bonjour",
          description: "Résumé",
          date: new Date("2026-03-16T00:00:00Z"),
          url: "/fr/posts/bonjour/",
        } as unknown as Data,
      ],
    );

    assertEquals(page.data.url, "/fr/api/posts/index.json");
  });
});
