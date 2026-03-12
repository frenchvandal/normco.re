// @ts-check
(() => {
  const root = globalThis.document.documentElement;

  if (root.dataset.carbonBootstrap === "ready") {
    return;
  }
  root.dataset.carbonBootstrap = "ready";

  /**
   * Registers Carbon custom elements only when matching selectors are present.
   * This keeps registration selective while migration is incremental.
   * @param {ReadonlyArray<{ readonly selector: string; readonly register: () => Promise<unknown> }>} selectiveRegistrations
   * @returns {Promise<void>}
   */
  async function registerMatchingCarbonElements(selectiveRegistrations) {
    const registrationsToLoad = selectiveRegistrations
      .filter(({ selector }) => globalThis.document.querySelector(selector))
      .map(({ register }) => register());

    await Promise.allSettled(registrationsToLoad);
  }

  /** @type {ReadonlyArray<{ readonly selector: string; readonly register: () => Promise<unknown> }>} */
  const selectiveRegistrations = [
    {
      selector: "cds-header",
      register: () =>
        import("npm/carbon-web-components/es/components/ui-shell/header.js"),
    },
    {
      selector: "cds-header-menu-button",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/header-menu-button.js"
        ),
    },
    {
      selector: "cds-header-nav",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/header-nav.js"
        ),
    },
    {
      selector: "cds-header-nav-item",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/header-nav-item.js"
        ),
    },
    {
      selector: "cds-side-nav",
      register: () =>
        import("npm/carbon-web-components/es/components/ui-shell/side-nav.js"),
    },
    {
      selector: "cds-side-nav-items",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/side-nav-items.js"
        ),
    },
    {
      selector: "cds-side-nav-link",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/side-nav-link.js"
        ),
    },
    // TODO(phiphi): [Carbon-P2] Add selective registrations for Carbon search/language/theme header actions when those zones migrate; remove this TODO once all header actions are Carbon-registered through this bootstrap.
  ];

  void registerMatchingCarbonElements(selectiveRegistrations);
})();
