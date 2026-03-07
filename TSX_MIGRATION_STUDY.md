# Étude de migration exhaustive : moteur de templates ESM TypeScript → TSX (Lume)

## 1) Objectif

Cette étude définit une stratégie fiable pour migrer le rendu de templates du
site Lume depuis les fichiers ESM TypeScript (`.page.ts`, layouts/composants
`.ts`) vers TSX (`.page.tsx`, layouts/composants `.tsx`), tout en limitant les
risques fonctionnels et les régressions visuelles.

---

## 2) Référentiel de migration (doc Lume JSX/TSX)

Points structurants à respecter pendant la migration :

1. Le plugin `lume/plugins/jsx.ts` est **obligatoire** pour rendre `.jsx/.tsx`
   au build.
2. Les pages HTML en TSX doivent utiliser l’extension **`.page.tsx`**.
3. Les layouts TSX doivent être placés dans `_includes` (extension `.tsx`).
4. En layout TSX, il faut utiliser **`children`** (et non `content`) pour éviter
   les problèmes d’échappement.
5. Pour les composants, privilégier `comp.*` (composants Lume) plutôt que des
   imports directs pour préserver un meilleur comportement en live-reload.
6. Le TSX Lume est un rendu statique build-time (pas d’événements client type
   `onClick` sans pipeline JS côté navigateur).

---

## 3) État actuel du repository (inventaire réel)

Inventaire obtenu via `deno task study:tsx` :

- Pages `*.page.ts` : **10**
- Pages `*.page.tsx` : **0**
- Fichiers `_includes/*.ts` : **6**
- Fichiers `_includes/*.tsx` : **0**
- Fichiers `_components/*.ts` : **6**
- Fichiers `_components/*.tsx` : **0**
- Imports directs depuis `_components` détectés : **0**

### 3.1 Liste des pages à migrer (`*.page.ts`)

- `src/404.page.ts`
- `src/about.page.ts`
- `src/feeds.page.ts`
- `src/index.page.ts`
- `src/theme-toggle.page.ts`
- `src/posts/index.page.ts`
- `src/posts/instructions.page.ts`
- `src/posts/lorem-ipsum.page.ts`
- `src/posts/proin-facilisis.page.ts`
- `src/posts/vestibulum-ante.page.ts`

### 3.2 Surface layout/component actuelle

Layouts et utilitaires de layout :

- `src/_includes/layouts/base.ts`
- `src/_includes/layouts/post.ts`
- `src/_includes/layouts/_anti-flash.ts`

Composants :

- `src/_components/Footer.ts`
- `src/_components/Header.ts`
- `src/_components/PostCard.ts`

---

## 4) Analyse de compatibilité configuration

### 4.1 Points déjà conformes TSX

- `deno.json` est déjà configuré avec :
  - `compilerOptions.jsx = "react-jsx"`
  - `compilerOptions.jsxImportSource = "lume"`
  - alias `lume/jsx-runtime`

➡️ Le socle TypeScript/JSX est prêt côté compilateur.

### 4.2 Gaps bloquants identifiés

1. `_config.ts` n’importe pas `lume/plugins/jsx.ts`.
2. `_config.ts` ne fait pas `site.use(jsx())`.
3. Le preprocess reading-time cible uniquement `".ts"`.

➡️ Sans correction de ces 3 points, la migration TSX restera partielle ou
cassée.

---

## 5) Risques techniques majeurs

1. **Rendu non pris en charge** : sans plugin JSX, les `.page.tsx` ne seront pas
   rendues.
2. **Régressions de layout** : si `content` est conservé au lieu de `children`.
3. **Faux sentiment de migration terminée** : coexistence `.ts`/`.tsx` trop
   longue, dette cognitive et maintenance plus coûteuse.
4. **Confusion build-time vs runtime** : ajout de handlers JSX côté client qui
   ne fonctionneront pas sans bundle JS dédié.

---

## 6) Plan de migration recommandé (par phases)

## Phase 0 — Préparation (obligatoire)

- Ajouter `import jsx from "lume/plugins/jsx.ts";` dans `_config.ts`.
- Ajouter `site.use(jsx());`.
- Étendre les hooks existants qui ciblent `".ts"` vers `".ts", ".tsx"` quand
  nécessaire.
- Vérifier un build vert avant toute conversion massive.

## Phase 1 — Pilote

