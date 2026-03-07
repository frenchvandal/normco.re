(() => {
  const root = globalThis.document.documentElement;
  const button = globalThis.document.getElementById("theme-toggle");

  if (button === null) {
    return;
  }

  const themeToggleButton = button;
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      return globalThis.localStorage.getItem("color-scheme");
    } catch {
      return null;
    }
  }

  function persistTheme(theme) {
    try {
      globalThis.localStorage.setItem("color-scheme", theme);
    } catch {
      // Ignore storage failures (private mode, blocked storage, etc.).
    }
  }

  function getEffectiveTheme() {
    const value = root.getAttribute("data-color-scheme") ?? readStoredTheme();

    if (value === "light" || value === "dark") {
      return value;
    }

    return mediaQuery.matches ? "dark" : "light";
  }

  function updateAriaLabel(theme) {
    themeToggleButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }

  updateAriaLabel(getEffectiveTheme());

  themeToggleButton.addEventListener("click", () => {
    const nextTheme = getEffectiveTheme() === "dark" ? "light" : "dark";

    root.setAttribute("data-color-scheme", nextTheme);
    persistTheme(nextTheme);
    updateAriaLabel(nextTheme);
  });
})();
