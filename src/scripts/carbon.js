// @ts-check

export const CARBON_COMPONENTS_BASE_URL = "/scripts/carbon-vendor";

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
  {
    selector: "cds-copy-button",
    modulePath: "copy-button/copy-button.js",
  },
  { selector: "cds-side-nav", modulePath: "ui-shell/side-nav.js" },
  {
    selector: "cds-side-nav-items",
    modulePath: "ui-shell/side-nav-items.js",
  },
  { selector: "cds-side-nav-link", modulePath: "ui-shell/side-nav-link.js" },
];

/**
 * Resolves a local browser URL for a Carbon module.
 * @param {string} componentPath
 * @returns {string}
 */
export function getCarbonComponentUrl(componentPath) {
  if (componentPath.length === 0) {
    throw new Error("Invalid path");
  }

  return `${CARBON_COMPONENTS_BASE_URL}/${componentPath}`;
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
   * Registers only the Carbon elements needed by the current document.
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
