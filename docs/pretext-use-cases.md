# Cas d'usage de Pretext pour ce blog

Ce mémo recense les usages vraiment pertinents de `@chenglou/pretext` pour
`normco.re`, à partir du code réel du repo et de l'API effectivement disponible
dans la version actuellement installée (`0.0.4`).

## Verdict rapide

Pretext est pertinent ici, mais pas pour tout.

Les meilleurs usages pour ce repo sont :

1. stabiliser les hauteurs de texte dans les composants React éditoriaux ;
2. équilibrer les cartes de grille par rangée ;
3. alimenter un garde-fou multi-langue en CI, à condition d'avoir un vrai
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

À date, le registre npm ne publie pas de version plus récente :
`@chenglou/pretext` s'arrête toujours à `0.0.4`. Il n'y a donc pas encore de
chemin réaliste de mise à niveau immédiat pour débloquer une API plus riche.

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
- cache dédié `prepareWithSegments(...)` avec invalidation par locale ;
- invalidation explicite des caches de mesure quand `document.fonts` signale la
  fin d'un chargement, pour éviter de conserver des mesures faites avant
  l'arrivée d'une webfont.
- flag global `__PH_DISABLE_PRETEXT__` pour forcer un run sans Pretext dans les
  harness A/B et les diagnostics ciblés.

## Utilisation concrète dans le repo

Aujourd'hui, Pretext n'est pas un moteur de layout global du site. Il est
branché là où il apporte un gain clair et localisé.

Chemin principal :

- `src/blog/client/pretext-story-core.ts` : noyau pur de préparation, layout,
  inspection de lignes et cache par locale ;
- `src/blog/client/pretext-story.ts` : hook de stabilisation des hauteurs de
  titres et résumés ;
- `src/blog/client/pretext-story-grid.ts` : équilibrage par rangée de
  `StoryGrid`.

Points d'intégration actuels :

- `src/blog/client/common.tsx` pour `StoryCard`, `FeaturedStory` et
  `SignalStories` ;
- `src/blog/client/ArchiveApp.tsx` pour les items de timeline ;
- `src/blog/client/PostApp.tsx` pour le rail de navigation du post.

En pratique, le pattern d'usage est toujours le même :

1. préparer une mesure typographique avec la police de mesure explicite ;
2. calculer une hauteur ou une largeur cible à partir du texte et de la largeur
   disponible ;
3. propager le résultat via variables CSS plutôt que refaire des mesures DOM
   impératives.

## Comment Pretext est testé

Le repo teste Pretext sur trois niveaux complémentaires.

### 1) Tests unitaires du socle

Les invariants de préparation/layout sont couverts dans :

- `src/blog/client/pretext-story_test.ts`
- `src/_blog_client_contract_test.ts`

On y vérifie surtout :

- les chemins de cache ;
- les sorties de layout attendues ;
- les garde-fous d'intégration côté client.

### 2) Validation build/type/test classique

Toute modification du socle doit continuer à passer :

```sh
deno task check
deno task test
deno task build
```

Cela valide le contrat de code, mais pas encore le rendu réel dans un vrai
navigateur.

### 3) Harness headless multi-langue

Le garde-fou navigateur dédié vit dans :

- `scripts/pretext-visual-harness.ts`
- `scripts/pretext-visual-harness_test.ts`
- `scripts/pretext-visual-harness-compare.ts`
- `scripts/pretext-visual-harness-compare_test.ts`

Il visite les surfaces publiques vraiment utilisées :

- `home`
- `tag`
- `archive`
- `post`

Et il ajoute désormais une route interne dédiée :

- `probe`, qui monte explicitement `StoryCard`, `FeaturedStory`, `StoryGrid`,
  `ArchiveTimelineItem`, `SignalStoryLink` et `OutlineTimelineLink` dans un vrai
  navigateur, afin d'obtenir un signal runtime direct sur Pretext.

Et il les rend pour :

- `en`
- `fr`
- `zh-hans`
- `zh-hant`

Sur deux viewports :

- `mobile`
- `desktop`

Ce harness produit :

- des screenshots ;
- un `report.json` ;
- des métriques DOM par sélecteur critique ;
- un signal CLS ;
- les erreurs console/page/request ;
- un échec explicite si une route répond mal ou si des sélecteurs attendus ont
  disparu.

Le point important est la complémentarité :

- les routes publiques restent le garde-fou UX et CLS ;
- la route `probe` sert de banc d'essai navigateur pour les composants React
  réellement instrumentés par Pretext.

Commandes de base :

```sh
deno task pretext:harness:install
deno task pretext:harness
```

Commande de comparaison A/B :

```sh
deno task pretext:harness:install
deno task pretext:harness:compare
deno task pretext:react-harness
```

En CI GitHub Actions, le workflow exécute désormais :

```sh
deno task pretext:harness:install
deno task pretext:harness:compare:ci
deno task pretext:react-harness:ci
```

Puis le workflow publie `.tmp/pretext-harness-compare/` en artifact via
`actions/upload-artifact`, tandis que Deno reste responsable des `summary.md` et
du job summary.

Sortie du harness simple :

- `.tmp/pretext-harness/report.json`
- `.tmp/pretext-harness/summary.md`
- `.tmp/pretext-harness/screenshots/*.png`

