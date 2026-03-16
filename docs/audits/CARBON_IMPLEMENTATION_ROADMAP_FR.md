# Roadmap Carbon definitive - execution Codex

Statut: document de reference unique\
Date: 2026-03-16\
Remplace: `docs/audits/CARBON_COMPONENT_REVIEW_FR.md`,
`docs/audits/CARBON_COMPONENT_REVIEW_FR_v2.md`

## 1. But

Ce document definit la roadmap definitive pour les evolutions UX/UI Carbon du
site. Il doit etre suffisamment precis pour qu'un agent Codex puisse executer
les taches sans devoir reinterpretter les audits precedents.

Objectif principal:

- augmenter la qualite UX/A11y la ou l'impact est reel
- conserver la simplicite editoriale du site
- rester compatible avec le contexte statique Deno + Lume + TSX + Markdown
- eviter les refontes globales a faible ROI

## 2. Regles non negociables

### 2.1 Contraintes repo

- UI, layouts et composants restent en TSX
- contenus editoriaux restent dans `src/posts/<slug>/`
- aucune valeur CSS brute nouvelle dans le code UI
- utiliser exclusivement les tokens Carbon et les variables deja exposees
- source de verite des tokens: `src/styles/carbon/_theme-tokens.scss`
- references locales obligatoires du repo:
  - `docs/tokens/CARBON_TOKEN_MAP.json`
  - `docs/migration/CARBON_GUIDELINE_INDEX.md`

### 2.2 Contraintes Carbon

- base systeme: Carbon Design System v11
- utiliser des patterns Carbon credibles, pas des composants inventes
- si Carbon n'a pas de composant natif pour un cas, documenter l'adaptation
- ne pas forcer une refonte "Carbon stricte" si le gain UX est faible

### 2.3 Hierarchie des sources

Ordre de priorite a respecter:

1. documentation officielle Carbon en ligne pour les patterns, l'UX, l'a11y et
   les guidelines
2. packages npm Carbon utilises par le repo, en particulier `@carbon/styles`,
   pour la realite technique des tokens, classes et modules Sass
3. code existant du repo pour comprendre les conventions deja en place
4. documents locaux du repo pour la gouvernance et le mapping:
   - `docs/tokens/CARBON_TOKEN_MAP.json`
   - `docs/migration/CARBON_GUIDELINE_INDEX.md`

Interpretation attendue:

- `CARBON_TOKEN_MAP.json` n'est pas la source de verite de Carbon
- ce JSON sert de couche locale de mapping et d'aide de decision pour ce repo
- en cas de conflit, la reference primaire reste Carbon officiel, puis
  l'implementation effective du repo

### 2.4 Contraintes accessibilite

- tout element interactif doit avoir un focus visible
- les controles de disclosure conservent `aria-expanded`, `aria-controls` et
  restore focus
- les surfaces modal-like gardent focus trap si necessaire
- toute annonce dynamique importante doit etre lisible par lecteur d'ecran

## 3. Baseline verifiee

Les points suivants sont consideres comme deja solides et ne doivent pas etre
refaits sans raison forte:

- `Header` et `Side Nav` Carbon deja robustes
- skip link present
- `aria-current` deja en place sur la navigation et les breadcrumbs
- selecteur de langue deja implemente en pattern menu + `menuitemradio`
- recherche Pagefind deja chargee en lazy load avec fallback offline/retry
- `prefers-reduced-motion` et `prefers-contrast: more` deja traites
- archive deja structuree par annee avec navigation d'ancrage
- `Footer` minimal acceptable pour un site editorial personnel

Fichiers de reference pour cette baseline:

- `src/_components/Header.tsx`
- `src/scripts/disclosure-controls.js`
- `src/scripts/pagefind-lazy-init.js`
- `src/_includes/layouts/base.tsx`
- `src/posts/index.page.tsx`
- `src/_components/PostCard.tsx`
- `src/404.page.tsx`
- `src/offline.page.tsx`

## 4. Decisions de cadrage

### 4.1 A conserver

- architecture actuelle du shell
- selecteur de langue actuel
- footer minimal
- archive par annee et navigation d'ancrage

### 4.2 A corriger en priorite

- feedback interactif de `PostCard`
- accessibilite de la recherche
- coherance des etats `404`, `offline` et `empty`
- feedback lecteur d'ecran pour le bouton de copie de code
- robustesse multilingue et alternates `hreflang`

### 4.3 A ne pas faire maintenant

- ne pas migrer tout le site vers une grille Carbon 2x complete
- ne pas remplacer le selecteur de langue par un `Select` ou `Dropdown` par
  principe
