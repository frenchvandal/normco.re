# Cas d'usage de Pretext pour ce blog

Ce mémo recense des usages concrets de `@chenglou/pretext` pour
`normco.re`, en tenant compte de l'architecture actuelle (Lume + Deno,
contenu Markdown multi-langue, client React/Ant Design découplé par routes).

## Pourquoi c'est pertinent ici

Pretext sert à mesurer et mettre en page du texte multi-lignes sans déclencher
les mesures DOM coûteuses (`getBoundingClientRect`, `offsetHeight`) à chaque
itération. L'API est pensée en deux temps :

1. `prepare(...)` (pré-calcul, plus coûteux)
2. `layout(...)` (chemin chaud très rapide)

Cette séparation colle bien à un blog où un même texte peut être recalculé
souvent lors des redimensionnements, changements de breakpoint, ou itérations
sur des grilles/cartes éditoriales.

## Cas d'usage intéressants pour `normco.re`

### 1) Cartes d'articles plus stables (archives, tags, home)

Le client Ant Design affiche des résumés variables dans des cartes et timelines
(`Paragraph`, `Title`, méta-lignes, tags). On peut utiliser Pretext pour
estimer précisément la hauteur des blocs texte critiques (titre + description)
par breakpoint avant rendu final, afin de :

- réduire les sauts de layout visuels,
- harmoniser les hauteurs de cartes sans heuristiques fragiles,
- rendre plus prévisible le comportement de skeletons pendant le chargement.

Composants concernés : `StoryCard` (`src/blog/client/common.tsx:265`),
`ArchiveTimelineItem` (`src/blog/client/ArchiveApp.tsx:45`), et
`FeaturedStory` (`src/blog/client/common.tsx:383`).

Impact attendu : navigation plus fluide sur les listes riches en contenu.

### 2) Virtualisation fiable des longues listes éditoriales

Le README de Pretext met en avant la virtualisation/occlusion comme bénéfice
principal. Pour les vues archive/tag avec beaucoup d'items, on peut calculer des
hauteurs textuelles plus fiables en amont et alimenter une stratégie de
virtualisation sans « guesstimates ».

`ArchiveTimeline` (`src/blog/client/ArchiveApp.tsx:106`) rend actuellement
tous les items en DOM sans virtualisation. Chaque `ArchiveTimelineItem` est de
hauteur variable selon la langue (`fr`, `zh-hans`, `zh-hant`) et la longueur du
résumé. `layout()` sur `story.title` + `story.summary` à la largeur cible
fournirait des estimations fiables de hauteur pour un éventuel passage à un
composant virtualisé.

Impact attendu : scroll plus performant et moins d'erreurs de positionnement,
notamment sur mobile.

### 3) Préservation d'ancrage au scroll lors des changements de contenu

Pretext cite explicitement le cas « éviter les décalages de mise en page quand
un texte arrive ». C'est utile pour :

- chargement progressif de sections,
- variations de longueur liées à la langue (`en`, `fr`, `zh-hans`, `zh-hant`),
- interactions client qui réinjectent du texte (filtres, variantes de vue).

Impact attendu : moins de CLS perçu et meilleure continuité de lecture.

### 4) QA typographique multi-langue en build/test

Le repo possède déjà des garde-fous éditoriaux et de typographie. Un usage
pertinent de Pretext est un script de validation optionnel qui vérifie, en CI,
que des textes UI critiques (titres de cartes, boutons, labels) ne débordent
pas au-delà du nombre de lignes prévu selon langue + police + largeur.

Impact attendu : qualité visuelle plus constante sans lancer un navigateur pour
chaque vérification.

### 5) Layouts éditoriaux avancés pour essais visuels

Pretext propose un mode « lignes manuelles » (`layoutWithLines`,
`layoutNextLine`) utile pour des expérimentations :

- texte qui s'écoule autour d'un média,
- compositions magazine (colonnes à largeur variable),
- rendu futur vers Canvas/SVG si vous voulez des formats narratifs spéciaux.

`src/styles/components/editorial.css` expose déjà des primitives de layout
éditorial ; `layoutNextLine` permettrait de les prolonger côté JS pour des
compositions non rectangulaires.

Impact attendu : terrain d'expérimentation éditorial sans casser le socle
classique du blog.

### 6) Équilibrage déclaratif des hauteurs dans `StoryGrid`

`StoryGrid` (`src/blog/client/common.tsx:304`) place les cartes en deux
colonnes via `Row`/`Col` (`xs={24} md={12}`), soit environ 50 % de la largeur
viewport moins les gouttières. Les cartes d'une même rangée ont des hauteurs
variables selon la longueur du titre et du résumé.

En appelant `layout(preparedTitle, colWidth, lineHeight)` pour chaque
`StoryCard` lors d'un `useMemo`, on obtient le `lineCount` précis du titre et
du résumé à la largeur réelle de la colonne. Cette valeur peut être injectée
comme propriété CSS personnalisée :

```tsx
// dans StoryCard, après measure
<Card style={{ '--story-title-lines': titleLineCount } as React.CSSProperties}>
```

Le CSS peut alors stabiliser la hauteur du bloc titre avec
`min-block-size: calc(var(--story-title-lines) * var(--ph-lh-tight) * 1em)`
plutôt qu'avec des valeurs arbitraires ou `-webkit-line-clamp`.

