---
slug: alibaba-cloud-oss-cdn-deployment
lang: fr
title: "Comment ce blog est déployé sur Alibaba Cloud OSS et CDN"
description: "Présentation pratique de ma pipeline GitHub Actions : build Lume, assume de rôle OIDC, synchronisation OSS, refresh/preload CDN et nettoyage automatique."
---

Ce site est construit avec Lume puis déployé sur Alibaba Cloud OSS, derrière
Alibaba Cloud CDN. La pipeline de déploiement reste volontairement compacte : un
workflow GitHub, une étape de build et une action personnalisée :
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

Je voulais trois propriétés en même temps : des identifiants courte durée, des
uploads prévisibles et une cohérence de cache automatique. Cette configuration
me donne les trois sans ajouter de scripts à maintenir dans chaque dépôt.

## Pipeline en un coup d’œil

Le workflow GitHub de ce dépôt fait quatre choses :

1. Récupère le dépôt.
2. Installe Deno avec la version verrouillée dans `.tool-versions`.
3. Construit le site avec `deno task build` dans `_site`.
4. Exécute l’action de synchronisation OSS/CDN pour uploader et rafraîchir.

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

## Pourquoi OIDC plutôt que des clés d’accès

L’action utilise GitHub OIDC pour assumer un rôle RAM Alibaba Cloud à
l’exécution. Aucune clé d’accès longue durée n’est stockée dans le dépôt. Le
workflow n’a besoin que de `id-token: write` et des ARN du rôle et du provider.

En pratique, cela signifie que les identifiants sont émis juste à temps, limités
par la politique RAM et naturellement expirables. D’un point de vue
opérationnel, c’est moins risqué que de conserver des clés statiques dans les
secrets indéfiniment.

## Fonctionnement interne de l’action

L’action est découpée en trois phases :

- **pre** : assume le rôle RAM via OIDC et stocke des identifiants temporaires
  dans l’état de l’action.
- **main** : upload les fichiers locaux sur OSS, avec refresh/preload CDN
  optionnels pour les chemins uploadés.
- **post** : compare les objets distants sous le préfixe cible avec les fichiers
  locaux et supprime les orphelins côté distant.

La phase de nettoyage s’exécute avec `post-if: always()`, donc elle se lance
même si des étapes précédentes échouent. Le nettoyage et les appels CDN sont
volontairement non bloquants : les avertissements sont journalisés, mais les
déploiements ne sont pas interrompus par des incidents API CDN transitoires.

## Upload, cache et contrôle de dérive

Quelques détails d’implémentation comptent pour la fiabilité :

- Les uploads sont parallélisés via `max-concurrency`.
- Un throttling global d’API est appliqué avec `api-rps-limit`.
- Chaque upload de fichier est retenté jusqu’à trois fois avant d’être marqué en
  échec.
- Quand le CDN est activé, le refresh peut s’exécuter avant le preload dans le
  même lot de déploiement.
- La suppression d’objets OSS peut déclencher un refresh CDN des URL supprimées,
  ce qui réduit les fenêtres de cache obsolète.

Ce dernier point est facile à sous-estimer : l’upload seul ne suffit pas pour un
site statique dans la durée. Il faut aussi gérer la suppression pour éviter la
dérive des objets et les assets périmés qui ne devraient plus exister.

## Permissions RAM minimales

Au niveau des politiques, l’action a besoin de permissions OSS sur le scope du
bucket cible (list, put, delete) ainsi que de permissions CDN sur les API de
refresh/preload. La trust policy doit autoriser le provider OIDC GitHub à
assumer le rôle de déploiement.

Je conserve ce rôle comme rôle de déploiement dédié, sans le mélanger à des
permissions opérationnelles plus larges.

## Réutiliser l’action dans d’autres dépôts

L’action est publiée et réutilisable :
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).
Si votre répertoire de sortie est statique (par exemple `dist` ou `_site`),
l’intégration est essentiellement une question de configuration.

Pour moi, le résultat clé est simple : les déploiements restent sans surprise.
Build, sync, refresh, cleanup, terminé.
