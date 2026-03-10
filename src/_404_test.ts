import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import page404 from "./404.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("404.page.tsx", () => {
  it("renders the not-found container", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'class="not-found"');
  });

  it('displays the "404" code', () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "404");
  });

  it('displays a "Page not found" message', () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "Page not found");
  });

  it("contains a back-to-home link", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/"');
  });

  it("marks the 404 code as aria-hidden", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'aria-hidden="true"');
  });

  it("localizes message and home link for French data", () => {
    const frenchData = { lang: "fr" } as unknown as Lume.Data;
    const html = page404(frenchData, MOCK_HELPERS);
    assertStringIncludes(html, "Page introuvable");
    assertStringIncludes(html, 'href="/fr/"');
  });
});
