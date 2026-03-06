import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import Footer from "./Footer.ts";

describe("Footer()", () => {
  it("renders a site-footer element", () => {
    const html = Footer({});
    assertStringIncludes(html, 'class="site-footer"');
  });

  it("contains an RSS feed link", () => {
    const html = Footer({});
    assertStringIncludes(html, 'href="/feed.xml"');
    assertStringIncludes(html, "RSS");
  });

  it("contains a JSON Feed link", () => {
    const html = Footer({});
    assertStringIncludes(html, 'href="/feed.json"');
    assertStringIncludes(html, "JSON Feed");
  });

  it("contains the current year in the copyright notice", () => {
    const html = Footer({});
    const year = new Date().getFullYear().toString();
    assertStringIncludes(html, year);
  });

  it("contains the author name", () => {
    const html = Footer({});
    assertStringIncludes(html, "Phiphi");
  });
});
