import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import Footer from "./Footer.tsx";

const author = faker.person.fullName();

describe("Footer()", () => {
  it("renders a site-footer element", async () => {
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, 'class="site-footer"');
  });

  it("contains an RSS feed link", async () => {
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, 'href="/feed.xml"');
    assertStringIncludes(html, "RSS");
  });

  it("contains a JSON Feed link", async () => {
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, 'href="/feed.json"');
    assertStringIncludes(html, "JSON Feed");
  });

  it("contains the current year in the copyright notice", async () => {
    const html = await renderComponent(Footer({ author: author }));
    const year = new Date().getFullYear().toString();
    assertStringIncludes(html, year);
  });

  it("contains the author name", async () => {
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, author);
  });
});
