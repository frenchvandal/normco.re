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

  const currentScript = globalThis.document.currentScript;
  const assetVersion = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.assetVersion ?? "dev"
    : "dev";

  let waitingWorkerRef = null;
  let hasTriggeredRefresh = false;

  function showUpdateToast(waitingWorker) {
    const toast = globalThis.document.getElementById(UPDATE_TOAST_ID);
    const button = globalThis.document.getElementById(UPDATE_BUTTON_ID);

    if (!(toast instanceof HTMLElement) || !(button instanceof HTMLElement)) {
      return;
    }

    waitingWorkerRef = waitingWorker;
    toast.hidden = false;

    if (toast.dataset.bound === "true") {
      return;
    }

    toast.dataset.bound = "true";

    button.addEventListener("click", async () => {
      if (hasTriggeredRefresh) {
        return;
      }

      hasTriggeredRefresh = true;

      const registration = await globalThis.navigator.serviceWorker
        .getRegistration();
      const waitingWorker = registration?.waiting ?? waitingWorkerRef;

      if (waitingWorker instanceof ServiceWorker) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
      }

      button.setAttribute("disabled", "true");
      button.textContent = "Updating…";

      globalThis.setTimeout(() => {
        globalThis.location.reload();
      }, 1500);
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
    .register(`/sw.js?v=${assetVersion}`, { scope: "/" })
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
