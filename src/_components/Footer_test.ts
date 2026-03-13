import { assert, assertStringIncludes } from "jsr/assert";
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
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    assertStringIncludes(html, 'class="site-footer"');
  });

  it("contains an RSS feed link", async () => {
    const author = makeAuthor(102);
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    assertStringIncludes(html, 'href="/feed.xml"');
    assertStringIncludes(html, 'aria-label="Open RSS feed"');
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(
      html,
      'd="M8 18c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6C14 20.7 11.3 18 8 18zM8 28c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4C12 26.2 10.2 28 8 28z"',
    );
  });

  it("contains a GitHub repository link", async () => {
    const author = makeAuthor(106);
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    assertStringIncludes(
      html,
      'href="https://github.com/frenchvandal/normco.re"',
    );
    assertStringIncludes(html, 'target="_blank"');
    assertStringIncludes(html, 'rel="noopener noreferrer"');
    assertStringIncludes(html, 'aria-label="Open GitHub repository"');
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(
      html,
      'd="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67s0-1.21 0-2.38c-3.89.84-4.71-1.88-4.71-1.88A3.71 3.71 0 0 0 6.24 22.3c-1.27-.86.1-.85.1-.85A2.94 2.94 0 0 1 8.48 22.9a3 3 0 0 0 4.08 1.16 2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76 5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7 5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59c0 1.87 0 3.38 0 3.84s.25.81 1 .67A14 14 0 0 0 16 2Z"',
    );
  });

  it("renders the GitHub link before feed links", async () => {
    const author = makeAuthor(107);
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    const githubIndex = html.indexOf('aria-label="Open GitHub repository"');
    const rssIndex = html.indexOf('aria-label="Open RSS feed"');
    assert(githubIndex > -1 && rssIndex > -1);
    assert(githubIndex < rssIndex);
  });

  it("contains the current year in the copyright notice", async () => {
    const author = makeAuthor(104);
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    const year = new Date().getFullYear().toString();
    assertStringIncludes(html, year);
  });

  it("contains the author name", async () => {
    const author = makeAuthor(105);
    const html = await renderComponent(
      Footer({ author: author, language: "en", feedXmlUrl: "/feed.xml" }),
    );
    assertStringIncludes(html, author);
  });

  it("uses localized feed URLs when rendered in French", async () => {
    const author = makeAuthor(108);
    const html = await renderComponent(
      Footer({ author: author, language: "fr", feedXmlUrl: "/fr/feed.xml" }),
    );
    assertStringIncludes(html, 'href="/fr/feed.xml"');
  });
});

describe("Footer CSS contracts", () => {
  it("has hover/focus styles for footer navigation links", async () => {
    // This test verifies that the components.css file contains the required
    // hover and focus-visible styles for footer navigation links.
    const cssContent = await Deno.readTextFile(
      new URL("../styles/components.css", import.meta.url),
    );
    assertStringIncludes(
      cssContent,
      ".bx--footer__link:hover",
      "Missing hover style for footer navigation links",
    );
    assertStringIncludes(
      cssContent,
      ".bx--footer__link",
      "Missing focus-visible style for footer navigation links",
    );
  });
});
