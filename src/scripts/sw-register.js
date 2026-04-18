// @ts-check
(() => {
  if (!("serviceWorker" in globalThis.navigator)) {
    return;
  }

  const localHostPattern =
    /^(localhost|127(?:\.\d{1,3}){3}|\[::1\]|0\.0\.0\.0)$/i;
  const knownCrawlerPattern =
    /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;

  if (knownCrawlerPattern.test(globalThis.navigator.userAgent)) {
    return;
  }

  // `document.currentScript` can be null for deferred or dynamically
  // evaluated execution paths, so keep the bootstrap dataset optional.
  const currentScriptElement =
    globalThis.document.currentScript instanceof HTMLScriptElement
      ? globalThis.document.currentScript
      : null;
  const swUrl = currentScriptElement !== null
    ? currentScriptElement.dataset.swUrl ?? "/sw.js"
    : "/sw.js";
  const allowedSwDebugLevels = new Set(["off", "summary", "verbose"]);
  /**
   * @param {string | undefined} value
   * @returns {"off" | "summary" | "verbose"}
   */
  const resolveSwDebugLevel = (value) =>
    typeof value === "string" && allowedSwDebugLevels.has(value)
      ? /** @type {"off" | "summary" | "verbose"} */ (value)
      : "off";
  const swDebugLevel = resolveSwDebugLevel(
    currentScriptElement !== null
      ? currentScriptElement.dataset.swDebugLevel
      : undefined,
  );
  const safeSessionStorage = (() => {
    const storage = globalThis.sessionStorage;
    return {
      /** @param {string} key */
      getItem: (key) => {
        try {
          return storage?.getItem(key) ?? null;
        } catch {
          return null;
        }
      },
      /** @param {string} key */
      removeItem: (key) => {
        try {
          storage?.removeItem(key);
        } catch {
          // Ignore storage errors (e.g. private mode, quota exceeded).
        }
      },
      /** @param {string} key @param {string} value */
      setItem: (key, value) => {
        try {
          storage?.setItem(key, value);
        } catch {
          // Ignore storage errors (e.g. private mode, quota exceeded).
        }
      },
    };
  })();
  const isLocalDevelopmentHost = localHostPattern.test(
    globalThis.location.hostname,
  );
  let controllerWasPresent = globalThis.navigator.serviceWorker.controller !==
    null;
  let didReloadForUpdate = false;

  /**
   * @param {string} event
   * @param {Record<string, unknown>} [details]
   * @returns {void}
   */
  function log(event, details = {}) {
    if (swDebugLevel !== "summary" && swDebugLevel !== "verbose") {
      return;
    }

    console.info("[SW register]", event, { swUrl, swDebugLevel, ...details });
  }

  async function disableServiceWorkerForLocalDevelopment() {
    const registrations = typeof globalThis.navigator.serviceWorker
        .getRegistrations === "function"
      ? await globalThis.navigator.serviceWorker.getRegistrations()
      : [];
    const hadController = globalThis.navigator.serviceWorker.controller !==
      null;
    const cacheStorage = globalThis.caches;
    const cacheKeys = cacheStorage && typeof cacheStorage.keys === "function"
      ? await cacheStorage.keys()
      : [];

    log("localhost detected -> unregistering service workers", {
      registrations: registrations.length,
      hadController,
      cacheKeys,
    });

    await Promise.all(registrations.map((registration) =>
      registration
        .unregister()
    ));

    if (cacheStorage && typeof cacheStorage.delete === "function") {
      await Promise.all(cacheKeys.map((cacheKey) =>
        cacheStorage.delete(
          cacheKey,
        )
      ));
    }

    if (!hadController) {
      safeSessionStorage.removeItem("sw-localhost-reset");
      return;
    }

    if (safeSessionStorage.getItem("sw-localhost-reset") === "true") {
      return;
    }

    safeSessionStorage.setItem("sw-localhost-reset", "true");
    globalThis.location.reload();
  }

  /**
   * @param {ServiceWorkerRegistration} registration
   * @returns {void}
   */
  function handleRegistration(registration) {
    log("registered", {
      active: registration.active?.state ?? "none",
      installing: registration.installing?.state ?? "none",
      waiting: registration.waiting?.state ?? "none",
    });

    if (registration.waiting !== null) {
      log("waiting worker detected -> skip waiting");
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
          hasController: globalThis.navigator.serviceWorker.controller !== null,
        });

        if (
          installingWorker.state === "installed" &&
          globalThis.navigator.serviceWorker.controller !== null
        ) {
          log("new version installed -> skip waiting");
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }

  async function registerServiceWorker() {
    if (isLocalDevelopmentHost) {
      await disableServiceWorkerForLocalDevelopment();
      return;
    }

    globalThis.navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        if (!controllerWasPresent) {
          controllerWasPresent = true;
          log("controllerchange on first install -> keeping current page");
          return;
        }

        if (didReloadForUpdate) {
          log("controllerchange after update -> reload already handled");
          return;
        }

        didReloadForUpdate = true;
        log("controllerchange after update -> reloading page");
        globalThis.location.reload();
      },
    );

    try {
      const parsedUrl = new URL(swUrl, globalThis.location.origin);
      parsedUrl.searchParams.set("debug", swDebugLevel);

      const registration = await globalThis.navigator.serviceWorker.register(
        parsedUrl.toString(),
        { scope: "/", type: "module", updateViaCache: "none" },
      );

      handleRegistration(registration);
    } catch (error) {
      log("registration failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const requestIdleCallback = globalThis["requestIdleCallback"];

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => void registerServiceWorker(), { timeout: 3000 });
  } else {
    globalThis.setTimeout(() => void registerServiceWorker(), 0);
  }
})();
