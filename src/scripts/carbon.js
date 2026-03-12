// @ts-check

export const CARBON_COMPONENTS_BASE_URL =
  "https://unpkg.com/@carbon/web-components@2.50.0/es/components";

/** @type {ReadonlyArray<{ readonly selector: string; readonly modulePath: string }>} */
export const SELECTIVE_CARBON_COMPONENTS = [
  { selector: "cds-header", modulePath: "ui-shell/header.js" },
  {
    selector: "cds-header-menu-button",
    modulePath: "ui-shell/header-menu-button.js",
  },
  { selector: "cds-header-nav", modulePath: "ui-shell/header-nav.js" },
  {
    selector: "cds-header-nav-item",
    modulePath: "ui-shell/header-nav-item.js",
  },
  {
    selector: "cds-header-global-action",
    modulePath: "ui-shell/header-global-action.js",
  },
  { selector: "cds-header-panel", modulePath: "ui-shell/header-panel.js" },
  { selector: "cds-switcher", modulePath: "ui-shell/switcher.js" },
  { selector: "cds-switcher-item", modulePath: "ui-shell/switcher-item.js" },
  { selector: "cds-button", modulePath: "button/button.js" },
  { selector: "cds-link", modulePath: "link/link.js" },
  { selector: "cds-tag", modulePath: "tag/tag.js" },
  { selector: "cds-breadcrumb", modulePath: "breadcrumb/breadcrumb.js" },
  {
    selector: "cds-breadcrumb-item",
    modulePath: "breadcrumb/breadcrumb-item.js",
  },
  {
    selector: "cds-copy-button",
    modulePath: "copy-button/copy-button.js",
  },
  { selector: "cds-side-nav", modulePath: "ui-shell/side-nav.js" },
  {
    selector: "cds-side-nav-items",
    modulePath: "ui-shell/side-nav-items.js",
  },
  {
    selector: "cds-side-nav-link",
    modulePath: "ui-shell/side-nav-link.js",
  },
];

/**
 * Resolves a browser-compatible URL for a Carbon Web Components module.
 * @param {string} componentPath
 * @returns {string}
 */
export function getCarbonComponentUrl(componentPath) {
  return `${CARBON_COMPONENTS_BASE_URL}/${componentPath}?module`;
}

(() => {
  const root = globalThis.document?.documentElement;

  if (root === undefined) {
    return;
  }

  if (root.dataset.carbonBootstrap === "ready") {
    return;
  }
  root.dataset.carbonBootstrap = "ready";

  /**
   * Registers Carbon custom elements only when matching selectors are present.
   * This keeps registration selective while migration is incremental.
   * @param {ReadonlyArray<{ readonly selector: string; readonly modulePath: string }>} selectiveComponents
   * @returns {Promise<void>}
   */
  async function registerMatchingCarbonElements(selectiveComponents) {
    const registrationsToLoad = selectiveComponents
      .filter(({ selector }) => globalThis.document.querySelector(selector))
      .map(({ modulePath }) => import(getCarbonComponentUrl(modulePath)));

    await Promise.allSettled(registrationsToLoad);
  }

  void registerMatchingCarbonElements(SELECTIVE_CARBON_COMPONENTS);
})();
