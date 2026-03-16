# Audit visuel Carbon — revue des composants du site buildé

Date: 2026-03-16  
Périmètre: pages générées dans `_site` (`/`, `/posts/`, `/posts/<slug>/`, `/about/`, `/offline/`, `404`) + composants TSX/SCSS associés.

## Synthèse

Le site est déjà **très bien aligné Carbon** (scanner à 100/100), avec une implémentation solide du shell (`Header`, `Side nav`, `Breadcrumb`, `Tag`) et des tokens `--cds-*`.

Les meilleures opportunités d’amélioration ne sont **pas des corrections de conformité**, mais des **montées de niveau de patterns Carbon** pour gagner en cohérence UX:

1. Remplacer certaines constructions “maison” par des patterns Carbon plus explicites (ex: `PostCard`, navigation précédent/suivant, sections d’archives).
2. Uniformiser les zones d’actions (liens simples → boutons Carbon selon le contexte).
3. Renforcer la sémantique “état” (offline, 404, vide) via des patterns Carbon de notification/état.

---

## Revue composant par composant (avec proposition Carbon)

### 1) En-tête global (`Header`) + navigation principale

- **Actuel**: `cds--header`, actions globales, side nav mobile, search panel, sélecteur de langue, thème.  
- **Évaluation**: Très bon niveau; pattern Carbon respecté.
- **Proposition “mieux”**:
  - Conserver l’architecture actuelle.
  - Option d’amélioration: structurer les actions globales “langue/thème/recherche” autour d’une hiérarchie d’actions Carbon plus stricte (action primaire vs utilitaires), pour réduire la charge cognitive sur mobile.
  - Si le site grandit: envisager un pattern “Header + switcher” plus explicite pour langues/thèmes (menu dédié plutôt que juxtaposition d’icônes).
- **Priorité**: Faible.

### 2) Side navigation mobile

- **Actuel**: `cds--side-nav` + overlay.
- **Évaluation**: Correct et cohérent Carbon.
- **Proposition “mieux”**:
  - Ajouter (si besoin futur) des groupes de navigation (sections) avec intitulés pour améliorer la découvrabilité quand le nombre de pages augmente.
- **Priorité**: Faible (anticipation croissance).

### 3) Recherche dans le header

- **Actuel**: panel de recherche + personnalisation UI (`pagefind`) aux couleurs/tokens Carbon.
- **Évaluation**: Bon compromis pratique.
- **Proposition “mieux”**:
  - Si vous voulez coller encore plus à Carbon: encapsuler l’entrée de recherche dans un pattern proche `Search` Carbon (anatomie, feedback, clear action), et limiter le style “sur-mesure” au strict minimum.
  - Ajouter des états visuels Carbon-like “résultat vide / erreur offline” avec une zone de message standardisée.
- **Priorité**: Moyenne.

### 4) Sélecteur de langue

- **Actuel**: panneau custom en style header, options radio (`menuitemradio`).
- **Évaluation**: Fonctionnel et accessible.
- **Proposition “mieux”**:
  - Basculer vers un pattern Carbon de sélection plus standard (menu/listbox/select selon le contexte), pour un comportement plus familier clavier/lecteurs d’écran.
- **Priorité**: Moyenne.

### 5) Hero de page d’accueil (`home`)

- **Actuel**: bloc éditorial sobre (`eyebrow`, titre, lead) + section “posts récents”.
- **Évaluation**: Visuellement propre, mais très “custom”.
- **Proposition “mieux”**:
  - Introduire une structure de contenu Carbon plus systématique (grille + zones typographiques productives) pour homogénéiser avec les autres pages.
  - Ajouter un CTA Carbon explicite (bouton secondaire vers archive) au lieu d’un lien nu selon l’objectif éditorial.
- **Priorité**: Moyenne.

### 6) Cartes d’articles (`PostCard`)