Bénéfice supplémentaire : en recalculant au `resize`, les propriétés se
réajustent au breakpoint courant sans déclencher de reflow supplémentaire.

Impact attendu : rangées de grille parfaitement alignées sans CSS hacky.

### 7) Calibration précise des skeletons d'archive selon le contenu précédent

`ArchiveLoadingSkeleton` (`src/blog/client/ArchiveApp.tsx:231`) utilise
aujourd'hui des valeurs fixes (`rows: 6`). Si les données de la dernière visite
sont disponibles (cache mémoire, SWR stale-while-revalidate, ou localStorage),
on peut appliquer `layout()` sur les titres et résumés des N premiers articles
pour dériver un compte de lignes réaliste par bloc skeleton.

```ts
const { lineCount: titleLines } = layout(preparedTitle, containerWidth, lineHeight)
const { lineCount: summaryLines } = layout(preparedSummary, containerWidth, lineHeight)
// → <Skeleton paragraph={{ rows: titleLines + summaryLines }} />
```

Résultat : la transition skeleton → contenu réel ne provoque plus de changement
de hauteur brutal, ce qui élimine l'une des principales sources de CLS
perceptible à l'œil sur la page d'archive.

Impact attendu : skeleton fidèle au contenu attendu, saut de layout quasi nul.

### 8) Validation des titres de section longs dans le rail `PostApp`

Le rail `PostApp` (`src/blog/client/PostApp.tsx:210`) affiche une table des
matières via `Timeline`, dont les items sont les textes d'en-tête issus du
Markdown (`data.outline`). La largeur du rail est étroite (environ 240 px sur
les viewports `xl+`).

Un script Deno de validation au build (similaire à l'idée du cas 4, mais
orienté contenu structuré) peut utiliser `layout()` pour détecter les titres de
section qui dépassent deux lignes à la largeur du rail et les signaler en CI.
L'auteur peut alors reformuler ou confier la troncature au CSS en connaissance
de cause.

Cette approche est plus utile que la simple troncature CSS car elle :
- s'applique au moment de l'édition, pas à l'affichage,
- préserve les titres d'ancrage (#fragment) intacts,
- fonctionne pour toutes les langues simultanément.

Impact attendu : rail ToC sans débordement surprise, qualité visuelle stable
quelle que soit la longueur des sections.

### 9) Mesure des titres dans `SignalStories` avec des éléments atomiques

`SignalStories` (`src/blog/client/common.tsx:345`) affiche une liste compacte
de titres dans l'aside de `FeaturedStory`, chacun précédé d'un index numérique
(`"01"`, `"02"`…). Avec l'API expérimentale `prepareInlineFlow`, le numéro
d'index peut être traité comme un élément atomique de largeur fixe, et le titre
comme un run de texte, pour mesurer ensemble l'espace total disponible.

Cela ouvre la voie à :
- une troncature cohérente sur toutes les langues au même budget de lignes,
- un calcul précis du « débord » (overflow) si un titre dépasse la hauteur
  allouée à la liste,
- une composition future avec d'autres éléments atomiques (icônes, badges).

Impact attendu : aside `SignalStories` visuellement homogène sans CSS fragile.

## Priorisation recommandée (faible risque → fort levier)

1. **POC carte d'article** : mesurer titre + résumé sur une vue archive/tag
   (`StoryCard`, `ArchiveTimelineItem`).
2. **Équilibrage de grille** : injecter `--story-title-lines` dans `StoryGrid`
   pour stabiliser les hauteurs par rangée.
3. **Mesure CLS/scroll** : comparer avant/après sur une page longue.
4. **QA de débordement en CI** : assertions sur chaînes localisées critiques et
   titres de section longs (rail ToC).
5. **Skeleton calibré** : exploiter les données de visite précédente pour affiner
   `rows` du skeleton d'archive.
6. **Exploration layout avancé** : `layoutNextLine` pour les compositions
   éditoriales non rectangulaires ; `prepareInlineFlow` pour `SignalStories`.

## Contraintes d'intégration à garder en tête

- Garder Pretext côté client React uniquement là où la valeur est claire.
- Éviter de multiplier des chemins de rendu parallèles si les styles CSS/tokens
  existants suffisent.
- Profiler sur contenu réel (longueurs `fr`/`zh-*`), pas uniquement sur
  Lorem Ipsum.
- Commencer avec un périmètre minimal pour confirmer le ROI avant généralisation.
- **Pile de polices** : `--ph-font-sans` commence par `-apple-system` et
  `BlinkMacSystemFont`, qui se comportent comme `system-ui`. Or Pretext signale
  explicitement que `system-ui` est peu fiable sur macOS. Pour tous les appels
  à `prepare()`, utiliser un nom de police explicite de la pile, par exemple
  `"Segoe UI"` ou `Roboto`, plutôt que la valeur brute de `--ph-font-sans`.
  Une alternative propre serait d'exposer un token `--ph-font-measure` dans
  `src/styles/antd/theme-tokens.css` pointant vers la première police nommée
  de la pile.

## Décision pratique

Si vous cherchez un gain rapide pour ce repo, le meilleur point d'entrée est la
**stabilisation des hauteurs de texte sur les cartes d'archive/tag** : faible
complexité, bénéfice UX visible, et aligné avec les points forts explicites de
Pretext. L'équilibrage déclaratif de `StoryGrid` (cas 6) est la deuxième étape
naturelle car il réutilise le même `layout()` avec une application CSS légère.
