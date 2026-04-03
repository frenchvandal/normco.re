# Cas d’usage de Pretext pour ce blog

Ce mémo recense des usages concrets de `@chenglou/pretext` pour
`normco.re`, en tenant compte de l’architecture actuelle (Lume + Deno,
contenu Markdown multi-langue, client React/Ant Design découplé par routes).

## Pourquoi c’est pertinent ici

Pretext sert à mesurer et mettre en page du texte multi-lignes sans déclencher
les mesures DOM coûteuses (`getBoundingClientRect`, `offsetHeight`) à chaque
itération. L’API est pensée en deux temps :

1. `prepare(...)` (pré-calcul, plus coûteux)
2. `layout(...)` (chemin chaud très rapide)

Cette séparation colle bien à un blog où un même texte peut être recalculé
souvent lors des redimensionnements, changements de breakpoint, ou itérations
sur des grilles/cartes éditoriales.

## Cas d’usage intéressants pour `normco.re`

### 1) Cartes d’articles plus stables (archives, tags, home)

Le client Ant Design affiche des résumés variables dans des cartes et timelines
(`Paragraph`, `Title`, méta-lignes, tags). On peut utiliser Pretext pour
estimer précisément la hauteur des blocs texte critiques (titre + description)
par breakpoint avant rendu final, afin de :

- réduire les sauts de layout visuels,
- harmoniser les hauteurs de cartes sans heuristiques fragiles,
- rendre plus prévisible le comportement de skeletons pendant le chargement.

Impact attendu : navigation plus fluide sur les listes riches en contenu.

### 2) Virtualisation fiable des longues listes éditoriales

Le README de Pretext met en avant la virtualisation/occlusion comme bénéfice
principal. Pour les vues archive/tag avec beaucoup d’items, on peut calculer des
hauteurs textuelles plus fiables en amont et alimenter une stratégie de
virtualisation sans « guesstimates ».

Impact attendu : scroll plus performant et moins d’erreurs de positionnement,
notamment sur mobile.

### 3) Préservation d’ancrage au scroll lors des changements de contenu

Pretext cite explicitement le cas « éviter les décalages de mise en page quand
un texte arrive ». C’est utile pour :

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

- texte qui s’écoule autour d’un média,
- compositions magazine (colonnes à largeur variable),
- rendu futur vers Canvas/SVG si vous voulez des formats narratifs spéciaux.

Impact attendu : terrain d’expérimentation éditorial sans casser le socle
classique du blog.

## Priorisation recommandée (faible risque → fort levier)

1. **POC carte d’article** : mesurer titre + résumé sur une vue archive/tag.
2. **Mesure CLS/scroll** : comparer avant/après sur une page longue.
3. **QA de débordement en CI** : ajouter quelques assertions sur chaînes
   localisées critiques.
4. **Exploration layout avancé** : uniquement si un format éditorial le justifie.

## Contraintes d’intégration à garder en tête

- Garder Pretext côté client React uniquement là où la valeur est claire.
- Éviter de multiplier des chemins de rendu parallèles si les styles CSS/tokens
  existants suffisent.
- Profiler sur contenu réel (longueurs `fr`/`zh-*`), pas uniquement sur
  Lorem Ipsum.
- Commencer avec un périmètre minimal pour confirmer le ROI avant généralisation.

## Décision pratique

Si vous cherchez un gain rapide pour ce repo, le meilleur point d’entrée est la
**stabilisation des hauteurs de texte sur les cartes d’archive/tag** : faible
complexité, bénéfice UX visible, et aligné avec les points forts explicites de
Pretext.
