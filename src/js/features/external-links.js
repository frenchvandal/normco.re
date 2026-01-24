/**
 * External link enhancements
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

    // Add screen reader text
    if (!link.querySelector(".sr-only")) {
      const srText = document.createElement("span");
      srText.className = "sr-only";
      srText.textContent = " (opens in new tab)";
      link.appendChild(srText);
    }
  });
}
