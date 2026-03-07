(() => {
  let value = null;
  try {
    value = globalThis.localStorage.getItem("color-scheme");
  } catch {
    return;
  }

  if (value === "light" || value === "dark") {
    globalThis.document.documentElement.setAttribute(
      "data-color-scheme",
      value,
    );
  }
})();
