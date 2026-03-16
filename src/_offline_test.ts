import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import offlinePage from "./offline.page.tsx";

describe("offline.page.tsx", () => {
  it("renders the shared page state panel", () => {
    const html = offlinePage({} as Lume.Data);
    assertStringIncludes(html, 'class="state-panel state-panel--page"');
    assertStringIncludes(html, "You are offline.");
  });

  it("renders the localized home action for French data", () => {
    const html = offlinePage({ lang: "fr" } as Lume.Data);
    assertStringIncludes(html, 'href="/fr/"');
    assertStringIncludes(html, "Retour à l'accueil");
  });
});
