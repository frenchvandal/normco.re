---
lang: fr
title: "Comment installer ce thème ?"
description: "Un guide rapide pour configurer le thème Simple Blog avec Lume."
---

**Simple blog** est un thème de blog épuré et minimal pour Lume, avec prise en
charge des tags et des auteurs. Il permet de créer votre blog **en quelques
secondes**, et fournit des flux Atom et JSON pour vos abonnés.

La manière **la plus simple et la plus rapide** de configurer ce thème est
d'utiliser la [commande Lume init](https://deno.land/x/lume_init), que vous
pouvez aussi copier facilement depuis la
[page du thème Simple Blog](https://lume.land/theme/simple-blog/). En lançant :

```bash
deno run -A https://lume.land/init.ts --theme=simple-blog
```

vous créez un nouveau projet avec Simple Blog déjà configuré. Modifiez ensuite
le fichier `_data.yml` à la racine du blog pour personnaliser le titre, la
description et les métadonnées du site.

Les articles doivent être enregistrés dans le dossier `posts`. Par exemple :
`posts/my-first-post.md`.

## Installer en tant que thème distant

Pour ajouter ce thème à un projet Lume existant, importez-le dans votre fichier
`_config.ts` comme module distant. Pour le mettre à jour, changez le numéro de
version dans l'URL d'import :

```ts
import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;
```

Copiez ensuite le fichier
[`_data.yml`](https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml)
à la racine de votre blog et adaptez-le avec vos informations.

## Personnalisation

Vous pouvez utiliser [lumeCMS](https://lume.land/cms) pour personnaliser le blog
et ajouter du contenu facilement.
