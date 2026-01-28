---
title: Contenu enrichi
description: Exemples de contenu multimedia embarque dans les articles Markdown.
date: 2026-01-27
author: phiphi
tags:
  - Markdown
  - Media
  - Demo
id: rich-content
lang: fr
---

Cet article demontre les differents types de contenu enrichi pouvant etre
integres dans les articles Markdown de ce site.

<!--more-->

## Images

### Image simple

Syntaxe Markdown standard pour les images :

![Image de substitution](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Image+Exemple)

### Image avec legende

Utilisation de l'element HTML figure pour les images legendees :

<figure>
  <img src="https://via.placeholder.com/800x400/2d3748/ffffff?text=Image+Legendee" alt="Un exemple d'image avec legende">
  <figcaption>Ceci est une legende decrivant l'image ci-dessus.</figcaption>
</figure>

### Images responsives

Les images s'adaptent automatiquement a la largeur du conteneur tout en
conservant leur ratio d'aspect.

## Videos integrees

### YouTube

Integrez des videos YouTube avec une iframe :

<div class="video-container">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    title="Lecteur video YouTube"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

> [!NOTE]
> Nous utilisons `youtube-nocookie.com` pour le mode de confidentialite
> ameliore, qui ne stocke pas d'informations sur les visiteurs sauf s'ils lisent
> la video.

### Vimeo

Les videos Vimeo peuvent etre integrees de maniere similaire :

<div class="video-container">
  <iframe
    src="https://player.vimeo.com/video/32001208"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Audio

Lecteur audio HTML5 pour le contenu audio :

<audio controls>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  Votre navigateur ne prend pas en charge l'element audio.
</audio>

## Elements interactifs

### Details/Resume (Sections repliables)

<details>
  <summary>Cliquez pour developper</summary>

Ce contenu est masque par defaut et revele en cliquant sur le resume.

Vous pouvez inclure n'importe quel contenu Markdown ici :

- Listes
- **Texte en gras**
- `Extraits de code`
- Meme des blocs de code :

```javascript
console.log("Bonjour depuis une section repliable !");
```

</details>

### Plusieurs sections repliables

<details>
  <summary>Section 1 : Pour commencer</summary>

Pour commencer, installez les dependances :

```bash
npm install
```

Puis lancez le serveur de developpement :

```bash
npm run dev
```

</details>

<details>
  <summary>Section 2 : Configuration</summary>

Editez le fichier `config.json` pour personnaliser les parametres :

```json
{
  "theme": "dark",
  "language": "fr"
}
```

</details>

<details>
  <summary>Section 3 : Deploiement</summary>

Construisez et deployez avec :

```bash
npm run build
npm run deploy
```

</details>

## Diagrammes en art ASCII

Pour les diagrammes simples, l'art ASCII fonctionne bien dans les blocs de code
:

```text
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|      Client      +---->+     Serveur      +---->+  Base de donnees |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+

        Requete              Traitement              Stockage
```

```text
+-----------+
|   Debut   |
+-----+-----+
      |
      v
+-----+-----+
|   Entree  |
+-----+-----+
      |
      v
+-----+-----+
| Traitement|
+-----+-----+
      |
      v
+-----+-----+
|   Sortie  |
+-----+-----+
      |
      v
+-----+-----+
|    Fin    |
+-----------+
```

## Citations

### Citation mise en avant

<blockquote class="pull-quote">
  <p>La meilleure facon de predire l'avenir est de l'inventer.</p>
  <cite>— Alan Kay</cite>
</blockquote>

### Citation etendue

> La simplicite est la sophistication supreme. Quand vous commencez a resoudre
> un probleme, les premieres solutions sont tres complexes, et la plupart des
> gens s'arretent la. Mais si vous continuez, vivez avec le probleme et pelez
> plus de couches de l'oignon, vous pouvez souvent arriver a des solutions tres
> elegantes et simples.
>
> — Steve Jobs

## Tableaux avec contenu complexe

| Fonctionnalite | Statut                        | Notes                            |
| -------------- | ----------------------------- | -------------------------------- |
| Mode sombre    | :white_check_mark: Implemente | Bouton dans l'en-tete            |
| Recherche      | :white_check_mark: Implemente | Appuyez sur `Ctrl+K` pour ouvrir |
| i18n           | :white_check_mark: Implemente | Anglais, Francais, Chinois       |
| Commentaires   | :construction: Prevu          | Utilisant Giscus                 |
| Analytique     | :x: Non prevu                 | Approche axee confidentialite    |

## Integrations externes

### GitHub Gist

Vous pouvez integrer des Gists GitHub pour partager des extraits de code :

<script src="https://gist.github.com/octocat/6cad326836d38bd3a7ae.js"></script>

> [!TIP]
> Les Gists GitHub sont parfaits pour partager des exemples de code plus longs
> que vous souhaitez maintenir separement de votre article de blog.

### CodePen

Pour les demos front-end, les integrations CodePen fonctionnent bien :

<p class="codepen" data-height="300" data-default-tab="css,result" data-slug-hash="BamYvYp" data-user="chriscoyier" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>Voir l'<a href="https://codepen.io/chriscoyier/pen/BamYvYp">exemple CSS Grid</a> par Chris Coyier sur CodePen.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## Raccourcis clavier

Documentez les raccourcis clavier avec l'element `<kbd>` :

| Action        | Windows/Linux                | macOS                       |
| ------------- | ---------------------------- | --------------------------- |
| Enregistrer   | <kbd>Ctrl</kbd>+<kbd>S</kbd> | <kbd>Cmd</kbd>+<kbd>S</kbd> |
| Rechercher    | <kbd>Ctrl</kbd>+<kbd>F</kbd> | <kbd>Cmd</kbd>+<kbd>F</kbd> |
| Recherche     | <kbd>Ctrl</kbd>+<kbd>K</kbd> | <kbd>Cmd</kbd>+<kbd>K</kbd> |
| Nouvel onglet | <kbd>Ctrl</kbd>+<kbd>T</kbd> | <kbd>Cmd</kbd>+<kbd>T</kbd> |

## Resume

Le contenu enrichi ameliore l'experience de lecture et aide a expliquer des
concepts complexes. Utilisez ces elements judicieusement pour ajouter de la
valeur sans submerger les lecteurs.

Pour le contenu specifique au code, consultez l'article
[Coloration syntaxique](/posts/code-syntax/). Pour le Markdown de base,
consultez le [Guide de syntaxe Markdown](/fr/posts/markdown-syntax-fr/).
