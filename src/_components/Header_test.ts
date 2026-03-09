import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import Header from "./Header.tsx";

function makeSiteName(seed: number): string {
  faker.seed(seed);
  return faker.internet.domainName();
}

describe("Header()", () => {
  describe("ariaCurrent — home link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', async () => {
      const siteName = makeSiteName(201);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /posts/', async () => {
      const siteName = makeSiteName(202);
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: siteName }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /about/', async () => {
      const siteName = makeSiteName(203);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', async () => {
      const siteName = makeSiteName(204);
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: siteName }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", async () => {
      const siteName = makeSiteName(205);
      const html = await renderComponent(
        Header({ currentUrl: "/posts/my-post/", siteName: siteName }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const siteName = makeSiteName(206);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertNotMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', async () => {
      const siteName = makeSiteName(207);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName }),
      );
      assertMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });

    it('does not mark /about/ as current on "/"', async () => {
      const siteName = makeSiteName(208);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertNotMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", async () => {
      const siteName = makeSiteName(209);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertStringIncludes(html, 'class="site-header"');
    });

    it("contains the site-name link pointing to /", async () => {
      const siteName = makeSiteName(210);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName }),
      );
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'class="site-name"');
    });

    it("contains a Writing nav link", async () => {
      const siteName = makeSiteName(211);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains an About nav link", async () => {
      const siteName = makeSiteName(212);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("contains the theme-toggle button", async () => {
      const siteName = makeSiteName(213);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
    });

    it("contains the contrast SVG icon", async () => {
      const siteName = makeSiteName(214);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName }),
      );
      assertMatch(html, /class="theme-icon[^"]*"/);
    });
  });
});
