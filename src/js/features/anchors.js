/**
 * Smooth scroll for anchor links.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { enhanceAnchors } from "./anchors.js";
 *
 * let clickHandler;
 * globalThis.matchMedia = () => ({ matches: true });
 * globalThis.document = {
 *   addEventListener: (_event, handler) => {
 *     clickHandler = handler;
 *   },
 *   querySelector: () => null,
 * };
 *
 * enhanceAnchors();
 * assertEquals(typeof clickHandler, "function");
 * ```
 */
export function enhanceAnchors() {
  const prefersReducedMotion = globalThis.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (href === "#") return;

    const target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      // Update URL without triggering scroll
      history.pushState(null, "", href);

      // Focus the target for accessibility
      target.setAttribute("tabindex", "-1");
      target.focus();
      target.focus({ preventScroll: true });
    }
  });
}
