// @ts-check
(() => {
  const tooltipContainers = Array.from(
    globalThis.document.querySelectorAll("[data-header-tooltip]"),
  ).filter((candidate) => candidate instanceof HTMLElement);

  if (tooltipContainers.length === 0) {
    return;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getTrigger(container) {
    const trigger = container.querySelector("[data-header-tooltip-trigger]");
    return trigger instanceof HTMLButtonElement ? trigger : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function closeTooltip(container) {
    container.classList.remove("cds--popover--open");
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function openTooltip(container) {
    const trigger = getTrigger(container);

    if (trigger === null || trigger.getAttribute("aria-expanded") === "true") {
      return;
    }

    container.classList.add("cds--popover--open");
  }

  for (const container of tooltipContainers) {
    if (container.dataset.headerTooltipBound === "true") {
      continue;
    }

    const trigger = getTrigger(container);

    if (trigger === null) {
      continue;
    }

    container.dataset.headerTooltipBound = "true";
    container.addEventListener("pointerenter", () => {
      openTooltip(container);
    });

    container.addEventListener("pointerleave", () => {
      closeTooltip(container);
    });

    container.addEventListener("focusin", () => {
      openTooltip(container);
    });

    container.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && container.contains(nextTarget)) {
        return;
      }

      closeTooltip(container);
    });

    trigger.addEventListener("click", () => {
      closeTooltip(container);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeTooltip(container);
    });
  }
})();
