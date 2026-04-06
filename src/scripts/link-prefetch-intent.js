// @ts-check

import { createPrefetchScheduler } from "./shared/adaptive-prefetch.js";
import { fetchWithTimeout } from "./shared/network-utils.js";

const PREFETCH_TIMEOUT_MS = 2000;
const HOVER_INTENT_DELAY_MS = 180;
const INTERSECTION_ROOT_MARGIN = "192px 0px";
const ALLOWED_DOCUMENT_EXTENSIONS = new Set([".html"]);

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {() => void}
 */
export function bindLinkPrefetchIntent(runtime) {
  const scheduler = createPrefetchScheduler(runtime);
  /** @type {Set<string>} */
  const prefetchedUrls = new Set();
  /** @type {Set<string>} */
  const budgetedUrls = new Set();
  /** @type {Map<string, Promise<boolean>>} */
  const pendingPrefetches = new Map();
  /** @type {string[]} */
  const queuedUrls = [];
  /** @type {Set<string>} */
  const queuedUrlSet = new Set();
  /** @type {WeakSet<HTMLAnchorElement>} */
  const observedLinks = new WeakSet();
  /** @type {Map<HTMLAnchorElement, ReturnType<typeof runtime.setTimeout>>} */
  const hoverTimers = new Map();
  const currentDocumentUrl = (() => {
    const url = new URL(runtime.location.href);
    url.hash = "";
    return url.toString();
  })();
  const canUseDomPrefetch = (() => {
    const link = runtime.document.createElement("link");
    return Boolean(link.relList?.supports?.("prefetch"));
  })();
  const supportsPointerEvents = typeof runtime.PointerEvent === "function";
  /** @type {IntersectionObserver | null} */
  let intersectionObserver = null;
  let idleScanScheduled = false;
  let queueDrainScheduled = false;

  /**
   * @returns {boolean}
   */
  function hasRemainingRequestBudget() {
    return budgetedUrls.size < scheduler.budget.maxRequests;
  }

  /**
   * @returns {boolean}
   */
  function canStartAnotherRequest() {
    return pendingPrefetches.size < scheduler.budget.maxConcurrency;
  }

  /**
   * @returns {boolean}
   */
  function canProgrammaticallyPrefetch() {
    const { allowed, maxConcurrency, maxRequests } = scheduler.budget;
    return allowed && maxConcurrency > 0 && maxRequests > 0;
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
   * Returns the normalized URL used as the prefetch cache key when a link is a
   * valid same-origin document candidate. The URL fragment is dropped because
   * it never changes the network response payload and should not consume
   * additional prefetch budget.
   *
   * @param {HTMLAnchorElement} link
   * @returns {string | null}
   */
  function getPrefetchCandidateUrl(link) {
    if (link.href.length === 0) {
      return null;
    }

    const url = new URL(link.href);

    if (url.origin !== runtime.location.origin) {
      return null;
    }

    url.hash = "";

    if (url.toString() === currentDocumentUrl) {
      return null;
    }

    if (link.target === "_blank" || link.download.length > 0) {
      return null;
    }

    if (!isDocumentPath(url)) {
      return null;
    }

    return url.toString();
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

    /** @type {Promise<boolean>} */
    /** @type {RequestInit & { priority?: "low" }} */
    const fallbackRequestInit = {
      mode: "same-origin",
      credentials: "same-origin",
      priority: "low",
      headers: {
        accept: "text/html",
        purpose: "prefetch",
        "x-purpose": "prefetch",
      },
    };

    const prefetchPromise = (canUseDomPrefetch
      ? new Promise(
        /** @param {(value: boolean) => void} resolve */
        (resolve) => {
          const prefetchLink = runtime.document.createElement("link");
          prefetchLink.rel = "prefetch";
          prefetchLink.href = url;
          prefetchLink.as = "document";
          prefetchLink.onload = () => resolve(true);
          prefetchLink.onerror = () => resolve(false);
          runtime.document.head.append(prefetchLink);
        },
      )
      : fetchWithTimeout(url, fallbackRequestInit, PREFETCH_TIMEOUT_MS).then(
        (response) => response.ok,
        () => false,
      ))
      .then((succeeded) => {
        if (succeeded) {
          prefetchedUrls.add(url);
        }

        return succeeded;
      })
      .finally(() => {
        pendingPrefetches.delete(url);
        scheduleQueueDrain();
      });

    pendingPrefetches.set(url, prefetchPromise);
    return prefetchPromise;
  }

  /**
   * @returns {void}
   */
  function drainQueue() {
    queueDrainScheduled = false;

    if (!canProgrammaticallyPrefetch()) {
      return;
    }

    while (queuedUrls.length > 0 && canStartAnotherRequest()) {
      const nextUrl = queuedUrls.shift();

      if (nextUrl === undefined) {
        break;
      }

      queuedUrlSet.delete(nextUrl);
      void prefetchUrl(nextUrl);
    }
  }

  /**
   * @returns {void}
   */
  function scheduleQueueDrain() {
    if (queueDrainScheduled || queuedUrls.length === 0) {
      return;
    }

    queueDrainScheduled = true;

    if (
      scheduler.budget.mode === "idle-only" &&
      typeof runtime.requestIdleCallback === "function"
    ) {
      runtime.requestIdleCallback(
        () => {
          drainQueue();
        },
        { timeout: PREFETCH_TIMEOUT_MS },
      );
      return;
    }

    runtime.setTimeout(drainQueue, 0);
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  function queuePrefetch(url) {
    if (
      !canProgrammaticallyPrefetch() || budgetedUrls.has(url) ||
      !hasRemainingRequestBudget()
    ) {
      return false;
    }

    budgetedUrls.add(url);
    queuedUrls.push(url);
    queuedUrlSet.add(url);
    scheduleQueueDrain();
    return true;
  }

  /**
   * @param {EventTarget | null} target
   * @returns {HTMLAnchorElement | null}
   */
  function getClosestAnchor(target) {
    if (!(target instanceof runtime.Element)) {
      return null;
    }

    const anchor = target.closest("a[href]");
    return anchor instanceof runtime.HTMLAnchorElement ? anchor : null;
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {void}
   */
  function clearHoverIntent(link) {
    const timer = hoverTimers.get(link);

    if (timer !== undefined) {
      runtime.clearTimeout(timer);
      hoverTimers.delete(link);
    }
  }

  /**
   * @returns {void}
   */
  function clearAllHoverIntents() {
    for (const timer of hoverTimers.values()) {
      runtime.clearTimeout(timer);
    }

    hoverTimers.clear();
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {void}
   */
  function prefetchFromIntent(link) {
    if (scheduler.budget.mode !== "normal") {
      return;
    }

    const url = getPrefetchCandidateUrl(link);

    if (url === null) {
      return;
    }

    clearHoverIntent(link);
    queuePrefetch(url);
  }

  /**
   * @returns {void}
   */
  function scheduleIdleScan() {
    if (
      idleScanScheduled || !canProgrammaticallyPrefetch() ||
      !hasRemainingRequestBudget()
    ) {
      return;
    }

    idleScanScheduled = true;

    const runScan = () => {
      idleScanScheduled = false;

      if (
        !canProgrammaticallyPrefetch() || !hasRemainingRequestBudget()
      ) {
        return;
      }

      const links = runtime.document.querySelectorAll("a[href]");

      for (const node of links) {
        if (!(node instanceof runtime.HTMLAnchorElement)) {
          continue;
        }

        const url = getPrefetchCandidateUrl(node);

        if (url === null) {
          continue;
        }

        if (scheduler.budget.mode === "normal") {
          observeLink(node);
        }

        if (!queuePrefetch(url) || !hasRemainingRequestBudget()) {
          if (!hasRemainingRequestBudget()) {
            break;
          }

          continue;
        }
      }
    };

    if (typeof runtime.requestIdleCallback === "function") {
      runtime.requestIdleCallback(() => {
        runScan();
      }, { timeout: PREFETCH_TIMEOUT_MS });
      return;
    }

    runtime.setTimeout(runScan, 1);
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {void}
   */
  function observeLink(link) {
    if (intersectionObserver === null || observedLinks.has(link)) {
      return;
    }

    observedLinks.add(link);
    intersectionObserver.observe(link);
  }

  /**
   * @returns {void}
   */
  function syncIntersectionObserver() {
    if (
      scheduler.budget.mode !== "normal" ||
      typeof runtime.IntersectionObserver !== "function"
    ) {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
      return;
    }

    if (intersectionObserver !== null) {
      return;
    }

    intersectionObserver = new runtime.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          intersectionObserver?.unobserve(entry.target);
          const link = entry.target instanceof runtime.HTMLAnchorElement
            ? entry.target
            : null;

          if (link !== null) {
            prefetchFromIntent(link);
          }
        }
      },
      { rootMargin: INTERSECTION_ROOT_MARGIN },
    );

    const links = runtime.document.querySelectorAll("a[href]");

    for (const node of links) {
      if (!(node instanceof runtime.HTMLAnchorElement)) {
        continue;
      }

      if (getPrefetchCandidateUrl(node) === null) {
        continue;
      }

      observeLink(node);
    }
  }

  /**
   * @param {MouseEvent} event
   * @returns {void}
   */
  function handleMouseOver(event) {
    if (scheduler.budget.mode !== "normal") {
      return;
    }

    const link = getClosestAnchor(event.target);

    if (link === null) {
      return;
    }

    const relatedLink = getClosestAnchor(event.relatedTarget);

    if (relatedLink === link) {
      return;
    }

    const url = getPrefetchCandidateUrl(link);

    if (url === null || budgetedUrls.has(url)) {
      return;
    }

    const timer = runtime.setTimeout(() => {
      hoverTimers.delete(link);
      queuePrefetch(url);
    }, HOVER_INTENT_DELAY_MS);

    hoverTimers.set(link, timer);
  }

  /**
   * @param {MouseEvent} event
   * @returns {void}
   */
  function handleMouseOut(event) {
    const link = getClosestAnchor(event.target);

    if (link === null) {
      return;
    }

    const relatedLink = getClosestAnchor(event.relatedTarget);

    if (relatedLink === link) {
      return;
    }

    clearHoverIntent(link);
  }

  /**
   * @param {FocusEvent} event
   * @returns {void}
   */
  function handleFocusIn(event) {
    const link = getClosestAnchor(event.target);

    if (link !== null) {
      prefetchFromIntent(link);
    }
  }

  /**
   * @param {PointerEvent} event
   * @returns {void}
   */
  function handlePointerDown(event) {
    if (event.pointerType !== "touch") {
      return;
    }

    const link = getClosestAnchor(event.target);

    if (link !== null) {
      prefetchFromIntent(link);
    }
  }

  /**
   * @param {TouchEvent} event
   * @returns {void}
   */
  function handleTouchStart(event) {
    if (event.touches.length !== 1) {
      return;
    }

    const link = getClosestAnchor(event.target);

    if (link !== null) {
      prefetchFromIntent(link);
    }
  }

  const removeBudgetListener = scheduler.addChangeListener(() => {
    if (scheduler.budget.mode !== "normal") {
      clearAllHoverIntents();
    }

    syncIntersectionObserver();
    scheduleIdleScan();
    scheduleQueueDrain();
  });

  runtime.document.addEventListener("mouseover", handleMouseOver);
  runtime.document.addEventListener("mouseout", handleMouseOut);
  runtime.document.addEventListener("focusin", handleFocusIn);

  if (supportsPointerEvents) {
    runtime.document.addEventListener("pointerdown", handlePointerDown);
  } else {
    runtime.document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
  }

  syncIntersectionObserver();
  scheduleIdleScan();

  return () => {
    runtime.document.removeEventListener("mouseover", handleMouseOver);
    runtime.document.removeEventListener("mouseout", handleMouseOut);
    runtime.document.removeEventListener("focusin", handleFocusIn);
    runtime.document.removeEventListener("pointerdown", handlePointerDown);
    runtime.document.removeEventListener("touchstart", handleTouchStart);
    clearAllHoverIntents();
    intersectionObserver?.disconnect();
    removeBudgetListener();
    scheduler.destroy();
  };
}

if (typeof window !== "undefined") {
  bindLinkPrefetchIntent(window);
}
