---
title: Guide de syntaxe Markdown
description: Un guide complet du formatage Markdown pris en charge sur ce site.
date: 2026-01-24
author: phiphi
tags:
  - Markdown
  - Guide
  - Documentation
id: markdown-syntax
lang: fr
---

Cet article propose un exemple de syntaxe Markdown de base utilisable dans les
fichiers de contenu, ainsi que des fonctionnalités personnalisées prises en
charge par ce site.

<!--more-->

## Titres

Les éléments HTML `<h1>` à `<h6>` représentent six niveaux de titres de section.
`<h1>` est le niveau le plus élevé tandis que `<h6>` est le plus bas.

# H1

## H2

### H3

#### H4

##### H5

###### H6

## Paragraphe

Xerum, currentibus sunt sunt est conculta officiis ipsam faccus. Ratibusda
molupta dolupta exernat inctasit laborum, voluptas quibus, corem paribus
officiis.

Nam fuga. Non nimus mollit magnis exerci dolupta inctum fugitam facia cum id
offictotam, tet as a nectiis maxim am.

## Citations

L'élément blockquote représente un contenu cité d'une autre source,
éventuellement avec une citation qui doit être dans un élément `footer` ou
`cite`.

### Citation sans attribution

> Tiam, ad mint andae modi consequi laborum, odis ipsam veliam, qui fuga. Minima
> consequatur non verum officiis doloria tempora. Sit autetur labore officia
> rectem qui numquam dolor.

### Citation avec attribution

> Ne communiquez pas en partageant la mémoire, partagez la mémoire en
> communiquant.
>
> — <cite>Rob Pike[^1]</cite>

[^1]: La citation ci-dessus est extraite de la
    [conférence](https://www.youtube.com/watch?v=PAAkCSZUG1c) de Rob Pike lors
    du Gopherfest, le 18 novembre 2015.

## Tableaux

Les tableaux ne font pas partie de la spécification Markdown de base, mais ils
sont pris en charge.

| Nom    | Âge | Ville   |
| ------ | --- | ------- |
| Alice  | 28  | Paris   |
| Bob    | 34  | Londres |
| Carole | 25  | Chengdu |

### Colonnes alignées

| Gauche  | Centre  | Droite |
| :------ | :-----: | -----: |
| Cellule | Cellule |  100 € |
| Cellule | Cellule |  200 € |
| Cellule | Cellule |  300 € |

## Blocs de code

### Code en ligne

Utilisez des accents graves pour le `code en ligne`.

### Bloc de code avec coloration syntaxique

```javascript
const salutation = "Bonjour, le monde !";
console.log(salutation);
```

Consultez l'article [Coloration syntaxique](/posts/code-syntax/) pour plus
d'exemples.

## Listes

### Liste ordonnée

1. Premier élément
2. Deuxième élément
3. Troisième élément

### Liste non ordonnée

- Élément de liste
- Un autre élément
- Et encore un autre

### Liste imbriquée

- Fruits
  - Pomme
  - Orange
  - Banane
- Produits laitiers
  - Lait
  - Fromage

### Liste de tâches

- [x] Rédiger le communiqué de presse
- [ ] Mettre à jour le site web
- [ ] Contacter les médias

## Ligne horizontale

Utilisez trois tirets, astérisques ou traits de soulignement ou plus :

---

## Liens

[Un exemple de lien](https://example.com)

[Lien avec titre](https://example.com "Site exemple")

<https://normco.re>

## Images

![Espace réservé](https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Image+Exemple)

## Emphase

_Ce texte est en italique_

**Ce texte est en gras**

_**Ce texte est en gras et en italique**_

~~Ce texte est barré~~

## Abréviations

La spécification HTML est maintenue par le W3C.

*[HTML]: Langage de balisage hypertexte *[W3C]: World Wide Web Consortium

## Alertes / Avertissements

> [!NOTE]
> Informations utiles que les utilisateurs devraient connaître.

> [!TIP]
> Conseils utiles pour faire les choses mieux ou plus facilement.

> [!IMPORTANT]
> Informations clés dont les utilisateurs ont besoin pour atteindre leur
> objectif.

> [!WARNING]
> Informations urgentes nécessitant une attention immédiate.

> [!CAUTION]
> Avertissement sur les risques ou les conséquences négatives de certaines
> actions.

## Résumé

Ce guide couvre la plupart des fonctionnalités Markdown dont vous aurez besoin
pour rédiger du contenu. Pour des exemples spécifiques au code, consultez
l'article [Coloration syntaxique](/posts/code-syntax/).
