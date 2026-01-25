/**
 * Pagefind UI loader
 * Ensures the script is loaded once and avoids blocking the initial render
 */

const PAGEFIND_SCRIPT_SRC = "/pagefind/pagefind-ui.js";
const PAGEFIND_TIMEOUT_MS = 5000;

let pagefindLoadPromise = null;

export function loadPagefindUI() {
  if (globalThis.PagefindUI) {
    return Promise.resolve();
  }

  if (pagefindLoadPromise) {
    return pagefindLoadPromise;
  }

  pagefindLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-pagefind-ui="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Pagefind failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = PAGEFIND_SCRIPT_SRC;
    script.defer = true;
    script.dataset.pagefindUi = "true";

    const timeoutId = setTimeout(() => {
      reject(new Error("Pagefind failed to load within timeout"));
    }, PAGEFIND_TIMEOUT_MS);

    script.addEventListener("load", () => {
      clearTimeout(timeoutId);
      resolve();
    });

    script.addEventListener("error", () => {
      clearTimeout(timeoutId);
      reject(new Error("Pagefind failed to load"));
    });

    document.head.appendChild(script);
  });

  return pagefindLoadPromise;
}
