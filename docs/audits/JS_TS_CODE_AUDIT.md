# Audit de code JavaScript / TypeScript

**Date :** 2026-03-16
**Portee :** Tous les fichiers `.ts`, `.tsx`, `.js` du depot (CSS/Sass exclus)
**Fichiers audites :** 82

---

## Resume executif

Le code JavaScript/TypeScript du depot est globalement de bonne qualite. Les
points forts sont la securite de typage, les conventions d'accessibilite, la
couverture de tests et l'architecture modulaire. L'audit releve neanmoins
quelques problemes critiques (securite XSS, gestion d'erreurs manquante) et
plusieurs axes d'amelioration.

### Metriques globales

| Categorie | Fichiers | Problemes critiques | Problemes moyens | Problemes mineurs |
|-----------|----------|--------------------:|:----------------:|:-----------------:|
| Config build (`_config/`) | 8 | 2 | 4 | 8 |
| Plugins | 6 | 1 | 3 | 4 |
| Scripts build (`scripts/`) | 10 | 1 | 3 | 5 |
| Composants TSX | 8 | 1 | 2 | 3 |
| Layouts TSX | 6 | 1 | 3 | 2 |
| Utilitaires (`utils/`) | 14 | 0 | 1 | 4 |
| Pages TSX | 6 | 0 | 1 | 3 |
| Scripts client (`src/scripts/`) | 14 | 3 | 4 | 8 |
| Donnees / metadata | 8 | 0 | 0 | 3 |
| Outils (`tools/`) | 1 | 0 | 1 | 2 |
| Tests (`*_test.ts`) | ~30 | 0 | 3 | 6 |
| **Total** | **82** | **9** | **25** | **48** |

---

## Problemes critiques (severite haute)

### 1. XSS — `StatePanel.tsx` (lignes 39-58)

**Fichier :** `src/_components/StatePanel.tsx`

Le composant construit du HTML par interpolation de chaines sans echappement :

```tsx
${eyebrow}     // ligne 43
${title}        // ligne 46
${actionHref}   // ligne 49
${actionLabel}  // ligne 49
${message}      // ligne 56
${ariaLabel}    // ligne 53
```

Toute valeur contenant des caracteres HTML (`<`, `>`, `"`, `&`) sera injectee
telle quelle. Meme si les valeurs sont actuellement controlees, le composant
est reutilisable et le risque de regression est eleve.

**Recommandation :** Convertir en JSX (comme les autres composants) ou
implementer un echappement HTML systematique.

---

### 2. XSS — `tag.tsx` (lignes 76-115)

**Fichier :** `src/_includes/layouts/tag.tsx`

Meme probleme : construction HTML par template literal avec `${homeUrl}`,
`${archiveUrl}`, `${tagName}` sans echappement.

**Recommandation :** Migrer vers JSX ou echapper les valeurs dynamiques.

---

### 3. Conversion de contenu — `processors.ts` (ligne 135)

**Fichier :** `_config/processors.ts`

```ts
const content = String(page.content);
```

Si `page.content` est un `Uint8Array` ou `ArrayBuffer`, `String()` produit
`"[object ArrayBuffer]"` au lieu du contenu reel, corrompant les fichiers XML.

**Recommandation :** Utiliser `new TextDecoder().decode()` pour les contenus
binaires ou ajouter une verification de type.

---

### 4. Collision de slugs — `_cms.ts` (lignes 38-42)

**Fichier :** `_cms.ts`

La fonction `resolveSlug` retourne `"post"` comme valeur par defaut pour les
slugs vides. Cela cree un dossier `/post/_data.yml` qui ecrase toute entree
precedente avec un slug vide.

**Recommandation :** Lever une erreur pour les slugs invalides ou utiliser un
identifiant unique comme fallback.

---

### 5. Service Worker — `sw.js` (ligne 294)

**Fichier :** `src/scripts/sw.js`

```js
Number(timestampHeader)
```

La conversion peut produire `NaN` si l'en-tete de cache est absent ou mal
forme. Le TTL serait alors toujours expire.

**Recommandation :** Ajouter une verification `Number.isNaN()` avec un
comportement par defaut.

---

### 6. Service Worker — `sw.js` (ligne 246)

**Fichier :** `src/scripts/sw.js`

Acces potentiellement indefini sur `OFFLINE_URL_BY_LANGUAGE[lang]` si la langue
detectee ne figure pas dans le dictionnaire.

**Recommandation :** Ajouter un fallback vers la langue par defaut.

---

### 7. Focus null — `disclosure-controls.js` (ligne 555)

**Fichier :** `src/scripts/disclosure-controls.js`

Appel a `.focus()` sans verification prealable que l'element existe. Peut
produire une `TypeError` a l'execution.

**Recommandation :** Ajouter un null-check avant l'appel.

---

### 8. Gestion d'erreurs — `fingerprint-assets.ts`

**Fichier :** `scripts/fingerprint-assets.ts`

- Ligne 86 : `Deno.readFile(sourcePath)` sans try-catch ni message
  d'erreur contextuel.
- Ligne 235 : `await main()` au niveau module sans gestion de rejection.
  Un echec produit un crash avec un message de promise non geree.

**Recommandation :** Envelopper dans un try-catch avec messages descriptifs
et codes de sortie.

---

### 9. Cast JSON non valide — `payload-report.ts` (ligne 1219)

**Fichier :** `scripts/payload-report.ts`

```ts
return JSON.parse(raw) as PayloadReport;
```

Cast direct sans validation de la structure. Un fichier corrompu ou un schema
modifie provoque des erreurs silencieuses en aval.

**Recommandation :** Valider la structure avec un type guard avant le cast.

---

## Problemes de severite moyenne

### Securite de type

| Fichier | Ligne(s) | Probleme |
|---------|----------|----------|
| `_config/processors.ts` | 60 | Cast `as Record<string, unknown>` sans validation |
| `_cms.ts` | 39 | Slug non valide au niveau format (caracteres, longueur) |
| `_cms.ts` | 141 | Dependance a l'API `Temporal` sans fallback |
| `plugins/content-contract.ts` | 245 | `data.tags as string[]` sans verification des elements |
| `plugins/content-contract.ts` | 228 | `page.document` accede sans null-check |
| `src/_includes/layouts/post.tsx` | 82-102 | Multiples casts `as unknown as` aux frontieres Lume |
| `src/_includes/layouts/tag.tsx` | 40-41 | Meme probleme de casts non securises |
| `scripts/payload-report.ts` | 805 | Cast `(report as { metadata?: unknown })` trop large |

### Gestion d'erreurs

| Fichier | Ligne(s) | Probleme |
|---------|----------|----------|
| `contracts/validate.ts` | 210-214 | Lecture de fichiers sans try-catch |
| `contracts/validate.ts` | 226, 247 | Parsing JSON sans gestion de `SyntaxError` |
| `contracts/validate.ts` | 124 | `new RegExp()` sur pattern utilisateur sans protection |
| `contracts/validate.ts` | 270 | `main()` appele sans gestion d'erreur |
| `_config.ts` | 117-127 | Scripts post-build sans gestion d'echec |
| `tools/carbon_repo_scanner.ts` | 621 | Ecriture fichier sans gestion d'erreur |

### Performance

| Fichier | Ligne(s) | Probleme |
|---------|----------|----------|
| `_config/processors.ts` | 27-118 | 4 processeurs HTML independants iterent toutes les pages |
| `scripts/check-output-links.ts` | 155 | O(n*m) verifications d'existence de fichiers |
| `plugins/otel.ts` | 460 | `ignorePatterns.some()` evalue a chaque requete |
| `plugins/otel.ts` | 429-597 | Fonction `createMiddleware()` de 168 lignes |

### Couverture de tests

| Fichier test | Couverture manquante |
|--------------|---------------------|
| `_config/feeds_test.ts` | Test minimal — 1 seule assertion |
| `plugins/otel_test.ts` | Middleware erreurs, patterns de route, metriques |
| `scripts/check-output-links_test.ts` | 2 cas seulement — liens relatifs, symlinks |
| `src/scripts/disclosure-controls_test.ts` | Touche Escape, clic exterieur |
| `src/tags/_index_test.ts` | Normalisation de slug, tags multiples, tri |

---

## Problemes de severite basse

### Qualite de code

| Fichier | Probleme |
|---------|----------|
| `_config/feeds.ts` | Violation DRY — 4 configs quasi identiques, boucle recommandee |
| `_config/plugins.ts` | Operations bitwise non documentees (`chrome: 123 << 16`) |
| `_config/plugins.ts` | URL de police Google en dur dans le code |
| `_config/materialize_sass_npm_packages.ts` | Pattern `void [...]` non documente |
| `plugins/otel.ts` | Duplication de la creation de `RequestRecord` (succes vs erreur) |
| `plugins/otel.ts` | Ternaires imbriques pour la resolution de mode |
| `scripts/lint-commit.ts` | Codes ANSI en dur — utiliser un objet constant |
| `src/scripts/disclosure-controls.js` | `setTimeout(..., 50)` — magic number |
| `src/scripts/disclosure-controls.js` | 625 lignes, responsabilites multiples |
| `src/scripts/pagefind-lazy-init.js` | Gestion d'etat complexe — pattern state machine recommande |
| `src/_components/Header.tsx` | `HOME_URLS` recalcule a chaque rendu |

### Conventions

| Fichier | Probleme |
|---------|----------|
| `src/_components/Footer.tsx` | Type de retour implicite (manque `=> JSX.Element`) |
| `src/_components/Header.tsx` | Type de retour implicite |
| `src/posts/_data.ts` | Constante `AUTHOR` dupliquee depuis `src/_data.ts` |
| `src/utils/tags.ts` | `charCodeAt()` sans documentation Unicode |
| `src/scripts/header-tooltips.js` | Parametre `event` inutilise dans handler `focusout` |
| `src/utils/copyright_test.ts` | Code de spy console duplique 4 fois |
| `src/posts/_markdown_contract_test.ts` | Regex frontmatter ne normalise pas les fins de ligne |

### Compatibilite

| Fichier | Probleme |
|---------|----------|
| `src/scripts/link-prefetch-intent.js` | `.at()` necessite ES2022 — verifier le support cible |
| `_cms.ts` | `Temporal.Now.plainDateISO()` — API pas encore stable partout |
| `_cms.ts` | `prodBranch: "master"` en dur |

---

## Points forts du codebase

### Securite de type
- Usage systematique de `as const satisfies Record<>` pour les donnees
  statiques
- Types readonly sur les interfaces de composants
- JSDoc `@ts-check` et `@typedef` sur tous les scripts client

### Accessibilite
- Implementation exemplaire : `aria-expanded`, `aria-controls`,
  `aria-current`, `aria-label`, `aria-busy`, `role="dialog"`,
  `role="menuitemradio"`
- Gestion du focus (focus trap, restauration apres fermeture)
- Navigation clavier complete (fleches, Escape, Tab)
- Detection de modalite d'interaction (pointer vs clavier)

### Tests
- ~30 fichiers de test avec couverture correcte
- Usage de faker avec seeds pour la reproductibilite
- Tests de contrats CSS (verification runtime des selecteurs attendus)
- Helpers et factories bien structures

### Architecture
- Separation claire : build config / plugins / composants / utilitaires /
  scripts client
- Plugins Lume modulaires avec injection de dependances
- Scripts client en IIFE isoles sans pollution globale
- Service Worker avec strategies de cache differenciees

### Performance
- `requestIdleCallback` avec fallback `setTimeout`
- `WeakMap` / `WeakSet` pour eviter les fuites memoire
- Prefetch avec budget et detection de connexion lente
- Chargement paresseux de Pagefind

---

## Recommandations prioritaires

### Priorite 1 — Securite

1. **Convertir `StatePanel.tsx` en JSX** pour eliminer le risque XSS
2. **Convertir la construction HTML de `tag.tsx` en JSX** ou ajouter
   un echappement systematique
3. **Corriger `processors.ts` ligne 135** : utiliser `TextDecoder` pour
   le contenu binaire

### Priorite 2 — Robustesse

4. **Corriger `resolveSlug` dans `_cms.ts`** : lever une erreur au lieu
   du fallback `"post"`
5. **Ajouter la gestion d'erreurs dans `fingerprint-assets.ts`** : try-catch
   et code de sortie dans `main()`
6. **Valider le JSON dans `payload-report.ts`** avant le cast
7. **Ajouter les null-checks dans `sw.js`** pour le timestamp et le
   dictionnaire de langues
8. **Ajouter un null-check dans `disclosure-controls.js`** avant `.focus()`

### Priorite 3 — Qualite

9. **Combiner les processeurs HTML** dans `processors.ts` en une seule passe
10. **Factoriser les 4 configs de feeds** dans `feeds.ts` via une boucle
11. **Extraire la duplication de `RequestRecord`** dans `otel.ts`
12. **Documenter les patterns non evidents** : bitwise dans `plugins.ts`,
    `void [...]` dans `materialize_sass_npm_packages.ts`

### Priorite 4 — Tests

13. **Etoffer `feeds_test.ts`** au-dela d'une seule assertion
14. **Ajouter les tests manquants dans `otel_test.ts`** : middleware, metriques
15. **Tester les cas limites de `check-output-links_test.ts`** : liens
    relatifs, chemins invalides
16. **Ajouter le test Escape et clic exterieur** dans
    `disclosure-controls_test.ts`

---

## Annexe — Inventaire des fichiers audites

### Configuration build (8 fichiers)
- `_config.ts`
- `_config/assets.ts`
- `_config/feeds.ts`
- `_config/feeds_test.ts`
- `_config/materialize_sass_npm_packages.ts`
- `_config/plugins.ts`
- `_config/processors.ts`
- `_cms.ts`

### Plugins (6 fichiers)
- `contracts/validate.ts`
- `plugins/console_debug.ts`
- `plugins/console_debug_test.ts`
- `plugins/content-contract.ts`
- `plugins/otel.ts`
- `plugins/otel_test.ts`

### Scripts build (10 fichiers)
- `scripts/check-browser-imports.ts`
- `scripts/check-browser-imports_test.ts`
- `scripts/check-output-links.ts`
- `scripts/check-output-links_test.ts`
- `scripts/ensure-dir.ts`
- `scripts/fingerprint-assets.ts`
- `scripts/lint-commit.ts`
- `scripts/lint-commit_test.ts`
- `scripts/payload-report.ts`
- `scripts/payload-report_test.ts`

### Composants TSX (8 fichiers)
- `src/_components/CarbonIcon.tsx`
- `src/_components/Footer.tsx`
- `src/_components/Footer_test.ts`
- `src/_components/Header.tsx`
- `src/_components/Header_test.ts`
- `src/_components/PostCard.tsx`
- `src/_components/PostCard_test.ts`
- `src/_components/StatePanel.tsx`

### Layouts TSX (6 fichiers)
- `src/_includes/layouts/base.tsx`
- `src/_includes/layouts/_base_test.ts`
- `src/_includes/layouts/post.tsx`
- `src/_includes/layouts/_post_test.ts`
- `src/_includes/layouts/tag.tsx`
- `src/_includes/layouts/_tag_test.ts`

### Utilitaires (14 fichiers)
- `src/utils/carbon-icons.ts`
- `src/utils/copyright.ts`
- `src/utils/copyright_test.ts`
- `src/utils/editorial-image-dimensions.ts`
- `src/utils/editorial-image-dimensions_test.ts`
- `src/utils/font-preload.ts`
- `src/utils/i18n.ts`
- `src/utils/i18n_test.ts`
- `src/utils/slugify.ts`
- `src/utils/slugify_test.ts`
- `src/utils/tags.ts`
- `src/utils/tags_test.ts`
- `src/utils/xml-stylesheet.ts`
- `src/utils/xml-stylesheet_test.ts`

### Pages TSX (6 fichiers)
- `src/404.page.tsx`
- `src/about.page.tsx`
- `src/index.page.tsx`
- `src/offline.page.tsx`
- `src/posts/index.page.tsx`
- `src/tags/index.page.ts`

### Scripts client (14 fichiers)
- `src/scripts/anti-flash.js`
- `src/scripts/disclosure-controls.js`
- `src/scripts/disclosure-controls_test.ts`
- `src/scripts/feed-copy.js`
- `src/scripts/header-tooltips.js`
- `src/scripts/header-tooltips_test.ts`
- `src/scripts/language-preference.js`
- `src/scripts/link-prefetch-intent.js`
- `src/scripts/pagefind-lazy-init.js`
- `src/scripts/pagefind-lazy-init_test.ts`
- `src/scripts/post-code-copy.js`
- `src/scripts/sw.js`
- `src/scripts/sw-register.js`
- `src/scripts/theme-toggle.js`

### Donnees / metadata (8 fichiers)
- `src/_archetypes/post.ts`
- `src/_data.ts`
- `src/_data_test.ts`
- `src/posts/_data.ts`
- `src/posts/_data_test.ts`
- `src/posts/post-metadata.ts`
- `src/posts/post-metadata_test.ts`
- `src/posts/_markdown_contract_test.ts`

### Tests de pages (6 fichiers)
- `src/_404_test.ts`
- `src/_about_test.ts`
- `src/_index_test.ts`
- `src/_offline_test.ts`
- `src/posts/_index_test.ts`
- `src/tags/_index_test.ts`

### Outils (1 fichier)
- `tools/carbon_repo_scanner.ts`
