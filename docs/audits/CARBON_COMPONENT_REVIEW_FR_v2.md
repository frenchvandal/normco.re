# Revue critique de l'audit Carbon — Rapport amélioré v2

Date: 2026-03-16
Auteur: Revue UX/UI senior — Carbon Design System v11
Source: `docs/audits/CARBON_COMPONENT_REVIEW_FR.md`
Périmètre: pages générées (`/`, `/posts/`, `/posts/<slug>/`, `/about/`, `/offline/`, `404`) + composants TSX/SCSS.

---

## 1. Résumé exécutif

Le rapport d'audit initial est **solide dans son diagnostic global** : le site est effectivement bien aligné Carbon v11 (classes `cds--*`, tokens `--cds-*`, shell UI complet). L'audit identifie correctement que les gains se situent dans la **montée en maturité des patterns**, pas dans la correction de non-conformités.

**Cependant, le rapport présente plusieurs lacunes critiques :**

- Aucune mention de l'accessibilité clavier/lecteur d'écran (pourtant l'un des piliers Carbon).
- Pas d'analyse responsive/mobile au-delà de mentions ponctuelles.
- Pas de vérification des états d'interaction (hover/focus/active/disabled).
- Pas de prise en compte de l'internationalisation (le site est multilingue EN/FR/ZH).
- Les recommandations restent souvent vagues ("pattern plus standard", "plus explicite") sans spécification concrète.
- Le backlog manque de critères d'acceptation testables et d'estimation d'effort.

**Note globale : 6.5/10** — Bon point de départ, mais insuffisant pour guider une implémentation.

---

## 2. Évaluation globale

### Qualité de l'analyse — 7/10

| Point fort | Point faible |
|---|---|
| Couverture exhaustive des 12 composants | Analyse superficielle : 3-4 lignes par composant |
| Diagnostic correct du niveau de maturité | Aucune référence aux specs Carbon précises (liens, tokens attendus) |
| Ton pragmatique et non-alarmiste | Pas de capture d'écran ni de comparaison avant/après |
| Identification correcte des composants "maison" | Omission complète de l'accessibilité et du responsive |
| Backlog structuré Quick wins / V2 | Pas de V3 ni d'horizon long terme |

### Alignement Carbon — 7/10

| Point fort | Point faible |
|---|---|
| Connaissance correcte des patterns Carbon (Tile, Search, Tag) | Pas de référence aux pages de documentation Carbon spécifiques |
| Bonne intuition sur le détournement des Tags pour la navigation | Ne mentionne pas les patterns Carbon existants pour Empty States |
| Distinction pertinente custom vs Carbon | Ne vérifie pas les tokens de motion/transition |
| Reconnaissance du bon usage du shell | Pas d'analyse des tokens typographiques (productive vs expressive) |
| — | Ne mentionne pas la grille 2x Carbon pour le layout |

### Priorisation produit/UX — 6/10

| Point fort | Point faible |
|---|---|
| PostCard identifié comme priorité haute (correct) | Les états système (404/offline) surévalués en priorité |
| Progressivité de l'approche ("pas tout refaire") | Pas de métriques ou d'impact mesurable |
| — | Pas de persona ou de scénario utilisateur pour justifier |
| — | Absence de la dimension performance perçue |
| — | Le sélecteur de langue est déjà bien implémenté (roving tabindex, `menuitemradio`) — la recommandation de le refaire est discutable |

### Faisabilité technique — 5/10

| Point fort | Point faible |
|---|---|
| Pas de proposition irréaliste | Aucune mention du contexte technique (Deno/Lume/site statique) |
| — | Pas d'estimation d'effort (S/M/L) |
| — | Pas de dépendances identifiées |
| — | La suggestion "Tile/Card Carbon" nécessite une évaluation de faisabilité en SSG |
| — | Pas de critères d'acceptation testables |

---

## 3. Tableau FLOR (Forces / Lacunes / Opportunités / Risques)

| Forces | Lacunes |
|---|---|
| Diagnostic global juste et calibré | Accessibilité non auditée (WCAG, ARIA, clavier) |
| Couverture composant par composant | Responsive/mobile absent |
| Ton professionnel et actionnable | Recommandations floues ("plus standard", "plus explicite") |
| Backlog structuré | Pas de critères d'acceptation |
| Bonne connaissance Carbon | i18n/CJK ignoré malgré support ZH |

| Opportunités | Risques |
|---|---|
| Ajouter une dimension A11y au rapport | Recommander de refaire le sélecteur de langue alors qu'il est déjà conforme |
| Quantifier l'impact des changements | Sur-ingénierie des PostCards (Tile Carbon dans un contexte blog) |
| Intégrer la performance perçue | Perte de la simplicité éditoriale du site |
| Exploiter les container queries existantes | Régressions A11y si migration sans tests |

---

## 4. Revue composant par composant

### 1) Header (`cds--header`)

**Ce qui est bon dans l'audit :**
- Diagnostic correct : le header est solide et Carbon-conforme.
- La suggestion de hiérarchiser les actions pour mobile est pertinente.

**Ce qui manque :**
- L'audit ne mentionne pas que le header implémente déjà un **focus trap** sur le SideNav mobile, un **skip link**, et une gestion `aria-expanded`/`aria-controls` complète — ce sont des forces à documenter.
- Pas de vérification que le header sticky ne masque pas le contenu focusé au clavier.
- Pas d'analyse du comportement `prefers-reduced-motion` (déjà géré via tokens).

**Risques UX/A11y :**
- Les trois panneaux (recherche, langue, thème) doivent garantir qu'un seul est ouvert à la fois — **vérification faite : c'est le cas** (le script `disclosure-controls.js` ferme les autres).
- Le bouton de thème cycle entre 3 états (light/dark/system) : l'`aria-label` doit refléter l'état *suivant*, pas l'état actuel — **à vérifier dans l'implémentation**.

**Recommandation :**
- Ajouter au rapport : "Le header est l'un des composants les plus aboutis du site. Priorité : surveillance, pas refonte."
- Impact : **Faible** | Effort : **S**

---

### 2) Side navigation mobile (`cds--side-nav`)

**Ce qui est bon :** Diagnostic correct, pas de sur-ingénierie proposée.

**Ce qui manque :**
- Pas de mention du comportement modal (overlay, body scroll lock, focus trap) — tout cela est déjà implémenté.
- La suggestion d'ajouter des groupes de navigation est spéculative et non nécessaire actuellement.

**Risques UX/A11y :**
- S'assurer que l'overlay a bien `aria-hidden` inversé par rapport au SideNav — **vérifié : c'est le cas**.

**Recommandation :** Aucune action nécessaire à court terme.
- Impact : **Faible** | Effort : **S**

---

### 3) Recherche (`pagefind`)

**Ce qui est bon :**
- Bonne identification du compromis pragmatique (Pagefind custom stylé en Carbon).
- La suggestion d'ajouter des états vide/erreur est pertinente.

**Ce qui manque :**
- L'implémentation a **déjà** un fallback offline et un message d'erreur avec retry — l'audit ne le mentionne pas.
- Pas de mention du **lazy loading** de Pagefind (bon pour la performance perçue).
- Pas de vérification de l'accessibilité de la zone de résultats Pagefind (ARIA live region pour annoncer le nombre de résultats).

**Risques UX/A11y :**
- Pagefind génère son propre DOM : s'assurer que les résultats ont un `role="status"` ou `aria-live="polite"` pour les lecteurs d'écran.
- Le champ de recherche doit avoir un `aria-label` explicite (Pagefind le gère-t-il ?).

**Recommandation :**
- Vérifier que Pagefind injecte des attributs ARIA appropriés sur les résultats.
- Ajouter un `aria-live="polite"` sur le conteneur de résultats si absent.
- Impact : **Moyen** | Effort : **S**

---

### 4) Sélecteur de langue

**Ce qui est bon :** Identification correcte comme composant custom.

**Ce qui manque — et c'est la plus grosse erreur de l'audit :**
- L'implémentation actuelle utilise **déjà** un pattern `role="menu"` avec `menuitemradio`, roving tabindex, navigation au clavier (flèches, Home/End, Space), et gestion du focus — c'est **conforme ARIA APG**.
- La recommandation de "basculer vers un composant Carbon plus canonique" est **discutable** : Carbon v11 n'a pas de composant "language switcher" natif. Le pattern menu avec `menuitemradio` est le pattern approprié pour une sélection exclusive dans un contexte header.

**Risques UX/A11y :**
- Risque de **régression** si on remplace un composant fonctionnel et accessible par un pattern moins adapté (ex: `<select>` natif perdrait le contrôle visuel, un `Dropdown` Carbon nécessiterait du JS framework).

**Recommandation :**
- **Conserver l'implémentation actuelle.** Documenter les patterns ARIA utilisés.
- Seul ajustement potentiel : vérifier que `aria-checked` est bien annoncé par VoiceOver/NVDA.
- Impact : **Faible** | Effort : **S**

---

### 5) Hero (page d'accueil)

**Ce qui est bon :**
- Observation pertinente sur le côté "custom" du hero.
- La suggestion d'un CTA bouton Carbon est valide.

**Ce qui manque :**
- Pas de mention de la structure `aria-labelledby` déjà en place.
- Pas d'analyse de la typographie expressive vs productive — le hero utilise correctement des tokens expressifs.
- Pas de mention du responsive : le hero a un `max-inline-size: 20ch` sur le titre, ce qui est un bon pattern pour le CJK mais pourrait être trop étroit en français.

**Risques UX/A11y :**
- Les labels "Featured writing" / "Écriture en vedette" varient en longueur selon la langue — vérifier le rendu en ZH-Hans/ZH-Hant.

**Recommandation :**
- Ajouter un lien/bouton Carbon (`cds--btn--secondary`) vers l'archive plutôt qu'un lien nu.
- Tester le hero en toutes les langues supportées.
- Impact : **Moyen** | Effort : **S**

---

### 6) PostCard

**Ce qui est bon :**
- Identifié correctement comme le composant à plus fort ROI.
- La suggestion Tile/Card Carbon est dans la bonne direction.

**Ce qui manque :**
- L'audit ne décrit pas le composant actuel avec précision : c'est un `<article>` avec `<time>`, `<h3><a>`, et `<span>` pour le temps de lecture — structure sémantiquement correcte.
- Pas de mention des container queries déjà en place (responsive via `@container`).
- Pas d'analyse de l'état focus : le lien dans le titre est-il suffisamment visible au focus ?

**Risques UX/A11y :**
- Si on migre vers une Tile cliquable, il faut s'assurer que toute la surface est cliquable (pas juste le titre) tout en conservant un lien sémantique pour les lecteurs d'écran.
- Pattern "card as link" : attention au piège de mettre un `<a>` autour de tout le `<article>` (cela lit tout le contenu comme texte du lien).

**Recommandation concrète :**
- Utiliser le pattern **"clickable card"** : `<article>` avec un `<a>` sur le titre en `::after` stretched pour couvrir toute la carte. Ajouter `position: relative` sur l'article et le pseudo-élément en overlay.
- Ajouter un état `hover` avec `var(--cds-layer-hover)` et un focus ring Carbon.
- Conserver la structure sémantique existante.
- Impact : **Fort** | Effort : **M**

---

### 7) Breadcrumb (`cds--breadcrumb`)

**Ce qui est bon :** Diagnostic correct, aucune action nécessaire.

**Ce qui manque :**
- L'audit devrait mentionner que l'implémentation inclut déjà `aria-label` et `aria-current="page"` — c'est un bon point à documenter.

**Recommandation :** Aucune.
- Impact : **Très faible** | Effort : **S**

---

### 8) Tags (catégories + années)

**Ce qui est bon :**
- Observation pertinente sur le détournement des tags pour la navigation annuelle.

**Ce qui manque :**
- L'audit ne mentionne pas l'algorithme de coloration par hash — c'est un pattern intelligent qui évite l'attribution manuelle.
- Pas d'analyse des couleurs de tags en mode sombre (le code utilise `oklch()` pour ajuster — vérifier le contraste).
- La suggestion "tabs ou filter chips" est vague : sur un site statique, des anchor links sont le pattern le plus simple et robuste.

**Risques UX/A11y :**
- Les tags utilisés comme navigation doivent avoir un `role` approprié — actuellement ce sont des `<a>` dans des `<span class="cds--tag">`, ce qui est sémantiquement correct.
- Vérifier le contraste des tags colorés en mode sombre (oklch peut produire des résultats à faible contraste).

**Recommandation :**
- Conserver les anchor links plutôt que de migrer vers tabs (inadapté au SSG).
- Ajouter une `nav` avec `aria-label="Navigation par année"` autour des tags de navigation annuelle si ce n'est pas déjà fait.
- Vérifier le contraste WCAG AA des 7 couleurs de tags × 2 thèmes.
- Impact : **Moyen** | Effort : **S**

---

### 9) Archive par année

**Ce qui est bon :**
- La suggestion d'accordéon pour beaucoup d'années est raisonnable.

**Ce qui manque :**
- Le rapport ne mentionne pas `content-visibility: auto` déjà utilisé sur les sections — excellent pour la performance de rendu.
- Pas de mention de la navigation `aria-label` et `aria-labelledby` déjà en place.
- La suggestion de "navigation sticky" est pertinente mais doit être évaluée en contexte mobile.

**Risques UX/A11y :**
- `content-visibility: auto` peut causer des problèmes avec les anchor links (le navigateur doit rendre la section cible) — à tester.

**Recommandation :**
- Pas de refonte majeure nécessaire.
- Tester la compatibilité `content-visibility` + anchor scroll dans tous les navigateurs cibles.
- Impact : **Faible** | Effort : **S**

---

### 10) Page article

**Ce qui est bon :**
- La suggestion de renforcer la navigation prev/next est pertinente.

**Ce qui manque :**
- Pas de mention du bouton "copier le code" — un composant custom qui devrait suivre le pattern Carbon pour le focus ring.
- Pas d'analyse de la lisibilité du contenu long (mesure typographique, espacement inter-paragraphes).
- La navigation prev/next a déjà un `aria-label` sur le `<nav>` et des `aria-hidden` sur les placeholders vides.

**Risques UX/A11y :**
- Le bouton de copie de code doit être atteignable au clavier et annoncer le résultat (succès/échec) via `aria-live` ou un changement de label temporaire.
- Les blocs de code longs doivent être scrollables horizontalement avec un focus visible sur le conteneur.

**Recommandation :**
- Transformer la nav prev/next en tiles Carbon légères (fond `--cds-layer`, hover `--cds-layer-hover`, border `--cds-border-subtle`).
- Vérifier l'annonce du feedback de copie pour les lecteurs d'écran.
- Impact : **Moyen** | Effort : **M**

---

### 11) Footer

**Ce qui est bon :** Diagnostic pragmatique ("suffisant pour un blog personnel").

**Ce qui manque :**
- Le footer utilise des `aria-label` sur les liens (GitHub, RSS) — c'est un bon point à documenter.
- Pas de vérification que les icônes SVG ont bien `aria-hidden="true"` avec un label sur le `<a>` parent.

**Recommandation :**
- Ajouter le lien JSON Feed si absent (le site en génère un).
- Structurer avec `<footer role="contentinfo">` si ce n'est pas déjà un `<footer>`.
- Impact : **Faible** | Effort : **S**

---

### 12) États système (404 / offline / empty)

**Ce qui est bon :**
- Identification correcte du besoin d'harmonisation.

**Ce qui manque — et survalorisation de la priorité :**
- L'audit met cette section en "Haute priorité" mais ces pages sont **rarement vues** par les utilisateurs. L'impact UX réel est **moyen**, pas haut.
- Les pages 404 et offline utilisent déjà des tokens Carbon typographiques (`cds-expressive-heading-04`, `cds-productive-body-long-02`) et des couleurs Carbon.
- L'audit ne mentionne pas le pattern **Empty States** de Carbon v11 (documenté sur carbondesignsystem.com/components/empty-states/usage/) — c'est pourtant la référence exacte pour ces cas.

**Risques UX/A11y :**
- La page offline doit fonctionner sans JS (service worker context).
- Le lien "retour accueil" doit être un vrai `<a>`, pas un bouton avec `onclick` — **vérifié : c'est bien un `<a>`**.

**Recommandation :**
- Aligner sur le pattern [Empty States Carbon](https://carbondesignsystem.com/components/empty-states/usage/) : illustration optionnelle, heading, description, action primaire (bouton).
- Remplacer le lien nu "retour accueil" par un `cds--btn cds--btn--secondary`.
- Ramener la priorité de **Haute** à **Moyenne**.
- Impact : **Moyen** | Effort : **S**

---

## 5. Compléments manquants au rapport original

### 5.1 Accessibilité (WCAG 2.2 AA)

| Dimension | État actuel (vérifié dans le code) | Recommandation |
|---|---|---|
| Skip link | Présent, visible au focus | Aucune action |
| Focus visible | Focus ring custom (3px, 2px offset) | Vérifier cohérence sur tous les composants custom |
| `aria-current` | Présent sur nav et breadcrumb | Aucune action |
| `aria-expanded` | Présent sur tous les toggles header | Aucune action |
| Focus trap (modaux) | SideNav mobile : oui | Aucune action |
| `prefers-reduced-motion` | Durées à 0ms | Aucune action |
| `prefers-contrast: more` | Bordures et textes renforcés | Aucune action |
| Annonce résultats recherche | Non vérifié (Pagefind) | Ajouter `aria-live="polite"` sur le conteneur de résultats |
| Contraste tags colorés dark mode | Non vérifié | Auditer les 7 couleurs × 2 thèmes avec un outil de contraste |
| Code copy feedback | Non vérifié | Vérifier annonce pour lecteurs d'écran |

### 5.2 Responsive / Mobile

| Dimension | État actuel | Recommandation |
|---|---|---|
| SideNav mobile | Modal avec overlay | Aucune action |
| PostCard responsive | Container queries (`@container`) | Aucune action |
| Archive `content-visibility` | Optimisation render | Tester anchor scroll |
| Header panels mobile | Pleine largeur | Vérifier usabilité sur petits écrans (320px) |
| Hero titre `max-inline-size` | 20ch | Vérifier avec libellés ZH (plus courts) et FR (plus longs) |

### 5.3 Internationalisation

| Dimension | État actuel | Recommandation |
|---|---|---|
| Langues supportées | EN, FR, ZH-Hans, ZH-Hant | Aucune action structurelle |
| Polices CJK | Noto Sans SC/TC en fallback | Vérifier le chargement (taille des fichiers) |
| Longueur des labels | Variable selon langue | Tester tous les boutons/labels en FR (souvent plus long que EN) |
| `lang` attribut | Dynamique sur `<html>` | Aucune action |
| `hreflang` alternatives | À vérifier | S'assurer que les `<link rel="alternate" hreflang>` sont présents |

### 5.4 Performance perçue

| Dimension | État actuel | Recommandation |
|---|---|---|
| Pagefind lazy load | Oui, au clic | Aucune action |
| Link prefetch | Intent-based (hover/focus) | Aucune action |
| Service worker | Présent | Aucune action |
| Anti-flash script | Présent (thème) | Aucune action |
| `content-visibility` | Sur archive | Aucune action |
| Scripts `defer` + `fetchpriority="low"` | Oui | Aucune action |

### 5.5 Cohérence des états d'interaction

| Composant | hover | focus | active | disabled |
|---|---|---|---|---|
| Header nav links | `--cds-layer-hover` | Focus ring | Non spécifié | N/A |
| Header action buttons | `--cds-layer-hover` | Focus ring | Non spécifié | N/A |
| PostCard title link | Underline | Focus ring à vérifier | Non spécifié | N/A |
| Breadcrumb links | Underline | Focus ring | Non spécifié | N/A |
| Tags | Non vérifié | Non vérifié | Non vérifié | N/A |
| Prev/Next links | Non vérifié | Non vérifié | Non vérifié | N/A |
| Footer links | Non vérifié | Non vérifié | Non vérifié | N/A |

**Recommandation :** Auditer systématiquement hover/focus/active sur tous les éléments interactifs. S'assurer que le focus ring est visible sur fond clair ET sombre.

---

## 6. Backlog priorisé amélioré

### Quick wins (1-2 semaines)

| # | Action | Pourquoi | Impact | Effort | Dépendances | Critère d'acceptation |
|---|---|---|---|---|---|---|
| QW-1 | Ajouter état hover/focus sur PostCard | Le composant le plus répété manque de feedback interactif | Fort | S | Aucune | Hover : fond `--cds-layer-hover`. Focus : focus ring Carbon visible. Teste au clavier. |
| QW-2 | Remplacer le lien "retour accueil" par un bouton Carbon sur 404/offline | Alignement Carbon Empty States, meilleure affordance | Moyen | S | Aucune | Bouton `cds--btn--secondary` visible, focusable, avec label accessible. |
| QW-3 | Ajouter `aria-live="polite"` sur les résultats Pagefind | Annonce des résultats pour lecteurs d'écran | Moyen | S | Vérifier le DOM généré par Pagefind | NVDA/VoiceOver annonce "X résultats trouvés" après saisie. |
| QW-4 | Auditer le contraste des tags colorés en dark mode | Les tags oklch() pourraient avoir un contraste insuffisant | Moyen | S | Outil de contraste (axe, Lighthouse) | 7 couleurs × 2 thèmes passent WCAG AA (4.5:1 texte, 3:1 UI). |
| QW-5 | Ajouter un CTA bouton vers l'archive sur le hero | Meilleure découvrabilité de l'archive | Faible | S | Aucune | Bouton `cds--btn--secondary` sous le lead du hero. |

### V2 (1-2 mois)

| # | Action | Pourquoi | Impact | Effort | Dépendances | Critère d'acceptation |
|---|---|---|---|---|---|---|
| V2-1 | Transformer PostCard en "clickable card" | Zone cliquable élargie, feedback visuel cohérent | Fort | M | QW-1 (hover/focus d'abord) | Toute la surface de la carte est cliquable. Le lien titre reste le seul `<a>`. Focus ring sur la carte entière. |
| V2-2 | Enrichir la navigation prev/next (post) | Meilleure affordance, alignement Carbon | Moyen | M | Aucune | Tiles avec fond `--cds-layer`, hover `--cds-layer-hover`, focus ring, titre du post visible. |
| V2-3 | Renforcer le pattern de recherche | États vide/erreur/offline plus visuels | Moyen | M | QW-3 (ARIA d'abord) | Message d'état stylé Carbon, icône, action retry. Test offline. |
| V2-4 | Vérifier `content-visibility` + anchor scroll | Risque de régression navigation archive | Faible | S | Aucune | Anchor links fonctionnent dans Chrome, Firefox, Safari. |
| V2-5 | Tester rendu multilingue de tous les composants | Labels FR/ZH peuvent déborder ou être tronqués | Moyen | S | Aucune | Tous les boutons, labels, breadcrumbs affichent correctement en 4 langues. |

### V3 (long terme)

| # | Action | Pourquoi | Impact | Effort | Dépendances | Critère d'acceptation |
|---|---|---|---|---|---|---|
| V3-1 | Implémenter la grille Carbon 2x sur le layout global | Cohérence structurelle avec le design system | Moyen | L | Audit complet du layout actuel | Toutes les pages utilisent `cds--grid` / `cds--col` ou équivalent CSS Grid aligné sur la grille 2x. |
| V3-2 | Navigation sticky année (archive) si > 5 années | Réduction du scroll sur archive longue | Faible | M | V2-4 | Nav année fixe en scroll sur desktop, inline sur mobile. |
| V3-3 | Support RTL si ajout de langues arabes/hébraïques | Internationalisation complète | Faible | L | Architecture CSS existante | `dir="rtl"` n'inverse rien de cassé. |
| V3-4 | Ajout `<link rel="alternate" hreflang>` complet | SEO multilingue | Moyen | S | Aucune | Chaque page inclut les 4 alternatives de langue dans `<head>`. |
| V3-5 | Dark mode high contrast (G100) comme option | Accessibilité renforcée | Faible | M | Déjà partiellement supporté (G100 dans tokens) | Toggle accessible, thème G100 activable, contraste vérifié. |

---

## 7. Rapport amélioré — Version intégrable

> Ce qui suit est la **réécriture complète** du rapport, prête à remplacer la version originale.

---

# Audit visuel Carbon v11 — Revue des composants

**Date :** 2026-03-16
**Périmètre :** Pages générées (`/`, `/posts/`, `/posts/<slug>/`, `/about/`, `/offline/`, `404`) + composants TSX/SCSS.
**Méthode :** Revue du code source (TSX, SCSS, JS) + vérification des classes Carbon, tokens, et patterns ARIA.
**Référence :** [Carbon Design System v11](https://carbondesignsystem.com/) — [Tokens](https://carbondesignsystem.com/guidelines/tokens/overview/) — [Accessibilité](https://carbondesignsystem.com/guidelines/accessibility/overview/)

---

## Synthèse

Le site atteint un **excellent niveau d'alignement Carbon v11** :

- Shell complet (`cds--header`, `cds--side-nav`, `cds--breadcrumb`, `cds--tag`).
- Tokens `--cds-*` comme unique source de design (couleurs, espacement, typographie, motion).
- Accessibilité solide : skip link, `aria-expanded`, `aria-controls`, `aria-current`, focus trap, `prefers-reduced-motion`, `prefers-contrast: more`.
- Performance : lazy loading Pagefind, `content-visibility: auto`, prefetch intent, service worker.

**Les axes d'amélioration sont des montées de niveau**, pas des corrections :

1. **PostCard** : ajouter feedback interactif (hover/focus) et zone cliquable élargie.
2. **États système** : aligner 404/offline sur le pattern [Empty States Carbon](https://carbondesignsystem.com/components/empty-states/usage/).
3. **Accessibilité de la recherche** : vérifier les annonces ARIA des résultats Pagefind.
4. **Contraste dark mode** : auditer les tags colorés oklch().

---

## Revue par composant

### Header + Navigation — Score : 9/10

**État :** Complet et conforme. Classes Carbon, ARIA, focus management, disclosure pattern.

| Aspect | Détail |
|---|---|
| Classes | `cds--header`, `cds--header__action`, `cds--header__panel`, etc. |
| ARIA | `aria-expanded`, `aria-controls`, `aria-current="page"`, `aria-haspopup` |
| Clavier | Tab, Escape, focus restoration |
| Motion | Respecte `prefers-reduced-motion` |

**Action :** Aucune refonte. Surveillance uniquement.

---

### Side Nav mobile — Score : 9/10

**État :** Modal conforme avec overlay, body scroll lock, focus trap.

**Action :** Aucune.

---

### Recherche (Pagefind) — Score : 7/10

**État :** Bon compromis. Lazy loading, fallback offline, styling Carbon via variables CSS.

| Force | Lacune |
|---|---|
| Lazy loading performant | Annonce ARIA des résultats non vérifiée |
| Fallback offline avec retry | Le DOM Pagefind est hors de notre contrôle |
| Tokens Carbon mappés | Pas de `aria-live` sur le conteneur de résultats |

**Actions :**
1. Ajouter `aria-live="polite"` sur `.pagefind-ui__results` (post-init).
2. Vérifier que le champ de recherche a un `aria-label` ou `<label>` associé.
3. Tester avec NVDA et VoiceOver.

**Effort : S** | **Impact : Moyen**

---

### Sélecteur de langue — Score : 8/10

**État :** Pattern `role="menu"` avec `menuitemradio`, roving tabindex, navigation clavier complète (flèches, Home/End, Space). **Conforme ARIA APG.**

**Action :** Conserver. Vérifier l'annonce de `aria-checked` sur les lecteurs d'écran principaux.

**Effort : S** | **Impact : Faible**

---

### Hero (accueil) — Score : 7/10

**État :** Visuellement propre, tokens expressifs Carbon, `aria-labelledby` en place.

| Force | Lacune |
|---|---|
| Typographie expressive | Pas de CTA bouton vers l'archive |
| Structure sémantique | `max-inline-size: 20ch` à tester en FR/ZH |

**Actions :**
1. Ajouter un bouton `cds--btn cds--btn--secondary` vers `/posts/`.
2. Tester le hero en FR (labels plus longs) et ZH (labels plus courts).

**Effort : S** | **Impact : Moyen**

---

### PostCard — Score : 6/10 → Priorité haute

**État :** Sémantiquement correct (`<article>`, `<time>`, `<h3><a>`), responsive via container queries. Mais : pas de feedback hover/focus sur la carte, zone cliquable limitée au titre.

**Actions (en 2 phases) :**

**Phase 1 — Quick win :**
- Ajouter hover : `background-color: var(--cds-layer-hover)`.
- Ajouter focus-within : focus ring Carbon sur l'article.
- Transition : `var(--cds-transition-default)`.

**Phase 2 — V2 :**
- Pattern "clickable card" : pseudo-élément `::after` stretched sur le `<a>` du titre.
- Toute la surface est cliquable sans wrapper `<a>` englobant (préserve la sémantique).

**Effort : S (phase 1) / M (phase 2)** | **Impact : Fort**

---

### Breadcrumb — Score : 10/10

**État :** `cds--breadcrumb` complet, `aria-label`, `aria-current="page"`.

**Action :** Aucune.

---

### Tags — Score : 7.5/10

**État :** `cds--tag` avec coloration par hash (7 couleurs). Utilisés pour la taxonomie (correct) et la navigation année (détournement acceptable).

**Actions :**
1. Auditer contraste WCAG AA des 7 couleurs × 2 thèmes (priorité dark mode oklch).
2. S'assurer que la navigation par année est dans un `<nav aria-label="...">`.

**Effort : S** | **Impact : Moyen**

---

### Archive — Score : 8/10

**État :** Structuré, performant (`content-visibility`), accessible (`aria-labelledby` par section).

**Action :** Tester la compatibilité `content-visibility: auto` + anchor links dans les navigateurs cibles.

**Effort : S** | **Impact : Faible**

---

### Page article — Score : 7.5/10

**État :** Métadonnées, tags, contenu, navigation prev/next. Breadcrumb Carbon. Bouton copie code custom.

**Actions :**
1. Vérifier que le bouton copie annonce le feedback aux lecteurs d'écran.
2. V2 : transformer la nav prev/next en tiles Carbon légères.

**Effort : S (feedback) / M (tiles)** | **Impact : Moyen**

---

### Footer — Score : 7/10

**État :** Minimal mais fonctionnel. `aria-label` sur les liens. Icônes `aria-hidden`.

**Action :** Aucune refonte nécessaire. Ajout optionnel du lien JSON Feed.

**Effort : S** | **Impact : Faible**

---

### États système (404 / offline) — Score : 6.5/10

**État :** Pages dédiées avec tokens Carbon typographiques. Fonctionnelles mais pas alignées sur le pattern [Empty States](https://carbondesignsystem.com/components/empty-states/usage/).

**Actions :**
1. Remplacer le lien "retour accueil" par un bouton `cds--btn cds--btn--secondary`.
2. Structurer selon le pattern Empty States : heading + description + action primaire.
3. Optionnel : ajouter une illustration sobre.

**Effort : S** | **Impact : Moyen**

---

## Backlog priorisé

### Quick wins (1-2 semaines)

1. **QW-1** — Hover/focus sur PostCard (`--cds-layer-hover`, focus ring)
2. **QW-2** — Bouton Carbon sur 404/offline (remplace lien nu)
3. **QW-3** — `aria-live` sur résultats Pagefind
4. **QW-4** — Audit contraste tags dark mode
5. **QW-5** — CTA bouton archive sur hero

### V2 (1-2 mois)

1. **V2-1** — PostCard clickable card (pseudo-élément stretched)
2. **V2-2** — Nav prev/next en tiles Carbon
3. **V2-3** — Pattern recherche enrichi (états visuels)
4. **V2-4** — Test `content-visibility` + anchors
5. **V2-5** — Test rendu multilingue complet

### V3 (long terme)

1. **V3-1** — Grille Carbon 2x sur le layout global
2. **V3-2** — Navigation sticky archive
3. **V3-4** — `hreflang` alternatives SEO
4. **V3-5** — Thème G100 high contrast en option

---

## Méthodologie de validation

Pour chaque item du backlog, valider avec :

- **Visuel :** Capture avant/après dans les 2 thèmes (light/dark).
- **A11y :** Test clavier (Tab, Enter, Escape) + lecteur d'écran (VoiceOver macOS, NVDA Windows).
- **Responsive :** Viewports 320px, 768px, 1440px.
- **i18n :** Vérifier en EN, FR, ZH-Hans, ZH-Hant.
- **Scanner :** `deno run --allow-read --allow-write tools/carbon_repo_scanner.ts .` → score maintenu à 100/100.
