import { assert, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";
import layoutStyles from "../styles/_layout.scss" with { type: "text" };

import Footer from "./Footer.tsx";

const FIXED_CURRENT_YEAR = 2026;

function makeAuthor(seed: number): string {
  seedTestFaker(seed);
  return faker.person.fullName();
}

describe("Footer()", () => {
  it("renders a site-footer element", async () => {
    const author = makeAuthor(101);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
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
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );
    assertStringIncludes(html, 'href="/syndication/"');
    assertStringIncludes(html, 'aria-label="Open syndication page"');
    assertStringIncludes(html, ">Syndication</span>");
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(html, 'data-carbon-icon="rss"');
  });

  it("contains a GitHub repository link", async () => {
    const author = makeAuthor(106);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );
    assertStringIncludes(
      html,
      'href="https://github.com/frenchvandal/normco.re"',
    );
    assertStringIncludes(html, 'target="_blank"');
    assertStringIncludes(html, 'rel="noopener noreferrer"');
    assertStringIncludes(html, 'aria-label="Open GitHub repository"');
    assertStringIncludes(html, ">GitHub</span>");
    assertStringIncludes(html, 'class="site-footer-icon"');
    assertStringIncludes(html, 'data-carbon-icon="logo--github"');
  });

  it("renders the GitHub link before feed links", async () => {
    const author = makeAuthor(107);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
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
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );
    assertStringIncludes(html, `2022-${FIXED_CURRENT_YEAR}`);
  });

  it("contains only the current year when start year equals current year", async () => {
    const author = makeAuthor(109);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: FIXED_CURRENT_YEAR,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );
    // Should contain the year only once (not as a range)
    const yearMatches = html.match(new RegExp(String(FIXED_CURRENT_YEAR), "g"));
    assert(yearMatches !== null && yearMatches.length === 1);
  });

  it("contains the author name", async () => {
    const author = makeAuthor(105);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
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
        homeUrl: "/fr/",
        syndicationPageUrl: "/fr/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );
    assertStringIncludes(html, 'href="/fr/syndication/"');
  });

  it("renders a home link brand mark", async () => {
    const author = makeAuthor(110);
    const html = await renderComponent(
      Footer({
        author: author,
        language: "en",
        homeUrl: "/",
        syndicationPageUrl: "/syndication/",
        blogStartYear: 2022,
        currentYear: FIXED_CURRENT_YEAR,
      }),
    );

    assertStringIncludes(html, 'href="/" class="site-footer-mark"');
    assertStringIncludes(html, ">normco.re<");
    assertStringIncludes(html, 'class="site-footer-copy"');
  });
});

describe("Footer CSS contracts", () => {
  it("has hover/focus styles for footer navigation links", () => {
    assertStringIncludes(
      layoutStyles,
      ".site-footer-link:hover",
      "Missing hover style for footer navigation links",
    );
    assertStringIncludes(
      layoutStyles,
      ".site-footer-link:focus-visible",
      "Missing focus-visible style for footer navigation links",
    );
    assertStringIncludes(layoutStyles, ".site-footer-mark");
    assertStringIncludes(layoutStyles, ".site-footer-copy");
  });
});
