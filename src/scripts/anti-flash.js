// @ts-check

(() => {
  const root = globalThis.document.documentElement;
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const STORAGE_KEY = "color-mode";
  const LEGACY_STORAGE_KEY = "color-scheme";

  let storedValue = null;
  try {
    storedValue = globalThis.localStorage.getItem(STORAGE_KEY) ??
      globalThis.localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    storedValue = null;
  }

  const resolvedMode = storedValue === "light" || storedValue === "dark"
    ? storedValue
    : mediaQuery.matches
    ? "dark"
    : "light";

  root.setAttribute("data-light-theme", "light");
  root.setAttribute("data-dark-theme", "dark");
  root.setAttribute("data-color-mode", resolvedMode);

  // Sync aria-pressed on the theme toggle once the DOM is ready so that screen
  // readers get the correct state even when theme-toggle.js is delayed or
  // unavailable. This acts as a belt-and-suspenders alongside theme-toggle.js,
  // which sets the same attribute at the bottom of <body>.
  globalThis.document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = globalThis.document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-pressed",
        resolvedMode === "dark" ? "true" : "false",
      );
    }
  });
})();
