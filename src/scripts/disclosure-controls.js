// @ts-check
(() => {
  const disclosures = Array.from(
    globalThis.document.querySelectorAll(".language-menu"),
  ).filter((element) => element instanceof HTMLDetailsElement);

  if (disclosures.length === 0) {
    return;
  }

  /** @type {WeakMap<HTMLDetailsElement, HTMLElement>} */
  const triggerByDisclosure = new WeakMap();

  for (const disclosure of disclosures) {
    const trigger = disclosure.querySelector(":scope > summary");

    if (trigger instanceof HTMLElement) {
      triggerByDisclosure.set(disclosure, trigger);
    }

    disclosure.addEventListener("toggle", () => {
      if (!disclosure.open) {
        return;
      }

      closeDisclosures(disclosure);
      closeCarbonChrome();
    });
  }

  /** @param {HTMLDetailsElement} disclosure */
  function closeDisclosure(disclosure, restoreFocus = false) {
    if (!disclosure.open) {
      return false;
    }

    disclosure.open = false;

    if (restoreFocus) {
      triggerByDisclosure.get(disclosure)?.focus({ preventScroll: true });
    }

    return true;
  }

  /** @param {HTMLDetailsElement} [exceptDisclosure] */
  function closeDisclosures(exceptDisclosure) {
    for (const disclosure of disclosures) {
      if (disclosure === exceptDisclosure) {
        continue;
      }

      closeDisclosure(disclosure);
    }
  }

  function closeCarbonChrome(restoreFocus = false) {
    let closed = false;

    const focusTarget = restoreFocus
      ? globalThis.document.querySelector(
        "cds-header-global-action[active], cds-header-menu-button[active]",
      )
      : null;

    for (
      const element of globalThis.document.querySelectorAll(
        "cds-header-menu-button[active], cds-side-nav[expanded], cds-header-panel[expanded], cds-header-global-action[active]",
      )
    ) {
      if (element.hasAttribute("active")) {
        element.removeAttribute("active");
        closed = true;
      }

      if (element.hasAttribute("expanded")) {
        element.removeAttribute("expanded");
        closed = true;
      }

      if (!(element instanceof HTMLElement)) {
        continue;
      }

      if (!element.matches("cds-header-global-action")) {
        continue;
      }

      const panelId = element.getAttribute("panel-id");

      if (panelId === null || panelId.length === 0) {
        continue;
      }

      const linkedPanel = globalThis.document.getElementById(panelId);
      linkedPanel?.removeAttribute("expanded");
    }

    if (restoreFocus && focusTarget instanceof HTMLElement) {
      focusTarget.focus({ preventScroll: true });
    }

    return closed;
  }

  globalThis.document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }

    for (const disclosure of disclosures) {
      if (!disclosure.open || disclosure.contains(event.target)) {
        continue;
      }

      closeDisclosure(disclosure);
    }
  }, { passive: true });

  globalThis.document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    for (let index = disclosures.length - 1; index >= 0; index -= 1) {
      const disclosure = disclosures[index];

      if (disclosure !== undefined && closeDisclosure(disclosure, true)) {
        event.preventDefault();
        return;
      }
    }

    if (closeCarbonChrome(true)) {
      event.preventDefault();
    }
  });

  globalThis.document.addEventListener(
    "cds-header-menu-button-toggled",
    (event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const detail = event.detail;

      if (
        typeof detail !== "object" ||
        detail === null ||
        !("active" in detail) ||
        detail.active !== true
      ) {
        return;
      }

      closeDisclosures();
    },
  );

  for (
    const globalAction of globalThis.document.querySelectorAll(
      "cds-header-global-action",
    )
  ) {
    if (!(globalAction instanceof HTMLElement)) {
      continue;
    }

    const actionObserver = new MutationObserver(() => {
      if (!globalAction.hasAttribute("active")) {
        return;
      }

      closeDisclosures();
    });

    actionObserver.observe(globalAction, {
      attributes: true,
      attributeFilter: ["active"],
    });
  }
})();
