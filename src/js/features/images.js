/**
 * Image lazy loading enhancements.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { enhanceImages } from "./images.js";
 *
 * const image = {
 *   complete: true,
 *   classList: {
 *     values: new Set(),
 *     add(value) {
 *       this.values.add(value);
 *     },
 *   },
 * };
 *
 * globalThis.document = {
 *   querySelectorAll: () => [image],
 * };
 *
 * enhanceImages();
 * assertEquals(image.classList.values.has("loaded"), true);
 * ```
 */
export function enhanceImages() {
  // Add fade-in animation for lazy loaded images
  const images = document.querySelectorAll("img[loading='lazy']");

  images.forEach((img) => {
    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
      }, { once: true });
    }
  });
}
