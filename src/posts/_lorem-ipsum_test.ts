import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import loremIpsumPage from "./lorem-ipsum.page.ts";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("posts/lorem-ipsum.page.ts", () => {
  it("returns an HTML string with paragraphs", () => {
    const html = loremIpsumPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<p>");
  });

  it('contains the "Why placeholder text matters" heading', () => {
    const html = loremIpsumPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Why placeholder text matters");
  });

  it('contains the "A question of fidelity" heading', () => {
    const html = loremIpsumPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "A question of fidelity");
  });

  it("contains a code block", () => {
    const html = loremIpsumPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<pre><code");
  });
});
