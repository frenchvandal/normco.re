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
      selector: "cds-header-global-action",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/header-global-action.js"
        ),
    },
    {
      selector: "cds-header-panel",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/header-panel.js"
        ),
    },
    {
      selector: "cds-switcher",
      register: () =>
        import("npm/carbon-web-components/es/components/ui-shell/switcher.js"),
    },
    {
      selector: "cds-switcher-item",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/ui-shell/switcher-item.js"
        ),
    },
    {
      selector: "cds-button",
      register: () =>
        import("npm/carbon-web-components/es/components/button/button.js"),
    },
    {
      selector: "cds-link",
      register: () =>
        import("npm/carbon-web-components/es/components/link/link.js"),
    },
    {
      selector: "cds-tag",
      register: () =>
        import("npm/carbon-web-components/es/components/tag/tag.js"),
    },
    {
      selector: "cds-breadcrumb",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/breadcrumb/breadcrumb.js"
        ),
    },
    {
      selector: "cds-breadcrumb-item",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/breadcrumb/breadcrumb-item.js"
        ),
    },
    {
      selector: "cds-copy-button",
      register: () =>
        import(
          "npm/carbon-web-components/es/components/copy-button/copy-button.js"
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
  ];

  void registerMatchingCarbonElements(selectiveRegistrations);
})();
