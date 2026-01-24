/**
 * Smooth scroll for anchor links
 */

export function enhanceAnchors() {
  const prefersReducedMotion = globalThis.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
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
  });
}
