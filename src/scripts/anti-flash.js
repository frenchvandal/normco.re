(() => {
  const value = globalThis.localStorage.getItem("color-scheme");

  if (value === "light" || value === "dark") {
    globalThis.document.documentElement.setAttribute(
      "data-color-scheme",
      value,
    );
  }
})();
