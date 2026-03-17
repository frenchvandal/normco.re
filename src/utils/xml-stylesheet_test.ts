import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { getXmlStylesheetHref } from "./xml-stylesheet.ts";

describe("getXmlStylesheetHref()", () => {
  it("returns the feed stylesheet for the default feed URL", () => {
    assertEquals(getXmlStylesheetHref("/feed.xml"), "/feed.xsl");
  });

  it("returns the feed stylesheet for localized feed URLs", () => {
    assertEquals(getXmlStylesheetHref("/fr/feed.xml"), "/feed.xsl");
    assertEquals(getXmlStylesheetHref("/zh-hans/feed.xml"), "/feed.xsl");
    assertEquals(getXmlStylesheetHref("/zh-hant/feed.xml"), "/feed.xsl");
  });

  it("returns the sitemap stylesheet for default and localized sitemap URLs", () => {
    assertEquals(getXmlStylesheetHref("/sitemap.xml"), "/sitemap.xsl");
    assertEquals(getXmlStylesheetHref("/fr/sitemap.xml"), "/sitemap.xsl");
  });

  it("returns the feed stylesheet for default and localized Atom URLs", () => {
    assertEquals(getXmlStylesheetHref("/atom.xml"), "/feed.xsl");
    assertEquals(getXmlStylesheetHref("/fr/atom.xml"), "/feed.xsl");
  });

  it("returns undefined for unrelated XML files", () => {
    assertEquals(getXmlStylesheetHref("/feed.json"), undefined);
    assertEquals(getXmlStylesheetHref("/data.xml"), undefined);
  });
});
