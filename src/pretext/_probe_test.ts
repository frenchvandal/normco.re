import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeData } from "../../test/lume.ts";

import pretextProbePage, {
  description,
  extraStylesheets,
  searchIndexed,
  title,
  unlisted,
  url,
} from "./probe.page.tsx";

describe("pretext/probe.page.tsx", () => {
  it("stays unlisted and opts out of search indexing", () => {
    assertEquals(url, "/pretext/probe/");
    assertEquals(title, "Pretext Browser Probe");
    assertEquals(
      description,
      "Internal browser-only route for measuring Pretext-driven React surfaces.",
    );
    assertEquals(extraStylesheets, ["/styles/blog-antd.css"]);
    assertEquals(searchIndexed, false);
    assertEquals(unlisted, true);
  });

  it("renders the localized probe root and browser entrypoint", () => {
    const html = pretextProbePage(asLumeData({ lang: "fr" }));

    assertStringIncludes(html, 'id="pretext-browser-probe"');
    assertStringIncludes(html, 'class="blog-antd-probe-root"');
    assertStringIncludes(html, 'data-language="fr"');
    assertStringIncludes(
      html,
      '<script src="/scripts/pretext-browser-probe.js" type="module" defer="defer"></script>',
    );
  });
});
