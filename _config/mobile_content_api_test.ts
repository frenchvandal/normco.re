import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type Site from "lume/core/site.ts";
import type { Data, Page } from "lume/core/file.ts";

import {
  APP_CONTRACT_VERSION,
  createAppManifestDocument,
  createPostDetailPage,
  createPostsIndexDocument,
  createPostsIndexPage,
  registerMobileContentApi,
} from "./mobile_content_api.ts";
import { getJSDOM } from "../test/jsdom.ts";

const JSDOM = await getJSDOM();

type Processor = (pages: Page[], allPages: Page[]) => void;

function createDocument(markup: string): Document {
  return new JSDOM(
    `<!doctype html><html><body>${markup}</body></html>`,
  ).window.document;
}

function createPostPage(
  options: {
    slug?: string;
    lang?: string;
    title?: string;
    description?: string;
    url?: string;
    date?: Date;
    document?: Document;
  } = {},
): Page {
  const slug = options.slug ?? "example-post";
  const lang = options.lang ?? "en";

  return {
    data: {
      type: "post",
      id: slug,
      basename: slug,
      lang,
      title: options.title ?? "Example post",
      description: options.description ?? "Contract-backed summary.",
      date: options.date ?? new Date("2026-03-16T00:00:00Z"),
      url: options.url ??
        (lang === "en" ? `/posts/${slug}/` : `/${lang}/posts/${slug}/`),
      readingInfo: { minutes: 1.2 },
      tags: ["android", 42, "compose"],
    } as unknown as Data,
    document: options.document ??
      createDocument(`
        <article class="post-content">
          <p>Hello contract.</p>
          <h2>Section</h2>
          <pre><code class="language-kotlin">println("hi")</code></pre>
        </article>
      `),
    sourcePath: `/src/posts/${slug}/${lang}.md`,
  } as unknown as Page;
}

function createStubSite() {
  let processor: Processor | undefined;

  const site = {
    process(formats: string[], callback: Processor): void {
      assertEquals(formats, [".html"]);
      processor = callback;
    },
    url(path: string, absolute: boolean): string {
      if (!absolute) {
        throw new Error("Expected absolute URL resolution");
      }

      return `https://normco.re${path}`;
    },
  } as unknown as Site;

  function run(pages: Page[], allPages = [...pages]): Page[] {
    if (processor === undefined) {
      throw new Error("Expected mobile content API processor to be registered");
    }

    processor(pages, allPages);
    return allPages;
  }

  return { run, site };
}

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
        basename: "example-post",
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

  it("builds post-detail pages with alternates and structured blocks", () => {
    const siteStub = {
      url(path: string, absolute: boolean): string {
        if (!absolute) {
          throw new Error("Expected absolute URL resolution");
        }

        return `https://normco.re${path}`;
      },
    };

    const englishPage = createPostPage({ lang: "en" });
    const frenchPage = createPostPage({
      lang: "fr",
      title: "Bonjour",
      description: "Résumé",
      url: "/fr/posts/example-post/",
    });

    const detailPage = createPostDetailPage(siteStub, englishPage, [
      englishPage,
      frenchPage,
    ]);
    const json = JSON.parse(detailPage.content as string) as {
      readonly lang: string;
      readonly alternates: ReadonlyArray<
        {
          readonly lang: string;
          readonly apiUrl: string;
          readonly webUrl: string;
        }
      >;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly text?: string;
        readonly level?: number;
      }>;
      readonly heroImage: null;
    };

    assertEquals(detailPage.data.url, "/api/posts/example-post.json");
    assertEquals(json.lang, "en");
    assertEquals(json.heroImage, null);
    assertEquals(json.alternates, [
      {
        lang: "fr",
        apiUrl: "/fr/api/posts/example-post.json",
        webUrl: "https://normco.re/fr/posts/example-post/",
      },
    ]);
    assertEquals(json.blocks[0], {
      type: "paragraph",
      text: "Hello contract.",
    });
    assertEquals(json.blocks[1], {
      type: "heading",
      level: 2,
      text: "Section",
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
            basename: "missing-summary",
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

  it("registers generated app-manifest, posts-index, and post-detail pages in the Lume build", () => {
    const env = createStubSite();
    registerMobileContentApi(env.site);

    const allPages = env.run([
      createPostPage({ slug: "example-post", lang: "en" }),
      createPostPage({
        slug: "example-post",
        lang: "fr",
        url: "/fr/posts/example-post/",
      }),
    ]);

    const generatedUrls = allPages.filter((page) =>
      page.sourcePath === "(generated)"
    )
      .map((page) => page.data.url)
      .sort();

    assertEquals(generatedUrls, [
      "/api/app-manifest.json",
      "/api/posts/example-post.json",
      "/api/posts/index.json",
      "/fr/api/posts/example-post.json",
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
          basename: "bonjour",
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
