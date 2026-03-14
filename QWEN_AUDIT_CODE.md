# Carbon Design System Migration & Architecture Audit

**Date:** March 14, 2026\
**Author:** Qwen Code\
**Repository:** `frenchvandal/normco.re`

---

## Contexte

Tu as accès aux ressources suivantes :

- **Repository GitHub** : `frenchvandal/normco.re`
- **Figma via MCP**
- **Site généré par le repo Lume**

Documentation interne à lire en priorité dans le repo :

- `CLAUDE.md`
- `AGENTS.md`
- `CARBON_MIGRATION_PLAN.md`
- `ARCHITECTURE.md`
- tous les autres fichiers `.md` du projet si pertinents

⚠️ **Important**

Les fichiers **`CLAUDE.md` et `AGENTS.md` ont un contenu strictement identique**
dans ce projet.

Ils doivent donc :

- toujours rester **synchronisés**
- contenir **exactement les mêmes instructions**
- être **mis à jour de manière identique**

Toute modification apportée à l'un doit être **appliquée à l'autre**.

---

# Objectifs de l'audit

Cet audit vise deux transformations majeures du projet.

## 1. Migration Design System

Remplacer complètement **Primer (GitHub)** par **Carbon Design System (IBM)**.

Contraintes :

- **Aucun composant Carbon installé via npm**
- Tous les composants doivent être **implémentés directement dans le repo**
- L'implémentation doit être basée uniquement sur :
  - les **guidelines officielles**
  - les **designs Figma**

Ressources Carbon :

### Guidelines

https://carbondesignsystem.com/

### Figma

Carbon Design System\
https://www.figma.com/design/tVdGpdfznZUzo6LeGIKbte/-v11--Carbon-Design-System--Community-

IBM Color Library\
https://www.figma.com/design/LB0FBc9Sv0lAiXcm5fVkea/IBM®-Color-Library--Community-

IBM Pictogram Library\
https://www.figma.com/design/BH4YnsefetmaVoj1hhZYvP/IBM®-Pictogram-Library--Community-

IBM UI Icon Library\
https://www.figma.com/design/UXvYp7qRiZfaxxJgf6xMf2/IBM®-UI-Icon-Library--Community-

---

### Typographie Carbon (Google Fonts)

Carbon utilise des polices distribuées via **Google Fonts** (ex. IBM Plex).

**Contraintes d'implémentation pour ce projet :**

- ne **pas utiliser le CDN Google Fonts**
- les polices doivent être **servies localement**

Méthode obligatoire :

utiliser le plugin officiel **Google Fonts de Lume**

Documentation :

https://lume.land/plugins/google_fonts/

L'audit doit inclure :

- stratégie de téléchargement des fonts
- intégration via le plugin Lume
- organisation des fichiers fonts
- déclaration CSS optimale
- optimisation performance (subsetting, preload, etc.)

---

## 2. Refactorisation de l'architecture

L'architecture actuelle devient :

- trop **monolithique**
- trop **overengineered**

Exemples à analyser :

- construction des scripts JS front-end
- `_config.ts`
- organisation des composants
- organisation CSS
- organisation des layouts Lume
- gestion des assets
- pipeline de build

Objectif :

refactoriser vers une architecture :

- **plus modulaire**
- **plus simple**
- **plus maintenable**
- adaptée à **Lume + Deno**

---

# Travail demandé

## 1. Audit complet du repository

Analyser :

- architecture globale
- organisation des dossiers
- gestion des layouts Lume
- organisation CSS
- pipeline JS
- build scripts
- `_config.ts`
- dépendances
- conventions de code

Pour chaque problème identifié :

- expliquer **le problème**
- expliquer **l'impact**
- proposer **une refactorisation concrète**

---

# 2. Analyse UI/UX du site

Analyser le site généré.

Pages à analyser :

- home
- page article
- about
- pagination
- navigation
- toute autre page détectée

Identifier **tous les éléments UI principaux**.

Exemples (liste non exhaustive) :

- header
- navigation
- hero / banner
- cards d'articles
- pagination
- footer
- sidebar
- boutons
- liens
- typographie
- couleurs
- icônes
- images
- modals / popovers
- formulaires (si présents)

---

# 3. Mapping vers Carbon Design System

Pour **chaque élément UI identifié**, fournir :

### Composant Carbon recommandé

Exemples :

