// @ts-check

export const CARBON_COMPONENTS_BASE_URL = "/scripts/carbon-vendor";

/** @type {ReadonlyArray<{ readonly selector: string; readonly modulePath: string }>} */
export const SELECTIVE_CARBON_COMPONENTS = [
  {
    selector: "cds-copy-button",
    modulePath: "copy-button/copy-button.js",
  },
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
