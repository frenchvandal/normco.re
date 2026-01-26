/**
 * Table of contents enhancements.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { enhanceTOC } from "./toc.js";
 *
 * let scrollHandler;
 * const toc = { offsetTop: 100, classList: { add: () => {}, remove: () => {} }, querySelector: () => null };
 * globalThis.document = {
 *   querySelector: () => toc,
 *   querySelectorAll: () => [],
 * };
 * globalThis.addEventListener = (_event, handler) => {
 *   scrollHandler = handler;
 * };
 * globalThis.requestAnimationFrame = (cb) => cb();
 * globalThis.IntersectionObserver = class {
 *   constructor() {}
 *   observe() {}
 * };
 *
 * enhanceTOC();
 * assertEquals(typeof scrollHandler, "function");
 * ```
 */
export function enhanceTOC() {
  const toc = document.querySelector(".toc");
  if (!toc) return;

  // Make TOC sticky on scroll
  const tocTop = toc.offsetTop;
  let activeLink = null;

  let isTicking = false;
  const updateStickyState = () => {
    if (globalThis.scrollY > tocTop - 20) {
      toc.classList.add("toc-sticky");
    } else {
      toc.classList.remove("toc-sticky");
    }
    isTicking = false;
  };

  globalThis.addEventListener("scroll", () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateStickyState);
    }
  }, { passive: true });

  // Highlight current section in TOC
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const tocLink = toc.querySelector(`a[href="#${id}"]`);

        if (tocLink) {
          if (entry.isIntersecting) {
            if (activeLink && activeLink !== tocLink) {
              activeLink.classList.remove("active");
            }
            tocLink.classList.add("active");
            activeLink = tocLink;
          }
        }
      });
    },
    { rootMargin: "-20% 0px -35% 0px" },
  );

  // Observe all headings
  document.querySelectorAll("h2[id], h3[id], h4[id]").forEach((heading) => {
    observer.observe(heading);
  });
}
