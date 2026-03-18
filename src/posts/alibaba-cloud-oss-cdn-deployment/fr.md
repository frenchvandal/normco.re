---
slug: alibaba-cloud-oss-cdn-deployment
lang: fr
title: "Comment ce blog est déployé sur Alibaba Cloud OSS et CDN"
description: "Présentation pratique de ma pipeline GitHub Actions : build Lume, prise de rôle OIDC, synchronisation OSS, refresh/preload CDN et nettoyage automatique."
---

Ce site est construit avec Lume puis déployé sur Alibaba Cloud OSS, avec Alibaba
Cloud CDN en frontal. La chaîne de déploiement reste volontairement compacte :
un workflow GitHub, une étape de build et une action personnalisée :
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

Je voulais quatre propriétés en même temps : des identifiants à durée de vie
courte, des uploads prévisibles, des en-têtes de cache cohérents avec les
fichiers livrés, et une cohérence de cache automatique. Cette configuration me
donne les quatre sans ajouter de scripts de déploiement propres à chaque dépôt.

## Pipeline en un coup d’œil

En régime de production nominal, le workflow de ce dépôt fait quatre choses :

1. Récupère le dépôt.
2. Installe Deno avec la version verrouillée dans `.tool-versions`.
3. Construit le site avec `deno task build` dans `_site`.
4. Exécute l’action de synchronisation OSS/CDN pour uploader, rafraîchir,
   précharger et nettoyer.

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

Quand le CDN est activé dans cette action, le refresh s’exécute toujours. Le
preload reste optionnel : on peut donc le désactiver, mais il n’a de sens qu’en
complément du refresh.

## Pourquoi OIDC plutôt que des clés d’accès

L’action utilise GitHub OIDC pour endosser un rôle RAM Alibaba Cloud à
l’exécution. Aucune clé d’accès longue durée n’est stockée dans le dépôt. Le
workflow n’a besoin que de `id-token: write`, de l’ARN du rôle RAM et de l’ARN
du fournisseur OIDC.

La configuration actuelle transmet aussi
`audience: ${{ github.repository_id }}`. GitHub peut émettre un ID token avec
une audience personnalisée, et Alibaba Cloud RAM peut valider cette valeur `aud`
par rapport aux Client ID configurés sur le fournisseur d’identité OIDC et dans
la trust policy du rôle. La frontière de confiance est donc plus resserrée
qu’avec l’audience par défaut seule.

## Fonctionnement interne de l’action

L’action est découpée en trois phases :

- **pre** : endosse le rôle RAM via OIDC et stocke des identifiants temporaires
  dans l’état de l’action.
- **main** : upload les fichiers locaux sur OSS, applique les en-têtes de cache
  et exécute un refresh CDN, suivi éventuellement d’un preload.
- **post** : compare les objets distants sous le préfixe cible avec les fichiers
  locaux, supprime les orphelins côté distant, rafraîchit au besoin les URL
  supprimées et récupère l’état des tâches CDN soumises pendant `main`.

La phase de nettoyage s’exécute avec `post-if: always()`, donc elle se lance
même si des étapes précédentes échouent. Le nettoyage et les appels CDN sont
volontairement non bloquants : les avertissements sont journalisés, mais des
incidents API CDN transitoires n’interrompent pas le déploiement.

## Upload, cache, quota et contrôle de dérive

Quelques détails d’implémentation comptent pour la fiabilité :

- Les uploads sont parallélisés via `max-concurrency`.
- Un throttling global d’API est appliqué avec `api-rps-limit`.
- Chaque upload de fichier est retenté jusqu’à trois fois avant d’être marqué en
  échec.
- L’étape d’upload écrit désormais automatiquement des en-têtes
  `Cache-Control` : les fichiers HTML et `sw.js` sont revalidés de manière
  agressive, les assets hashés sont envoyés comme immuables, et les ressources
  statiques courantes reçoivent des fenêtres de revalidation plus courtes au
  lieu d’une politique unique pour tout.
- L’action vérifie le quota CDN restant avant de soumettre des lots de refresh
  ou de preload.
- Le refresh s’exécute avant le preload, et le preload peut être désactivé tout
  en conservant le refresh CDN.
- La suppression d’objets OSS peut déclencher un refresh CDN des URL supprimées,
  ce qui réduit les fenêtres de cache obsolète et limite la dérive des objets
  dans le temps.

Ce dernier point est facile à sous-estimer : l’upload seul ne suffit pas pour un
site statique qui évolue. Il faut aussi gérer la suppression et l’invalidation
de cache des objets qui ne devraient plus exister.

## Permissions RAM minimales

Au niveau des politiques, le rôle a besoin de permissions OSS sur le scope du
bucket cible pour lister, uploader et supprimer les objets. Côté CDN, il lui
faut les permissions de refresh/preload ainsi que les API de lecture utilisées
pour les contrôles de quota et le suivi des tâches. La trust policy doit
autoriser le fournisseur OIDC GitHub à endosser le rôle de déploiement.

Je conserve ce rôle comme rôle de déploiement dédié, sans le mélanger à des
permissions opérationnelles plus larges.

## Réutiliser l’action dans d’autres dépôts

L’action est publiée et réutilisable :
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action).

Ce dépôt suit actuellement `@master` parce que je fais évoluer le site et
l’action ensemble. Dans un autre dépôt, j’épinglerais plutôt `@v1`, voire un SHA
de commit complet.

Pour moi, le résultat clé reste le même : des déploiements prévisibles. Build,
sync, refresh, preload, cleanup, terminé.