- ne pas transformer la navigation annuelle en `Tabs`
- ne pas "carboniser" le footer pour des raisons purement cosmetiques
- ne pas introduire de CTA hero lourd si le besoin produit n'est pas explicite

## 5. Ordre d'execution recommande

| Ordre | ID    | Sujet                 | Priorite        | Resultat attendu                                                       |
| ----- | ----- | --------------------- | --------------- | ---------------------------------------------------------------------- |
| 1     | CR-01 | Recherche accessible  | P0              | recherche avec etats annonces, count/no-result/loading clairs          |
| 2     | CR-02 | PostCard feedback     | P0              | cartes plus lisibles au hover et au clavier sans changer la semantique |
| 3     | CR-03 | Etats systeme unifies | P0              | `404`, `offline` et `empty` harmonises par un pattern partage          |
| 4     | CR-04 | Page article          | P1              | prev/next plus lisible et copy code annonce                            |
| 5     | CR-05 | i18n et alternates    | P1              | UI stable en 4 langues + `hreflang` de page                            |
| 6     | CR-06 | Navigation archive    | P1              | pattern annee clarifie, dette Carbon documentee                        |
| 7     | CR-07 | Sticky nav archive    | P2 conditionnel | a faire seulement si le volume de contenu le justifie                  |
| 8     | CR-08 | Rationalisation grid  | P3 differe      | a ouvrir uniquement avec une refonte layout plus large                 |

### 5.1 Etat d'avancement au 2026-03-16

| ID    | Etat                 | Notes                                                                   |
| ----- | -------------------- | ----------------------------------------------------------------------- |
| CR-01 | Termine              | recherche accessible, etats annonces, retry/focus, tests OK             |
| CR-02 | Termine              | feedback `hover` et `focus-within` sur `PostCard`, tests OK             |
| CR-03 | Non commence         | la carte dediee `StatePanel` reste a faire                              |
| CR-04 | Termine              | rail article, prev/next plus lisible, copy code annonce, tests OK       |
| CR-05 | Termine              | alternates `hreflang`, i18n shell/pages, tests OK                       |
| CR-06 | Partiellement traite | archive clarifiee, taxonomie `/tags/{slug}/` ajoutee, dette a confirmer |
| CR-07 | Differe              | toujours conditionnel au volume de contenu                              |
| CR-08 | Differe              | non ouvert comme chantier dedie                                         |

Travaux complementaires deja realises hors cartes strictes:

- harmonisation desktop/mobile du shell et des largeurs editoriales
- rail contextuelle sur `About` avec contenu de support et pictogramme Carbon
- pages taxonomiques `/tags/{slug}/` avec variantes localisees
- pipeline qualite deplacee vers `_cache/quality/`
- check de liens final execute apres fingerprinting

## 6. Cartes de travail definitives

### CR-01 - Recherche accessible

**Priorite:** P0\
**But:** Faire de la recherche un pattern robuste Carbon-like sans casser
Pagefind ni surcharger le site.

**Fichiers cibles:**

- `src/scripts/pagefind-lazy-init.js`
- `src/_components/Header.tsx`
- `src/styles/components/_header.scss`
- `src/utils/i18n.ts`
- `src/_components/Header_test.ts`

**Travail a faire:**

- conserver le lazy loading actuel
- ajouter un etat explicite de chargement avant que Pagefind soit pret
- ajouter un message `no results`
- annoncer l'etat de recherche via une zone `aria-live="polite"` ou equivalent
  fiable
- exposer des libelles i18n pour:
  - loading
  - no results
  - result count
- verifier que le focus revient au champ ou a l'action de retry apres erreur

**Contraintes d'implementation:**

- ne pas reimplementer un moteur de recherche custom
- ne pas styler le DOM Pagefind avec des valeurs brutes
- si le DOM genere par Pagefind est trop instable, privilegier un conteneur de
  statut adjacent et controle par notre JS

**Critere d'acceptation testable:**

- ouverture du panneau recherche -> focus sur le champ
- pendant l'initialisation -> un message de chargement est visible et annoncable
- une recherche avec resultats -> le nombre de resultats est annonce
- une recherche sans resultats -> message vide visible et annonce
- erreur/offline -> message + retry restent utilisables au clavier

**Validation attendue:**

- `deno task test`
- `deno task check`
- test manuel clavier
- test manuel VoiceOver et, si possible, NVDA

### CR-02 - PostCard feedback interactif

**Priorite:** P0\
**But:** Donner un feedback de survol et de focus coherent au composant le plus
repete du site.

**Fichiers cibles:**

- `src/_components/PostCard.tsx`
- `src/styles/components/_post-card.scss`
- `src/_components/PostCard_test.ts`
- `src/_index_test.ts`
- `src/posts/_index_test.ts`

