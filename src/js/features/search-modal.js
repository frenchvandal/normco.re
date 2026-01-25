/**
 * Search Modal
 * Global search modal with Cmd/Ctrl+K shortcut
 */

import { closeModal, openModal } from "../components/modal.js";

const MODAL_ID = "search-modal";
const PAGEFIND_TIMEOUT_MS = 5000;

const waitForPagefind = () => {
  if (globalThis.PagefindUI) {
    return Promise.resolve();
  }

  const script = document.querySelector('script[data-pagefind-ui="true"]');
  if (!script) {
    return Promise.reject(new Error("Pagefind script tag not found"));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Pagefind failed to load within timeout"));
    }, PAGEFIND_TIMEOUT_MS);

    script.addEventListener(
      "load",
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      { once: true },
    );

    script.addEventListener(
      "error",
      () => {
        clearTimeout(timeoutId);
        reject(new Error("Pagefind failed to load"));
      },
      { once: true },
    );
  });
};

/**
 * Initialize search modal functionality
 */
export function initSearchModal() {
  // Check if modal exists
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const focusSearchInput = () => {
    const input = modal.querySelector(".pagefind-ui__search-input");
    if (input) {
      input.focus();
    }
  };

  // Initialize Pagefind in modal when it opens
  let pagefindInitialized = false;
  let isInitializing = false;

  modal.addEventListener("modal:open", () => {
    const searchContainer = modal.querySelector(".search-modal__content");
    if (!searchContainer) return;

    if (!pagefindInitialized && !isInitializing) {
      isInitializing = true;
      searchContainer.setAttribute("aria-busy", "true");

      waitForPagefind()
        .then(() => {
          if (!globalThis.PagefindUI) {
            throw new Error("Pagefind UI is unavailable");
          }
          if (pagefindInitialized) return;
          if (modal.getAttribute("data-state") !== "open") return;

          new globalThis.PagefindUI({
            element: searchContainer,
            showSubResults: true,
            showImages: false,
            excerptLength: 15,
            autofocus: true,
          });
          pagefindInitialized = true;
        })
        .catch((error) => {
          const message = error instanceof Error
            ? error.message
            : "Unknown error";
          console.warn("Search modal initialization failed:", message);
          if (globalThis.toast?.error) {
            globalThis.toast.error("Search is unavailable right now.", 4000);
          }
        })
        .finally(() => {
          isInitializing = false;
          searchContainer.removeAttribute("aria-busy");
          focusSearchInput();
        });
    }

    // Focus search input after modal opens
    setTimeout(() => {
      focusSearchInput();
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
