import {
  assertEquals,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeData, asLumeHelpers } from "../test/lume.ts";

import galleryPage, { searchIndexed } from "./gallery.page.tsx";
import {
  GALLERY_RESPONSIVE_IMAGE_SIZES,
  GALLERY_RESPONSIVE_IMAGE_TRANSFORMS,
} from "./gallery/constants.ts";

const MOCK_HELPERS = asLumeHelpers({
  date: (value: unknown, format?: string): string | undefined => {
    if (format === "ATOM" && value instanceof Date) {
      return value.toISOString();
    }

    return "Jan 5";
  },
});

function makeData(posts: readonly Lume.Data[], lang?: string): Lume.Data {
  return asLumeData({
    ...(lang ? { lang } : {}),
    search: {
      pages: (_query: string, _sort: string) => posts,
    },
  });
}

function makePost(overrides: Partial<Lume.Data> = {}): Lume.Data {
  return asLumeData({
    basename: "example-post",
    title: "Example post",
    url: "/posts/example-post/",
    date: new Date("2026-01-05T00:00:00.000Z"),
    description: "A short summary.",
    readingInfo: { minutes: 3 },
    tags: ["design"],
    children:
      '<p><img src="./images/hero.jpg" alt="Hero" width="800" height="500"></p>',
    ...overrides,
  });
}

describe("gallery.page.tsx", () => {
  it("keeps the gallery page in the static blog shell", async () => {
    const html = await galleryPage(makeData([]), MOCK_HELPERS);

    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--gallery"',
    );
    assertEquals(searchIndexed, false);
  });

  it("renders a static Lume-friendly gallery fallback and client bootstrap", async () => {
    const html = await galleryPage(makeData([makePost()]), MOCK_HELPERS);

    assertStringIncludes(html, 'class="blog-antd-gallery-hero__visual"');
    assertStringIncludes(
      html,
      'class="blog-antd-gallery-hero__panel blog-antd-gallery-hero__panel--lead"',
    );
    assertStringIncludes(html, 'class="blog-antd-gallery-root"');
    assertStringIncludes(html, 'class="blog-antd-gallery-fallback"');
    assertStringIncludes(
      html,
      'data-gallery-item-key="/posts/example-post/::1"',
    );
    assertStringIncludes(html, `sizes="${GALLERY_RESPONSIVE_IMAGE_SIZES}"`);
    assertStringIncludes(
      html,
      `transform-images="${GALLERY_RESPONSIVE_IMAGE_TRANSFORMS}"`,
    );
    assertStringIncludes(html, 'script id="blog-gallery-data"');
    assertStringIncludes(html, 'src="/scripts/gallery.js"');
    assertStringIncludes(html, 'href="/posts/example-post/"');
    assertStringIncludes(html, "Open article");
  });

  it("renders the shared empty state when no post images are available", async () => {
    const html = await galleryPage(
      makeData([
        makePost({
          children:
            '<p><img src="https://example.com/remote.jpg" alt="Remote"></p>',
        }),
      ]),
      MOCK_HELPERS,
    );

    assertStringIncludes(html, 'class="state-panel state-panel--inline"');
    assertStringIncludes(html, "No images yet.");
    assertNotMatch(html, /blog-gallery-data/);
    assertNotMatch(html, /\/scripts\/gallery\.js/);
  });

  it("localizes the gallery chrome for French", async () => {
    const html = await galleryPage(makeData([], "fr"), MOCK_HELPERS);

    assertStringIncludes(html, "Index visuel");
    assertStringIncludes(html, 'href="/fr/posts/"');
    assertStringIncludes(html, "Retour aux articles");
  });
});
