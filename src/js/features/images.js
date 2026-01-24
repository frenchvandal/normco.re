/**
 * Image lazy loading enhancements
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
