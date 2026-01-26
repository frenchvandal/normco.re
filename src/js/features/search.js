/**
 * Search initialization (Pagefind).
 *
 * @param {object} [dependencies] - Optional dependency overrides.
 * @param {() => Promise<void>} [dependencies.loadPagefindUI] - Loader override.
 * @param {new (options: object) => void} [dependencies.PagefindUI] - Pagefind UI constructor.
 * @param {{ error?: (message: string, duration: number) => void }} [dependencies.toast]
 *   - Toast helper.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { initSearch } from "./search.js";
 *
 * const calls = [];
 * const container = {
 *   setAttribute: () => {},
 *   removeAttribute: () => {},
 *   querySelector: () => ({ remove: () => calls.push("skeleton-removed") }),
 * };
 *
 * globalThis.document = {
 *   getElementById: () => container,
 * };
 *
 * initSearch({
 *   loadPagefindUI: () => Promise.resolve(),
 *   PagefindUI: class {
 *     constructor() {
 *       calls.push("pagefind");
 *     }
 *   },
 * });
 *
 * assertEquals(calls.includes("pagefind"), true);
 * ```
 */

import { loadPagefindUI } from "../core/pagefind.js";

export function initSearch(dependencies = {}) {
  const {
    loadPagefindUI: loadPagefindUIImpl = loadPagefindUI,
    PagefindUI: PagefindUIImpl = globalThis.PagefindUI,
    toast = globalThis.toast,
  } = dependencies;
  const searchContainer = document.getElementById("search");
  if (!searchContainer) return;

  searchContainer.setAttribute("aria-busy", "true");

  // Remove skeleton when search initializes
  const removeSkeleton = () => {
    const skeleton = searchContainer.querySelector(".search-skeleton");
    if (skeleton) {
      skeleton.remove();
    }
  };

  loadPagefindUIImpl()
    .then(() => {
      const PagefindUI = PagefindUIImpl ?? globalThis.PagefindUI;
      if (!PagefindUI) {
        throw new Error("Pagefind UI is unavailable");
      }
      removeSkeleton();
      new PagefindUI({
        element: "#search",
        showSubResults: true,
        showImages: false,
        excerptLength: 15,
      });
    })
    .catch((error) => {
      console.warn("Search initialization failed:", error.message);
      if (toast?.error) {
        toast.error("Search is unavailable right now.", 4000);
      }
      removeSkeleton();
    })
    .finally(() => {
      searchContainer.removeAttribute("aria-busy");
    });
}