**Travail a faire:**

- phase 1 uniquement: garder la structure semantique actuelle
- ajouter un etat `hover`
- ajouter un etat `focus-within`
- faire apparaitre un contour/focus ring Carbon visible sur la carte quand le
  lien interne est focus
- verifier le rendu sur home et archive

**Contraintes d'implementation:**

- ne pas passer en "full clickable card" dans cette tache
- ne pas envelopper tout l'article dans un unique `<a>`
- utiliser les tokens de layer/border/focus existants

**Critere d'acceptation testable:**

- la carte reagit clairement a la souris
- la carte reagit clairement au clavier
- le titre reste le lien principal
- aucune regression HTML dans les tests existants

**Validation attendue:**

- `deno task test`
- `deno task check`
- capture avant/apres home + archive en light/dark

### CR-03 - Etats systeme unifies

**Priorite:** P0\
**But:** Remplacer les variantes disparates par un pattern partage simple et
reutilisable.

**Fichiers cibles:**

- `src/404.page.tsx`
- `src/offline.page.tsx`
- `src/index.page.tsx`
- `src/posts/index.page.tsx`
- `src/styles/components/_error-pages.scss`
- nouveau composant recommande: `src/_components/StatePanel.tsx`
- tests associes: `src/_404_test.ts`, `src/_index_test.ts`,
  `src/posts/_index_test.ts`

**Travail a faire:**

- creer un composant partage pour:
  - `404`
  - `offline`
  - empty state home/archive
- harmoniser la hierarchie:
  - titre
  - message
  - action principale
- reutiliser ce composant au lieu de dupliquer la structure

**Contraintes d'implementation:**

- Carbon ne fournit pas ici un composant natif unique a recopier tel quel: il
  faut appliquer un pattern local credibile
- verifier si les styles de boutons Carbon existent deja avant d'utiliser
  `cds--btn`
- si les styles de boutons Carbon ne sont pas disponibles, creer une action-link
  locale alignee Carbon au lieu d'introduire a moitie le composant bouton
- `404`, `offline` et `empty` partagent une structure, mais pas le meme texte ni
  la meme priorite d'action

**Critere d'acceptation testable:**

- `404` et `offline` utilisent la meme ossature visuelle
- les empty states in-page ne cassent pas le flow editorial
- une seule action principale par etat
- les libelles sont localises dans les 4 langues

**Validation attendue:**

- `deno task test`
- `deno task check`
- revue responsive sur `320`, `768`, `1440`

### CR-04 - Page article

**Priorite:** P1\
**But:** Ameliorer la navigation prev/next et le feedback du bouton copy code.

**Fichiers cibles:**

- `src/_includes/layouts/post.tsx`
- `src/scripts/post-code-copy.js`
- `src/styles/components/_post.scss`
- `src/_includes/layouts/_post_test.ts`
- `src/utils/i18n.ts`

**Travail a faire:**

- rendre la navigation prev/next plus lisible visuellement
- rester sur une "tile legere", pas une carte lourde
- ajouter un mecanisme de feedback annoncable pour le bouton copy code
- verifier le focus visible sur les liens prev/next

**Contraintes d'implementation:**

- ne pas creer un composant riche inutile pour prev/next
- ne pas faire reposer l'annonce copy uniquement sur un changement visuel ou
  d'`aria-label`
- privilegier une zone de statut dediee si necessaire

**Critere d'acceptation testable:**

- prev/next ont un etat hover + focus lisible
- le feedback copy est perceptible visuellement et par lecteur d'ecran
- les tests post existants continuent de passer

**Validation attendue:**

- `deno task test`
- `deno task check`
- test manuel clavier sur article avec blocs de code

### CR-05 - i18n et alternates

**Priorite:** P1\
**But:** Stabiliser le rendu multilingue et completer les metadonnees de langue.

**Fichiers cibles:**

- `src/_includes/layouts/base.tsx`
- `src/utils/i18n.ts`
- `src/_includes/layouts/_base_test.ts`
- toute page ou composant dont le libelle deborde apres test

**Travail a faire:**

- ajouter les balises `rel="alternate" hreflang="..."` pour les variantes de
  page quand l'information est disponible
- tester tout le shell et les pages cles dans les 4 langues
- corriger les debordements ou retours de ligne problematiques

**Contraintes d'implementation:**

- ne pas lancer de support RTL dans cette tache
- ne pas modifier la logique d'URL multilanguage existante sans necessite

**Critere d'acceptation testable:**

- les pages localisees publient leurs alternates de langue dans `<head>`
- aucun libelle critique n'est tronque sur `320` et `768`
- pas de regression sur `lang`, `hreflang` et URLs localisees

