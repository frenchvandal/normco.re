import { assertEquals } from "jsr:@std/assert@^1.0.19";
import { describe, it } from "jsr:@std/testing@^1.0.17/bdd";
import { isBlogAppViewData, parseBlogAppData } from "./bootstrap-data.ts";

const VALID_POST_VIEW_DATA = JSON.stringify({
  view: "post",
  languageTag: "en",
  breadcrumbAriaLabel: "Breadcrumb",
  breadcrumb: [],
  title: "Archive",
  publishedDateIso: "2026-03-29",
  publishedDateLabel: "Mar 29, 2026",
  summaryEyebrow: "Summary",
  summaryItems: [],
  contentHtml: "<p>Hello</p>",
  detailsTitle: "Details",
  publicationDetails: [],
  railAriaLabel: "Post rail",
  sectionsTitle: "Sections",
  outline: [],
  tagsTitle: "Tags",
  tags: [],
  backlinksTitle: "Backlinks",
  backlinks: [],
  navigationAriaLabel: "Post navigation",
  previousLabel: "Previous",
  nextLabel: "Next",
});

describe("parseBlogAppData()", () => {
  it("returns parsed data for valid JSON that matches the blog app contract", () => {
    const result = parseBlogAppData(VALID_POST_VIEW_DATA, isBlogAppViewData);

    assertEquals(result?.view, "post");
    assertEquals(result?.title, "Archive");
  });

  it("returns undefined for invalid JSON", () => {
    const result = parseBlogAppData("{", isBlogAppViewData);

    assertEquals(result, undefined);
  });

  it("returns undefined for valid JSON with an invalid bootstrap shape", () => {
    const result = parseBlogAppData(
      '{"view":"post","contentHtml":"<p>Hello</p>"}',
      isBlogAppViewData,
    );

    assertEquals(result, undefined);
  });
});
