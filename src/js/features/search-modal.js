/**
 * Search Modal
 * Global search modal with Cmd/Ctrl+K shortcut
 */

import { closeModal, openModal } from "../components/modal.js";

const MODAL_ID = "search-modal";

/**
 * Initialize search modal functionality
 */
export function initSearchModal() {
  // Check if modal exists
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  // Initialize Pagefind in modal when it opens
  let pagefindInitialized = false;

  modal.addEventListener("modal:open", () => {
    if (!pagefindInitialized && globalThis.PagefindUI) {
      const searchContainer = modal.querySelector(".search-modal__content");
      if (searchContainer) {
        new globalThis.PagefindUI({
          element: searchContainer,
          showSubResults: true,
          showImages: false,
          excerptLength: 15,
          autofocus: true,
        });
        pagefindInitialized = true;
      }
    }

    // Focus search input after modal opens
    setTimeout(() => {
      const input = modal.querySelector(".pagefind-ui__search-input");
      if (input) {
        input.focus();
      }
    }, 100);
  });

  // Global keyboard shortcut (Cmd/Ctrl + K)
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      openModal(MODAL_ID);
    }
  });

  // Close modal when clicking on a search result link
  modal.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link && link.href) {
      closeModal(MODAL_ID);
    }
  });
}
