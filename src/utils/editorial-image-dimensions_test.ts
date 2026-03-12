import { assertEquals, assertStringIncludes, assertThrows } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { DOMParser } from "lume/deps/dom.ts";

import {
  assertEditorialImageDimensions,
  collectEditorialImageDimensionIssues,
  type EditorialImagePageSnapshot,
} from "./editorial-image-dimensions.ts";

function parseHtml(html: string): EditorialImagePageSnapshot["document"] {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  if (document === null) {
    throw new Error("Cannot parse HTML fixture");
  }

  return document;
}

describe("editorial image dimensions gate", () => {
  it("passes when editorial images expose explicit width and height", () => {
    const document = parseHtml(
      `<main data-pagefind-body="">
        <article>
          <img src="/img/post-cover.png" width="1280" height="720" alt="cover">
        </article>
      </main>`,
    );
    const issues = collectEditorialImageDimensionIssues({
      pageUrl: "/posts/with-dimensions/",
      document,
    });

    assertEquals(issues.length, 0);
    assertEditorialImageDimensions([
      {
        pageUrl: "/posts/with-dimensions/",
        document,
      },
    ]);
  });

  it("ignores images outside editorial scope", () => {
    const document = parseHtml(
      `<main data-pagefind-ignore="">
        <img src="/img/feed-icon.png" alt="feed icon">
      </main>
      <footer>
        <img src="/img/footer-badge.png" alt="badge">
      </footer>`,
    );
    const issues = collectEditorialImageDimensionIssues({
      pageUrl: "/feed.xsl",
      document,
    });

    assertEquals(issues.length, 0);
  });

  it("fails when an editorial image misses width and/or height", () => {
    const document = parseHtml(
      `<main data-pagefind-body="">
        <article>
          <img src="/img/missing-both.png" alt="missing both">
          <img src="/img/missing-height.png" width="640" alt="missing height">
        </article>
      </main>`,
    );

    assertThrows(
      () =>
        assertEditorialImageDimensions([
          {
            pageUrl: "/posts/broken/",
            document,
          },
        ]),
      Error,
      "editorial-image-dimensions",
    );

    const issues = collectEditorialImageDimensionIssues({
      pageUrl: "/posts/broken/",
      document,
    });
    assertEquals(issues.length, 2);
    assertStringIncludes(issues[0] ?? "", "missing width+height");
    assertStringIncludes(issues[1] ?? "", "missing height");
  });
});
