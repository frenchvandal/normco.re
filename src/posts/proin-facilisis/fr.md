---
slug: proin-facilisis
lang: fr
title: "Proin Facilisis : rendre les choses plus simples"
description: "Sur la philosophie de la réduction des frictions, dans le code, le design et la vie quotidienne."
---

_Proin facilisis_ — en latin, « favoriser l’aisance ». L’expression apparaît
dans d’anciens textes botaniques pour décrire une plante qui facilite la
digestion, adoucit un passage, lève une obstruction. Comme philosophie de
conception logicielle, la formule se transpose étonnamment bien.

Un bon logiciel réduit les frictions. Il anticipe l’étape suivante de
l’utilisateur. Il propose la bonne affordance au bon moment. Il s’efface.

## L’inventaire des frictions

Proin in tellus sit amet nibh dignissim sagittis. La première étape pour réduire
les frictions est de les cartographier. Où l’utilisateur ralentit-il ? Où
l’attention monte-t-elle ? Où les erreurs se concentrent-elles ?

Dans une application web classique, les moments de forte friction sont
prévisibles : onboarding, envoi de formulaire, récupération après erreur et
états de chargement. Ce sont les vestibules du produit, les seuils que
l’utilisateur doit franchir pour atteindre la valeur.

```ts
// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined {/* … */}

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(`User not found: ${id}`);
  }
  return user;
}
```

## Le paradoxe de la simplicité

Vivamus pretium aliquet erat. Il y a un paradoxe au cœur du « rendre simple » :
c’est difficile. Éliminer les frictions demande une compréhension fine de
l’utilisateur, du contexte et des modes d’échec. Cela exige plus de travail côté
concepteur pour en demander moins côté utilisateur.

C’est pour cela que la simplicité est une forme de générosité. Chaque étape
inutile retirée du parcours rend du temps à l’utilisateur, du temps qu’il peut
consacrer à ce qui compte vraiment.

## Facilisis en pratique

Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Quelques
principes vers lesquels je reviens régulièrement :

- Les valeurs par défaut doivent convenir à la majorité des usages.
- Les messages d’erreur doivent expliquer le problème et la correction.
- Le chemin nominal ne devrait demander aucun effort mental.
- La configuration doit être possible, jamais obligatoire.
- La documentation fait partie intégrante du produit.

Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam tincidunt
tempus. Le nom même de ce principe — _nulla facilisi_, « rien de facile » —
rappelle que la simplicité, bien comprise, n’est jamais accidentelle.
