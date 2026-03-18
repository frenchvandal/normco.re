import { assert, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";
import layoutStyles from "../styles/_layout.scss" with { type: "text" };

import Footer from "./Footer.tsx";

function makeAuthor(seed: number): string {
  faker.seed(seed);
  return faker.person.fullName();
}

describe("Footer()", () => {
  it("renders a site-footer element", async () => {
    const author = makeAuthor(101);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    assertStringIncludes(html, 'class="site-footer"');
  });

  it("contains a syndication page link", async () => {
    const author = makeAuthor(102);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    assertStringIncludes(html, 'href="/syndication/"');
    assertStringIncludes(html, 'aria-label="Open syndication page"');
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(html, 'class="site-footer-link-label"');
    assertStringIncludes(html, 'class="site-footer-link-label">Feeds</span>');
    assertStringIncludes(html, 'data-carbon-icon="rss"');
  });

  it("contains a GitHub repository link", async () => {
    const author = makeAuthor(106);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    assertStringIncludes(
      html,
      'href="https://github.com/frenchvandal/normco.re"',
    );
    assertStringIncludes(html, 'target="_blank"');
    assertStringIncludes(html, 'rel="noopener noreferrer"');
    assertStringIncludes(html, 'aria-label="Open GitHub repository"');
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(html, 'class="site-footer-link-label">GitHub</span>');
    assertStringIncludes(html, 'data-carbon-icon="logo--github"');
  });

  it("renders the GitHub link before feed links", async () => {
    const author = makeAuthor(107);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    const githubIndex = html.indexOf('aria-label="Open GitHub repository"');
    const rssIndex = html.indexOf('aria-label="Open syndication page"');
    assert(githubIndex > -1 && rssIndex > -1);
    assert(githubIndex < rssIndex);
  });

  it("contains the copyright year range when start year differs from current year", async () => {
    const author = makeAuthor(104);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    const currentYear = new Date().getFullYear();
    assertStringIncludes(html, `2022-${currentYear}`);
  });

  it("contains only the current year when start year equals current year", async () => {
    const author = makeAuthor(109);
    const currentYear = new Date().getFullYear();
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: currentYear,
      }),
    );
    // Should contain the year only once (not as a range)
    const yearMatches = html.match(new RegExp(String(currentYear), "g"));
    assert(yearMatches !== null && yearMatches.length === 1);
  });

  it("contains the author name", async () => {
    const author = makeAuthor(105);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
      }),
    );
    assertStringIncludes(html, author);
  });

  it("uses localized syndication page URLs when rendered in French", async () => {
    const author = makeAuthor(108);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "fr",
        syndicationPageUrl: "/fr/syndication/",
        blogStartYear: 2022,
      }),
    );
    assertStringIncludes(html, 'href="/fr/syndication/"');
  });
});

describe("Footer CSS contracts", () => {
  it("has hover/focus styles for footer navigation links", () => {
    assertStringIncludes(
      layoutStyles,
      ".site-footer-nav a:hover",
      "Missing hover style for footer navigation links",
    );
    assertStringIncludes(
      layoutStyles,
      ".site-footer-nav a:focus-visible",
      "Missing focus-visible style for footer navigation links",
    );
  });
});
