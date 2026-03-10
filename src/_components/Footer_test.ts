import { assert, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import Footer from "./Footer.tsx";

function makeAuthor(seed: number): string {
  faker.seed(seed);
  return faker.person.fullName();
}

describe("Footer()", () => {
  it("renders a site-footer element", async () => {
    const author = makeAuthor(101);
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, 'class="site-footer"');
  });

  it("contains an RSS feed link", async () => {
    const author = makeAuthor(102);
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, 'href="/feed.xml"');
    assertStringIncludes(html, 'aria-label="Open RSS feed"');
    assertNotMatch(html, /<span>RSS<\/span>/);
  });

  it("contains a GitHub repository link", async () => {
    const author = makeAuthor(106);
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(
      html,
      'href="https://github.com/frenchvandal/normco.re"',
    );
    assertStringIncludes(html, 'target="_blank"');
    assertStringIncludes(html, 'rel="noopener noreferrer"');
    assertStringIncludes(html, 'aria-label="Open GitHub repository"');
    assertNotMatch(html, /<span>GitHub<\/span>/);
  });

  it("renders the GitHub link before feed links", async () => {
    const author = makeAuthor(107);
    const html = await renderComponent(Footer({ author: author }));
    const githubIndex = html.indexOf('aria-label="Open GitHub repository"');
    const rssIndex = html.indexOf('aria-label="Open RSS feed"');
    assert(githubIndex > -1 && rssIndex > -1);
    assert(githubIndex < rssIndex);
  });

  it("contains the current year in the copyright notice", async () => {
    const author = makeAuthor(104);
    const html = await renderComponent(Footer({ author: author }));
    const year = new Date().getFullYear().toString();
    assertStringIncludes(html, year);
  });

  it("contains the author name", async () => {
    const author = makeAuthor(105);
    const html = await renderComponent(Footer({ author: author }));
    assertStringIncludes(html, author);
  });
});
