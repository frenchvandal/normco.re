/** Explains how this blog deploys to Alibaba Cloud OSS and CDN. */

export const title = "How This Blog Deploys to Alibaba Cloud OSS and CDN";
/** Publication date. */
export const date = new Date("2026-03-10");
/** Post meta description. */
export const description =
  "A practical walkthrough of my GitHub Actions pipeline: Lume build, OIDC role assumption, OSS sync, CDN refresh/preload, and automatic cleanup.";
/** Post tags. */
export const tags = ["devops", "github-actions", "alibaba-cloud"];

/** Renders the post body. */
export default (_data: Lume.Data, _helpers: Lume.Helpers): string =>
  `<p>
  This site is built with Lume and deployed to Alibaba Cloud OSS, fronted by
  Alibaba Cloud CDN. The deployment pipeline is intentionally small:
  one GitHub workflow, one build step, and one custom action:
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action"><code>frenchvandal/aliyun-oss-cdn-sync-action</code></a>.
</p>

<p>
  I wanted three properties at the same time: short-lived credentials,
  predictable uploads, and automatic cache coherence. This setup gives me all
  three without adding scripts to maintain in every repository.
</p>

<h2>Pipeline at a glance</h2>

<p>
  The GitHub workflow in this repository does four things:
</p>

<ol>
  <li>Checks out the repository.</li>
  <li>Installs Deno with the pinned version from <code>.tool-versions</code>.</li>
  <li>Builds the site with <code>deno task build</code> into <code>_site</code>.</li>
  <li>Runs the OSS/CDN sync action to upload and refresh.</li>
</ol>

<pre><code class="language-yaml">name: Deploy static content to OSS

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
          role-oidc-arn: \${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: \${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: \${{ github.run_id }}
          role-session-expiration: 3600
          input-dir: _site
          bucket: \${{ secrets.OSS_BUCKET }}
          region: \${{ secrets.OSS_REGION }}
          cdn-enabled: true
          cdn-base-url: \${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh,preload
</code></pre>

<h2>Why OIDC instead of access keys</h2>

<p>
  The action uses GitHub OIDC to assume an Alibaba Cloud RAM role at runtime.
  No long-lived access key is stored in the repository. The workflow only needs
  <code>id-token: write</code> plus the role and provider ARNs.
</p>

<p>
  In practice, this means credentials are minted just-in-time, scoped by RAM
  policy, and naturally expire. Operationally, that is less risky than keeping
  static keys in secrets forever.
</p>

<h2>How the action runs internally</h2>

<p>
  The action is split into three phases:
</p>

<ul>
  <li><strong>pre</strong>: assumes the RAM role through OIDC and stores temporary credentials in action state.</li>
  <li><strong>main</strong>: uploads local files to OSS, with optional CDN refresh/preload for uploaded paths.</li>
  <li><strong>post</strong>: compares remote objects under the destination prefix with local files and deletes remote orphans.</li>
</ul>

<p>
  The cleanup phase runs with <code>post-if: always()</code>, so it still executes
  even when earlier steps fail. Cleanup and CDN calls are intentionally
  non-fatal: warnings are logged, but deployments are not blocked by transient
  CDN API issues.
</p>

<h2>Upload, cache, and drift control</h2>

<p>
  A few implementation details matter for reliability:
</p>

<ul>
  <li>Uploads are parallelized with <code>max-concurrency</code>.</li>
  <li>A global API throttle is applied through <code>api-rps-limit</code>.</li>
  <li>Each file upload is retried up to three times before being marked as failed.</li>
  <li>When CDN is enabled, refresh can run before preload for the same deployment batch.</li>
  <li>Deleted OSS objects can trigger CDN refresh for removed URLs, reducing stale cache windows.</li>
</ul>

<p>
  That last point is easy to miss: upload alone is not enough for static sites
  over time. You also need deletion to avoid object drift and stale assets that
  should no longer exist.
</p>

<h2>Minimum RAM permissions</h2>

<p>
  At the policy level, the action needs OSS permissions on the target bucket
  scope (list, put, delete) and CDN permissions for refresh/preload APIs.
  The trust policy must allow the GitHub OIDC provider to assume the deploy role.
</p>

<p>
  I keep this as a dedicated deploy role rather than mixing it with broader
  operational permissions.
</p>

<h2>Reusing the action in other repositories</h2>

<p>
  The action is published and reusable:
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action">github.com/frenchvandal/aliyun-oss-cdn-sync-action</a>.
  If your output directory is static (for example <code>dist</code> or
  <code>_site</code>), integration is mostly configuration.
</p>

<p>
  For me, the key result is that deploys stay boring: build, sync, refresh,
  cleanup, done.
</p>`;