- Button
- Card
- Breadcrumb
- Pagination
- Tag
- Link
- UI Shell Header
- UI Shell Navigation
- Content block

### Guidelines Carbon associées

Inclure :

- spacing
- typography
- color usage
- grid
- layout
- accessibility

### Informations Figma nécessaires

Extraire depuis Figma :

- tokens couleurs
- tokens typographiques
- spacing
- dimensions
- iconographie

---

# 4. Architecture cible du projet

Proposer une **nouvelle architecture claire** pour le repo.

Inclure :

- structure dossiers
- organisation composants
- organisation CSS
- organisation JS
- structure layouts Lume
- conventions de nommage
- séparation logique

Objectif :

architecture **simple, maintenable et extensible**.

---

# 5. Implémentation Carbon sans dépendance npm

Définir une stratégie pour implémenter Carbon **directement dans le repo**.

Inclure :

- design tokens
- variables CSS
- système de spacing
- typographie
- composants UI
- icônes
- pictogrammes

Proposer :

- structure composants
- stratégie CSS
- stratégie JS minimale

---

# 6. Gestion des fonts Carbon avec le plugin Lume Google Fonts

Définir la stratégie complète pour utiliser **IBM Plex via le plugin Google
Fonts de Lume**.

Inclure :

- configuration du plugin
- téléchargement local des fonts
- organisation des fichiers fonts
- déclaration CSS
- preload éventuel
- optimisation performance

Documentation :

https://lume.land/plugins/google_fonts/

---

# 7. Mise à jour de la documentation interne

Suite à l'audit, mettre à jour explicitement les fichiers suivants :

- `AGENTS.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `CARBON_MIGRATION_PLAN.md`

### Règle importante

Les fichiers :

- `AGENTS.md`
- `CLAUDE.md`

doivent **conserver un contenu strictement identique**.

Toute modification apportée à l'un doit être **appliquée exactement à l'autre**.

### Contenu à mettre à jour

#### AGENTS.md et CLAUDE.md (contenu identique)

Inclure :

- conventions d'architecture du projet
- règles d'implémentation du Carbon Design System
- organisation des composants
- conventions CSS
- gestion des design tokens
- gestion des fonts via le plugin Lume
- règles de contribution et workflow

#### ARCHITECTURE.md

Inclure :

- architecture cible détaillée
- structure des dossiers
- organisation des composants
- organisation CSS
- pipeline JS
- conventions de build
- gestion des assets
- intégration des fonts
- organisation des design tokens Carbon

#### CARBON_MIGRATION_PLAN.md

Inclure :

- plan de migration détaillé
- ordre de migration des composants
- checklist de migration
- stratégie pour éviter les régressions
- mapping des composants Primer → Carbon

---

# 8. Préparer le prompt pour lancer la migration

Produire un **prompt optimal pour Claude Code** permettant de :

- démarrer la migration vers Carbon
- refactoriser progressivement l'architecture
- implémenter les composants Carbon

Ce prompt doit :

- être structuré
- contenir des étapes claires
- permettre une migration progressive
- éviter toute régression

---

# Format attendu de la réponse

Structure la réponse en sections :

1. Audit architecture
2. Analyse UI du site
3. Mapping Carbon
4. Architecture cible
5. Stratégie implémentation Carbon
6. Gestion des fonts Carbon avec le plugin Lume Google Fonts
7. Mise à jour de la documentation (`AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`,
   `CARBON_MIGRATION_PLAN.md`)
8. Prompt pour lancer la migration

Utiliser :

- tableaux
- listes structurées
- exemples de code si nécessaire

---

# Rapport d'audit

## 1. Audit architecture

### 1.1 État actuel du projet

**Points forts identifiés :**

- ✅ Architecture fonctionnelle avec séparation logique (functional core,
  imperative shell)
- ✅ TypeScript strict avec bonnes pratiques modernes
- ✅ Tests unitaires présents pour les composants critiques
- ✅ CSS moderne avec `@layer`, custom properties, `@scope`
- ✅ Carbon Design System partiellement implémenté (tokens, header, grid)
- ✅ Documentation interne complète (AGENTS.md, ARCHITECTURE.md, etc.)
- ✅ Workflow de validation robuste (lint, type check, HTML validation, link
  checking)

**Problèmes majeurs identifiés :**

| Problème                                             | Impact                                                                           | Sévérité    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- |
| **1. Google Fonts via CDN** dans `style.css`         | Non-conforme aux contraintes projet (fonts doivent être locales via plugin Lume) | 🔴 Critique |
| **2. `_config.ts` monolithique** (600+ lignes)       | Difficile à maintenir, tester, et faire évoluer                                  | 🟠 Élevé    |
| **3. Mélange Primer/Carbon** dans le CSS             | Incohérence design, dette technique visuelle                                     | 🟠 Élevé    |
| **4. Scripts JS front-end non optimisés**            | Build complexe, bundling manuel Carbon                                           | 🟡 Moyen    |
| **5. Composants Carbon incomplets**                  | Seuls header/footer sont implémentés                                             | 🟡 Moyen    |
| **6. Architecture CSS partiellement overengineered** | 7 fichiers CSS, certaines redondances                                            | 🟡 Moyen    |
| **7. `design/` JSON non exploités**                  | Tokens Carbon non générés automatiquement                                        | 🟡 Moyen    |

---

### 1.2 Analyse détaillée par domaine

#### A. Configuration `_config.ts`

**Problème :** Fichier de 600+ lignes qui orchestre tout le build.

**Impact :**

- Difficile à tester unitairement
- Complexe à faire évoluer
- Mélange configuration, pipelines assets, et logique métier

**Refactorisation proposée :**

```
_config.ts
├── site.ts (instanciation Lume)
├── plugins/
│   ├── assets.ts (CSS, JS, images)
│   ├── content.ts (pages, layouts, data)
│   ├── seo.ts (SEO, feed, sitemap)
│   └── validation.ts (HTML, links, SEO checks)
└── hooks/
    ├── preprocess.ts
    └── postprocess.ts
