/** Explains how this blog deploys to Alibaba Cloud OSS and CDN. */

export const id = "alibaba-cloud-oss-cdn-deployment";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;

/** English post title. */
export const title = "How This Blog Deploys to Alibaba Cloud OSS and CDN";
/** Publication date. */
export const date = new Date("2026-03-10");
/** Post meta description. */
export const description =
  "A practical walkthrough of my GitHub Actions pipeline: Lume build, OIDC role assumption, OSS sync, CDN refresh/preload, and automatic cleanup.";
/** Post tags. */
export const tags = ["devops", "github-actions", "alibaba-cloud"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Comment ce blog est déployé sur Alibaba Cloud OSS et CDN",
  description:
    "Présentation pratique de ma pipeline GitHub Actions : build Lume, assume de rôle OIDC, synchronisation OSS, refresh/preload CDN et nettoyage automatique.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "这个博客如何部署到阿里云 OSS 与 CDN",
  description:
    "一份实践向说明：我的 GitHub Actions 流水线如何完成 Lume 构建、OIDC 角色临时授权、OSS 同步、CDN 刷新与预热，以及自动清理。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "這個部落格如何部署到阿里雲 OSS 與 CDN",
  description:
    "一份實作導向說明：我的 GitHub Actions 流水線如何完成 Lume 建置、OIDC 角色臨時授權、OSS 同步、CDN 刷新與預熱，以及自動清理。",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  Ce site est construit avec Lume puis déployé sur Alibaba Cloud OSS,
  derrière Alibaba Cloud CDN. La pipeline de déploiement reste volontairement
  compacte&nbsp;: un workflow GitHub, une étape de build et une action personnalisée&nbsp;:
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action"><code>frenchvandal/aliyun-oss-cdn-sync-action</code></a>.
</p>

<p>
  Je voulais trois propriétés en même temps&nbsp;: des identifiants courte durée,
  des uploads prévisibles et une cohérence de cache automatique. Cette
  configuration me donne les trois sans ajouter de scripts à maintenir dans
  chaque dépôt.
</p>

<h2>Pipeline en un coup d’œil</h2>

<p>
  Le workflow GitHub de ce dépôt fait quatre choses&nbsp;:
</p>

<ol>
  <li>Récupère le dépôt.</li>
  <li>Installe Deno avec la version verrouillée dans <code>.tool-versions</code>.</li>
  <li>Construit le site avec <code>deno task build</code> dans <code>_site</code>.</li>
  <li>Exécute l’action de synchronisation OSS/CDN pour uploader et rafraîchir.</li>
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

<h2>Pourquoi OIDC plutôt que des clés d’accès</h2>

<p>
  L’action utilise GitHub OIDC pour assumer un rôle RAM Alibaba Cloud à
  l’exécution. Aucune clé d’accès longue durée n’est stockée dans le dépôt.
  Le workflow n’a besoin que de <code>id-token: write</code> et des ARN du rôle et du
  provider.
</p>

<p>
  En pratique, cela signifie que les identifiants sont émis juste à temps,
  limités par la politique RAM et naturellement expirables. D’un point de vue
  opérationnel, c’est moins risqué que de conserver des clés statiques dans les
  secrets indéfiniment.
</p>

<h2>Fonctionnement interne de l’action</h2>

<p>
  L’action est découpée en trois phases&nbsp;:
</p>

<ul>
  <li><strong>pre</strong>&nbsp;: assume le rôle RAM via OIDC et stocke des identifiants temporaires dans l’état de l’action.</li>
  <li><strong>main</strong>&nbsp;: upload les fichiers locaux sur OSS, avec refresh/preload CDN optionnels pour les chemins uploadés.</li>
  <li><strong>post</strong>&nbsp;: compare les objets distants sous le préfixe cible avec les fichiers locaux et supprime les orphelins côté distant.</li>
</ul>

<p>
  La phase de nettoyage s’exécute avec <code>post-if: always()</code>, donc elle se lance
  même si des étapes précédentes échouent. Le nettoyage et les appels CDN sont
  volontairement non bloquants&nbsp;: les avertissements sont journalisés, mais les
  déploiements ne sont pas interrompus par des incidents API CDN transitoires.
</p>

<h2>Upload, cache et contrôle de dérive</h2>

<p>
  Quelques détails d’implémentation comptent pour la fiabilité&nbsp;:
</p>

<ul>
  <li>Les uploads sont parallélisés via <code>max-concurrency</code>.</li>
  <li>Un throttling global d’API est appliqué avec <code>api-rps-limit</code>.</li>
  <li>Chaque upload de fichier est retenté jusqu’à trois fois avant d’être marqué en échec.</li>
  <li>Quand le CDN est activé, le refresh peut s’exécuter avant le preload dans le même lot de déploiement.</li>
  <li>La suppression d’objets OSS peut déclencher un refresh CDN des URL supprimées, ce qui réduit les fenêtres de cache obsolète.</li>
</ul>

<p>
  Ce dernier point est facile à sous-estimer&nbsp;: l’upload seul ne suffit pas pour
  un site statique dans la durée. Il faut aussi gérer la suppression pour éviter
  la dérive des objets et les assets périmés qui ne devraient plus exister.
</p>

<h2>Permissions RAM minimales</h2>

<p>
  Au niveau des politiques, l’action a besoin de permissions OSS sur le scope du
  bucket cible (list, put, delete) ainsi que de permissions CDN sur les API de
  refresh/preload. La trust policy doit autoriser le provider OIDC GitHub à
  assumer le rôle de déploiement.
</p>

<p>
  Je conserve ce rôle comme rôle de déploiement dédié, sans le mélanger à des
  permissions opérationnelles plus larges.
</p>

<h2>Réutiliser l’action dans d’autres dépôts</h2>

<p>
  L’action est publiée et réutilisable&nbsp;:
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action">github.com/frenchvandal/aliyun-oss-cdn-sync-action</a>.
  Si votre répertoire de sortie est statique (par exemple <code>dist</code> ou
  <code>_site</code>), l’intégration est essentiellement une question de configuration.
</p>

<p>
  Pour moi, le résultat clé est simple&nbsp;: les déploiements restent sans surprise.
  Build, sync, refresh, cleanup, terminé.
</p>`;
  }

  if (data.lang === "zh-hans") {
    return `<p>
  这个站点使用 Lume 构建，并部署到阿里云 OSS，再由阿里云 CDN 对外分发。
  整条部署流水线刻意保持简洁：一个 GitHub Workflow、一个构建步骤、
  再加一个自定义 Action：
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action"><code>frenchvandal/aliyun-oss-cdn-sync-action</code></a>。
</p>

<p>
  我希望同时满足三件事：短时凭证、可预测上传、自动缓存一致性。
  这套配置同时做到三者，而且不需要在每个仓库里额外维护脚本。
</p>

<h2>流水线总览</h2>

<p>
  这个仓库里的 GitHub Workflow 做了四件事：
</p>

<ol>
  <li>检出仓库代码。</li>
  <li>按 <code>.tool-versions</code> 安装固定版本的 Deno。</li>
  <li>执行 <code>deno task build</code>，将站点构建到 <code>_site</code>。</li>
  <li>调用 OSS/CDN 同步 Action，完成上传与缓存刷新。</li>
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

<h2>为什么选 OIDC，而不是长期 Access Key</h2>

<p>
  这个 Action 在运行时通过 GitHub OIDC 去扮演阿里云 RAM 角色。
  仓库中不保存长期 Access Key。Workflow 只需要
  <code>id-token: write</code>，再加上角色和 OIDC Provider 的 ARN。
</p>

<p>
  这意味着凭证是按需签发、受 RAM 策略约束、并且自然过期。
  从运维风险角度看，这比长期把静态密钥放在 secrets 里要更稳健。
</p>

<h2>Action 内部是怎么执行的</h2>

<p>
  这个 Action 被拆成三个阶段：
</p>

<ul>
  <li><strong>pre</strong>：通过 OIDC 扮演 RAM 角色，并把临时凭证写入 action state。</li>
  <li><strong>main</strong>：上传本地文件到 OSS，并可选对上传路径执行 CDN 刷新/预热。</li>
  <li><strong>post</strong>：比较目标前缀下的远端对象与本地文件，删除远端孤儿对象。</li>
</ul>

<p>
  清理阶段通过 <code>post-if: always()</code> 执行，所以即使前面步骤失败也会运行。
  清理和 CDN 调用都被设计为“非致命”：会记录警告，但不会因为 CDN API 的短暂抖动而阻塞部署。
</p>

<h2>上传、缓存与漂移控制</h2>

<p>
  下面这些实现细节对可靠性非常关键：
</p>

<ul>
  <li>上传通过 <code>max-concurrency</code> 并行化。</li>
  <li>全局 API 限速通过 <code>api-rps-limit</code> 控制。</li>
  <li>每个文件上传失败后最多重试三次。</li>
  <li>开启 CDN 时，同一批部署里 refresh 可以先于 preload 执行。</li>
  <li>删除 OSS 对象时可触发对应 URL 的 CDN 刷新，减少旧缓存窗口。</li>
</ul>

<p>
  最后一条很容易被低估：长期运行的静态站点仅有上传远远不够。
  你还需要删除机制，避免对象漂移和不该再存在的过期资源。
</p>

<h2>最小化 RAM 权限</h2>

<p>
  权限上，这个 Action 需要目标 bucket 范围内的 OSS 权限（list、put、delete），
  以及 CDN refresh/preload API 的调用权限。
  此外，Trust Policy 必须允许 GitHub OIDC Provider 扮演部署角色。
</p>

<p>
  我把它单独作为“部署角色”维护，不与更宽泛的运营权限混用。
</p>

<h2>在其他仓库复用这个 Action</h2>

<p>
  这个 Action 已发布，可直接复用：
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action">github.com/frenchvandal/aliyun-oss-cdn-sync-action</a>。
  如果你的输出目录是静态的（例如 <code>dist</code> 或 <code>_site</code>），
  集成成本基本就是填配置。
</p>

<p>
  对我来说，最关键的结果是：部署可以保持“无聊”。
  build、sync、refresh、cleanup，结束。
</p>`;
  }

  if (data.lang === "zh-hant") {
    return `<p>
  這個站點使用 Lume 建置，並部署到阿里雲 OSS，再由阿里雲 CDN 對外分發。
  整條部署流水線刻意保持精簡：一個 GitHub Workflow、一個建置步驟，
  再加上一個自訂 Action：
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action"><code>frenchvandal/aliyun-oss-cdn-sync-action</code></a>。
</p>

<p>
  我希望同時滿足三件事：短時憑證、可預測上傳、自動快取一致性。
  這套配置同時做到三者，而且不需要在每個倉庫裡額外維護腳本。
</p>

<h2>流水線總覽</h2>

<p>
  這個倉庫中的 GitHub Workflow 做了四件事：
</p>

<ol>
  <li>檢出倉庫程式碼。</li>
  <li>依 <code>.tool-versions</code> 安裝固定版本的 Deno。</li>
  <li>執行 <code>deno task build</code>，將站點建置到 <code>_site</code>。</li>
  <li>呼叫 OSS/CDN 同步 Action，完成上傳與快取刷新。</li>
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

<h2>為什麼選 OIDC，而不是長期 Access Key</h2>

<p>
  這個 Action 在執行時透過 GitHub OIDC 去扮演阿里雲 RAM 角色。
  倉庫中不保存長期 Access Key。Workflow 只需要
  <code>id-token: write</code>，再加上角色與 OIDC Provider 的 ARN。
</p>

<p>
  這代表憑證是按需簽發、受 RAM 策略限制、並且自然過期。
  從維運風險角度來看，這比長期把靜態金鑰放在 secrets 裡更穩健。
</p>

<h2>Action 內部如何執行</h2>

<p>
  這個 Action 被拆成三個階段：
</p>

<ul>
  <li><strong>pre</strong>：透過 OIDC 扮演 RAM 角色，並把臨時憑證寫入 action state。</li>
  <li><strong>main</strong>：上傳本地檔案到 OSS，並可選對上傳路徑執行 CDN 刷新/預熱。</li>
  <li><strong>post</strong>：比較目標前綴下的遠端物件與本地檔案，刪除遠端孤兒物件。</li>
</ul>

<p>
  清理階段透過 <code>post-if: always()</code> 執行，所以即使前面步驟失敗也會執行。
  清理與 CDN 呼叫都被設計成「非致命」：會記錄警告，但不會因 CDN API 的短暫波動阻塞部署。
</p>

<h2>上傳、快取與漂移控制</h2>

<p>
  以下實作細節對可靠性非常關鍵：
</p>

<ul>
  <li>上傳透過 <code>max-concurrency</code> 平行化。</li>
  <li>全域 API 限速由 <code>api-rps-limit</code> 控制。</li>
  <li>每個檔案上傳失敗後最多重試三次。</li>
  <li>啟用 CDN 時，同一批部署裡 refresh 可以先於 preload 執行。</li>
  <li>刪除 OSS 物件時可觸發對應 URL 的 CDN 刷新，降低過期快取窗口。</li>
</ul>

<p>
  最後一點很容易被低估：長期運行的靜態站點僅靠上傳遠遠不夠。
  你還需要刪除機制，避免物件漂移與不應再存在的過期資源。
</p>

<h2>最小化 RAM 權限</h2>

<p>
  權限上，這個 Action 需要目標 bucket 範圍內的 OSS 權限（list、put、delete），
  以及 CDN refresh/preload API 的呼叫權限。
  此外，Trust Policy 必須允許 GitHub OIDC Provider 扮演部署角色。
</p>

<p>
  我把它獨立作為「部署角色」維護，不與更寬泛的營運權限混用。
</p>

<h2>在其他倉庫重用這個 Action</h2>

<p>
  這個 Action 已發布，可直接重用：
  <a href="https://github.com/frenchvandal/aliyun-oss-cdn-sync-action">github.com/frenchvandal/aliyun-oss-cdn-sync-action</a>。
  如果你的輸出目錄是靜態的（例如 <code>dist</code> 或 <code>_site</code>），
  整合成本基本就是填設定。
</p>

<p>
  對我來說，最關鍵的結果是：部署可以維持「無聊」。
  build、sync、refresh、cleanup，完成。
</p>`;
  }

  return `<p>
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
};
