// @ts-check
(() => {
  const MOBILE_MEDIA_QUERY = "(max-width: 41.98rem)";
  const containers = Array.from(
    globalThis.document.querySelectorAll("[data-contact-toggletip]"),
  ).filter((candidate) => candidate instanceof HTMLElement);
  const mobileMedia = typeof globalThis.matchMedia === "function"
    ? globalThis.matchMedia(MOBILE_MEDIA_QUERY)
    : null;

  if (containers.length === 0) {
    return;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getTrigger(container) {
    const trigger = container.querySelector("[data-contact-toggletip-trigger]");
    return trigger instanceof HTMLButtonElement ? trigger : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPopover(container) {
    const popover = container.querySelector(".cds--popover");
    return popover instanceof HTMLElement ? popover : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPanel(container) {
    const panel = container.querySelector("[data-contact-toggletip-panel]");
    return panel instanceof HTMLElement ? panel : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getCloseButton(container) {
    const button = container.querySelector("[data-contact-toggletip-close]");
    return button instanceof HTMLButtonElement ? button : null;
  }

  /**
   * @param {HTMLElement | null} element
   * @returns {void}
   */
  function blurElement(element) {
    if (element !== null && element !== globalThis.document.body) {
      element.blur();
    }
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    const panel = getPanel(container);

    if (panel === null) {
      return [];
    }

    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((candidate) => candidate instanceof HTMLElement);
  }

  /**
   * @returns {void}
   */
  function syncModalState() {
    const hasOpenToggletip = containers.some(isOpen) && isMobileViewport();

    if (hasOpenToggletip) {
      globalThis.document.body.dataset.contactToggletipModalOpen = "true";
      return;
    }

    delete globalThis.document.body.dataset.contactToggletipModalOpen;
  }

  /**
   * @returns {void}
   */
  function syncOpenPanelsToViewport() {
    for (const container of containers) {
      const popover = getPopover(container);
      const panel = getPanel(container);
      const open = isOpen(container);
      if (popover) {
        popover.hidden = !open;
      }
      syncPanelModalState(panel, open);
    }

    syncModalState();
  }

  /**
   * @returns {boolean}
   */
  function isMobileViewport() {
    return mobileMedia?.matches ?? false;
  }

  /**
   * @param {HTMLElement | null} panel
   * @param {boolean} open
   * @returns {void}
   */
  function syncPanelModalState(panel, open) {
    if (panel === null) {
      return;
    }

    if (open && isMobileViewport()) {
      panel.setAttribute("aria-modal", "true");
      return;
    }

    panel.removeAttribute("aria-modal");
  }

  /**
   * @param {HTMLElement} container
   * @param {boolean} open
   * @returns {void}
   */
  function setToggletipState(container, open) {
    const trigger = getTrigger(container);
    const popover = getPopover(container);
    const panel = getPanel(container);

    container.classList.toggle("cds--popover--open", open);
    container.classList.toggle("cds--toggletip--open", open);
    trigger?.setAttribute("aria-expanded", open ? "true" : "false");
    if (popover) {
      popover.hidden = !open;
    }
    syncPanelModalState(panel, open);
  }

  /**
   * @param {HTMLElement} container
   * @param {{ restoreFocus?: boolean; blurActiveElement?: boolean }} [options]
   * @returns {void}
   */
  function closeToggletip(container, options = {}) {
    const trigger = getTrigger(container);
    const activeElement =
      globalThis.document.activeElement instanceof HTMLElement
        ? globalThis.document.activeElement
        : null;

    setToggletipState(container, false);
    syncModalState();

    if (options.restoreFocus) {
      trigger?.focus();
      return;
    }

    if (options.blurActiveElement) {
      blurElement(activeElement);
    }
  }

  /**
   * @param {HTMLElement | null} [except]
   * @returns {void}
   */
  function closeAll(except = null) {
    for (const container of containers) {
      if (container === except) {
        continue;
      }

      closeToggletip(container);
    }
  }

  /**
   * @param {HTMLElement} container
   * @returns {boolean}
   */
  function isOpen(container) {
    return container.classList.contains("cds--popover--open");
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function openToggletip(container) {
    const panel = getPanel(container);

    closeAll(container);
    setToggletipState(container, true);
    syncModalState();

    globalThis.setTimeout(() => {
      if (!isOpen(container)) {
        return;
      }

      panel?.focus();
    }, 0);
  }

  for (const container of containers) {
    const trigger = getTrigger(container);
    const popover = getPopover(container);
    const panel = getPanel(container);
    const closeButton = getCloseButton(container);

    if (trigger === null || popover === null || panel === null) {
      continue;
    }

    setToggletipState(container, isOpen(container));
    trigger.addEventListener("click", (event) => {
      if (isOpen(container)) {
        closeToggletip(container, {
          restoreFocus: event.detail === 0,
          blurActiveElement: event.detail !== 0,
        });
        return;
      }

      openToggletip(container);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeToggletip(container, { restoreFocus: true });
    });

    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeToggletip(container, { restoreFocus: true });
        return;
      }

      if (event.key !== "Tab" || !isOpen(container) || !isMobileViewport()) {
        return;
      }

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = globalThis.document.activeElement;

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        panel.focus();
        return;
      }

      if (activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? lastFocusable : firstFocusable).focus();
        return;
      }

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    });

    closeButton?.addEventListener("click", (event) => {
      closeToggletip(container, {
        restoreFocus: event.detail === 0,
        blurActiveElement: event.detail !== 0,
      });
    });

    popover.addEventListener("pointerdown", (event) => {
      if (event.target !== popover) {
        return;
      }

      closeToggletip(container, {
        blurActiveElement: true,
      });
    });

    container.addEventListener("focusout", () => {
      globalThis.setTimeout(() => {
        const activeElement = globalThis.document.activeElement;

        if (
          activeElement instanceof Node && container.contains(activeElement)
        ) {
          return;
        }

        closeToggletip(container);
      }, 0);
    });
  }

  globalThis.document.addEventListener("pointerdown", (event) => {
    const target = event.target;

    if (!(target instanceof Node)) {
      closeAll();
      return;
    }

    const clickedContainer = target instanceof Element
      ? target.closest("[data-contact-toggletip]")
      : null;

    if (clickedContainer instanceof HTMLElement) {
      return;
    }

    closeAll();
  });

  if (mobileMedia) {
    const handleViewportChange = () => {
      syncOpenPanelsToViewport();
    };

    if (typeof mobileMedia.addEventListener === "function") {
      mobileMedia.addEventListener("change", handleViewportChange);
    } else if (typeof mobileMedia.addListener === "function") {
      mobileMedia.addListener(handleViewportChange);
    }
  }
})();