```

#### B. Pipeline CSS

**Problème :** 7 fichiers CSS avec redondances tokens-carbon.css / base.css.

**Impact :**

- Tokens définis en double
- Risque d'incohérence
- Poids CSS inutile

**Refactorisation proposée :**

```
styles/
├── tokens.css (Carbon tokens uniquement)
├── base.css (reset + typography)
├── layout.css (grid + shell)
├── components.css (composants UI)
└── utilities.css (helpers)
```

#### C. Scripts JavaScript

**Problème :** Build Carbon vendor complexe via `build-carbon-vendor.ts`.

**Impact :**

- Post-build hook lent
- Dépendance à `deno bundle` avec code-splitting
- 12+ fichiers JS dans `src/scripts/`

**Refactorisation proposée :**

- Utiliser import maps pour Carbon
- Réduire scripts au strict minimum
- Documenter chaque script

#### D. Composants

**Problème :** Seulement Header, Footer, PostCard implémentés.

**Impact :**

- Migration Carbon incomplète
- Composants manquants : Button, Card, Tag, Breadcrumb, Pagination, etc.

**Refactorisation proposée :**

```
_components/
├── shell/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── SideNav.tsx
├── content/
│   ├── PostCard.tsx
│   ├── Card.tsx
│   └── Hero.tsx
├── navigation/
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   └── Link.tsx
└── ui/
    ├── Button.tsx
    ├── Search.tsx
    └── Dropdown.tsx
