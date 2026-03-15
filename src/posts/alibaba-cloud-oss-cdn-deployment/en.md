---
slug: alibaba-cloud-oss-cdn-deployment
lang: en
title: "How This Blog Deploys to Alibaba Cloud OSS and CDN"
description: "A practical walkthrough of my GitHub Actions pipeline: Lume build, OIDC role assumption, OSS sync, CDN refresh/preload, and automatic cleanup."
---

This site is built with Lume and deployed to Alibaba Cloud OSS, fronted by
Alibaba Cloud CDN. The deployment pipeline is intentionally small: one GitHub
workflow, one build step, and one custom action:
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

I wanted three properties at the same time: short-lived credentials, predictable
uploads, and automatic cache coherence. This setup gives me all three without
adding scripts to maintain in every repository.

## Pipeline at a glance

The GitHub workflow in this repository does four things:

1. Checks out the repository.
2. Installs Deno with the pinned version from `.tool-versions`.
3. Builds the site with `deno task build` into `_site`.
4. Runs the OSS/CDN sync action to upload and refresh.

```yaml
name: Deploy static content to OSS

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    runs-on: macos-26
    steps:
      - uses: actions/checkout@v6
      - uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
      - run: deno task build
      - uses: frenchvandal/aliyun-oss-cdn-sync-action@v1
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh,preload
```

## Why OIDC instead of access keys

The action uses GitHub OIDC to assume an Alibaba Cloud RAM role at runtime. No
long-lived access key is stored in the repository. The workflow only needs
`id-token: write` plus the role and provider ARNs.

In practice, this means credentials are minted just-in-time, scoped by RAM
policy, and naturally expire. Operationally, that is less risky than keeping
static keys in secrets forever.

## How the action runs internally

The action is split into three phases:

- **pre**: assumes the RAM role through OIDC and stores temporary credentials in
  action state.
- **main**: uploads local files to OSS, with optional CDN refresh/preload for
  uploaded paths.
- **post**: compares remote objects under the destination prefix with local
  files and deletes remote orphans.

The cleanup phase runs with `post-if: always()`, so it still executes even when
earlier steps fail. Cleanup and CDN calls are intentionally non-fatal: warnings
are logged, but deployments are not blocked by transient CDN API issues.

## Upload, cache, and drift control

A few implementation details matter for reliability:

- Uploads are parallelized with `max-concurrency`.
- A global API throttle is applied through `api-rps-limit`.
- Each file upload is retried up to three times before being marked as failed.
- When CDN is enabled, refresh can run before preload for the same deployment
  batch.
- Deleted OSS objects can trigger CDN refresh for removed URLs, reducing stale
  cache windows.

That last point is easy to miss: upload alone is not enough for static sites
over time. You also need deletion to avoid object drift and stale assets that
should no longer exist.

## Minimum RAM permissions

At the policy level, the action needs OSS permissions on the target bucket scope
(list, put, delete) and CDN permissions for refresh/preload APIs. The trust
policy must allow the GitHub OIDC provider to assume the deploy role.

I keep this as a dedicated deploy role rather than mixing it with broader
operational permissions.

## Reusing the action in other repositories

The action is published and reusable:
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).
If your output directory is static (for example `dist` or `_site`), integration
is mostly configuration.

For me, the key result is that deploys stay boring: build, sync, refresh,
cleanup, done.
