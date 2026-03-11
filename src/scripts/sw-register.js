// @ts-check
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
  const swUrl = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swUrl ?? "/sw.js"
    : "/sw.js";
  const swDebugLevel = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swDebugLevel ?? "off"
    : "off";

  function isDebugEnabled() {
    return swDebugLevel === "summary" || swDebugLevel === "verbose";
  }

  /**
   * @param {string} event
   * @param {Record<string, unknown>} [details]
   * @returns {void}
   */
  function log(event, details = {}) {
    if (!isDebugEnabled()) {
      return;
    }

    console.info("[SW register]", event, {
      swUrl,
      swDebugLevel,
      ...details,
    });
  }

  function registerServiceWorker() {
    globalThis.navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        log("controllerchange -> reloading page");
        globalThis.location.reload();
      },
    );

    void globalThis.navigator.serviceWorker
      .register(`${swUrl}?debug=${swDebugLevel}`, {
        scope: "/",
      })
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
  }

  function scheduleServiceWorkerRegistration() {
    const requestIdleCallback = globalThis["requestIdleCallback"];

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => {
        registerServiceWorker();
      }, { timeout: 3000 });
      return;
    }

    globalThis.setTimeout(() => {
      registerServiceWorker();
    }, 0);
  }

  scheduleServiceWorkerRegistration();
})();