- Migrer **une page simple** (ex. `about.page.ts` → `about.page.tsx`).
- Valider : rendu HTML, frontmatter, layout, tests, build.
- Si OK : fixer un pattern de migration unique (template de fichier +
  conventions).

## Phase 2 — Layouts

- Migrer `src/_includes/layouts/base.ts` et `post.ts` vers `.tsx`.
- Remplacer toute logique de concaténation/string HTML par JSX explicite.
- Vérifier précisément l’injection du `children` dans la structure HTML globale.

## Phase 3 — Composants

- Migrer `src/_components/*.ts` vers `.tsx`.
- Conserver l’usage des composants via `comp.*` dans les templates.
- Vérifier les snapshots/tests de composants après migration.

## Phase 4 — Pages (batchs)

- Migrer les pages restantes par lots de 2 à 3 pages.
- Prioriser l’ordre : pages statiques → pages liste/index → pages post.
- Après chaque lot : tests + build + contrôle visuel.

## Phase 5 — Stabilisation

- Nettoyer les reliquats `.ts` de rendu devenus obsolètes.
- Harmoniser signatures de fonctions de rendu TSX.
- Bloquer les réintroductions `.page.ts` via revue/CI (règle d’équipe).

---

## 7) Check-list de validation par lot

- `deno fmt`
- `deno lint`
- `deno task check`
- `deno task lint:doc`
- `deno test`
- `deno task build`

Vérifications fonctionnelles minimales :

- page d’accueil
- une page de post
- flux (`/feed.xml`) si impact indirect
- layout de base (head, title, nav, footer)

---

## 8) Estimation d’effort (ordre de grandeur)

- Préparation config + pilote : **0.5 à 1 jour**
- Layouts + composants : **1 à 2 jours**
- Migration des 10 pages + stabilisation : **1 à 2 jours**

Total cible : **2.5 à 5 jours** selon aléas de contenu/tests.

---

## 9) Décisions recommandées

1. **Décision immédiate** : activer plugin JSX dans `_config.ts`.
2. **Décision de méthode** : migration incrémentale (pas de big-bang).
3. **Décision qualité** : valider chaque lot avec le pipeline complet.
4. **Décision de gouvernance** : figer une convention finale “TSX-first” pour
   les rendus HTML.

---

## 10) Conclusion

Le projet est **techniquement prêt** côté TypeScript (JSX runtime déjà
configuré), mais **pas prêt côté pipeline Lume** tant que le plugin JSX n’est
pas activé dans `_config.ts`. La migration est réaliste, peu risquée si conduite
par lots courts, et peut être finalisée rapidement avec une discipline stricte
de validation.

---

## 11) Mise à jour documentaire à inclure (CLAUDE.md + README.md)

Pour éviter un décalage entre l’implémentation réelle et les consignes projet,
la migration TSX doit être accompagnée d’une mise à jour coordonnée de la
documentation de référence.

### 11.1 `CLAUDE.md`

- Mettre à jour toutes les sections qui imposent explicitement “ESM + TypeScript
  (`*.page.ts` / layouts `.ts` / composants `.ts`)” vers une formulation
  **TSX-first** (`*.page.tsx`, layouts/composants `.tsx`) avec mention claire de
  la stratégie incrémentale.
- Conserver les règles Lume spécifiques rappelées dans cette étude : plugin
  `jsx()`, usage de `children` en layout, et préférence pour `comp.*` côté
  composants.
- Mettre à jour les exemples de conventions (noms de fichiers, snippets,
  checklist) pour refléter l’état post-migration.

### 11.2 `README.md`

- Mettre à jour la section “Tech Stack” pour annoncer explicitement TSX comme
  moteur de rendu des pages/layouts/composants.
- Adapter “Project Structure” et les exemples de fichiers (`*.page.tsx`,
  layouts `.tsx`, composants `.tsx`).
- Mettre à jour la section “Authoring Content” pour documenter le format de
  création d’une page/post en TSX.
- Ajouter une note courte sur les prérequis de rendu (plugin JSX activé dans
  `_config.ts`) afin de faciliter l’onboarding.

### 11.3 Critère d’acceptation documentaire

La migration sera considérée **complète** uniquement lorsque le code, la
configuration, et la documentation (`CLAUDE.md` + `README.md`) convergent vers
les mêmes conventions TSX.