**Validation attendue:**

- `deno task test`
- `deno task check`
- verification visuelle EN / FR / ZH-Hans / ZH-Hant

### CR-06 - Clarification de la navigation archive

**Priorite:** P1\
**But:** Clarifier la dette UX autour des tags utilises comme navigation
annuelle.

**Fichiers cibles:**

- `src/posts/index.page.tsx`
- `src/styles/components/_archive.scss`
- `src/styles/components/_tag.scss`
- `src/posts/_index_test.ts`

**Travail a faire:**

- conserver la navigation actuelle si elle reste la solution la plus simple
- documenter explicitement la deviation UX: tags utilises comme anchor-nav
- ou remplacer le style par une nav secondaire dediee si la confusion est forte

**Contraintes d'implementation:**

- ne pas utiliser `Tabs`
- ne pas degrader la lisibilite de la taxonomie des articles
- ne pas casser la navigation d'ancrage et `content-visibility`

**Critere d'acceptation testable:**

- la navigation annuelle est clairement percue comme navigation
- la taxonomie des tags article reste distincte
- la navigation continue de fonctionner sans JS supplementaire

**Validation attendue:**

- `deno task test`
- `deno task check`
- test manuel ancrage Chrome / Firefox / Safari si possible

### CR-07 - Sticky nav archive conditionnelle

**Priorite:** P2 conditionnelle\
**Declencheur:** uniquement si le nombre d'annees rend l'archive sensiblement
longue a parcourir.

**Decision actuelle:**

- ne pas implementer tant que le volume de contenu ne le justifie pas

### CR-08 - Rationalisation 2x grid

**Priorite:** P3 differee\
**Decision actuelle:**

- ne pas ouvrir ce chantier dans les taches courtes
- ne le traiter qu'avec une refonte layout plus large et un objectif produit
  clair

## 7. Definition of done globale

Une tache n'est pas terminee tant que les conditions suivantes ne sont pas
remplies:

- le scope defini dans la carte est couvert
- les tests existants lies au scope passent
- les nouveaux comportements critiques ont un moyen de verification
- `deno task check` passe
- `deno task test` passe
- le scanner Carbon ne regresse pas:
  - `deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .`
- aucun token brut interdit n'est introduit dans le code UI

## 8. Strategie d'execution pour Codex

### 8.1 Rythme recommande

- traiter une carte a la fois
- ne pas melanger `CR-01` et `CR-03` dans le meme lot
- preferer des changements petits, testables et localises

### 8.2 Principe de modification

- etendre d'abord les composants et scripts existants
- creer un nouveau composant partage seulement si la duplication actuelle le
  justifie
- preferer les tests existants du repo aux nouveaux frameworks de test

### 8.3 En cas d'incertitude

- si Carbon n'offre pas de pattern univoque, choisir l'adaptation la plus simple
  et la documenter dans le code ou dans la PR
- si un comportement browser-only est difficile a tester unitairement, ajouter
  un protocole de validation manuelle explicite

## 9. Commandes de validation

```sh
deno task check
deno task test
deno task build
deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .
```

## 10. References officielles a utiliser

- references primaires:
- Carbon home: https://carbondesignsystem.com/
- Components: https://carbondesignsystem.com/components/
- Guidelines: https://carbondesignsystem.com/guidelines/
- Accessibility:
  https://carbondesignsystem.com/guidelines/accessibility/overview/
- Search usage: https://carbondesignsystem.com/components/search/usage/
- Search accessibility:
  https://carbondesignsystem.com/components/search/accessibility/
- Breadcrumb usage: https://carbondesignsystem.com/components/breadcrumb/usage/
- Tag usage: https://carbondesignsystem.com/components/tag/usage/
- Tile usage: https://carbondesignsystem.com/components/tile/usage/
- Empty states pattern:
  https://carbondesignsystem.com/patterns/empty-states-pattern/
- 2x Grid overview: https://carbondesignsystem.com/elements/2x-grid/overview/

- references techniques a croiser dans le repo:
  - `@carbon/styles`
  - `src/styles/carbon/_theme-tokens.scss`

- references locales de gouvernance:
  - `docs/tokens/CARBON_TOKEN_MAP.json`
  - `docs/migration/CARBON_GUIDELINE_INDEX.md`

## 11. Resume executif final

La roadmap definitive ne demande pas une refonte generale. Elle demande une
sequence courte et rationnelle:

1. rendre la recherche accessible
2. rendre `PostCard` plus lisible au hover et au clavier
3. unifier les etats systeme
4. renforcer la page article
5. fiabiliser le multilingue
6. clarifier la navigation archive

Tout le reste est differe.
