// @ts-check
(() => {
  const controls = Array.from(
    globalThis.document.querySelectorAll(
      "cds-header-global-action[panel-id], cds-header-menu-button",
    ),
  ).filter((element) => element instanceof HTMLElement);

  if (controls.length === 0) {
    return;
  }

  /**
   * @param {HTMLElement} control
   * @returns {string | null}
   */
  function getLinkedPanelId(control) {
    if (!control.matches("cds-header-global-action[panel-id]")) {
      return null;
    }
    return control.getAttribute("panel-id");
  }

  /**
   * @param {{
   *   readonly exceptControl?: HTMLElement | null;
   *   readonly restoreFocus?: boolean;
   * }} [options]
   * @returns {boolean}
   */
  function closeCarbonChrome(options = {}) {
    const exceptControl = options.exceptControl ?? null;
    const restoreFocus = options.restoreFocus ?? false;
    let closed = false;
    const preservedPanelId = exceptControl === null
      ? null
      : getLinkedPanelId(exceptControl);
    const preserveSideNav = exceptControl !== null &&
      exceptControl.matches("cds-header-menu-button") &&
      exceptControl.hasAttribute("active");
    const focusTarget = restoreFocus
      ? globalThis.document.querySelector(
        "cds-header-global-action[active], cds-header-menu-button[active]",
      )
      : null;

    for (const control of controls) {
      if (control === exceptControl) {
        continue;
      }

      if (control.hasAttribute("active")) {
        control.removeAttribute("active");
        closed = true;
      }

      const linkedPanelId = getLinkedPanelId(control);

      if (linkedPanelId === null) {
        continue;
      }

      const linkedPanel = globalThis.document.getElementById(linkedPanelId);

      if (!(linkedPanel instanceof HTMLElement)) {
        continue;
      }

      if (linkedPanel.hasAttribute("expanded")) {
        linkedPanel.removeAttribute("expanded");
        closed = true;
      }
    }

    for (
      const panel of globalThis.document.querySelectorAll(
        "cds-header-panel[expanded]",
      )
    ) {
      if (!(panel instanceof HTMLElement)) {
        continue;
      }

      if (preservedPanelId !== null && panel.id === preservedPanelId) {
        continue;
      }

      panel.removeAttribute("expanded");
      closed = true;
    }

    for (
      const sideNav of globalThis.document.querySelectorAll(
        "cds-side-nav[expanded]",
      )
    ) {
      if (!(sideNav instanceof HTMLElement)) {
        continue;
      }

      if (preserveSideNav) {
        continue;
      }

      sideNav.removeAttribute("expanded");
      closed = true;
    }

    if (restoreFocus && focusTarget instanceof HTMLElement) {
      focusTarget.focus({ preventScroll: true });
    }

    return closed;
  }

  globalThis.document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (closeCarbonChrome({ restoreFocus: true })) {
      event.preventDefault();
    }
  });

  const activeObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type !== "attributes" ||
        mutation.attributeName !== "active" ||
        !(mutation.target instanceof HTMLElement) ||
        !mutation.target.hasAttribute("active")
      ) {
        continue;
      }

      closeCarbonChrome({ exceptControl: mutation.target });
    }
  });

  for (const control of controls) {
    activeObserver.observe(control, {
      attributes: true,
      attributeFilter: ["active"],
    });
  }
})();

/**
 * Handle native UI shell toggles (navigation and search)
 * Replaces functionality previously provided by Carbon Web Components
 */
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".site-navigation-toggle");
  const searchToggle = document.querySelector(".site-search-action");

  /**
   * Toggles a panel's visibility and updates ARIA states
   * @param {Element|null} button The trigger button
   * @param {string} panelId The ID of the panel to toggle
   */
  const setupToggle = (button, panelId) => {
    if (!(button instanceof HTMLElement)) return;

    const panel = document.getElementById(panelId);
    if (!panel) return;

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      button.setAttribute("aria-expanded", String(newState));

      // The search script relies on the 'expanded' attribute (no value)
      if (newState) {
        panel.setAttribute("expanded", "");
        // Only necessary for the search input to get focus when opened
        const searchInput = panel.querySelector('input[type="text"]');
        if (searchInput) {
          // slight delay to allow display:block to apply before focusing
          setTimeout(() => searchInput.focus(), 50);
        }
      } else {
        panel.removeAttribute("expanded");
      }
    });

    // Close on escape key
    panel.addEventListener("keydown", (e) => {
      // @ts-ignore: e may not be typed as KeyboardEvent in some environments
      if (e.key === "Escape") {
        button.setAttribute("aria-expanded", "false");
        panel.removeAttribute("expanded");
        button.focus();
      }
    });
  };

  setupToggle(navToggle, "site-navigation-menu");
  setupToggle(searchToggle, "site-search-panel");
  setupToggle(
    document.querySelector(
      ".site-search-action[aria-controls='feed-search-panel']",
    ),
    "feed-search-panel",
  );
  setupToggle(
    document.querySelector(
      ".site-search-action[aria-controls='sitemap-search-panel']",
    ),
    "sitemap-search-panel",
  );
});
