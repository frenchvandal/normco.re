/**
 * Language Selector Module
 *
 * Handles the dropdown behavior for the language selector component.
 * Provides keyboard navigation and click-outside-to-close functionality.
 *
 * @module
 */

/**
 * Initializes the language selector dropdown behavior.
 *
 * Features:
 * - Toggle dropdown on button click
 * - Close on click outside
 * - Close on Escape key
 * - Keyboard navigation within menu
 */
export function initLanguageSelector() {
  const selector = document.querySelector(".lang-selector");
  if (!selector) {
    return;
  }

  const toggle = selector.querySelector(".lang-selector__toggle");
  const menu = selector.querySelector(".lang-selector__menu");

  if (!toggle || !menu) {
    return;
  }

  /**
   * Opens the dropdown menu.
   */
  function openMenu() {
    selector.setAttribute("data-open", "true");
    toggle.setAttribute("aria-expanded", "true");

    // Focus first menu item
    const firstLink = menu.querySelector(".lang-selector__link");
    if (firstLink) {
      firstLink.focus();
    }
  }

  /**
   * Closes the dropdown menu.
   */
  function closeMenu() {
    selector.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");
  }

  /**
   * Toggles the dropdown menu.
   */
  function toggleMenu() {
    const isOpen = selector.getAttribute("data-open") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Toggle on button click
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (!selector.contains(e.target)) {
      closeMenu();
    }
  });

  // Keyboard navigation
  selector.addEventListener("keydown", (e) => {
    const isOpen = selector.getAttribute("data-open") === "true";

    switch (e.key) {
      case "Escape":
        if (isOpen) {
          closeMenu();
          toggle.focus();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          // Move to next item
          const items = menu.querySelectorAll(".lang-selector__link");
          const current = document.activeElement;
          const index = Array.from(items).indexOf(current);
          if (index < items.length - 1) {
            items[index + 1].focus();
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          // Move to previous item
          const items = menu.querySelectorAll(".lang-selector__link");
          const current = document.activeElement;
          const index = Array.from(items).indexOf(current);
          if (index > 0) {
            items[index - 1].focus();
          }
        }
        break;

      case "Home":
        if (isOpen) {
          e.preventDefault();
          const firstItem = menu.querySelector(".lang-selector__link");
          if (firstItem) {
            firstItem.focus();
          }
        }
        break;

      case "End":
        if (isOpen) {
          e.preventDefault();
          const items = menu.querySelectorAll(".lang-selector__link");
          if (items.length > 0) {
            items[items.length - 1].focus();
          }
        }
        break;
    }
  });
}
