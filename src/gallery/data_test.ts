import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeData } from "../../test/lume.ts";

import { collectGalleryItems } from "./data.ts";

const DATE_HELPER = (value: unknown, format?: string): string | undefined => {
  if (!(value instanceof Date)) {
    return undefined;
  }

  if (format === "ATOM") {
    return value.toISOString();
  }

  return "Jan 5";
};

function makePost(
  overrides: Partial<Lume.Data> = {},
): Lume.Data {
  return asLumeData({
    basename: "example-post",
    title: "Example post",
    url: "/posts/example-post/",
    date: new Date("2026-01-05T00:00:00.000Z"),
    description: "A short summary.",
    readingInfo: { minutes: 3 },
    tags: ["design"],
    children: "",
    ...overrides,
  });
}

describe("collectGalleryItems()", () => {
  it("collects local post images once and skips remote duplicates", async () => {
    const items = await collectGalleryItems(
      [
        makePost({
          children:
            '<p><img src="./images/hero.jpg" alt="Hero" width="800" height="500"></p>' +
            '<p><img src="./images/hero.jpg" alt="Duplicate" width="800" height="500"></p>' +
            '<p><img src="https://example.com/remote.jpg" alt="Remote"></p>',
        }),
      ],
      "en",
      DATE_HELPER,
    );

    assertEquals(items, [
      {
        key: "/posts/example-post/::1",
        src: "/posts/example-post/images/hero.jpg",
        alt: "Hero",
        width: 800,
        height: 500,
        postTitle: "Example post",
        postUrl: "/posts/example-post/",
        postSummary: "A short summary.",
        postDateIso: "2026-01-05T00:00:00.000Z",
        postDateLabel: "Jan 5",
        postReadingLabel: "3 min read",
        tags: ["design"],
      },
    ]);
  });

  it("falls back to repository image dimensions when markup omits them", async () => {
    const items = await collectGalleryItems(
      [
        makePost({
          children:
            '<p><img src="/posts/vestibulum-ante/images/bruno-martins-4cwf-iW6I1Q-unsplash.jpg" alt="Reference image"></p>',
        }),
      ],
      "en",
      DATE_HELPER,
    );

    assertEquals(items[0]?.width, 3454);
    assertEquals(items[0]?.height, 2302);
  });
});
