# Cas d'usage de Pretext pour ce blog

Ce mémo recense les usages vraiment pertinents de `@chenglou/pretext` pour
`normco.re`, à partir du code réel du repo et de l'API effectivement disponible
dans la version actuellement installée (`0.0.4`).

## Verdict rapide

Pretext est pertinent ici, mais pas pour tout.

Les meilleurs usages pour ce repo sont :

1. stabiliser les hauteurs de texte dans les composants React éditoriaux ;
2. équilibrer les cartes de grille par rangée ;
3. préparer un futur garde-fou multi-langue en CI, à condition d'avoir un vrai
   contexte de mesure navigateur/canvas.

Les usages à plus faible intérêt aujourd'hui sont :

1. la virtualisation ;
2. les skeletons calibrés ;
3. les layouts magazine complexes pilotés en JS ;
4. les scénarios qui reposent sur `prepareInlineFlow`, car cette API n'est pas
   exportée par `@chenglou/pretext@0.0.4`.

## Pourquoi c'est pertinent ici

Pretext sert à mesurer et mettre en page du texte multi-lignes sans déclencher
de mesures DOM coûteuses (`getBoundingClientRect`, `offsetHeight`) à chaque
itération.

Le modèle en deux temps colle bien à ce repo :

1. `prepare(...)` pour le pré-calcul ;
2. `layout(...)` pour le chemin chaud.

Sur un blog multilingue, cela est particulièrement utile quand le même texte
doit être recalculé souvent à cause :

- d'un changement de breakpoint ;
- d'une variation de langue ;
- d'une grille de cartes ;
- d'un rail étroit ;
- d'un recalcul au `resize`.

## API réellement disponible dans `0.0.4`

La version installée expose :

- `prepare`
- `prepareWithSegments`
- `layout`
- `layoutWithLines`
- `layoutNextLine`
- `walkLineRanges`
- `setLocale`
- `clearCache`

Elle **n'expose pas** `prepareInlineFlow`.

Conséquence pratique : les idées autour des éléments atomiques dans
`SignalStories` sont intéressantes conceptuellement, mais ne doivent pas être
considérées comme la prochaine étape naturelle dans l'état actuel du repo.

## Réalité du repo à garder en tête

Le premier mémo supposait implicitement que les surfaces `src/blog/client/`
étaient déjà le centre de gravité du rendu public. En étudiant le dépôt plus
complètement, il faut nuancer :

- les composants React/Ant Design existent bien ;
- ils sont testés et cohérents ;
- mais les entrypoints client mentionnés dans `ARCHITECTURE.md` (`main.tsx`,
  `tag-main.tsx`, `post-main.tsx`, `bootstrap.tsx`) ne sont pas présents
  aujourd'hui dans `src/blog/client/` ;
- les routes publiques sont encore largement servies par les layouts TSX
  statiques sous `src/_includes/layouts/` et `src/posts/index.page.tsx`.

Donc :

- Pretext reste utile ;
- mais surtout pour stabiliser les composants React existants et préparer des
  garde-fous ;
- pas encore comme moteur d'une grosse interface client active en production.

## Ce qui est déjà implémenté

Au 4 avril 2026, le repo contient déjà un premier socle solide :

- `usePretextTextStyle(...)` dans `src/blog/client/pretext-story.ts`
- `useBalancedStoryGridTextStyles(...)` dans
  `src/blog/client/pretext-story-grid.ts`
- un noyau pur de mesure/caching dans `src/blog/client/pretext-story-core.ts`
- un token `--ph-font-measure` dans `src/styles/antd/theme-tokens.css`

Surfaces déjà couvertes :

- `StoryCard`
- `FeaturedStory`
- `ArchiveTimelineItem`
- `StoryGrid` avec équilibrage par rangée
- `SignalStories` avec stabilisation des titres
- le rail `PostApp` avec stabilisation runtime des titres de section

Socle bas niveau désormais disponible aussi :

- `layoutTextBlockWithLines(...)` pour inspecter les lignes calculées ;
- `measureTextBlockWidestLine(...)` pour récupérer la largeur réelle de la ligne
  la plus large après layout ;
- cache dédié `prepareWithSegments(...)` avec invalidation par locale.