```

---

## 2. Analyse UI du site

### 2.1 Pages analysées

| Page            | URL              | État             |
| --------------- | ---------------- | ---------------- |
| **Home**        | `/`              | ✅ Fonctionnelle |
| **Post detail** | `/posts/{slug}/` | ✅ Fonctionnelle |
| **Archive**     | `/posts/`        | ✅ Fonctionnelle |
| **About**       | `/about/`        | ✅ Fonctionnelle |
| **404**         | `/404`           | ✅ Fonctionnelle |
| **Offline**     | `/offline`       | ✅ Fonctionnelle |
| **Feeds hub**   | `/feeds/`        | ✅ Fonctionnelle |

### 2.2 Éléments UI identifiés

| Élément               | Localisation  | État actuel               | Priorité migration |
| --------------------- | ------------- | ------------------------- | ------------------ |
| **Header**            | Global        | Carbon UI Shell (partiel) | ✅ Déjà migré      |
| **Footer**            | Global        | Carbon-compatible         | ✅ Déjà migré      |
| **Hero**              | Home          | Primer-like               | 🔴 Haute           |
| **PostCard**          | Home, Archive | Primer-like               | 🔴 Haute           |
| **Breadcrumb**        | Post detail   | Custom                    | 🟠 Moyenne         |
| **Tags**              | Post detail   | Carbon (partiel)          | 🟠 Moyenne         |
| **Pagination**        | Archive       | Custom                    | 🟠 Moyenne         |
| **Archive year nav**  | Archive       | Custom                    | 🟡 Basse           |
| **Search**            | Header panel  | Pagefind UI               | 🟠 Moyenne         |
| **Language dropdown** | Header        | Custom panel              | 🟠 Moyenne         |
| **Theme toggle**      | Header        | Custom                    | 🟡 Basse           |
| **Skip link**         | Global        | Carbon-compatible         | ✅ Déjà migré      |
| **Code blocks**       | Post detail   | Custom + copy button      | 🟡 Basse           |

---

## 3. Mapping Carbon Design System

### 3.1 Composants à implémenter

| Composant actuel  | Composant Carbon recommandé | Source Carbon                                                                   | Statut       |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------- | ------------ |
| Hero section      | Content block               | [Content block](https://carbondesignsystem.com/components/content-block/usage/) | 🔴 À faire   |
| PostCard          | Card + Link                 | [Card](https://carbondesignsystem.com/components/card/usage/)                   | 🔴 À faire   |
| Breadcrumb        | Breadcrumb                  | [Breadcrumb](https://carbondesignsystem.com/components/breadcrumb/usage/)       | 🟠 Partiel   |
| Tags              | Tag                         | [Tag](https://carbondesignsystem.com/components/tag/usage/)                     | 🟠 Partiel   |
| Archive nav       | Pagination                  | [Pagination](https://carbondesignsystem.com/components/pagination/usage/)       | 🔴 À faire   |
| Search            | Search                      | [Search](https://carbondesignsystem.com/components/search/usage/)               | 🟠 Partiel   |
| Language selector | Dropdown                    | [Dropdown](https://carbondesignsystem.com/components/dropdown/usage/)           | 🔴 À faire   |
| Theme toggle      | Toggle                      | [Toggle](https://carbondesignsystem.com/components/toggle/usage/)               | 🔴 À faire   |
| Buttons           | Button                      | [Button](https://carbondesignsystem.com/components/button/usage/)               | 🔴 À faire   |
| Links             | Link                        | [Link](https://carbondesignsystem.com/components/link/usage/)                   | ✅ Déjà fait |

### 3.2 Tokens Figma à extraire

| Token       | Fichier JSON                                             | Usage             |
| ----------- | -------------------------------------------------------- | ----------------- |
| Couleurs    | `design/Colors.json`, `design/Color palette*.json`       | Thèmes light/dark |
| Spacing     | `design/Spacing.json`                                    | Marges, paddings  |
| Breakpoints | `design/Breakpoint.json`, `design/Breakpoint LG–XL.json` | Responsive        |
| Radius      | `design/Radius.json`                                     | Coins arrondis    |
| Typography  | `design/Numbers.json`                                    | Tailles, weights  |
| Grid        | `design/Grid mode.json`, `design/Column span.json`       | Layout            |

---

## 4. Architecture cible

### 4.1 Structure de dossiers refactorisée

```
turbo-fiesta/
├── _config.ts                    # Orchestrateur principal (allégé)
├── _cms.ts                       # Configuration LumeCMS
├── deno.json                     # Dependencies, tasks, imports
├── src/
│   ├── _data.ts                  # Site-wide data
│   ├── index.page.tsx            # Home page
│   ├── about.page.tsx            # About page
│   ├── 404.page.tsx              # 404 page
│   ├── style.css                 # CSS entrypoint
│   ├── _components/
│   │   ├── shell/                # Header, Footer, SideNav
│   │   ├── content/              # PostCard, Card, Hero
│   │   ├── navigation/           # Breadcrumb, Pagination, Link
│   │   └── ui/                   # Button, Tag, Search, Dropdown
│   ├── _includes/
│   │   └── layouts/
│   │       ├── base.tsx          # Layout de base
│   │       └── post.tsx          # Layout article
│   ├── posts/                    # Articles
│   ├── scripts/                  # JS client-side (minimal)
│   ├── styles/
│   │   ├── tokens.css            # Carbon design tokens
│   │   ├── base.css              # Reset + typography
│   │   ├── layout.css            # Grid + shell
│   │   ├── components.css        # Composants UI
│   │   └── utilities.css         # Helpers
│   └── utils/                    # Fonctions utilitaires
├── plugins/                      # Plugins Lume custom
├── scripts/                      # Scripts build/maintenance
│   ├── build-carbon-vendor.ts    # Bundle Carbon components
│   ├── fingerprint-assets.ts     # Cache busting
│   └── md-to-tsx.ts              # Conversion Markdown → TSX
└── design/                       # JSON exports Figma
    ├── Theme.json
    ├── Colors.json
    ├── Spacing.json
    └── ...
