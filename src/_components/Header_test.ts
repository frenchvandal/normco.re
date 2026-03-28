import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import headerStyles from "../styles/components/header.css" with {
  type: "text",
};
import layoutShellStyles from "../styles/layout.css" with { type: "text" };
import navigationStyles from "../styles/components/navigation.css" with {
  type: "text",
};

import Header from "./Header.tsx";
import { ariaCurrent, buildHeaderNavigation } from "./header-navigation.ts";

const layoutStyles = [
  headerStyles,
  navigationStyles,
  layoutShellStyles,
].join("\n");

describe("header-navigation.ts", () => {
  describe("ariaCurrent()", () => {
    it("marks exact matches as current", () => {
      assertEquals(ariaCurrent("/posts/", "/posts/"), {
        "aria-current": "page",
      });
      assertEquals(ariaCurrent("/about/", "/about"), {
        "aria-current": "page",
      });
    });

    it("keeps home inactive on child routes", () => {
      assertEquals(ariaCurrent("/", "/posts/"), {});
      assertEquals(ariaCurrent("/fr/", "/fr/about/"), {});
    });

    it("marks child routes under non-home sections", () => {
      assertEquals(ariaCurrent("/posts/", "/posts/my-post/"), {
        "aria-current": "page",
      });
    });
  });

  describe("buildHeaderNavigation()", () => {
    it("marks writing current for tag taxonomy routes", () => {
      const navigationItems = buildHeaderNavigation({
        currentUrl: "/tags/design/",
        language: "en",
      });

      assertEquals(navigationItems.map((item) => item.isCurrent), [
        false,
        true,
        false,
      ]);
      assertEquals(navigationItems[1]?.href, "/posts/");
    });

    it("keeps localized home inactive on localized child routes", () => {
      const navigationItems = buildHeaderNavigation({
        currentUrl: "/fr/posts/instructions/",
        language: "fr",
      });

      assertEquals(navigationItems.map((item) => item.isCurrent), [
        false,
        true,
        false,
      ]);
      assertEquals(navigationItems[0]?.href, "/fr/");
      assertEquals(navigationItems[2]?.href, "/fr/about/");
    });
  });
});

