import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import instructionsPage from "./instructions.page.ts";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("posts/instructions.page.ts", () => {
  it("returns an HTML string", () => {
    const html = instructionsPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<p>");
  });

  it('contains the "Install as a remote theme" section', () => {
    const html = instructionsPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Install as a remote theme");
  });

  it('contains the "Customization" section', () => {
    const html = instructionsPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Customization");
  });

  it("contains a code example", () => {
    const html = instructionsPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<code");
  });
});
