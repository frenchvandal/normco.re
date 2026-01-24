/**
 * Search initialization (Pagefind)
 */

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

  // Wait for Pagefind to load with Promise-based approach
  const waitForPagefind = () => {
    return new Promise((resolve, reject) => {
      const timeout = 5000;
      const interval = 100;
      let elapsed = 0;

      const check = setInterval(() => {
        if (globalThis.PagefindUI) {
          clearInterval(check);
          resolve();
        } else if (elapsed >= timeout) {
          clearInterval(check);
          reject(new Error("Pagefind failed to load within timeout"));
        }
        elapsed += interval;
      }, interval);
    });
  };

  waitForPagefind()
    .then(() => {
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
