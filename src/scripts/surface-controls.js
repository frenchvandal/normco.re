// @ts-check
(() => {
  /** @param {HTMLElement} root */
  function initContentSwitcher(root) {
    if (root.dataset.contentSwitcherBound === "true") {
      return;
    }

    const buttons = Array.from(
      root.querySelectorAll("[data-content-switcher-trigger]"),
    ).filter((candidate) => candidate instanceof HTMLButtonElement);

    if (buttons.length === 0) {
      return;
    }

    root.dataset.contentSwitcherBound = "true";

    /**
     * @param {HTMLButtonElement} nextButton
     * @param {boolean} moveFocus
     */
    function activate(nextButton, moveFocus) {
      for (const button of buttons) {
        const isSelected = button === nextButton;
        const panelId = button.getAttribute("aria-controls");
        const panel = typeof panelId === "string" && panelId.length > 0
          ? globalThis.document.getElementById(panelId)
          : null;

        button.classList.toggle("cds--content-switcher--selected", isSelected);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
        button.tabIndex = isSelected ? 0 : -1;

        if (panel instanceof HTMLElement) {
          panel.hidden = !isSelected;
        }
      }

      if (moveFocus) {
        nextButton.focus();
      }
    }

    /**
     * @param {KeyboardEvent} event
     * @param {HTMLButtonElement} currentButton
     */
    function handleKeys(event, currentButton) {
      const currentIndex = buttons.indexOf(currentButton);

      if (currentIndex < 0) {
        return;
      }

      let nextIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex = currentIndex === 0
            ? buttons.length - 1
            : currentIndex - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          nextIndex = currentIndex === buttons.length - 1
            ? 0
            : currentIndex + 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = buttons.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextButton = buttons[nextIndex];

      if (nextButton !== undefined) {
        activate(nextButton, true);
      }
    }

    for (const button of buttons) {
      button.addEventListener("click", (event) => {
        activate(button, false);

        // Keep keyboard focus behavior, but do not leave a persistent focus
        // ring after pointer clicks.
        if (event.detail > 0) {
          button.blur();
        }
      });
      button.addEventListener("keydown", (event) => handleKeys(event, button));
    }

    const initiallySelected =
      buttons.find((button) =>
        button.getAttribute("aria-selected") === "true"
      ) ?? buttons[0];

    if (initiallySelected !== undefined) {
      activate(initiallySelected, false);
    }
  }

  /** @param {HTMLElement} root */
  function initTabs(root) {
    if (root.dataset.tabsBound === "true") {
      return;
    }

    const tabs = Array.from(root.querySelectorAll("[data-tabs-trigger]"))
      .filter(
        (candidate) => candidate instanceof HTMLButtonElement,
      );

    if (tabs.length === 0) {
      return;
    }

    root.dataset.tabsBound = "true";

    /**
     * @param {HTMLButtonElement} nextTab
     * @param {boolean} moveFocus
     */
    function activate(nextTab, moveFocus) {
      for (const tab of tabs) {
        const isSelected = tab === nextTab;
        const tabItem = tab.closest(".cds--tabs__nav-item");
        const panelId = tab.getAttribute("aria-controls");
        const panel = typeof panelId === "string" && panelId.length > 0
          ? globalThis.document.getElementById(panelId)
          : null;

        tab.setAttribute("aria-selected", isSelected ? "true" : "false");
        tab.tabIndex = isSelected ? 0 : -1;
        if (tabItem instanceof HTMLElement) {
          tabItem.classList.toggle("cds--tabs__nav-item--selected", isSelected);
        }

        if (panel instanceof HTMLElement) {
          panel.hidden = !isSelected;
        }
      }

      if (moveFocus) {
        nextTab.focus();
      }
    }

    /**
     * @param {KeyboardEvent} event
     * @param {HTMLButtonElement} currentTab
     */
    function handleKeys(event, currentTab) {
      const currentIndex = tabs.indexOf(currentTab);

      if (currentIndex < 0) {
        return;
      }

      let nextIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextTab = tabs[nextIndex];

      if (nextTab !== undefined) {
        activate(nextTab, true);
      }
    }

    for (const tab of tabs) {
      tab.addEventListener("click", (event) => {
        activate(tab, false);

        // Keep keyboard focus behavior, but do not leave a persistent focus
        // ring after pointer clicks.
        if (event.detail > 0) {
          tab.blur();
        }
      });
      tab.addEventListener("keydown", (event) => handleKeys(event, tab));
    }

    const initiallySelected =
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ??
        tabs[0];

    if (initiallySelected !== undefined) {
      activate(initiallySelected, false);
    }
  }

  /** @param {HTMLElement} root */
  function initAccordion(root) {
    if (root.dataset.accordionBound === "true") {
      return;
    }

    const triggers = Array.from(
      root.querySelectorAll("[data-accordion-trigger]"),
    ).filter((candidate) => candidate instanceof HTMLButtonElement);

    if (triggers.length === 0) {
      return;
    }

    root.dataset.accordionBound = "true";

    /**
     * @param {HTMLButtonElement} trigger
     * @param {boolean} expanded
     */
    function setExpanded(trigger, expanded) {
      const item = trigger.closest(".cds--accordion__item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = typeof panelId === "string" && panelId.length > 0
        ? globalThis.document.getElementById(panelId)
        : null;

      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (item instanceof HTMLElement) {
        item.classList.toggle("cds--accordion__item--active", expanded);
      }

      if (panel instanceof HTMLElement) {
        panel.hidden = !expanded;
      }
    }

    for (const trigger of triggers) {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      setExpanded(trigger, expanded);
      trigger.addEventListener("click", () => {
        const nextExpanded = trigger.getAttribute("aria-expanded") !== "true";
        setExpanded(trigger, nextExpanded);
      });
    }
  }

  const contentSwitchers = Array.from(
    globalThis.document.querySelectorAll("[data-content-switcher]"),
  ).filter((candidate) => candidate instanceof HTMLElement);

  for (const root of contentSwitchers) {
    initContentSwitcher(root);
  }

  const tabs = Array.from(
    globalThis.document.querySelectorAll("[data-site-tabs]"),
  ).filter((candidate) => candidate instanceof HTMLElement);

  for (const root of tabs) {
    initTabs(root);
  }

  const accordions = Array.from(
    globalThis.document.querySelectorAll("[data-site-accordion]"),
  ).filter((candidate) => candidate instanceof HTMLElement);

  for (const root of accordions) {
    initAccordion(root);
  }
})();
