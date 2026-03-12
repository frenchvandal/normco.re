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
    // TODO(phiphi): [Carbon-P2] Add selective `@carbon/web-components` registrations for the header shell once `Header.tsx` emits `cds-*` elements. Remove this placeholder when all migrated header Carbon elements are registered through this bootstrap.
  ];

  void registerMatchingCarbonElements(selectiveRegistrations);
})();
