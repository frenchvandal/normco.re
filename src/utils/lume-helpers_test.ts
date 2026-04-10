import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeHelpers } from "../../test/lume.ts";

import {
  renderFallbackPostCard,
  resolveDateHelper,
  resolvePostCardRenderer,
} from "./lume-helpers.ts";
import {
  resolvePostSummaryViewTransitionName,
  resolvePostTitleViewTransitionName,
  VIEW_TRANSITION_NAME_ATTRIBUTE,
} from "./view-transitions.ts";

describe("resolvePostCardRenderer()", () => {
  it("preserves the renderer context when a dynamic PostCard is available", async () => {
    const renderer = resolvePostCardRenderer({
      prefix: "Module",
      PostCard(this: { prefix: string }, { title }: { title: string }) {
        return `<p>${this.prefix}: ${title}</p>`;
      },
    });

    assertEquals(
      await renderer({
        title: "Hello",
        url: "/posts/hello/",
        dateStr: "Mar 29, 2026",
        dateIso: "2026-03-29",
      }),
      "<p>Module: Hello</p>",
    );
  });

  it("falls back to the static renderer when PostCard is missing", async () => {
    const renderer = resolvePostCardRenderer({});
    const props = {
      title: "Hello",
      url: "/posts/hello/",
      dateStr: "Mar 29, 2026",
      dateIso: "2026-03-29",
    };

    assertEquals(await renderer(props), await renderFallbackPostCard(props));
  });
});

describe("resolveDateHelper()", () => {
  it("preserves the helper context when the dynamic date helper exists", () => {
    const dateHelper = resolveDateHelper(
      asLumeHelpers({
        prefix: "fmt",
        date(
          this: { prefix: string },
          value: unknown,
          pattern?: string,
          lang?: string,
        ) {
          return `${this.prefix}:${String(value)}:${pattern}:${lang}`;
        },
      }),
    );

    assertEquals(
      dateHelper("2026-03-29", "ATOM", "en"),
      "fmt:2026-03-29:ATOM:en",
    );
  });

  it("returns undefined when the dynamic date helper is unavailable", () => {
    const dateHelper = resolveDateHelper(asLumeHelpers({}));

    assertEquals(dateHelper("2026-03-29"), undefined);
  });
});

describe("renderFallbackPostCard()", () => {
  it("adds a shared title transition for canonical post URLs", async () => {
    const html = await renderFallbackPostCard({
      title: "Hello",
      url: "/posts/hello/",
      dateStr: "Mar 29, 2026",
      dateIso: "2026-03-29",
    });

    assertEquals(
      html.includes(
        `${VIEW_TRANSITION_NAME_ATTRIBUTE}="${
          resolvePostTitleViewTransitionName("/posts/hello/")
        }"`,
      ),
      true,
    );
  });

  it("adds a shared summary transition when a visible summary is rendered", async () => {
    const html = await renderFallbackPostCard({
      title: "Hello",
      url: "/posts/hello/",
      dateStr: "Mar 29, 2026",
      dateIso: "2026-03-29",
      summary: "Visible summary",
      showSummary: true,
    });

    assertEquals(
      html.includes(
        `${VIEW_TRANSITION_NAME_ATTRIBUTE}="${
          resolvePostSummaryViewTransitionName("/posts/hello/")
        }"`,
      ),
      true,
    );
  });
});
