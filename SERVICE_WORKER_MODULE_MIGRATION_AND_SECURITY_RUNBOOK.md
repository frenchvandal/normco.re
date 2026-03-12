# Service Worker Module Migration Plan and Security Runbook

## Context

The current setup uses:

- `src/scripts/sw-register.js` to register `/sw.js`
- `src/scripts/sw.js` as a classic (non-module) service worker
- asset fingerprinting via `scripts/fingerprint-assets.ts`

The goal is to keep the migration small while improving maintainability and
preserving current behavior (offline fallback, feed caching, predictive
preloading, and instant activation flow).

## Migration Goals

- Move from a classic service worker script to a module service worker.
- Split large service worker logic into focused modules for easier maintenance.
- Keep runtime behavior stable for users.
- Keep rollback simple and fast.

## Non-Goals

- No feature redesign during migration.
- No new background APIs (for example, periodic sync) in this phase.
- No changes to caching strategy semantics unless required for correctness.

## Proposed Phases

### Phase 0: Baseline and guardrails (0.5 day)

1. Capture baseline behavior:
   - install and activate lifecycle
   - offline page fallback
   - feed stale-while-revalidate
   - predictive preloading behavior
2. Capture baseline metrics:
   - first SW install success rate
   - update success path (`waiting` -> `skipWaiting` -> `controllerchange`)
   - cache counts by namespace (`static-*`, `pages-*`, `feeds-*`)
3. Keep existing registration path as a fallback strategy during rollout.

### Phase 1: Registration migration (0.5 day)

1. Update registration to prefer module workers:

```js
navigator.serviceWorker.register(`${swUrl}?debug=${swDebugLevel}`, {
  scope: "/",
  type: "module",
  updateViaCache: "none",
});
```

2. Keep current activation semantics (`SKIP_WAITING`, `controllerchange`
   reload).
3. Add explicit error logging for registration failures, including fallback
   path.

### Phase 2: SW code split into modules (1 day)

1. Rename `src/scripts/sw.js` to module entry semantics (still output as
   `/sw.js`).
2. Extract to internal modules:
   - lifecycle (`install`, `activate`, `message`)
   - cache strategies (`cacheFirst`, `networkFirstPage`,
     `staleWhileRevalidateFeed`)
   - predictive preload model and transition tracking
   - request classification and bypass logic
3. Keep side effects only in the entry module; keep helpers pure where possible.
4. Use static imports only.

### Phase 3: Verification and rollout (0.5 day)

1. Verify on:
   - Chromium
   - Firefox
   - Safari
2. Verify update flow from an older SW version to the new module SW.
3. Roll out directly if stable; otherwise, use immediate rollback (see below).

## Acceptance Criteria

- All existing SW tests pass.
- Full project pipeline passes:
  - `deno fmt`
  - `deno lint`
  - `deno task check`
  - `deno task lint:doc`
  - `deno test`
  - `deno task test:doc`
  - `deno task build`
- `_html-issues.json` remains valid with zero HTML errors.
- Manual checks confirm:
  - offline fallback works
  - feed cache behavior is unchanged
  - predictive preloading remains network-aware and bounded

## Rollback Plan

If module registration causes regressions:

1. Revert registration option `type: "module"` and return to classic
   registration.
2. Restore previous single-file SW entry from the prior commit.
3. Trigger SW update by deploying the reverted `/sw.js`.
4. Confirm `controllerchange` reload and cache namespace cleanup.

Rollback must be possible in one revert commit.

## Mini Security Runbook (Service Worker)

### 1. Browser patch hygiene

- Keep local development browsers up to date.
- Apply stable browser security updates promptly.
- Track high-impact SW-related CVEs in release notes and security advisories.

### 2. CSP and XSS checks

Before every release that touches SW or script loading:

1. Confirm strict CSP is still enforced and does not accidentally allow unsafe
   script execution.
2. Re-check any DOM write paths used by SW-related client scripts.
3. Confirm no untrusted data is used to construct SW registration URLs or
   message payloads.

### 3. Cache data review

For each cache namespace (`static-*`, `pages-*`, `feeds-*`):

1. Confirm only public, non-sensitive content is cached.
2. Confirm no authenticated API responses are cached.
3. Confirm TTL and invalidation logic are still aligned with content freshness
   goals.

### 4. Scope and transport checks

- Keep SW scope minimal and intentional.
- Enforce HTTPS in all production environments.
- Re-check that crawler bypass logic is treated as a secondary safeguard, not a
  trust boundary.

### 5. Incident response checklist

If a security issue is suspected:

1. Disable risky behavior first (registration rollback or SW rollback).
2. Deploy a clean SW version that clears stale caches as needed.
3. Validate with manual cache inspection in DevTools Application panel.
4. Document root cause, impact, and permanent fix before re-enabling
   optimizations.

### 6. Release gate for SW changes

No SW-related change ships unless all are true:

- SW tests and full pipeline pass.
- Manual offline and update-flow checks pass.
- Cache review is completed.
- CSP/XSS checklist is completed.
