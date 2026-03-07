import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import proinFacilisisPage from "./proin-facilisis.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("posts/proin-facilisis.page.tsx", () => {
  it("returns an HTML string with paragraphs", () => {
    const html = proinFacilisisPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<p>");
  });

  it('contains the "The friction inventory" heading', () => {
    const html = proinFacilisisPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "The friction inventory");
  });

  it('contains the "Facilisis in practice" heading', () => {
    const html = proinFacilisisPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Facilisis in practice");
  });

  it("contains a code example", () => {
    const html = proinFacilisisPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<pre><code");
  });
});
