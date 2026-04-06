---
lang: en
title: "How This Blog Deploys to Alibaba Cloud OSS and CDN"
description: "A practical walkthrough of my GitHub Actions pipeline: warmed Lume builds, OIDC role assumption, OSS sync, CDN refresh, and automatic cleanup."
---

This site is built with Lume and deployed to Alibaba Cloud OSS, with Alibaba
Cloud CDN in front of it. The deployment pipeline stays intentionally small: one
GitHub workflow, Deno available on the runner, and one custom action that
restores a local build cache, runs the build, syncs OSS, and cleans up:
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

I now want five properties at the same time: short-lived credentials, warmed
builds on fresh runners, predictable uploads, cache headers that match the files
being shipped, and automatic cache coherence. This setup gives me all five
without adding repository-specific deploy scripts.

## Pipeline at a glance

In steady-state production, this repository’s workflow now does three things:

1. Checks out the repository.
2. Installs Deno with the pinned version from `.tool-versions` and enables the
   runner-side tool cache.
3. Runs the OSS/CDN sync action, which restores `_cache`, executes
   `deno task build`, uploads `_site`, refreshes CDN, and cleans up.

At the moment, that build also fingerprints the shared and route-scoped critical
CSS assets, strips source maps, and prunes optional Pagefind files that are not
referenced by the final HTML before `_site` is synced.

```yaml
name: Deploy static content to OSS

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

concurrency:
  group: "oss-deploy"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: development
    runs-on: macos-26
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup Deno environment
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true

      - name: Deploy to Alibaba Cloud OSS
        uses: frenchvandal/aliyun-oss-cdn-sync-action@master
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          cache-enabled: true
          cache-key: >-
            lume-cache-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('deno.lock') }}-${{ hashFiles('_cache/**/*') || 'empty' }}
          cache-restore-keys: |
            lume-cache-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('deno.lock') }}-
            lume-cache-${{ runner.os }}-${{ runner.arch }}-
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          audience: ${{ github.repository_id }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh
          build-command: deno task build
```

In this repository, I currently keep `cdn-actions: refresh`. The action still
supports `refresh,preload`, but this site’s workflow no longer enables preload
on every deployment.

## Why OIDC instead of access keys

The action uses GitHub OIDC to assume an Alibaba Cloud RAM role at runtime. No
long-lived access key is stored in the repository. The workflow only needs
`id-token: write` plus the RAM role ARN and the OIDC provider ARN.

Authentication is now OIDC-only. The action does not fall back to static access
keys from inputs or environment variables if role assumption fails.

The current setup also passes `audience: ${{ github.repository_id }}`. GitHub
can mint an ID token for a custom audience, and Alibaba Cloud RAM can validate
that `aud` value against the Client IDs configured on the OIDC identity provider
and in the role trust policy. That gives me a tighter trust boundary than
relying on default audience handling alone.

## How the action runs internally

The action is split into three phases:

- **pre**: assumes the RAM role through OIDC and stores temporary credentials in
  action state.
- **main**: optionally restores the local `_cache` directory, runs
  `build-command`, uploads local files to OSS, applies cache headers, and runs
  CDN actions if enabled.
- **post**: compares remote objects under the destination prefix with local
  files produced by the build, deletes remote orphans, refreshes deleted URLs
  when needed, writes CDN task summaries, and saves `_cache` when `cache-key` is
  configured.

The cleanup phase runs with `post-if: always()`, so it still executes even when
earlier steps fail. Cleanup, CDN calls, and cache restore or save are
intentionally best-effort: warnings are logged, but transient CDN or cache
service issues do not block the deployment.

## Upload, cache, quota, and drift control

A few implementation details matter for reliability:

- `build-command` runs inside the action before any OSS upload or CDN call.
- If `cache-enabled` is `true` and `cache-key` is configured, `_cache` restore
  happens before the build and a fresh snapshot can be saved during `post`.
- `cache-enabled` controls only restore, so I can skip warm-cache restore
  temporarily without giving up the post-step cache save.
- Uploads are parallelized with `max-concurrency`.
- A global API throttle is applied through `api-rps-limit`.
- Each file upload is retried up to 3 times before being marked as failed.
- Partial upload failures are surfaced through `failed-count` and the GitHub job
  summary instead of being buried in the logs.
- The upload step now writes `Cache-Control` headers automatically: HTML and
  `sw.js` are revalidated aggressively, hashed assets are uploaded as immutable,
  and common static assets get shorter revalidation windows instead of a
  one-size-fits-all policy.
- `cdn-actions` only accepts `refresh` or `refresh,preload`; if CDN is enabled
  and the value is empty or invalid, the action falls back to `refresh`.
- The action checks remaining CDN quota before submitting refresh or preload
  batches.
- Deleted OSS objects can trigger CDN refresh for removed URLs, which reduces
  stale-cache windows and limits object drift over time.
- The action writes a GitHub Actions job summary for deployment, cleanup, and
  CDN task status.

That last point is easy to miss: upload alone is not enough for a static site
that changes over time. You also need deletion and cache invalidation for
objects that should no longer exist.

## Minimum RAM permissions

At the policy level, the role needs OSS permissions on the target bucket scope
for listing, uploading, and deleting objects. On the CDN side, this workflow
needs refresh permissions plus the read APIs used for quota checks and task
lookups. If preload is enabled, add the corresponding preload permission too.
The trust policy must allow the GitHub OIDC provider to assume the deploy role.

I keep this as a dedicated deploy role rather than mixing it with broader
operational permissions.

## Reusing the action in other repositories

The action is published and reusable:
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

This repository currently tracks `@master` because I maintain the site and the
action together. In a separate repository, I would usually pin `@v1` or, better
yet, a full commit SHA. I also now let the action own the build and `_cache`
lifecycle, which keeps consumer workflows shorter and more declarative.

For me, the key result is that deploys stay boring: restore cache, build, sync,
refresh, cleanup, done.
