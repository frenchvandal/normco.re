---
slug: alibaba-cloud-oss-cdn-deployment
lang: en
title: "How This Blog Deploys to Alibaba Cloud OSS and CDN"
description: "A practical walkthrough of my GitHub Actions pipeline: Lume build, OIDC role assumption, OSS sync, CDN refresh/preload, and automatic cleanup."
---

This site is built with Lume and deployed to Alibaba Cloud OSS, with Alibaba
Cloud CDN in front of it. The deployment pipeline stays intentionally small: one
GitHub workflow, one build step, and one custom action:
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

I wanted four properties at the same time: short-lived credentials, predictable
uploads, cache headers that match the files being shipped, and automatic cache
coherence. This setup gives me all four without adding repository-specific
deploy scripts.

## Pipeline at a glance

In steady-state production, this repository's workflow does four things:

1. Checks out the repository.
2. Installs Deno with the pinned version from `.tool-versions`.
3. Builds the site with `deno task build` into `_site`.
4. Runs the OSS/CDN sync action to upload, refresh, preload, and clean up.

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
      - name: Run build task
        run: deno task build
      - name: Deploy to Alibaba Cloud OSS
        uses: frenchvandal/aliyun-oss-cdn-sync-action@master
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          audience: ${{ github.repository_id }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh,preload
```

When CDN is enabled in this action, refresh always runs. Preload is optional, so
it can be disabled, but it only makes sense as an addition to refresh.

## Why OIDC instead of access keys

The action uses GitHub OIDC to assume an Alibaba Cloud RAM role at runtime. No
long-lived access key is stored in the repository. The workflow only needs
`id-token: write` plus the RAM role ARN and the OIDC provider ARN.

The current setup also passes `audience: ${{ github.repository_id }}`. GitHub
can mint an ID token for a custom audience, and Alibaba Cloud RAM can validate
that `aud` value against the Client IDs configured on the OIDC identity provider
and in the role trust policy. That gives me a tighter trust boundary than
relying on default audience handling alone.

## How the action runs internally

The action is split into three phases:

- **pre**: assumes the RAM role through OIDC and stores temporary credentials in
  action state.
- **main**: uploads local files to OSS, applies cache headers, and runs CDN
  refresh followed by optional preload.
- **post**: compares remote objects under the destination prefix with local
  files, deletes remote orphans, refreshes deleted URLs when needed, and looks
  up CDN task status for the requests submitted in `main`.

The cleanup phase runs with `post-if: always()`, so it still executes even when
earlier steps fail. Cleanup and CDN calls are intentionally non-fatal: warnings
are logged, but transient CDN API issues do not block the deployment.

## Upload, cache, quota, and drift control

A few implementation details matter for reliability:

- Uploads are parallelized with `max-concurrency`.
- A global API throttle is applied through `api-rps-limit`.
- Each file upload is retried up to three times before being marked as failed.
- The upload step now writes `Cache-Control` headers automatically: HTML and
  `sw.js` are revalidated aggressively, hashed assets are uploaded as immutable,
  and common static assets get shorter revalidation windows instead of a
  one-size-fits-all policy.
- The action checks remaining CDN quota before submitting refresh or preload
  batches.
- Refresh runs before preload, and preload can be disabled while keeping CDN
  refresh enabled.
- Deleted OSS objects can trigger CDN refresh for removed URLs, which reduces
  stale-cache windows and limits object drift over time.

That last point is easy to miss: upload alone is not enough for a static site
that changes over time. You also need deletion and cache invalidation for
objects that should no longer exist.

## Minimum RAM permissions

At the policy level, the role needs OSS permissions on the target bucket scope
for listing, uploading, and deleting objects. On the CDN side, it needs
permissions for refresh/preload plus the read APIs used for quota checks and
task lookups. The trust policy must allow the GitHub OIDC provider to assume the
deploy role.

I keep this as a dedicated deploy role rather than mixing it with broader
operational permissions.

## Reusing the action in other repositories

The action is published and reusable:
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

This repository currently tracks `@master` because I maintain the site and the
action together. In a separate repository, I would usually pin `@v1` or, better
yet, a full commit SHA.

For me, the key result is that deploys stay boring: build, sync, refresh,
preload, cleanup, done.
