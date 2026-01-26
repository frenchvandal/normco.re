/**
 * External link enhancements.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { enhanceExternalLinks } from "./external-links.js";
 *
 * const link = {
 *   hostname: "example.com",
 *   attributes: new Map(),
 *   classList: { add: () => {} },
 *   hasAttribute: () => false,
 *   setAttribute(name, value) {
 *     this.attributes.set(name, value);
 *   },
 *   querySelector: () => null,
 *   appendChild: () => {},
 * };
 *
 * globalThis.location = { hostname: "localhost" };
 * globalThis.document = {
 *   querySelectorAll: () => [link],
 *   createElement: () => ({ className: "", textContent: "", appendChild: () => {} }),
 * };
 *
 * enhanceExternalLinks();
 * assertEquals(link.attributes.get("target"), "_blank");
 * ```
 */
export function enhanceExternalLinks() {
  const links = document.querySelectorAll("a[href^='http']");

  links.forEach((link) => {
    // Skip if it's a link to the current domain
    if (link.hostname === globalThis.location.hostname) return;

    // Add external indicator
    if (!link.hasAttribute("target")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }

    // Add tooltip for external links (CSS-driven)
    link.setAttribute("data-tooltip", "Opens in new tab");
    link.classList.add("external-link");

    // Add screen reader text
    if (!link.querySelector(".sr-only")) {
      const srText = document.createElement("span");
      srText.className = "sr-only";
      srText.textContent = " (opens in new tab)";
      link.appendChild(srText);
    }
  });
}
