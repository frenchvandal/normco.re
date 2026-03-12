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
  const legacySwUrl = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swUrl
    : undefined;
  const swModuleUrl = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swModuleUrl ?? "/sw-module.js"
    : "/sw-module.js";
  const swClassicUrl = currentScript instanceof HTMLScriptElement
    ? currentScript.dataset.swClassicUrl ?? legacySwUrl ?? "/sw.js"
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
      swModuleUrl,
      swClassicUrl,
      swDebugLevel,
      ...details,
    });
  }

  /**
   * Builds a registration URL with the debug level encoded as a query string.
   *
   * @param {string} scriptUrl
   * @returns {string}
   */
  function withDebugQuery(scriptUrl) {
    const parsedUrl = new URL(scriptUrl, globalThis.location.origin);
    parsedUrl.searchParams.set("debug", swDebugLevel);

    return `${parsedUrl.pathname}${parsedUrl.search}`;
  }

  /**
   * @param {unknown} error
   * @returns {string}
   */
  function toErrorMessage(error) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  /**
   * Returns true when module registration should fallback to classic mode.
   *
   * @param {unknown} error
   * @returns {boolean}
   */
  function shouldFallbackToClassicRegistration(error) {
    if (error instanceof TypeError) {
      return true;
    }

    if (error instanceof DOMException) {
      return error.name === "TypeError" || error.name === "NotSupportedError";
    }

    return false;
  }

  /**
   * @param {"module" | "classic"} mode
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  function registerWorker(mode) {
    if (mode === "module") {
      return globalThis.navigator.serviceWorker.register(
        withDebugQuery(swModuleUrl),
        {
          scope: "/",
          type: "module",
          updateViaCache: "none",
        },
      );
    }

    return globalThis.navigator.serviceWorker.register(
      withDebugQuery(swClassicUrl),
      {
        scope: "/",
      },
    );
  }

  /**
   * @param {ServiceWorkerRegistration} registration
   * @param {"module" | "classic"} mode
   * @returns {void}
   */
  function handleRegistration(registration, mode) {
    log("registered", {
      mode,
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
        mode,
        installingState: installingWorker?.state ?? "none",
      });

      if (installingWorker === null) {
        return;
      }

      installingWorker.addEventListener("statechange", () => {
        log("installing statechange", {
          mode,
          state: installingWorker.state,
          hasController: globalThis.navigator.serviceWorker.controller !== null,
        });

        if (
          installingWorker.state === "installed" &&
          globalThis.navigator.serviceWorker.controller !== null
        ) {
          log("new version installed -> skip waiting", {
            mode,
            waitingState: registration.waiting?.state ?? "none",
          });
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }

  async function registerServiceWorker() {
    globalThis.navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        log("controllerchange -> reloading page");
        globalThis.location.reload();
      },
    );

    try {
      const moduleRegistration = await registerWorker("module");
      handleRegistration(moduleRegistration, "module");
      return;
    } catch (error) {
      const shouldFallback = shouldFallbackToClassicRegistration(error);

      log("module registration failed", {
        error: toErrorMessage(error),
        shouldFallback,
      });

      if (!shouldFallback) {
        return;
      }
    }

    try {
      const classicRegistration = await registerWorker("classic");
      handleRegistration(classicRegistration, "classic");
    } catch (error) {
      log("classic fallback registration failed", {
        error: toErrorMessage(error),
      });
    }
  }

  function scheduleServiceWorkerRegistration() {
    const requestIdleCallback = globalThis["requestIdleCallback"];

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => {
        void registerServiceWorker();
      }, { timeout: 3000 });
      return;
    }

    globalThis.setTimeout(() => {
      void registerServiceWorker();
    }, 0);
  }

  scheduleServiceWorkerRegistration();
})();
