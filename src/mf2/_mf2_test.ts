import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker, seedTestFaker } from "../../test/faker.ts";

import HEntryShell from "./components/HEntryShell.tsx";
import HFeedShell from "./components/HFeedShell.tsx";
import HiddenHCard from "./components/HiddenHCard.tsx";
import HiddenUrl from "./components/HiddenUrl.tsx";
import { MF2_HTML_CONTENT_TYPE } from "./config.ts";
import { getAuthorIdentity, getCanonicalFeedUrl } from "./extractors.ts";

describe("src/mf2", () => {
  it("resolves localized author and canonical feed metadata", () => {
    assertEquals(getCanonicalFeedUrl("en"), "/posts/");
    assertEquals(getCanonicalFeedUrl("fr"), "/fr/posts/");
    assertEquals(getAuthorIdentity("zhHans", "Phiphi"), {
      name: "Phiphi",
      url: "/zh-hans/about/",
    });
  });

  it("renders hidden discovery fragments for URLs and authors", async () => {
    seedTestFaker(1101);
    const url = `/posts/${faker.lorem.slug(2)}/`;
    const author = {
      name: faker.person.firstName(),
      url: `/about/${faker.lorem.slug(1)}/`,
    } as const;

    assertEquals(MF2_HTML_CONTENT_TYPE, "text/mf2+html");

    const urlHtml = await renderComponent(HiddenUrl({ url }));
    const authorHtml = await renderComponent(
      HiddenHCard({ author }),
    );

    assertStringIncludes(urlHtml, 'class="u-url sr-only"');
    assertStringIncludes(urlHtml, `href="${url}"`);
    assertStringIncludes(authorHtml, 'class="p-author h-card sr-only"');
    assertStringIncludes(authorHtml, author.name);
  });

  it("renders entry and feed shells with shared mf2 chrome", async () => {
    seedTestFaker(1102);
    const author = {
      name: faker.person.fullName(),
      url: `/about/${faker.lorem.slug(1)}/`,
    } as const;
    const summary = faker.lorem.sentence();
    const title = faker.lorem.words(3);
    const feedName = faker.company.name();

    const entryHtml = await renderComponent(
      HEntryShell({
        className: "post-card h-entry",
        summary,
        author,
        children: { __html: `<h3 class="p-name">${title}</h3>` },
      }),
    );
    const feedHtml = await renderComponent(
      HFeedShell({
        className: "home-recent h-feed",
        tagName: "section",
        url: "/posts/",
        author,
        children: { __html: `<h2 class="p-name">${feedName}</h2>` },
      }),
    );

    assertStringIncludes(entryHtml, 'class="post-card h-entry"');
    assertStringIncludes(entryHtml, 'class="p-summary sr-only"');
    assertStringIncludes(entryHtml, summary);
    assertStringIncludes(feedHtml, 'class="home-recent h-feed"');
    assertStringIncludes(feedHtml, 'class="u-url sr-only" href="/posts/"');
    assertStringIncludes(feedHtml, feedName);
  });
});
