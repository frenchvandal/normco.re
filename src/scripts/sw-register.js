(() => {
  const supportsServiceWorker = "serviceWorker" in globalThis.navigator;

  if (!supportsServiceWorker) {
    return;
  }

  const userAgent = globalThis.navigator.userAgent;
  const knownCrawlerPattern =
    /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;

  if (knownCrawlerPattern.test(userAgent)) {
    return;
  }

  const UPDATE_TOAST_ID = "sw-update-toast";
  const UPDATE_BUTTON_ID = "sw-update-button";

  function showUpdateToast(waitingWorker) {
    const toast = globalThis.document.getElementById(UPDATE_TOAST_ID);
    const button = globalThis.document.getElementById(UPDATE_BUTTON_ID);

    if (!(toast instanceof HTMLElement) || !(button instanceof HTMLElement)) {
      return;
    }

    if (toast.dataset.bound === "true") {
      toast.hidden = false;
      return;
    }

    toast.dataset.bound = "true";
    toast.hidden = false;

    button.addEventListener("click", () => {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      button.setAttribute("disabled", "true");
      button.textContent = "Updating…";
    });
  }

  function trackInstallingWorker(registration) {
    const installingWorker = registration.installing;

    if (installingWorker === null) {
      return;
    }

    installingWorker.addEventListener("statechange", () => {
      if (
        installingWorker.state === "installed" &&
        registration.waiting !== null &&
        globalThis.navigator.serviceWorker.controller !== null
      ) {
        showUpdateToast(registration.waiting);
      }
    });
  }

  globalThis.navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      globalThis.location.reload();
    },
  );

  globalThis.navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      if (registration.waiting !== null) {
        showUpdateToast(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        trackInstallingWorker(registration);
      });
    })
    .catch(() => {
      // Intentionally silent: if SW registration fails we keep the site usable.
    });
})();
