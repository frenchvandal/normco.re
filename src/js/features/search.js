/**
 * Search initialization (Pagefind)
 */

import { loadPagefindUI } from "../core/pagefind.js";

export function initSearch() {
  const searchContainer = document.getElementById("search");
  if (!searchContainer) return;

  // Pagefind UI is loaded via the plugin
  // This just adds loading state
  searchContainer.setAttribute("aria-busy", "true");

  // Remove skeleton when search initializes
  const removeSkeleton = () => {
    const skeleton = searchContainer.querySelector(".search-skeleton");
    if (skeleton) {
      skeleton.remove();
    }
  };

  loadPagefindUI()
    .then(() => {
      if (!globalThis.PagefindUI) {
        throw new Error("Pagefind UI is unavailable");
      }
      removeSkeleton();
      new globalThis.PagefindUI({
        element: "#search",
        showSubResults: true,
        showImages: false,
        excerptLength: 15,
      });
    })
    .catch((error) => {
      console.warn("Search initialization failed:", error.message);
      if (globalThis.toast?.error) {
        globalThis.toast.error("Search is unavailable right now.", 4000);
      }
      removeSkeleton();
    })
    .finally(() => {
      searchContainer.removeAttribute("aria-busy");
    });
}
