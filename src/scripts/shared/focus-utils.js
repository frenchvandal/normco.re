// @ts-check

import { FOCUSABLE_SELECTOR } from "../header-client/focusable-selector.js";

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isHidden(element) {
  return element.hidden || element.closest("[hidden]") !== null;
}

/**
 * @param {Window & typeof globalThis} runtime
 * @param {ParentNode} container
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(runtime, container) {
  /** @type {HTMLElement[]} */
  const focusable = [];

  for (const candidate of container.querySelectorAll(FOCUSABLE_SELECTOR)) {
    if (candidate instanceof runtime.HTMLElement && !isHidden(candidate)) {
      focusable.push(candidate);
    }
  }

  // Selector-list queries do not always preserve DOM order consistently.
  focusable.sort((left, right) => {
    if (left === right) {
      return 0;
    }

    const position = left.compareDocumentPosition(right);

    if (position & runtime.Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }

    if (position & runtime.Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });

  return focusable;
}

/**
 * @param {Window & typeof globalThis} runtime
 * @param {KeyboardEvent} event
 * @param {HTMLElement} container
 * @returns {void}
 */
export function trapFocus(runtime, event, container) {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(runtime, container);

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (
    !(first instanceof runtime.HTMLElement) ||
    !(last instanceof runtime.HTMLElement)
  ) {
    return;
  }

  if (event.shiftKey) {
    if (runtime.document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    }
    return;
  }

  if (runtime.document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}
