// @ts-check

import { getFocusableElements, trapFocus } from "./shared/focus-utils.js";

const MOBILE_MEDIA_QUERY = "(max-width: 41.98rem)";
const TOGGLETIP_SELECTOR = "[data-contact-toggletip]";
const TRIGGER_SELECTOR = "[data-contact-toggletip-trigger]";
const PANEL_SELECTOR = "[data-contact-toggletip-panel]";
const CLOSE_BUTTON_SELECTOR = "[data-contact-toggletip-close]";

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindAboutContactToggletips(runtime) {
  const doc = runtime.document;
  const containers = Array.from(doc.querySelectorAll(TOGGLETIP_SELECTOR))
    .filter((candidate) => candidate instanceof runtime.HTMLElement);
  const mobileMedia = typeof runtime.matchMedia === "function"
    ? runtime.matchMedia(MOBILE_MEDIA_QUERY)
    : null;

  if (containers.length === 0) {
    return;
  }

  /**
   * @returns {HTMLBodyElement | null}
   */
  function getBody() {
    const body = doc.body;
    return body instanceof runtime.HTMLBodyElement ? body : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getTrigger(container) {
    const trigger = container.querySelector(TRIGGER_SELECTOR);
    return trigger instanceof runtime.HTMLButtonElement ? trigger : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPopover(container) {
    const popover = container.querySelector(".site-popover");
    return popover instanceof runtime.HTMLElement ? popover : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPanel(container) {
    const panel = container.querySelector(PANEL_SELECTOR);
    return panel instanceof runtime.HTMLElement ? panel : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getCloseButton(container) {
    const button = container.querySelector(CLOSE_BUTTON_SELECTOR);
    return button instanceof runtime.HTMLButtonElement ? button : null;
  }

  /**
   * @param {HTMLElement | null} element
   * @returns {void}
   */
  function blurElement(element) {
    if (element === null || element === getBody()) {
      return;
    }

    element.blur();
  }

  /**
   * @returns {void}
   */
  function syncModalState() {
    const body = getBody();

    if (body === null) {
      return;
    }

    const hasOpenToggletip = containers.some(isOpen) && isMobileViewport();

    if (hasOpenToggletip) {
      body.dataset.contactToggletipModalOpen = "true";
      return;
    }

    delete body.dataset.contactToggletipModalOpen;
  }

  /**
   * @returns {void}
   */
  function syncOpenPanelsToViewport() {
    for (const container of containers) {
      const popover = getPopover(container);
      const panel = getPanel(container);
      const open = isOpen(container);

      if (popover !== null) {
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

    container.classList.toggle("site-popover--open", open);
    container.classList.toggle("site-toggletip--open", open);
    trigger?.setAttribute("aria-expanded", open ? "true" : "false");

    if (popover !== null) {
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
    const activeElement = doc.activeElement instanceof runtime.HTMLElement
      ? doc.activeElement
      : null;

    setToggletipState(container, false);
    syncModalState();

    if (options.restoreFocus) {
      trigger?.focus({ preventScroll: true });
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
    return container.classList.contains("site-popover--open");
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

    runtime.setTimeout(() => {
      if (!isOpen(container)) {
        return;
      }

      panel?.focus({ preventScroll: true });
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

      const focusableElements = getFocusableElements(runtime, panel);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      if (doc.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? lastFocusable : firstFocusable).focus({
          preventScroll: true,
        });
        return;
      }

      trapFocus(runtime, event, panel);
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
      runtime.setTimeout(() => {
        const activeElement = doc.activeElement;

        if (
          activeElement instanceof runtime.Node &&
          container.contains(activeElement)
        ) {
          return;
        }

        closeToggletip(container);
      }, 0);
    });
  }

  doc.addEventListener("pointerdown", (event) => {
    const target = event.target;

    if (!(target instanceof runtime.Node)) {
      closeAll();
      return;
    }

    const clickedContainer = target instanceof runtime.Element
      ? target.closest(TOGGLETIP_SELECTOR)
      : null;

    if (clickedContainer instanceof runtime.HTMLElement) {
      return;
    }

    closeAll();
  });

  if (typeof mobileMedia?.addEventListener === "function") {
    mobileMedia.addEventListener("change", syncOpenPanelsToViewport);
  } else if (typeof mobileMedia?.addListener === "function") {
    mobileMedia.addListener(syncOpenPanelsToViewport);
  }
}

if (typeof window !== "undefined") {
  bindAboutContactToggletips(window);
}
