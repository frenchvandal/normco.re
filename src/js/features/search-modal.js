/**
 * Search Modal
 * Global search modal with Cmd/Ctrl+K shortcut.
 */

import { closeModal, openModal } from "../components/modal.js";
import { loadPagefindUI } from "../core/pagefind.js";

const MODAL_ID = "search-modal";

/**
 * Initialize search modal functionality.
 *
 * @param {object} [dependencies] - Optional dependency overrides.
 * @param {(id: string) => void} [dependencies.openModal] - Open modal helper.
 * @param {(id: string) => void} [dependencies.closeModal] - Close modal helper.
 * @param {() => Promise<void>} [dependencies.loadPagefindUI] - Loader override.
 * @param {new (options: object) => void} [dependencies.PagefindUI] - Pagefind UI constructor.
 * @param {{ error?: (message: string, duration: number) => void }} [dependencies.toast]
 *   - Toast helper.
 * @param {(handler: () => void, timeout: number) => number} [dependencies.setTimeout]
 *   - Timer override.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { initSearchModal } from "./search-modal.js";
 *
 * let openCalled = false;
 * const modal = {
 *   getAttribute: () => "open",
 *   setAttribute: () => {},
 *   removeAttribute: () => {},
 *   querySelector: () => ({ focus: () => {} }),
 *   addEventListener: () => {},
 * };
 *
 * globalThis.document = {
 *   getElementById: () => modal,
 *   addEventListener: (_event, handler) => handler({ metaKey: true, key: "k", preventDefault: () => {} }),
 * };
 *
 * initSearchModal({
 *   openModal: () => {
 *     openCalled = true;
 *   },
 *   closeModal: () => {},
 *   loadPagefindUI: () => Promise.resolve(),
 *   PagefindUI: class {},
 *   setTimeout: (handler) => {
 *     handler();
 *     return 0;
 *   },
 * });
 *
 * assertEquals(openCalled, true);
 * ```
 */
export function initSearchModal(dependencies = {}) {
  const {
    openModal: openModalImpl = openModal,
    closeModal: closeModalImpl = closeModal,
    loadPagefindUI: loadPagefindUIImpl = loadPagefindUI,
    PagefindUI: PagefindUIImpl = globalThis.PagefindUI,
    toast = globalThis.toast,
    setTimeout: setTimeoutImpl = setTimeout,
  } = dependencies;
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

      loadPagefindUIImpl()
        .then(() => {
          const PagefindUI = PagefindUIImpl ?? globalThis.PagefindUI;
          if (!PagefindUI) {
            throw new Error("Pagefind UI is unavailable");
          }
          if (pagefindInitialized) return;
          if (modal.getAttribute("data-state") !== "open") return;

          new PagefindUI({
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
          if (toast?.error) {
            toast.error("Search is unavailable right now.", 4000);
          }
        })
        .finally(() => {
          isInitializing = false;
          searchContainer.removeAttribute("aria-busy");
          focusSearchInput();
        });
    }

    // Focus search input after modal opens
    setTimeoutImpl(() => {
      focusSearchInput();
    }, 100);
  });

  // Global keyboard shortcut (Cmd/Ctrl + K)
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      openModalImpl(MODAL_ID);
    }
  });

  // Close modal when clicking on a search result link
  modal.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link && link.href) {
      closeModalImpl(MODAL_ID);
    }
  });
}
