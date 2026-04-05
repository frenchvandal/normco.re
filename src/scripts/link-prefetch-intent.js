// @ts-check
(() => {
  /**
   * @typedef {{
   *   readonly saveData?: boolean;
   *   readonly effectiveType?: string;
   * }} NetworkInformationLike
   */

  /**
   * Returns the optional Network Information API object when available.
   * @returns {NetworkInformationLike | undefined}
   */
  function getNavigatorConnection() {
    const navigatorWithConnection =
      /** @type {Navigator & { readonly connection?: unknown }} */ (
        globalThis.navigator
      );
    const connectionCandidate = navigatorWithConnection.connection;

    if (
      typeof connectionCandidate !== "object" || connectionCandidate === null
    ) {
      return undefined;
    }

    return /** @type {NetworkInformationLike} */ (connectionCandidate);
  }

  const connection = getNavigatorConnection();
  const blockedEffectiveTypes = new Set(["slow-2g", "2g"]);

  if (connection?.saveData) {
    return;
  }

  if (
    typeof connection?.effectiveType === "string" &&
    blockedEffectiveTypes.has(connection.effectiveType)
  ) {
    return;
  }

  const PREFETCH_LIMIT = 3;
  const PREFETCH_TIMEOUT_MS = 2000;
  const HOVER_INTENT_DELAY_MS = 180;
  const ALLOWED_DOCUMENT_EXTENSIONS = new Set([".html"]);

  /** @type {Set<string>} */
  const prefetchedUrls = new Set();
  /** @type {Map<string, Promise<boolean>>} */
  const pendingPrefetches = new Map();
  /** @type {WeakSet<HTMLAnchorElement>} */
  const intentBoundLinks = new WeakSet();
  /** @type {Map<HTMLAnchorElement, ReturnType<typeof globalThis.setTimeout>>} */
  const hoverTimers = new Map();
  const currentDocumentUrl = (() => {
    const url = new URL(globalThis.location.href);
    url.hash = "";
    return url.toString();
  })();

  const canUseDomPrefetch = (() => {
    const link = globalThis.document.createElement("link");
    return Boolean(link.relList?.supports?.("prefetch"));
  })();

  /**
   * Creates a timeout-backed abort signal for speculative network work while
   * preserving an upstream signal when one is already present.
   *
   * @param {number} timeoutMs
   * @param {AbortSignal | null | undefined} [upstreamSignal]
   * @returns {{ signal: AbortSignal; cleanup: () => void }}
   */
  function createTimeoutSignal(timeoutMs, upstreamSignal) {
    const existingSignal = upstreamSignal ?? undefined;
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const abortFromUpstream = () => {
      controller.abort();
    };

    if (existingSignal !== undefined) {
      if (existingSignal.aborted) {
        abortFromUpstream();
      } else {
        existingSignal.addEventListener("abort", abortFromUpstream, {
          once: true,
        });
      }
    }

    return {
      signal: controller.signal,
      cleanup() {
        globalThis.clearTimeout(timeoutId);

        if (existingSignal !== undefined && !existingSignal.aborted) {
          existingSignal.removeEventListener("abort", abortFromUpstream);
        }
      },
    };
  }

  /**
   * @param {string | URL} input
   * @param {RequestInit} init
   * @param {number} timeoutMs
   * @returns {Promise<Response>}
   */
  async function fetchWithTimeout(input, init, timeoutMs) {
    const { signal, cleanup } = createTimeoutSignal(
      timeoutMs,
      init.signal ?? undefined,
    );

    try {
      return await globalThis.fetch(input, { ...init, signal });
    } finally {
      cleanup();
    }
  }

  function hasPrefetchBudget() {
    return prefetchedUrls.size + pendingPrefetches.size < PREFETCH_LIMIT;
  }

  /**
   * Returns the normalized URL used as the prefetch cache key.
   *
   * The URL fragment is dropped because it never changes the network
   * response payload and should not consume additional prefetch budget.
   *
   * @param {HTMLAnchorElement} link
   * @returns {string}
   */
  function toPrefetchUrl(link) {
    const url = new URL(link.href);
    url.hash = "";
    return url.toString();
  }

  /**
   * Returns true when the URL path likely points to an HTML document.
   *
   * @param {URL} url
   * @returns {boolean}
   */
  function isDocumentPath(url) {
    const pathSegments = url.pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1] ?? "";
    const extensionMatch = /\.[a-z0-9]+$/i.exec(lastSegment);

    if (extensionMatch === null) {
      return true;
    }

    return ALLOWED_DOCUMENT_EXTENSIONS.has(extensionMatch[0].toLowerCase());
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {boolean}
   */
  function isPrefetchCandidate(link) {
    if (link.href.length === 0) {
      return false;
    }

    const url = new URL(link.href);

    if (url.origin !== globalThis.location.origin) {
      return false;
    }

    url.hash = "";

    if (url.toString() === currentDocumentUrl) {
      return false;
    }

    if (link.target === "_blank" || link.download.length > 0) {
      return false;
    }

    if (!isDocumentPath(url)) {
      return false;
    }

    return true;
  }

  /**
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  function prefetchUrl(url) {
    if (prefetchedUrls.has(url)) {
      return Promise.resolve(true);
    }

    const existingPrefetch = pendingPrefetches.get(url);

    if (existingPrefetch !== undefined) {
      return existingPrefetch;
    }

    if (!hasPrefetchBudget()) {
      return Promise.resolve(false);
    }

    /** @type {Promise<boolean>} */
    const prefetchPromise = (canUseDomPrefetch
      ? new Promise(
        /** @param {(value: boolean) => void} resolve */
        (resolve) => {
          const prefetchLink = globalThis.document.createElement("link");
          prefetchLink.rel = "prefetch";
          prefetchLink.href = url;
          prefetchLink.as = "document";
          prefetchLink.onload = () => resolve(true);
          prefetchLink.onerror = () => resolve(false);
          globalThis.document.head.append(prefetchLink);
        },
      )
      : fetchWithTimeout(url, {
        mode: "same-origin",
        credentials: "same-origin",
        headers: { accept: "text/html" },
      }, PREFETCH_TIMEOUT_MS).then((response) => response.ok, () => false))
      .then((succeeded) => {
        if (succeeded) {
          prefetchedUrls.add(url);
        }

        return succeeded;
      })
      .finally(() => {
        pendingPrefetches.delete(url);
      });

    pendingPrefetches.set(url, prefetchPromise);
    return prefetchPromise;
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {void}
   */
  function clearHoverIntent(link) {
    const timer = hoverTimers.get(link);

    if (timer !== undefined) {
      globalThis.clearTimeout(timer);
      hoverTimers.delete(link);
    }
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {void}
   */
  function prefetchFromIntent(link) {
    if (!isPrefetchCandidate(link) || !hasPrefetchBudget()) {
      return;
    }

    clearHoverIntent(link);
    void prefetchUrl(toPrefetchUrl(link));
  }

  /** @param {HTMLAnchorElement} link */
  function registerIntent(link) {
    if (intentBoundLinks.has(link)) {
      return;
    }

    intentBoundLinks.add(link);

    const onMouseEnter = () => {
      if (!isPrefetchCandidate(link) || !hasPrefetchBudget()) {
        return;
      }

      const url = toPrefetchUrl(link);

      if (prefetchedUrls.has(url)) {
        return;
      }

      const timer = globalThis.setTimeout(() => {
        hoverTimers.delete(link);
        void prefetchUrl(url);
      }, HOVER_INTENT_DELAY_MS);

      hoverTimers.set(link, timer);
    };

    const onMouseLeave = () => clearHoverIntent(link);
    const onFocus = () => prefetchFromIntent(link);
    const onTouchStart = () => prefetchFromIntent(link);

    link.addEventListener("mouseenter", onMouseEnter);
    link.addEventListener("mouseleave", onMouseLeave);
    link.addEventListener("focus", onFocus);
    link.addEventListener("touchstart", onTouchStart, { passive: true });
  }

  function registerCandidateLinks() {
    const links = globalThis.document.querySelectorAll("a[href]");

    for (const node of links) {
      if (!(node instanceof HTMLAnchorElement) || !isPrefetchCandidate(node)) {
        continue;
      }

      registerIntent(node);
    }
  }

  const idleCallback = globalThis.requestIdleCallback;

  if (typeof idleCallback === "function") {
    idleCallback(() => {
      registerCandidateLinks();
    }, { timeout: PREFETCH_TIMEOUT_MS });
    return;
  }

  globalThis.setTimeout(registerCandidateLinks, 1);
})();