Sortie du compare A/B :

- `.tmp/pretext-harness-compare/comparison.json`
- `.tmp/pretext-harness-compare/summary.md`
- `.tmp/pretext-harness-compare/with-pretext/report.json`
- `.tmp/pretext-harness-compare/with-pretext/summary.md`
- `.tmp/pretext-harness-compare/with-pretext/screenshots/*.png`
- `.tmp/pretext-harness-compare/without-pretext/report.json`
- `.tmp/pretext-harness-compare/without-pretext/summary.md`
- `.tmp/pretext-harness-compare/without-pretext/screenshots/*.png`

Sortie du harness React A/B :

- `.tmp/pretext-react-harness/report.json`
- `.tmp/pretext-react-harness/summary.md`

Sur un runner GitHub, Deno publie aussi un job summary GitHub à partir du
`summary.md` racine. Le compare navigateur écrit d'abord le summary visuel, puis
le harness React y ajoute sa propre section en append. L'upload des fichiers
reste géré explicitement par le workflow. La détection du contexte runner reste
basée sur `GITHUB_ACTIONS=true`, ce qui évite d'activer le job summary en local.
Les summaries publiés en CI sont rédigés en anglais pour rester directement
exploitables dans GitHub Actions.

Important : ce harness mesure **l'effet réel** de l'intégration Pretext dans un
vrai navigateur. Il est donc très bon pour valider la stabilité visuelle, la
cohérence multi-langue et les régressions de rendu. En revanche, ce n'est pas un
benchmark scientifique de coût CPU isolé. Si un jour on veut comparer le temps
brut de `prepare(...)` ou `layout(...)`, il faudra un protocole séparé.

Le compare A/B apporte un garde-fou supplémentaire : il permet de vérifier non
seulement que le rendu final reste stable, mais aussi que le variant
`with-pretext` active bien les variables `--pretext-*` et les `min-block-size`
résolus attendus, tout en confrontant ce signal au variant `without-pretext`.

Point important découvert en pratique : sur l'état actuel du repo, le compare
navigateur peut aussi conclure honnêtement qu'il n'observe **aucun** signal
runtime propre à Pretext sur la matrice de routes publiques. Quand cela arrive,
il faut l'interpréter comme :

- un compare utile pour le garde-fou visuel/CLS ;
- mais pas comme la meilleure mesure de l'utilité intrinsèque de Pretext ;
- parce que les routes publiques couvertes restent en grande partie statiques ou
  n'exposent pas encore les surfaces React visées pendant le run.

Le harness React complète ce signal par une mesure beaucoup plus directe de
l'utilité des hooks Pretext eux-mêmes. Il ne dépend pas des routes publiques ni
du montage effectif des surfaces SSR/client du site ; il rend les hooks dans un
DOM contrôlé, sur des fixtures `en` / `fr` / `zh-hans` / `zh-hant`, puis compare
`with-pretext` / `without-pretext` sur des métriques simples et parlantes :

- couverture des surfaces texte où les variables `--pretext-title-height` et
  `--pretext-summary-height` apparaissent réellement ;
- couverture des cartes `StoryGrid` où ces variables sont effectivement
  renseignées ;
- nombre de rangées comparables de `StoryGrid` réellement équilibrées.

Autrement dit :

- le harness navigateur dit si l'effet utilisateur final reste stable ;
- le harness React dit si Pretext fait vraiment quelque chose d'utile au niveau
  des hooks et des variables CSS.

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

Statut : **implémenté côté harness headless et branché en CI**, avec un compare
`with-pretext` / `without-pretext`.

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

Le garde-fou multi-langue existe maintenant aussi côté CI via le compare
headless, ce qui permet de relier plus proprement l'effet runtime observé à un
contrôle automatisé.

Statut : **runtime et CI implémentés**.

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
3. **Validation visuelle / CLS** : désormais outillée par un harness headless
   dédié.
4. **QA multi-langue en CI** : désormais en place, y compris en mode compare
   A/B.
5. **Outils dev autour de `layoutWithLines()`** : bonne piste si les problèmes
   de typographie multi-langue deviennent fréquents.
6. **Le reste** : virtualisation, skeleton, layouts avancés et éléments
   atomiques restent en réserve.

## Contraintes d'intégration

- garder Pretext côté React là où la valeur est claire ;
- éviter les chemins de rendu parallèles sans bénéfice produit net ;
- profiler sur contenu réel `fr` et `zh-*`, pas seulement sur Lorem Ipsum ;
- conserver une pile de police explicite pour la mesure ;
- préférer un `line-height` explicite sur les surfaces mesurées, car CSS
  `normal` reste nécessairement approximé côté mesure ;
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

Le prochain meilleur levier n'est plus de brancher la CI, puisque c'est fait.
Les suites les plus crédibles sont plutôt :

1. exploiter `layoutWithLines()` et `walkLineRanges()` pour les cas d'outillage
   dev ou de shrink-wrap ciblé ;
2. enrichir au besoin le compare headless avec Firefox/WebKit si une divergence
   de rendu navigateur devient plausible ;
3. seulement après, revisiter des usages plus ambitieux ou plus exotiques.
