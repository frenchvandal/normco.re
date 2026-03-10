/** Explains how this blog deploys to Alibaba Cloud OSS and CDN. */

export const id = "alibaba-cloud-oss-cdn-deployment";
/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;

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
