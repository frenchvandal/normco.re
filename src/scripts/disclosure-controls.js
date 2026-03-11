// @ts-check
(() => {
  const disclosures = Array.from(
    globalThis.document.querySelectorAll(
      ".site-menu, .language-menu, .site-search",
    ),
  ).filter((element) => element instanceof HTMLDetailsElement);

  if (disclosures.length === 0) {
    return;
  }

  /** @type {WeakMap<HTMLDetailsElement, HTMLElement>} */
  const disclosureTriggerByElement = new WeakMap();

  for (const disclosure of disclosures) {
    const trigger = disclosure.querySelector(":scope > summary");

    if (trigger instanceof HTMLElement) {
      disclosureTriggerByElement.set(disclosure, trigger);
    }

    disclosure.addEventListener("toggle", () => {
      if (!disclosure.open) {
        return;
      }

      for (const otherDisclosure of disclosures) {
        if (otherDisclosure !== disclosure && otherDisclosure.open) {
          otherDisclosure.open = false;
        }
      }

      if (disclosure.classList.contains("site-search")) {
        queueMicrotask(() => {
          focusSearchInput(disclosure);
        });
      }
    });
  }

  /**
   * @param {HTMLDetailsElement} disclosure
   * @param {boolean} [restoreFocus]
   * @returns {boolean}
   */
  function closeDisclosure(disclosure, restoreFocus = false) {
    if (!disclosure.open) {
      return false;
    }

    disclosure.open = false;

    if (restoreFocus) {
      const trigger = disclosureTriggerByElement.get(disclosure);

      if (trigger instanceof HTMLElement) {
        trigger.focus({ preventScroll: true });
      }
    }

    return true;
  }

  /**
   * @param {HTMLDetailsElement} searchDisclosure
   * @returns {void}
   */
  function focusSearchInput(searchDisclosure) {
    if (!searchDisclosure.open) {
      return;
    }

    const searchRoot = searchDisclosure.querySelector(".site-search-root");

    if (!(searchRoot instanceof HTMLElement)) {
      return;
    }

    if (tryFocusSearchInput(searchRoot)) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (!searchDisclosure.open) {
        observer.disconnect();
        return;
      }

      if (tryFocusSearchInput(searchRoot)) {
        observer.disconnect();
      }
    });

    observer.observe(searchRoot, { childList: true, subtree: true });

    globalThis.setTimeout(() => {
      observer.disconnect();
    }, 1500);
  }

  /**
   * @param {HTMLElement} searchRoot
   * @returns {boolean}
   */
  function tryFocusSearchInput(searchRoot) {
    const searchInput = searchRoot.querySelector(".pagefind-ui__search-input");

    if (!(searchInput instanceof HTMLInputElement)) {
      return false;
    }

    if (searchInput.disabled) {
      return false;
    }

    searchInput.focus({ preventScroll: true });
    return true;
  }

  globalThis.document.addEventListener("pointerdown", (event) => {
    const eventTarget = event.target;

    if (!(eventTarget instanceof Node)) {
      return;
    }

    for (const disclosure of disclosures) {
      if (!disclosure.open) {
        continue;
      }

      if (disclosure.contains(eventTarget)) {
        continue;
      }

      closeDisclosure(disclosure);
    }
  });

  globalThis.document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    for (let index = disclosures.length - 1; index >= 0; index -= 1) {
      const disclosure = disclosures[index];

      if (disclosure === undefined) {
        continue;
      }

      if (closeDisclosure(disclosure, true)) {
        event.preventDefault();
        break;
      }
    }
  });
})();