- **Actuel**: composant minimal (date + titre + temps de lecture).
- **Évaluation**: Efficace, mais pas un pattern Carbon “riche”.
- **Proposition “mieux”**:
  - Migrer vers une vraie structure de **Tile/Card** Carbon (cliquable, zones de métadonnées, état hover/focus plus standardisé).
  - Cela aidera la cohérence visuelle entre home, archive et futurs modules (articles liés, recommandations, etc.).
- **Priorité**: Haute (meilleur ROI UX).

### 7) Breadcrumb (archive + détail article)

- **Actuel**: `cds--breadcrumb`.
- **Évaluation**: Très bien, déjà aligné.
- **Proposition “mieux”**:
  - Aucune refonte nécessaire.
  - Option: tronquage intelligent si profondeur de navigation augmente un jour.
- **Priorité**: Très faible.

### 8) Tags (catégories + années)

- **Actuel**: `cds--tag` colorés pour post tags et navigation année.
- **Évaluation**: Bon usage du composant.
- **Proposition “mieux”**:
  - Pour la navigation annuelle, préférer éventuellement un pattern de navigation/filtre explicite (tabs, anchor nav, filter chips selon usage) plutôt qu’un tag “détourné”.
  - Garder les tags colorés pour la taxonomie éditoriale.
- **Priorité**: Moyenne.

### 9) Archive par année

- **Actuel**: sections par année + nav d’ancrage + liste de `PostCard`.
- **Évaluation**: Lisible et robuste.
- **Proposition “mieux”**:
  - Si beaucoup d’années: envisager un pattern Carbon de **contenu structuré** type accordéon (réduction de longueur perçue) ou une navigation secondaire sticky.
  - Ajouter un compteur/état plus visuel par année (badge ou métadonnée de section normalisée).
- **Priorité**: Moyenne.

### 10) Page article (entête + contenu + navigation prev/next)

- **Actuel**: titre, métadonnées, tags, contenu, liens précédent/suivant.
- **Évaluation**: Très correct.
- **Proposition “mieux”**:
  - Transformer la navigation précédent/suivant en pattern plus “composant” (ex: item list/tile cliquable avec zone active claire) plutôt que lien texte simple.
  - Si vous ajoutez “articles liés”, préférer une grille de tuiles Carbon cohérente avec `PostCard` remanié.
- **Priorité**: Moyenne.

### 11) Footer

- **Actuel**: footer minimal custom (copyright + icônes GitHub/RSS).
- **Évaluation**: Suffisant pour un blog personnel.
- **Proposition “mieux”**:
  - Si vous voulez un rendu plus “design system”: structurer le footer avec colonnes/sections (navigation secondaire, feeds, social) dans la grille Carbon.
- **Priorité**: Faible.

### 12) États système (offline / 404 / empty states)

- **Actuel**: pages dédiées, style éditorial sobre.
- **Évaluation**: Fonctionnel.
- **Proposition “mieux”**:
  - Harmoniser ces états avec des patterns Carbon de notification/état (message, action principale, action secondaire).
  - Uniformiser la hiérarchie d’actions (retour accueil, retry, etc.) via boutons Carbon explicites.
- **Priorité**: Haute (impact UX immédiat).

---

## Backlog priorisé (proposition)

### Quick wins

1. Refondre `PostCard` en pattern Tile/Card Carbon (home + archive).  
2. Standardiser les états `offline`, `404`, “vide” avec un pattern d’état Carbon commun.  
3. Revoir la navigation “années” (tags → navigation de filtre explicite).

### V2

4. Renforcer le pattern de recherche (états vides/erreur plus standardisés).  
5. Normaliser le sélecteur de langue vers un composant de sélection Carbon plus canonique.  
6. Rationaliser la hiérarchie d’actions du header pour mobile.

---

## Conclusion

Votre base actuelle est saine et déjà Carbon-friendly.  
La meilleure stratégie n’est pas “tout refaire”, mais **faire évoluer les composants les plus visibles et répétés** (`PostCard`, états système, navigation d’archive) vers des patterns Carbon plus explicites et plus “productifs”.
