/**
 * Table of contents enhancements
 */

export function enhanceTOC() {
  const toc = document.querySelector(".toc");
  if (!toc) return;

  // Make TOC sticky on scroll
  const tocTop = toc.offsetTop;

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
            // Remove active from all links
            toc.querySelectorAll("a").forEach((link) => {
              link.classList.remove("active");
            });
            // Add active to current
            tocLink.classList.add("active");
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
