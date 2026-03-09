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
  // Keep backward compatibility for selectors still using the old attribute.
  root.setAttribute("data-color-scheme", resolvedMode);
})();
