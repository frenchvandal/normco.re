// @ts-check
(() => {
  const controls = Array.from(
    globalThis.document.querySelectorAll(
      "cds-header-global-action[panel-id], cds-header-menu-button, .bx--header__language-toggle, .bx--header__menu-toggle, .bx--header__action[aria-controls]",
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
    if (
      control.matches(
        ".bx--header__language-toggle, .bx--header__action[aria-controls]",
      )
    ) {
      return control.getAttribute("aria-controls");
    }
    if (control.matches(".bx--header__menu-toggle")) {
      return control.getAttribute("aria-controls");
    }
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
      exceptControl.matches(".bx--header__menu-toggle") &&
      exceptControl.getAttribute("aria-expanded") === "true";
    const focusTarget = restoreFocus
      ? globalThis.document.querySelector(
        "cds-header-global-action[active], cds-header-menu-button[active], .bx--header__language-toggle[aria-expanded='true'], .bx--header__menu-toggle[aria-expanded='true']",
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

      // Handle native hidden attribute for Carbon panels
      if (!linkedPanel.hasAttribute("hidden")) {
        linkedPanel.setAttribute("hidden", "");
        closed = true;
      }

      // Update aria-expanded on the control
      if (control.getAttribute("aria-expanded") === "true") {
        control.setAttribute("aria-expanded", "false");
      }
    }

    for (
      const panel of globalThis.document.querySelectorAll(
        "cds-header-panel[expanded], .bx--header__panel:not([hidden])",
      )
    ) {
      if (!(panel instanceof HTMLElement)) {
        continue;
      }

      if (preservedPanelId !== null && panel.id === preservedPanelId) {
        continue;
      }

      panel.removeAttribute("expanded");
      panel.setAttribute("hidden", "");
      closed = true;
    }

    for (
      const sideNav of globalThis.document.querySelectorAll(
        "cds-side-nav[expanded], .bx--side-nav:not([hidden])",
      )
    ) {
      if (!(sideNav instanceof HTMLElement)) {
        continue;
      }

      if (preserveSideNav) {
        continue;
      }

      sideNav.removeAttribute("expanded");
      sideNav.setAttribute("hidden", "");
      closed = true;
    }

    // Hide overlay when SideNav closes
    const overlay = globalThis.document.querySelector(".bx--side-nav__overlay");
    if (overlay instanceof HTMLElement && !preserveSideNav) {
      overlay.setAttribute("aria-hidden", "true");
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

  /**
   * Handle native UI shell toggles (navigation, search, language)
   * Replaces functionality previously provided by Carbon Web Components
   */
  function setupDisclosureControls() {
    const navToggle = document.querySelector(".bx--header__menu-toggle");
    const sideNav = document.getElementById("site-side-nav");
    const searchToggle = document.querySelector(
      ".bx--header__action[aria-controls='site-search-panel']",
    );
    const searchPanel = document.getElementById("site-search-panel");
    const languageToggle = document.querySelector(
      ".bx--header__language-toggle",
    );
    const languagePanel = document.getElementById("site-language-panel");
    const overlay = document.querySelector(".bx--side-nav__overlay");

    /**
     * Toggles a panel's visibility and updates ARIA states
     * @param {HTMLElement|null} button The trigger button
     * @param {HTMLElement|null} panel The panel to toggle
     */
    const setupPanelToggle = (button, panel) => {
      if (!button || !panel) return;

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        const newState = !isExpanded;

        // Close all other panels first
        closeCarbonChrome({ exceptControl: button });

        button.setAttribute("aria-expanded", String(newState));

        if (newState) {
          panel.removeAttribute("hidden");
          panel.setAttribute("expanded", "");
          // Focus first focusable element in panel
          const firstFocusable = panel.querySelector(
            "a, button, input, [tabindex]:not([tabindex='-1'])",
          );
          if (firstFocusable instanceof HTMLElement) {
            setTimeout(() => firstFocusable.focus(), 50);
          }
        } else {
          panel.setAttribute("hidden", "");
          panel.removeAttribute("expanded");
        }
      });
    };

    /**
     * Setup SideNav toggle with overlay
     * @param {HTMLElement|null} button The hamburger button
     * @param {HTMLElement|null} nav The SideNav element
     */
    const setupSideNavToggle = (button, nav) => {
      if (!button || !nav) return;

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        const newState = !isExpanded;

        // Close all other panels first
        closeCarbonChrome({ exceptControl: button });

        button.setAttribute("aria-expanded", String(newState));

        if (newState) {
          nav.removeAttribute("hidden");
          nav.setAttribute("expanded", "");
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "false");
          }
          // Focus first nav link
          const firstLink = nav.querySelector("a.bx--side-nav__link");
          if (firstLink instanceof HTMLElement) {
            setTimeout(() => firstLink.focus(), 50);
          }
        } else {
          nav.setAttribute("hidden", "");
          nav.removeAttribute("expanded");
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "true");
          }
        }
      });
    };

    // Setup SideNav toggle
    setupSideNavToggle(navToggle, sideNav);

    // Setup search panel toggle
    setupPanelToggle(searchToggle, searchPanel);

    // Setup language panel toggle
    setupPanelToggle(languageToggle, languagePanel);

    // Close panels when clicking overlay
    if (overlay instanceof HTMLElement) {
      overlay.addEventListener("click", () => {
        closeCarbonChrome({ restoreFocus: true });
      });
    }

    // Close panels when clicking outside (but not on overlay)
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const isInsidePanel = target.closest(".bx--header__panel, .bx--side-nav");
      const isToggleButton = target.closest(
        ".bx--header__menu-toggle, .bx--header__language-toggle, .bx--header__action[aria-controls]",
      );

      if (!isInsidePanel && !isToggleButton) {
        closeCarbonChrome();
      }
    });
  }

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupDisclosureControls);
  } else {
    setupDisclosureControls();
  }
})();