## Évaluation des cas d'usage initiaux

### 1) Cartes d'articles plus stables

Verdict : **oui, très pertinent**.

C'est le meilleur point d'entrée pour ce repo, et il est maintenant implémenté
sur les principales surfaces React éditoriales.

Bénéfice réel :

- moins de sauts visuels ;
- moins d'heuristiques CSS fragiles ;
- meilleure cohérence entre langues.

Statut : **implémenté**.

### 2) Virtualisation fiable des longues listes éditoriales

Verdict : **à déprioriser**.

L'idée est bonne en général, mais ici le coût est trop élevé pour le bénéfice
immédiat :

- la surface client archive n'est pas aujourd'hui le chemin public principal ;
- le volume courant de contenu reste modeste ;
- la complexité de virtualisation dépasserait largement le gain observé.

Statut : **à garder en réserve, pas en tranche active**.

### 3) Préservation d'ancrage au scroll lors des changements de contenu

Verdict : **intéressant mais faible ROI immédiat**.

Le cas est plus pertinent pour une vraie app client avec filtres, chargement
progressif, ou blocs injectés dynamiquement. Ce n'est pas encore le profil
dominant de `normco.re`.

Statut : **secondaire**.

### 4) QA typographique multi-langue en build/test

Verdict : **très intéressant à moyen terme**.

Le besoin est réel. En revanche, il faut être honnête sur la faisabilité :

- le repo ne dispose pas aujourd'hui d'un contexte canvas fiable dans les tasks
  Deno standard ;
- un garde-fou robuste demandera probablement un harness navigateur/headless.

La bonne idée reste donc :

- valider titres de cartes, labels UI, titres du rail, etc. ;
- mais dans une future étape dédiée de tooling.

Statut : **non implémenté, mais l'un des meilleurs prochains chantiers**.

### 5) Layouts éditoriaux avancés pour essais visuels

Verdict : **à sortir de la priorité active**.

Le site suit aujourd'hui une direction éditoriale suisse sobre et statique.
Ajouter des compositions non rectangulaires pilotées en JS ouvrirait un chemin
de rendu parallèle difficile à justifier maintenant.

Statut : **exploration seulement, pas feuille de route immédiate**.

### 6) Équilibrage déclaratif des hauteurs dans `StoryGrid`

Verdict : **oui, très pertinent**.

C'était la suite naturelle après la stabilisation individuelle des cartes.

Le repo fait désormais :

- une mesure unifiée des cartes de la grille ;
- un équilibrage par rangée ;
- une diffusion des hauteurs maximales via variables CSS.

Statut : **implémenté**.

### 7) Calibration précise des skeletons d'archive selon le contenu précédent

Verdict : **à déprioriser fortement**.

Le composant `ArchiveLoadingSkeleton` existe, mais le flow public actuel
n'exploite pas vraiment une archive client asynchrone avec transition skeleton
vers contenu.

Tant qu'il n'y a pas de chargement client réel, c'est surtout une idée
préparatoire.

Statut : **pas intéressant tout de suite**.

### 8) Validation des titres de section longs dans le rail `PostApp`

Verdict : **à scinder en deux**.

Ce qui est déjà utile :

- stabiliser runtime les titres du rail `PostApp`.

Ce qui reste à faire plus tard :

- le vrai garde-fou CI multi-langue.

Donc l'idée reste bonne, mais il fallait distinguer :

- le bénéfice runtime immédiat ;
- la validation build/test, qui dépend d'un futur contexte de mesure fiable.

Statut : **runtime implémenté, CI non implémentée**.

### 9) Mesure des titres dans `SignalStories` avec des éléments atomiques

Verdict : **à reformuler**.

Le besoin visuel est légitime, mais la piste initiale n'est pas la bonne
prochaine étape :

- `prepareInlineFlow` n'est pas exporté dans `0.0.4` ;
- la stabilisation simple des titres couvre déjà une bonne partie du bénéfice ;
- la complexité des éléments atomiques ne se justifie pas encore ici.

Statut :

- homogénéité visuelle : **implémentée partiellement**
- approche atomique : **à retirer de la priorité**

## Cas à retirer ou descendre franchement

Les cas suivants ne devraient plus être présentés comme prioritaires dans ce
repo :

