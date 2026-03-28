import { assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import offlinePage from "./offline.page.tsx";

describe("offline.page.tsx", () => {
  it("renders the shared page state panel", () => {
    const html = offlinePage({} as Lume.Data);
    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--editorial state-page state-page--offline"',
    );
    assertStringIncludes(
      html,
      'class="state-panel state-panel--page state-panel--offline-page"',
    );
    assertStringIncludes(
      html,
      'class="state-panel-visual state-panel-visual--offline"',
    );
    assertStringIncludes(html, 'class="state-panel-empty-illustration"');
    assertStringIncludes(html, "You are offline.");
  });

  it("renders the localized home action for French data", () => {
    const html = offlinePage({ lang: "fr" } as Lume.Data);
    assertStringIncludes(html, 'href="/fr/"');
    assertStringIncludes(html, "Retour à l’accueil");
  });
});
