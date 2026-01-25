/**
 * Service worker enhancements: update notifications and prefetching.
 */

const shouldPrefetch = () => {
  const connection = navigator.connection;

  if (!connection) {
    return true;
  }

  if (connection.saveData) {
    return false;
  }

  const slowTypes = ["slow-2g", "2g"];
  return !slowTypes.includes(connection.effectiveType);
};

const getAdjacentPostUrls = () => {
  const nextLink = document.querySelector('a[rel="next"]');
  const prevLink = document.querySelector('a[rel="prev"]');
  const urls = [nextLink?.href, prevLink?.href].filter(Boolean);

  return [...new Set(urls)];
};

const sendPrefetchMessage = (urls) => {
  if (!urls.length) {
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (!registration.active) {
      return;
    }

    registration.active.postMessage({ type: "prefetch", urls });
  });
};

const showToast = (variant, message, duration = 5000) => {
  if (!globalThis.toast || typeof globalThis.toast[variant] !== "function") {
    return;
  }

  globalThis.toast[variant](message, duration);
};

export const prefetchAdjacentPosts = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!shouldPrefetch()) {
    return;
  }

  const urls = getAdjacentPostUrls();
  sendPrefetchMessage(urls);
};

export const initializeServiceWorkerNotifications = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!navigator.onLine) {
    showToast("warning", "You are offline. Some features may be unavailable.");
  }

  globalThis.addEventListener("offline", () => {
    showToast("warning", "You are offline. Some features may be unavailable.");
  });

  globalThis.addEventListener("online", () => {
    showToast("success", "You are back online.", 3000);
  });

  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      if (!newWorker) {
        return;
      }

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          showToast(
            "info",
            "A new version is available. Refresh to update.",
            7000,
          );
        }
      });
    });
  });
};
