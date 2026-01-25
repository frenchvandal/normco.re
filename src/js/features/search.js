/**
 * Search initialization (Pagefind)
 */

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

  waitForPagefind()
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