1. virtualisation archive/tag ;
2. skeleton calibré ;
3. layouts magazine pilotés en JS ;
4. `prepareInlineFlow` pour `SignalStories`.

## Nouveaux cas d'usage intéressants découverts en étudiant l'API

### A) Shrink-wrap mesuré pour la navigation archive

`walkLineRanges()` ouvre une piste crédible pour les tuiles de navigation
mensuelle ou d'autres petits blocs textuels compacts :

- calculer la largeur réelle de la ligne la plus longue ;
- en déduire une largeur cible plus élégante ;
- éviter des `min-inline-size` trop arbitraires.

Ce n'est pas prioritaire tant que l'archive client n'est pas remobilisée, mais
le cas est plus concret que la virtualisation.

Statut : **socle implémenté**, pas encore branché sur une UI dédiée.

Verdict : **intéressant plus tard**.

### B) Outil de diagnostic éditorial en dev

`layoutWithLines()` peut servir à un outil de debug interne :

- afficher les coupures de ligne prévues pour un titre problématique ;
- comparer rapidement `fr`, `zh-hans`, `zh-hant`, `en` ;
- diagnostiquer une régression typographique sans partir à l'aveugle.

Ce ne serait pas une feature utilisateur, mais un très bon outil de travail si
la QA multi-langue devient plus exigeante.

Le repo dispose maintenant du noyau nécessaire pour cela via
`layoutTextBlockWithLines(...)`, même si aucun panneau de debug n'est encore
exposé.

Verdict : **outil dev crédible**.

Statut : **socle implémenté**, UI/outillage dev à faire seulement si le besoin
se confirme.

### C) Frontière de cache explicite par langue

`setLocale()` est plus important qu'il n'y paraît dans ce repo multilingue :

- il définit une frontière claire de cache entre langues ;
- il évite de mélanger des préparations de texte entre contextes linguistiques ;
- il rend l'intégration plus saine si les surfaces React redeviennent actives.

Ce n'est pas un cas d'usage produit, mais c'est une vraie bonne pratique
d'intégration.

Verdict : **intégration utile, déjà exploitée dans le socle actuel**.

## Priorisation recommandée maintenant

1. **Stabilisation des surfaces React éditoriales** : déjà faite sur les
   composants les plus rentables.
2. **Équilibrage de `StoryGrid`** : déjà fait.
3. **Validation visuelle / CLS** : prochaine meilleure vérification pour mesurer
   le gain réel.
4. **QA multi-langue en CI** : meilleur prochain chantier structurel, avec un
   vrai harness de mesure.
5. **Outils dev autour de `layoutWithLines()`** : bonne piste si les problèmes
   de typographie multi-langue deviennent fréquents.
6. **Le reste** : virtualisation, skeleton, layouts avancés et éléments
   atomiques restent en réserve.

## Contraintes d'intégration

- garder Pretext côté React là où la valeur est claire ;
- éviter les chemins de rendu parallèles sans bénéfice produit net ;
- profiler sur contenu réel `fr` et `zh-*`, pas seulement sur Lorem Ipsum ;
- conserver une pile de police explicite pour la mesure ;
- ne pas supposer qu'une idée séduisante dans le README Pretext est
  automatiquement prioritaire pour `normco.re`.

## Décision pratique

Le meilleur point d'entrée pour ce repo était bien la **stabilisation des
hauteurs de texte** sur les surfaces React éditoriales. Cette étape est
maintenant accomplie, puis prolongée par :

- l'équilibrage de `StoryGrid` ;
- la stabilisation de `SignalStories` ;
- la stabilisation runtime du rail `PostApp`.

Le socle couvre aussi maintenant les usages plus avancés de l'API Pretext qui
étaient vraiment crédibles dans ce repo :

- inspection de lignes avec `layoutWithLines()` ;
- mesure de la ligne la plus large avec `walkLineRanges()` ;
- invalidation explicite des caches de préparation segmentée lors des
  changements de locale.

Le prochain meilleur levier n'est plus le skeleton. C'est plutôt :

1. une validation visuelle/CLS sur les surfaces réellement utilisées ;
2. un futur garde-fou multi-langue en CI ;
3. seulement ensuite, des usages plus ambitieux ou plus exotiques.
