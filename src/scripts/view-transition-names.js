// @ts-check

const VIEW_TRANSITION_NAME_ATTRIBUTE = "data-view-transition-name";
const VIEW_TRANSITION_NAME_SELECTOR = `[${VIEW_TRANSITION_NAME_ATTRIBUTE}]`;

/**
 * @param {HTMLElement} element
 * @returns {void}
 */
function syncViewTransitionName(element) {
  const transitionName = element.getAttribute(VIEW_TRANSITION_NAME_ATTRIBUTE)
    ?.trim() ?? "";

  if (transitionName.length === 0) {
    element.style.removeProperty("view-transition-name");
    return;
  }

  element.style.setProperty("view-transition-name", transitionName);
}

/**
 * @param {Window & typeof globalThis} runtime
 * @param {ParentNode | HTMLElement} root
 * @returns {void}
 */
function syncTree(runtime, root) {
  if (root instanceof runtime.HTMLElement) {
    if (root.matches(VIEW_TRANSITION_NAME_SELECTOR)) {
      syncViewTransitionName(root);
    }
  }

  for (
    const candidate of root.querySelectorAll(VIEW_TRANSITION_NAME_SELECTOR)
  ) {
    if (candidate instanceof runtime.HTMLElement) {
      syncViewTransitionName(candidate);
    }
  }
}

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
function bindViewTransitionNames(runtime) {
  const root = runtime.document.documentElement;

  if (!(root instanceof runtime.HTMLElement)) {
    return;
  }

  if (root.dataset.viewTransitionNamesBound === "true") {
    return;
  }

  root.dataset.viewTransitionNamesBound = "true";
  syncTree(runtime, runtime.document);

  if (typeof runtime.MutationObserver !== "function") {
    return;
  }

  const observer = new runtime.MutationObserver((records) => {
    for (const record of records) {
      if (
        record.type === "attributes" &&
        record.target instanceof runtime.HTMLElement
      ) {
        syncViewTransitionName(record.target);
        continue;
      }

      for (const node of record.addedNodes) {
        if (node instanceof runtime.HTMLElement) {
          syncTree(runtime, node);
        }
      }
    }
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [VIEW_TRANSITION_NAME_ATTRIBUTE],
  });
}

if (typeof window !== "undefined") {
  bindViewTransitionNames(window);
}