describe("Header()", () => {
  it("keeps the shared shell on non-home routes", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertMatch(html, /<header[^>]*class="site-header"/);
    assertStringIncludes(html, 'class="site-header__wrapper"');
    assertStringIncludes(html, 'class="site-header__left"');
    assertStringIncludes(html, 'class="site-header__global"');
    assertStringIncludes(html, 'class="site-header__nav"');
    assertStringIncludes(html, 'data-site-header-menu=""');
    assertStringIncludes(html, 'class="site-header__menu-shell"');
    assertStringIncludes(
      html,
      'class="site-header__menu-list"',
    );
    assertStringIncludes(html, 'class="site-header__menu-item"');
    assertStringIncludes(html, 'class="site-side-nav__navigation"');
    assertStringIncludes(html, 'data-side-nav-close=""');
    assertNotMatch(html, /data-side-nav-utility=/);
    assertStringIncludes(
      html,
      'class="site-side-nav__items"',
    );
    assertStringIncludes(html, 'role="dialog"');
  });

  it("keeps legacy navigation, menu, and icon controls off the home route", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertMatch(
      html,
      /<button[^>]*class="site-header__action site-header__menu-toggle"[^>]*aria-controls="site-side-nav"/,
    );
    assertStringIncludes(html, 'data-icon="three-bars"');
    assertStringIncludes(html, 'data-icon="x"');
    assertStringIncludes(html, 'data-icon="translation"');
    assertStringIncludes(html, 'data-icon="sun"');
    assertStringIncludes(html, 'data-icon="moon"');
    assertStringIncludes(html, 'data-icon="device-desktop"');
  });

  it("renders search, language, and theme affordances for the legacy header", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertStringIncludes(html, 'data-header-tooltip-trigger=""');
    assertStringIncludes(html, 'id="site-search-panel"');
    assertStringIncludes(html, 'data-search-status=""');
    assertStringIncludes(html, 'data-search-root=""');
    assertStringIncludes(html, 'id="site-language-panel"');
    assertStringIncludes(html, 'data-language-menu=""');
    assertStringIncludes(html, 'id="theme-toggle"');
    assertStringIncludes(
      html,
      'data-label-follow-system="Follow system theme"',
    );
  });

  it("keeps language labels invariant and honors alternates in the legacy menu", async () => {
    const html = await renderComponent(
      Header({
        currentUrl: "/fr/about/",
        language: "fr",
        languageAlternates: {
          en: "/about/",
          fr: "/fr/about/",
          zhHans: "/zh-hans/about/",
          zhHant: "/zh-hant/about/",
        },
      }),
    );

    assertStringIncludes(
      html,
      '<span class="site-header__language-label">English</span>',
    );
    assertStringIncludes(
      html,
      '<span class="site-header__language-label">Français</span>',
    );
    assertStringIncludes(
      html,
      'href="/about/" class="site-header__language-option" data-language-option="en"',
    );
    assertStringIncludes(
      html,
      'href="/fr/about/" class="site-header__language-option" data-language-option="fr"',
    );
    assertMatch(html, /<a[^>]*href="\/fr\/about\/"[^>]*aria-checked="true"/);
  });

  it("localizes the legacy header for French child routes", async () => {
    const html = await renderComponent(
      Header({
        currentUrl: "/fr/posts/instructions/",
        language: "fr",
      }),
    );

    assertStringIncludes(html, 'href="/fr/posts/"');
    assertStringIncludes(html, "Articles");
    assertStringIncludes(html, 'aria-label="Ouvrir le menu de navigation"');
    assertStringIncludes(html, 'aria-label="Recherche"');
    assertStringIncludes(
      html,
      'data-search-loading-label="Chargement des résultats de recherche."',
    );
    assertNotMatch(
      html,
      /<a[^>]*href="\/fr\/"[^>]*aria-current="page"/,
    );
    assertStringIncludes(
      html,
      'class="site-side-nav__item site-side-nav__item--current"',
    );
    assertMatch(
      html,
      /<a[^>]*href="\/fr\/posts\/"[^>]*aria-current="page"/,
    );
  });

  it("switches to the editorial home variant on home routes", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/", language: "en" }),
    );

    assertMatch(
      html,
      /<header[^>]*class="site-header site-header--editorial-home"/,
    );
    assertStringIncludes(
      html,
      'class="site-header__nav editorial-home-header__nav"',
    );
    assertStringIncludes(html, 'data-site-header-menu=""');
    assertStringIncludes(html, 'class="site-header__menu-shell"');
    assertStringIncludes(
      html,
      'class="site-header__action editorial-home-header__action"',
    );
    assertStringIncludes(html, 'class="editorial-home-header__action-icon"');
    assertStringIncludes(html, 'data-icon="translation"');
    assertStringIncludes(html, "theme-icon theme-icon--sun");
    assertStringIncludes(html, "theme-icon theme-icon--moon");
    assertStringIncludes(html, "theme-icon theme-icon--system");
    assertStringIncludes(
      html,
      'class="site-side-nav editorial-home-header__drawer"',
    );
    assertNotMatch(html, /\bbtn-octicon\b/);
    assertNotMatch(html, /\bsubnav-item\b/);
    assertNotMatch(html, /\bBox\b/);
  });

  it("still omits the older pre-shell native navigation fragments", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/", language: "en" }),
    );

    assertNotMatch(html, /class="site-navigation-toggle"/);
    assertNotMatch(html, /class="site-navigation"/);
    assertNotMatch(html, /class="site-language-select"/);
    assertNotMatch(html, /id="language-select"/);
    assertNotMatch(html, /<cds-header-global-action/);
  });
});

describe("Header CSS contracts", () => {
  it("uses shared focus tokens for inset shell controls", () => {
    assertStringIncludes(
      layoutStyles,
      ".site-header__menu-toggle:focus-visible,",
    );
    assertStringIncludes(
      layoutStyles,
      "border-color: var(--ph-color-border-default);",
    );
  });

  it("keeps the desktop navigation and global actions visually separated", () => {
    assertStringIncludes(layoutStyles, "@media (min-width: 64rem) {");
    assertStringIncludes(layoutStyles, ".site-header__global {");
    assertStringIncludes(
      layoutStyles,
      "border-inline-start: var(--ph-border-hairline) solid",
    );
  });

  it("styles the mobile side nav as an editorial sheet", () => {
    assertStringIncludes(layoutStyles, ".site-side-nav__header");
    assertStringIncludes(layoutStyles, ".site-side-nav__brand");
    assertStringIncludes(layoutStyles, ".site-side-nav__close");
    assertStringIncludes(layoutStyles, ".site-side-nav__close-icon");
    assertStringIncludes(layoutStyles, ".site-side-nav__menu-shell");
    assertStringIncludes(layoutStyles, ".site-side-nav__items {");
    assertStringIncludes(layoutStyles, ".site-side-nav__link-text");
    assertStringIncludes(layoutStyles, ".site-side-nav__overlay");
    assertStringIncludes(layoutStyles, "var(--ph-side-nav-width)");
    assertStringIncludes(layoutStyles, "min-block-size: 3.75rem;");
    assertStringIncludes(
      layoutStyles,
      "box-shadow: var(--ph-shadow-floating);",
    );
    assertStringIncludes(
      layoutStyles,
      "z-index: calc(var(--ph-layer-header-panel) + 1);",
    );
    assertStringIncludes(layoutStyles, "inset: 0;");
  });
});
