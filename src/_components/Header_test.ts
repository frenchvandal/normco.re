import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";

import Header from "./Header.tsx";

describe("Header()", () => {
  describe("ariaCurrent — home link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /posts/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: "normco.re" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /about/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: "normco.re" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/posts/" aria-current="page"');
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/my-post/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/posts/" aria-current="page"');
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertNotMatch(html, /href="\/posts\/" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/about/" aria-current="page"');
    });

    it('does not mark /about/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertNotMatch(html, /href="\/about\/" aria-current="page"/);
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'class="site-header"');
    });

    it("contains the site-name link pointing to /", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'class="site-name"');
    });

    it("contains a Writing nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains an About nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("contains the theme-toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
    });

    it("contains the contrast SVG icon", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: "normco.re" }),
      );
      assertStringIncludes(html, 'class="theme-icon"');
    });
  });
});