```

### 4.2 Conventions de nommage

| Type      | Convention            | Exemple           |
| --------- | --------------------- | ----------------- |
| Composant | `PascalCase.tsx`      | `PostCard.tsx`    |
| Utility   | `kebab-case.ts`       | `date-helpers.ts` |
| Style     | `kebab-case.css`      | `tokens.css`      |
| Page      | `kebab-case.page.tsx` | `about.page.tsx`  |
| Layout    | `kebab-case.tsx`      | `base.tsx`        |
| Dossier   | `kebab-case`          | `_components/`    |

---

## 5. Stratégie implémentation Carbon

### 5.1 Design tokens

**Approche :** Générer les tokens CSS depuis les JSON Figma.

```ts
// scripts/generate-carbon-tokens.ts
import colors from "../design/Colors.json";
import spacing from "../design/Spacing.json";

function generateCssTokens() {
  return `
    :root {
      ${
    Object.entries(colors).map(([key, value]) => `--cds-${key}: ${value};`)
      .join("\n")
  }
    }
  `;
}
```

### 5.2 Variables CSS

Utiliser la nomenclature W3C DTCG `category-property-modifier` :

```css
:root {
  /* Colors */
  --color-background-default: oklch(100% 0 0);
  --color-background-hover: oklch(95.7% 0 0);
  --color-text-primary: oklch(14.9% 0 0);

  /* Spacing */
  --space-01: 0.125rem;
  --space-02: 0.25rem;
  --space-03: 0.5rem;
}
```

### 5.3 Composants UI

**Stratégie :** Implémenter progressivement sans dépendance npm.

```tsx
// _components/ui/Button.tsx
export default (
  {
    variant = "primary",
    size = "md",
    children,
  }: {
    readonly variant?: "primary" | "secondary" | "danger";
    readonly size?: "sm" | "md" | "lg";
    readonly children: string;
  },
) => (
  <button class={`bx--btn bx--btn--${variant} bx--btn--${size}`}>
    {children}
  </button>
);
```

### 5.4 Icônes

**Stratégie :** Utiliser IBM Pictograms via SVG inline.

```tsx
// utils/carbon-icon.ts
export function getIconPath(name: string): string {
  // Map icon name to SVG path from design JSON
  return ICONS[name] ?? "";
}
```

---

## 6. Gestion des fonts Carbon avec Lume Google Fonts

### 6.1 Configuration du plugin

```ts
// _config.ts
import googleFonts from "lume/plugins/google_fonts.ts";

site.use(
  googleFonts({
    fonts: [
      {
        family: "IBM Plex Sans",
        weights: [400, 500, 600],
        styles: ["normal", "italic"],
      },
      {
        family: "IBM Plex Mono",
        weights: [400, 500],
        styles: ["normal", "italic"],
      },
    ],
    output: "fonts",
    preload: true,
    display: "swap",
  }),
);
```

### 6.2 Organisation des fichiers

```
src/
├── fonts/
│   ├── ibm-plex-sans/
│   │   ├── 400.woff2
│   │   ├── 500.woff2
│   │   ├── 600.woff2
│   │   └── 400-italic.woff2
│   └── ibm-plex-mono/
│       ├── 400.woff2
│       ├── 500.woff2
│       └── 400-italic.woff2
```

### 6.3 Déclaration CSS

```css
/* styles/tokens.css */
@font-face {
  font-family: "IBM Plex Sans";
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/ibm-plex-sans/400.woff2") format("woff2");
}

@font-face {
  font-family: "IBM Plex Sans";
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/ibm-plex-sans/500.woff2") format("woff2");
}
```

### 6.4 Optimisation performance

- **Subsetting :** Extraire uniquement les glyphes nécessaires (Latin de base)
- **Preload :** Ajouter `<link rel="preload">` dans le `<head>`
- **WOFF2 :** Utiliser uniquement le format WOFF2 (meilleure compression)
- **Font-display :** `swap` pour éviter FOIT

---

## 7. Mise à jour de la documentation

### 7.1 Fichiers à mettre à jour

**Règle :** `AGENTS.md` et `CLAUDE.md` doivent avoir un contenu **strictement
identique**.

### 7.2 Contenu à ajouter dans `AGENTS.md` et `CLAUDE.md`

```markdown
## 6. Carbon Design System

