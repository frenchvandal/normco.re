// @ts-check

const DEFAULT_MEDIA_QUERY = "(max-width: 65.99rem)";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const currentScript = document.currentScript instanceof HTMLScriptElement
    ? document.currentScript
    : document.querySelector(
      'script[src="/scripts/post-mobile-tools-loader.js"][data-media-query]',
    );
  const mediaQueryValue = currentScript instanceof HTMLScriptElement &&
      currentScript.dataset.mediaQuery
    ? currentScript.dataset.mediaQuery
    : DEFAULT_MEDIA_QUERY;
  const mediaQuery = globalThis.matchMedia(mediaQueryValue);
  let loaded = false;

  const load = () => {
    if (loaded) {
      return;
    }

    loaded = true;
    void import("/scripts/post-mobile-tools.js");
  };

  if (mediaQuery.matches) {
    load();
  } else if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", (event) => {
      if (event.matches) {
        load();
      }
    }, { once: true });
  } else if (typeof mediaQuery.addListener === "function") {
    const listener = (event) => {
      if (!event.matches) {
        return;
      }

      mediaQuery.removeListener(listener);
      load();
    };

    mediaQuery.addListener(listener);
  }
}
