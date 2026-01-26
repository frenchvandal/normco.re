/**
 * Pagefind UI loader.
 * Ensures the script is loaded once and avoids blocking the initial render.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { loadPagefindUI } from "./pagefind.js";
 *
 * let appended = false;
 * const script = {
 *   addEventListener: (event, handler) => {
 *     if (event === "load") {
 *       handler();
 *     }
 *   },
 *   dataset: {},
 * };
 *
 * globalThis.document = {
 *   querySelector: () => null,
 *   createElement: () => script,
 *   head: {
 *     appendChild: () => {
 *       appended = true;
 *     },
 *   },
 * };
 *
 * await loadPagefindUI();
 * assertEquals(appended, true);
 * ```
 */

const PAGEFIND_SCRIPT_SRC = "/pagefind/pagefind-ui.js";
const PAGEFIND_TIMEOUT_MS = 5000;

let pagefindLoadPromise = null;

/**
 * Reset the internal loader cache (primarily for tests).
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { resetPagefindLoader, loadPagefindUI } from "./pagefind.js";
 *
 * resetPagefindLoader();
 * const loader = loadPagefindUI();
 * assertEquals(typeof loader.then, "function");
 * ```
 */
export function resetPagefindLoader() {
  pagefindLoadPromise = null;
}

/**
 * Loads the Pagefind UI script once and returns a shared promise.
 *
 * @returns A promise that resolves when the Pagefind UI is available.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { loadPagefindUI } from "./pagefind.js";
 *
 * assertEquals(typeof loadPagefindUI, "function");
 * ```
 */
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
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Pagefind failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = PAGEFIND_SCRIPT_SRC;
    script.dataset.pagefindUi = "true";

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

    document.head.appendChild(script);
  });

  return pagefindLoadPromise;
}
