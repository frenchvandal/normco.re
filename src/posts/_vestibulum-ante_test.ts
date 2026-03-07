import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import vestibulumAntePage from "./vestibulum-ante.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("posts/vestibulum-ante.page.tsx", () => {
  it("returns an HTML string with paragraphs", () => {
    const html = vestibulumAntePage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<p>");
  });

  it('contains the "The value of the in-between" heading', () => {
    const html = vestibulumAntePage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "The value of the in-between");
  });

  it('contains the "Standing at the door" heading', () => {
    const html = vestibulumAntePage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Standing at the door");
  });

  it('contains the "Coda" heading', () => {
    const html = vestibulumAntePage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Coda");
  });
});
