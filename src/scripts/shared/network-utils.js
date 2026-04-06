// @ts-check

/**
 * Creates a timeout-backed abort signal while preserving an upstream signal
 * when the incoming request is already abortable.
 *
 * @param {number} timeoutMs
 * @param {AbortSignal | null | undefined} [upstreamSignal]
 * @returns {{ signal: AbortSignal; cleanup: () => void }}
 */
export function createTimeoutSignal(timeoutMs, upstreamSignal) {
  const existingSignal = upstreamSignal ?? undefined;
  const abortSignalConstructor = globalThis.AbortSignal;
  const timeoutFactory = abortSignalConstructor?.timeout;
  const anyFactory = abortSignalConstructor?.any;

  if (typeof timeoutFactory === "function") {
    const timeoutSignal = timeoutFactory.call(
      abortSignalConstructor,
      timeoutMs,
    );

    if (existingSignal === undefined) {
      return { signal: timeoutSignal, cleanup() {} };
    }

    if (typeof anyFactory === "function") {
      return {
        signal: anyFactory.call(abortSignalConstructor, [
          existingSignal,
          timeoutSignal,
        ]),
        cleanup() {},
      };
    }
  }

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
 * @param {RequestInfo | URL} input
 * @param {RequestInit | undefined} init
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(input, init, timeoutMs) {
  const { signal, cleanup } = createTimeoutSignal(
    timeoutMs,
    init?.signal ?? undefined,
  );

  try {
    const requestInit = init === undefined ? { signal } : { ...init, signal };
    return await globalThis.fetch(input, requestInit);
  } finally {
    cleanup();
  }
}
