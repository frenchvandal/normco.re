# Codex Refactoring Prompt

> **Objectif** : rendre le code plus léger, élégant et lisible sans sacrifier
> les bonnes pratiques modernes (Deno 2 / TypeScript 5, Kotlin 2 / Compose, CSS
> custom properties, etc.).

---

## Contexte

Ce dépôt (`normco.re`) contient :

- un site statique **Deno + Lume + TSX** avec styles CSS token-driven (`--ph-*`)
- des scripts utilitaires **Deno** (lint, fingerprinting, payload analysis…)
- une app **Android Kotlin / Jetpack Compose / Material 3 / Hilt / Room**
- des contrats JSON partagés entre web et mobile

Le fichier `CLAUDE.md` à la racine contient toutes les conventions du projet.
Respecte-les scrupuleusement.

---

## 1 — Web : TSX (layouts, pages, composants)

### 1.1 Extraire les helpers dupliqués dans un module partagé

Trois fichiers — `src/index.page.tsx`, `src/posts/index.page.tsx`,
`src/_includes/layouts/tag.tsx` — dupliquent quasi-mot-pour-mot :

- `resolvePostCardRenderer()` (résolution Reflect d'un composant)
- `resolveDateHelper()` (résolution Reflect du helper `date`)
- `renderFallbackPostCard()` (HTML de secours pour les cartes)

**Action** : crée `src/utils/lume-helpers.ts` (ou un nom plus parlant) et
exporte ces trois fonctions. Mets à jour les imports dans les trois fichiers.

### 1.2 Extraire les type guards répétés

`isLumeData()`, `resolveOptionalString()`, `isDefined<T>()` sont redéfinis dans
plusieurs layouts/pages.

**Action** : déplace-les dans `src/utils/type-guards.ts` ; réexporte depuis un
barrel si nécessaire.

### 1.3 Centraliser le pattern de date courte par locale

```ts
const shortDatePattern = language === "fr"
  ? "d MMM"
  : language === "zhHans" || language === "zhHant"
  ? "M月d日"
  : "SHORT";
```

Ce ternaire est copié dans `index.page.tsx` et `posts/index.page.tsx`.

**Action** : ajoute `getShortDatePattern(language: string): string` dans
`src/utils/i18n.ts` et remplace les deux sites d'appel.

### 1.4 Alléger `Header.tsx` (758 lignes)

- Les trois appels `renderHeaderAction(…)` ne diffèrent que par l'icône et le
  label. Extrais un tableau déclaratif `headerActions` et itère dessus.
- Si possible, sépare la logique du panneau de recherche et du panneau de langue
  dans des sous-composants (fichiers séparés ou fonctions nommées dans le même
  fichier).

### 1.5 Factoriser la navigation prev/next dans `post.tsx`

Le bloc prev/next (deux fois la même structure `<div class="post-nav-item">…`)
peut devenir une petite fonction `renderPostNavLink(post, label, isNext)`.

### 1.6 Extraire le pattern « traduction + URL localisée »

```ts
const translations = getSiteTranslations(language);
const homeUrl = getLocalizedUrl("/", language);
```

Ce doublet apparaît dans quasiment chaque page. Envisage un helper
`usePageContext(language)` qui renvoie
`{ translations, homeUrl, archiveUrl, … }`.

---

## 2 — CSS (base.css, layout.css)

### 2.1 Réduire la répétition Shiki

`base.css:145-172` déclare trois fois les mêmes cinq propriétés (`color`,
`background-color`, `font-style`, `font-weight`, `text-decoration`) pour les
variantes Shiki light / dark / forced-colors.

**Action** : isole les propriétés communes dans une règle de base `.shiki span`
et ne redéfinis que les custom properties dans les media queries.

### 2.2 Consolider les sélecteurs d'icônes

`layout.css:169-183` liste dix classes d'icônes qui partagent les mêmes
propriétés de taille/fill. Crée une classe utilitaire `.u-icon` (ou `.ph-icon`)
appliquée côté markup, et remplace la longue liste de sélecteurs.

### 2.3 Extraire le pattern « surface subtle »

```css
border: 1px solid var(--ph-color-border-default);
border-radius: var(--ph-radius-md);
background: var(--ph-color-canvas-subtle);
```

Ce triplet revient dans `.site-search-notification`, `.feeds-copy-notice`,
`.site-header__panel`, etc. Crée `.u-surface-subtle` dans `utilities.css`.

---

## 3 — Scripts Deno (TypeScript)

### 3.1 Créer `scripts/_shared.ts`

Les fonctions suivantes sont dupliquées dans 2-3 scripts chacune :

| Fonction                             | Fichiers                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `fileExists()`                       | `fingerprint-assets.ts`, `check-output-links.ts`, `sync-android-contract-assets.ts` |
| `getLineNumber()` / `lineNumberAt()` | `check-browser-imports.ts`, `design-token-guard.ts`                                 |
| `getErrorMessage()`                  | `fingerprint-assets.ts`, `payload-report.ts`                                        |

**Action** : exporte-les depuis `scripts/_shared.ts` ; utilise
`import.meta.dirname` pour la résolution de chemin si besoin.

### 3.2 Simplifier `unwrapStringLiteral()` dans `check-browser-imports.ts`

L'implémentation actuelle (20 lignes) peut se réduire à un regex :

```ts
function unwrapStringLiteral(expr: string): string | undefined {
  const m = expr.trim().match(/^(['"`])([\s\S]*?)\1$/);
  if (!m || (m[1] === "`" && m[2].includes("${"))) return undefined;
  return m[2];
}
```

### 3.3 Factoriser le pattern « prefix check »

`check-browser-imports.ts` définit trois fonctions booléennes identiques
(`isForbiddenPrefix`, `isNetworkSpecifier`, `isBrowserResolvable`) qui appellent
toutes `prefixes.some(p => s.startsWith(p))`.

**Action** : remplace par un seul `hasPrefix(s, prefixes)`.

### 3.4 Utiliser `beforeEach` pour le seed Faker dans les tests

`lint-commit_test.ts` appelle `seedTestFaker(N)` au début de chaque test avec un
seed différent. Si l'intention est un seed unique par test, un
`beforeEach(() => seedTestFaker(seed++))` avec `describe` et `@std/testing/bdd`
simplifiera le fichier.

---

## 4 — Android (Kotlin / Compose)

### 4.1 Combiner les Flow dans les ViewModels

`HomeViewModel` et `ArchiveViewModel` lancent chacun 3-4 `viewModelScope.launch`
séparés pour observer `preferredLanguage`, `bookmarks`, `recentOpened`,
`syncStatus`. Chaque bloc fait `distinctUntilChanged().collectLatest { … }`.

**Action** : utilise `combine(flow1, flow2, …) { … }` pour fusionner en un seul
`launch` qui met à jour un `data class ContentState(…)`. Cela réduit le
boilerplate et évite les races potentielles entre mises à jour d'état.

### 4.2 Extraire les composables Loading/Error

`HomeScreen`, `ArchiveScreen`, `PostScreen`, `SettingsScreen` définissent chacun
leur propre `LoadingCard()` et `ErrorCard()` avec un contenu quasi-identique.

**Action** : crée `ui/components/AsyncStateCards.kt` avec :

```kotlin
@Composable
fun LoadingStateCard(@StringRes messageRes: Int)

