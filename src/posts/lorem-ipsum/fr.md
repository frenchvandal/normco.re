---
lang: fr
title: "Lorem ipsum et l'art du texte de remplissage"
description: "Une réflexion sur le faux texte, son histoire et les raisons pour lesquelles il reste utile dans les workflows de design modernes."
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Tout le monde connaît la formule, mais peu de personnes en connaissent
l'origine. Il s'agit d'un extrait brouillé du _de Finibus Bonorum et Malorum_ de
Cicéron, un traité philosophique rédigé en 45 av. J.-C. Ce texte est utilisé
comme faux contenu depuis le XVIe siècle, lorsqu'un imprimeur inconnu a mélangé
une casse de caractères pour créer un spécimen typographique.

## Pourquoi le texte de remplissage compte

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

Quand vous concevez une mise en page avec de vrais mots, vous concevez pour ces
mots précis. Le faux texte vous oblige à concevoir pour la structure, pas pour
le sens. C'est une contrainte utile : elle révèle si votre design peut absorber
l'imprévu : un titre sur trois lignes, un paragraphe sans respiration naturelle,
un mot trop long pour son conteneur.

## Une question de fidélité

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
laboriosam ? En design, il existe une tension entre la fidélité au contenu réel
et la liberté qu'autorise l'abstraction.

Les prototypes haute fidélité avec du vrai contenu exigent que ce contenu existe
déjà. Les wireframes basse fidélité, eux, communiquent la structure sans la
distraction du sens. Les deux approches ont leur place. L'essentiel est de
savoir quel outil sert le moment.

```ts
// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base = "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i < words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
```

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Conclusion

Le lorem ipsum est plus qu'un simple remplissage. C'est un miroir tendu au
design : il reflète la structure dépouillée de sens, la forme sans contenu.
C'est précisément pour cela qu'il traverse les époques.