### 6.1 Implémentation

- **Aucun composant Carbon installé via npm**
- Tous les composants sont implémentés directement dans le repo
- Basé sur les guidelines officielles et designs Figma

### 6.2 Design tokens

- Tokens générés depuis `design/*.json` (exports Figma)
- Nomenclature W3C DTCG : `category-property-modifier`
- Couleurs en `oklch()` pour uniformité perceptive

### 6.3 Typographie

- IBM Plex via plugin Lume Google Fonts
- Fonts servies localement (pas de CDN)
- Subsetting Latin pour optimisation

### 6.4 Composants

Structure :
```

_components/ ├── shell/ # Header, Footer, SideNav ├── content/ # Card, Hero,
PostCard ├── navigation/ # Breadcrumb, Pagination, Link └── ui/ # Button, Tag,
Search, Dropdown

```
### 6.5 CSS

- Modern CSS first (`@layer`, `@scope`, custom properties)
- SCSS uniquement si nécessaire
- CSS-in-JS prohibé
```

### 7.3 Contenu à ajouter dans `ARCHITECTURE.md`

```markdown
## Architecture Carbon

### Design tokens

Générés depuis `design/*.json` :

- `Theme.json` : thèmes light/dark
- `Colors.json` : palette couleurs
- `Spacing.json` : échelle 8px
- `Breakpoint.json` : responsive

### Composants

Chaque composant :

1. TSX dans `_components/{category}/`
2. Styles dans `styles/components.css`
3. Tests dans `_components/{category}/_test.ts`

### Fonts

IBM Plex via plugin Lume :

- Téléchargement local
- WOFF2 uniquement
- Subsetting Latin
```

### 7.4 Contenu à ajouter dans `CARBON_MIGRATION_PLAN.md`

```markdown
## Plan de migration

### Phase 1 : Fondations (Semaine 1)

- [ ] Configurer plugin Lume Google Fonts
- [ ] Générer tokens CSS depuis JSON Figma
- [ ] Nettoyer redondances CSS

### Phase 2 : Composants critiques (Semaine 2-3)

- [ ] Hero section → Carbon Content Block
- [ ] PostCard → Carbon Card
- [ ] Tags → Carbon Tag
- [ ] Breadcrumb → Carbon Breadcrumb

### Phase 3 : Navigation (Semaine 4)

- [ ] Archive pagination → Carbon Pagination
- [ ] Language selector → Carbon Dropdown
- [ ] Search → Carbon Search

### Phase 4 : Polishing (Semaine 5)

- [ ] Theme toggle → Carbon Toggle
- [ ] Buttons → Carbon Button
- [ ] Tests visuels
- [ ] Documentation

## Mapping Primer → Carbon

| Primer        | Carbon        | Fichier                         |
| ------------- | ------------- | ------------------------------- |
| `.hero`       | Content Block | `index.page.tsx`                |
| `.post-card`  | Card          | `PostCard.tsx`                  |
| `.blankslate` | Empty State   | `_components/ui/EmptyState.tsx` |
```

---

## 8. Prompt pour lancer la migration

```markdown
# Migration Carbon Design System — Prompt d'exécution

## Contexte

Tu es un expert Carbon Design System et Lume. Tu dois migrer progressivement le
blog normco.re de Primer vers Carbon Design System.

## Contraintes

1. **Aucun composant Carbon npm** — tout doit être implémenté dans le repo
2. **Fonts locales** — utiliser le plugin Lume Google Fonts
3. **AGENTS.md = CLAUDE.md** — toujours synchronisés
4. **Tests obligatoires** — chaque composant doit avoir ses tests

## Étapes

### Étape 1 : Configuration Google Fonts (2h)

1. Installer le plugin `lume/plugins/google_fonts`
2. Configurer IBM Plex Sans (400, 500, 600) et IBM Plex Mono (400, 500)
3. Générer les fichiers fonts dans `src/fonts/`
4. Mettre à jour `style.css` pour utiliser les fonts locales
5. Supprimer l'import CDN Google Fonts actuel

**Validation :**

- `deno task build` réussit
- Fonts sont dans `_site/fonts/`
- Pas de requête vers `fonts.googleapis.com`