@Composable
fun ErrorStateCard(message: String, @StringRes labelRes: Int, onRetry: () -> Unit)
```

### 4.3 Extraire un composable `SectionHeading`

`HomeScreen` définit `RecentReadingHeading`, `BookmarkedHeading`,
`LatestPostsHeading` — tous titre + sous-titre + action optionnelle.

**Action** : crée `ui/components/SectionHeading.kt` paramétré par `titleRes`,
`subtitleRes`, `actionLabel?`, `onAction?`.

### 4.4 Centraliser `formatPublishedDate()`

Même implémentation dans `PostSummaryCard.kt` et `PostScreen.kt`.

**Action** : déplace dans `ui/utils/DateFormatting.kt`.

### 4.5 Migrer `RemoteContractsClient` vers OkHttp

Le client HTTP utilise `HttpURLConnection` brut avec gestion manuelle des
ressources. OkHttp est déjà dans le graph de dépendances (via Coil).

**Action** : remplace par un `OkHttpClient` injecté via Hilt pour un code plus
idiomatique, testable et cohérent avec le reste du stack.

### 4.6 Simplifier la gestion du Job dans `SettingsViewModel`

Le pattern `observePreferencesJob?.cancel(); observePreferencesJob = launch {}`
peut être remplacé par `stateIn(SharingStarted.WhileSubscribed(5_000))` sur le
Flow source, éliminant la gestion manuelle du Job.

---

## Consignes transversales

- **Ne casse pas les tests existants.** Fais tourner `deno task check`,
  `deno task test`, `deno task build` après chaque groupe de modifications web.
  Pour Android : `./gradlew quality assembleDebug`.
- **Respecte `CLAUDE.md`** — tokens `--ph-*`, pas de valeurs hard-codées,
  imports Faker via l'alias local, seeds stables, préférence Deno std, etc.
- **Pas de sur-ingénierie** — ne crée pas d'abstractions « au cas où ». Si un
  helper n'est utilisé que deux fois, le gain doit être évident en lisibilité.
- **Commits atomiques** — un commit par thème (ex. « extract shared type guards
  », « consolidate icon selectors »), pas un seul commit monolithique.
- **Pas de changements cosmétiques gratuits** — ne reformate pas du code non
  touché, n'ajoute pas de docstrings ou de commentaires inutiles.
