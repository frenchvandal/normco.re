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

  const currentScript = globalThis.document.currentScript;
  const assetVersion = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.assetVersion ?? "dev"
    : "dev";
  const swDebugLevel = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swDebugLevel ?? "off"
    : "off";

  function isDebugEnabled() {
    return swDebugLevel === "summary" || swDebugLevel === "verbose";
  }

  function log(event, details = {}) {
    if (!isDebugEnabled()) {
      return;
    }

    console.info("[SW register]", event, {
      assetVersion,
      swDebugLevel,
      ...details,
    });
  }

  globalThis.navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      log("controllerchange -> reloading page");
      globalThis.location.reload();
    },
  );

  globalThis.navigator.serviceWorker
    .register(`/sw.js?v=${assetVersion}&debug=${swDebugLevel}`, { scope: "/" })
    .then((registration) => {
      log("registered", {
        active: registration.active?.state ?? "none",
        installing: registration.installing?.state ?? "none",
        waiting: registration.waiting?.state ?? "none",
      });

      if (registration.waiting !== null) {
        log("waiting worker detected -> skip waiting", {
          waitingState: registration.waiting.state,
        });
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;

        log("updatefound", {
          installingState: installingWorker?.state ?? "none",
        });

        if (installingWorker === null) {
          return;
        }

        installingWorker.addEventListener("statechange", () => {
          log("installing statechange", {
            state: installingWorker.state,
            hasController:
              globalThis.navigator.serviceWorker.controller !== null,
          });

          if (
            installingWorker.state === "installed" &&
            globalThis.navigator.serviceWorker.controller !== null
          ) {
            log("new version installed -> skip waiting", {
              waitingState: registration.waiting?.state ?? "none",
            });
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    })
    .catch((error) => {
      log("registration failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
})();