### Étape 2 : Tokens CSS (3h)

1. Créer `scripts/generate-carbon-tokens.ts`
2. Lire `design/Colors.json`, `design/Spacing.json`, `design/Theme.json`
3. Générer `src/styles/tokens.css`
4. Nettoyer les redondances entre `tokens-carbon.css` et `base.css`

**Validation :**

- Tokens sont à jour avec Figma
- Nomenclature W3C DTCG respectée
- Tests de non-régression CSS

### Étape 3 : Hero Section (4h)

1. Créer `_components/content/Hero.tsx`
2. Implémenter Carbon Content Block guidelines
3. Mettre à jour `index.page.tsx`
4. Ajouter tests `Hero_test.ts`

**Guidelines Carbon :**
https://carbondesignsystem.com/components/content-block/usage/

**Validation :**

- Screenshots avant/après
- Tests passent
- Accessibilité (skip link, focus)

### Étape 4 : PostCard (4h)

1. Refondre `PostCard.tsx` vers Carbon Card
2. Ajouter variantes (home, archive)
3. Mettre à jour `index.page.tsx` et `posts/index.page.tsx`
4. Tests `PostCard_test.ts`

**Guidelines Carbon :** https://carbondesignsystem.com/components/card/usage/

### Étape 5 : Tags (2h)

1. Mettre à jour `_components/ui/Tag.tsx`
2. Couleurs Carbon (blue, green, purple, red, teal, cyan, gray)
3. Mettre à jour `layouts/post.tsx`

**Guidelines Carbon :** https://carbondesignsystem.com/components/tag/usage/

### Étape 6 : Breadcrumb (2h)

1. Créer `_components/navigation/Breadcrumb.tsx`
2. Implémenter Carbon Breadcrumb
3. Mettre à jour `layouts/post.tsx`

**Guidelines Carbon :**
https://carbondesignsystem.com/components/breadcrumb/usage/

### Étape 7 : Documentation (1h)

1. Mettre à jour `AGENTS.md` et `CLAUDE.md` (contenu identique)
2. Mettre à jour `ARCHITECTURE.md`
3. Mettre à jour `CARBON_MIGRATION_PLAN.md`

## Workflow

Pour chaque étape :

1. `deno task serve` — capture screenshot avant
2. Implémentation
3. `deno task build` — capture screenshot après
4. `deno fmt && deno lint && deno task check && deno test`
5. Commit avec message Conventional Commits

## Livrables

- [ ] Fonts locales fonctionnelles
- [ ] Tokens CSS générés
- [ ] Hero migré
- [ ] PostCard migré
- [ ] Tags migrés
- [ ] Breadcrumb migré
- [ ] Documentation mise à jour

## Critères d'acceptation

- ✅ Aucun CDN Google Fonts
- ✅ Tokens alignés Figma
- ✅ Composants accessibles (WCAG 2.2 AA)
- ✅ Tests passent
- ✅ Build réussit
- ✅ Screenshots PR attachés
```

---

## Résumé exécutif

### Migration prioritaire (ordre recommandé)

1. **Google Fonts local** — Critique (non-conforme contraintes)
2. **Tokens CSS** — Fondation pour tous les composants
3. **Hero + PostCard** — Impact visuel maximum
4. **Tags + Breadcrumb** — Complète les pages articles
5. **Pagination + Search** — Archive et navigation

### Effort estimé

| Phase      | Durée   | Complexité |
| ---------- | ------- | ---------- |
| Fonts      | 2h      | 🟢 Faible  |
| Tokens     | 3h      | 🟢 Faible  |
| Hero       | 4h      | 🟡 Moyenne |
| PostCard   | 4h      | 🟡 Moyenne |
| Tags       | 2h      | 🟢 Faible  |
| Breadcrumb | 2h      | 🟢 Faible  |
| **Total**  | **17h** |            |

### Risques identifiés

- ⚠️ **Rupture de synchronisation AGENTS.md / CLAUDE.md** — Mettre en place
  validation automatique
- ⚠️ **Régression visuelle** — Screenshots systématiques + tests
- ⚠️ **Performance fonts** — Subsetting et WOFF2 obligatoires

---

**Prochaine action recommandée :** Commencer par l'**Étape 1 : Configuration
Google Fonts** car c'est la contrainte la plus critique et le prérequis pour
toutes les autres migrations.
