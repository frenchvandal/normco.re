// @ts-check
(() => {
  /** @typedef {"light" | "dark"} ColorMode */
  /** @typedef {"light" | "dark" | "system"} ThemePreference */
  const root = globalThis.document.documentElement;
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const STORAGE_KEY = "color-mode";
  const LEGACY_STORAGE_KEY = "color-scheme";

  /** @type {ThemePreference | null} */
  let storedValue = null;
  try {
    const storedPreference = globalThis.localStorage.getItem(STORAGE_KEY);

    if (
      storedPreference === "light" || storedPreference === "dark" ||
      storedPreference === "system"
    ) {
      storedValue = storedPreference;
    } else {
      const legacyPreference = globalThis.localStorage.getItem(
        LEGACY_STORAGE_KEY,
      );
      storedValue = legacyPreference === "light" || legacyPreference === "dark"
        ? legacyPreference
        : null;
    }
  } catch {
    storedValue = null;
  }

  const preference = storedValue ?? "system";
  const resolvedMode = preference === "light" || preference === "dark"
    ? preference
    : mediaQuery.matches
    ? "dark"
    : "light";

  root.setAttribute("data-light-theme", "light");
  root.setAttribute("data-dark-theme", "dark");
  root.setAttribute("data-color-mode", resolvedMode);
  root.setAttribute("data-theme-preference", preference);
  root.setAttribute("data-color-scheme", resolvedMode);

  globalThis.document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = globalThis.document.getElementById("theme-toggle");
    if (themeToggle) {
      const switchToLightLabel = themeToggle.getAttribute(
        "data-label-switch-light",
      ) ?? "Switch to light theme";
      const switchToDarkLabel = themeToggle.getAttribute(
        "data-label-switch-dark",
      ) ?? "Switch to dark theme";
      const followSystemLabel = themeToggle.getAttribute(
        "data-label-follow-system",
      ) ?? "Follow system theme";
      const nextLabel = preference === "light"
        ? switchToDarkLabel
        : preference === "dark"
        ? followSystemLabel
        : switchToLightLabel;

      themeToggle.setAttribute("aria-label", nextLabel);
      themeToggle.setAttribute("title", nextLabel);
    }
  });
})();
