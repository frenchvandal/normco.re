# Handoff développeurs — Blog Lume + Carbon + widget Telegram

## Convention de sources

### Sources Carbon

Toujours référencer la page officielle correspondante du Carbon Design System.

### Sources JSON du repo

Les exports JSON Figma/Carbon utilisés pour ce document sont **stockés dans le
répertoire `design/` à la racine du repo**.

**Convention à utiliser dans le projet :**

- `design/Theme.json`
- `design/Layer.json`
- `design/Spacing.json`
- `design/Radius.json`
- `design/Breakpoint.json`
- `design/Breakpoint LG–XL.json`
- `design/Breakpoint Max-Max+.json`
- `design/Grid mode.json`
- `design/Column span.json`
- `design/Aside.json`
- `design/Modal.json`
- `design/Content switcher.json`
- `design/Colors.json`
- `design/Colors pictogram.json`
- `design/Color palette.json`
- `design/Color palette 1.json`
- `design/Color palette 2.json`
- `design/Color palette 3.json`
- `design/Color palette 4.json`
- `design/Numbers.json`

---

## 1. Fondations

| Section     | Décision                                                                        | Do                                                                                                               | Don’t                                   | Source Carbon                                                                 | Source JSON dans le repo                                                                    |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Thèmes      | Supporter White, Gray 10, Gray 90, Gray 100                                     | Utiliser uniquement des tokens sémantiques ; préparer clair/sombre                                               | Pas de couleurs codées en dur           | [Themes overview](https://carbondesignsystem.com/elements/themes/overview/)   | `design/Theme.json`                                                                         |
| Layers      | Page = Background ; module secondaire = Layer 01 ; sous-module = Layer 02       | Utiliser Layer 01 pour les blocs secondaires                                                                     | Pas de faux fond “card” hors système    | [Themes overview](https://carbondesignsystem.com/elements/themes/overview/)   | `design/Layer.json`, `design/Theme.json`                                                    |
| Spacing     | Échelle Carbon stricte                                                          | 8 = micro-gap ; 16 = padding standard ; 24 = séparation moyenne ; 32–40 = séparation forte ; 48–64 = respiration | Pas de 18/20/28/36 arbitraires          | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) | `design/Spacing.json`, `design/Numbers.json`                                                |
| Radius      | Coins carrés par défaut ; round seulement si justifié                           | Garder les surfaces sobres                                                                                       | Pas d’arrondis décoratifs partout       | [Tile usage](https://carbondesignsystem.com/components/tile/usage/)           | `design/Radius.json`                                                                        |
| Breakpoints | 320 / 672 / 1056 / 1312 / 1584 / 1784                                           | Définir le responsive sur ces vrais seuils                                                                       | Pas de breakpoints maison non alignés   | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) | `design/Breakpoint.json`, `design/Breakpoint LG–XL.json`, `design/Breakpoint Max-Max+.json` |
| Grille      | Wide en desktop ; Narrow pour contenus resserrés ; Nested pour sous-composition | Standardiser la mise en page desktop sur Wide                                                                    | Pas de Condensed pour la lecture longue | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) | `design/Grid mode.json`, `design/Column span.json`                                          |

---

## 2. Shell

| Section             | Décision                                                     | Do                                                    | Don’t                                                  | Source Carbon                                                                                                                                                                                             | Source JSON dans le repo                                        |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Header global       | Le header contient hamburger, marque, nav, recherche, langue | Header stable, persistant, purement navigationnel     | Pas de Telegram, pas d’articles récents dans le header | [UI shell header / usage](https://carbondesignsystem.com/components/UI-shell-header/usage/) ; [UI shell header / style](https://carbondesignsystem.com/components/UI-shell-header/style/)                 | `design/Theme.json`, `design/Layer.json`, `design/Spacing.json` |
| Navigation mobile   | Panneau latéral mobile simple                                | Home, Writing, About, Archive, langue, thème éventuel | Pas de contenu éditorial dans le panneau               | [UI shell left panel / usage](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/) ; [UI shell left panel / style](https://carbondesignsystem.com/components/UI-shell-left-panel/style/) | `design/Aside.json`, `design/Breakpoint.json`                   |
| Recherche           | Recherche compacte intégrée au header                        | UI Carbon, moteur libre côté Lume, clavier OK         | Pas de bloc de recherche surdimensionné                | [Search / usage](https://carbondesignsystem.com/components/search/usage/) ; [Search / style](https://carbondesignsystem.com/components/search/style/)                                                     | `design/Layer.json`, `design/Theme.json`, `design/Spacing.json` |
| Sélecteur de langue | Dropdown standard compact                                    | Accessible clavier ; intégré proprement au header     | Pas de menu gadget                                     | [Dropdown / usage](https://carbondesignsystem.com/components/dropdown/usage/) ; [Dropdown / style](https://carbondesignsystem.com/components/dropdown/style/)                                             | `design/Layer.json`, `design/Theme.json`, `design/Spacing.json` |

---

## 3. Home

| Section         | Décision                                         | Do                                                                       | Don’t                                                                         | Source Carbon                                                                                                                                                                                                                 | Source JSON dans le repo                                                                                                                                                                                |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero            | Bloc éditorial, pas une card                     | Eyebrow, H1, baseline, respiration forte                                 | Pas de look applicatif                                                        | [Typography overview](https://carbondesignsystem.com/elements/typography/overview/) ; [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/)                                                           | `design/Breakpoint.json`, `design/Breakpoint LG–XL.json`, `design/Spacing.json`                                                                                                                         |
| Recent writing  | Contenu principal de la home                     | Liste sobre, date secondaire, titre en lien, lien archive séparé         | Ne pas concurrencer visuellement cette section                                | [Link / usage](https://carbondesignsystem.com/components/link/usage/) ; [Link / style](https://carbondesignsystem.com/components/link/style/)                                                                                 | `design/Spacing.json`, `design/Theme.json`                                                                                                                                                              |
| Widget Telegram | Module secondaire de contenu sous Recent writing | Surface sur Layer 01, 3 messages max, CTA final, visuellement secondaire | Pas dans le header, pas dans la nav mobile, pas au-dessus des billets récents | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) ; [Tile / usage](https://carbondesignsystem.com/components/tile/usage/) ; [Link / usage](https://carbondesignsystem.com/components/link/usage/) | `design/Layer.json`, `design/Theme.json`, `design/Spacing.json`, `design/Radius.json`, `design/Breakpoint.json`, `design/Breakpoint LG–XL.json`, `design/Breakpoint Max-Max+.json`, `design/Aside.json` |
| Footer          | Footer léger et aligné à la grille               | Peu de liens, typographie secondaire                                     | Pas de surcharge ni de second widget social                                   | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) ; [Link / usage](https://carbondesignsystem.com/components/link/usage/)                                                                         | `design/Spacing.json`, `design/Theme.json`                                                                                                                                                              |

---

## 4. Archive

| Section        | Décision                                                | Do                                                 | Don’t                                             | Source Carbon                                                                     | Source JSON dans le repo                                                                                                                                |
| -------------- | ------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breadcrumb     | Recommandé sur archive                                  | `Home / Writing / Archive` sous le header          | Pas de hiérarchie inutilement profonde            | [Breadcrumb / usage](https://carbondesignsystem.com/components/breadcrumb/usage/) | `design/Spacing.json`, `design/Theme.json`                                                                                                              |
| Filtres / Tags | Utiliser les couleurs de tags pour de vraies catégories | Peu de couleurs ; focus visible ; taxonomie claire | Pas de patchwork chromatique                      | [Tag / usage](https://carbondesignsystem.com/components/tag/usage/)               | `design/Color palette.json`, `design/Color palette 1.json`, `design/Color palette 2.json`, `design/Color palette 3.json`, `design/Color palette 4.json` |
| Pagination     | Pagination de navigation en bas de l’archive            | Accessible, claire, alignée à la grille            | Pas de logique “data table” si archive éditoriale | [Pagination / usage](https://carbondesignsystem.com/components/pagination/usage/) | `design/Spacing.json`, `design/Breakpoint.json`                                                                                                         |

---

## 5. Article

| Section             | Décision                                                | Do                                 | Don’t                                     | Source Carbon                                                                                                                                             | Source JSON dans le repo                                                                                                                                |
| ------------------- | ------------------------------------------------------- | ---------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Métadonnées / Tags  | Tags read-only et discrets                              | Peu de tags, cohérence chromatique | Pas de tags qui ressemblent à des CTA     | [Tag / usage](https://carbondesignsystem.com/components/tag/usage/) ; [Typography overview](https://carbondesignsystem.com/elements/typography/overview/) | `design/Color palette.json`, `design/Color palette 1.json`, `design/Color palette 2.json`, `design/Color palette 3.json`, `design/Color palette 4.json` |
| Liens dans le corps | Inline links dans le texte, standalone links hors texte | Différencier les usages            | Pas de liens stylés comme boutons partout | [Link / usage](https://carbondesignsystem.com/components/link/usage/) ; [Link / style](https://carbondesignsystem.com/components/link/style/)             | `design/Theme.json`, `design/Spacing.json`                                                                                                              |

---

## 6. About

| Section                | Décision                                    | Do                                 | Don’t                              | Source Carbon                                                                                                                                                       | Source JSON dans le repo                        |
| ---------------------- | ------------------------------------------- | ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Structure générale     | Page éditoriale, sobre, alignée à la grille | Structure lisible, rythme cohérent | Pas de landing page lourde         | [Typography overview](https://carbondesignsystem.com/elements/typography/overview/) ; [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) | `design/Spacing.json`, `design/Breakpoint.json` |
| Pictogrammes éventuels | Illustratifs uniquement                     | Usage ponctuel et illustratif      | Pas dans la navigation ni le shell | [Pictograms / usage](https://carbondesignsystem.com/elements/pictograms/usage/)                                                                                     | `design/Colors pictogram.json`                  |

---

## 7. Icônes et composants secondaires

| Section          | Décision                                          | Do                                   | Don’t                               | Source Carbon                                                                                 | Source JSON dans le repo                             |
| ---------------- | ------------------------------------------------- | ------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Icônes           | Un seul langage d’icônes UI cohérent              | Standardiser les tailles et le style | Pas de mélange de familles d’icônes | [Icons / usage](https://carbondesignsystem.com/elements/icons/usage/)                         | `design/Colors.json`, `design/Colors pictogram.json` |
| Content switcher | Référence éventuelle pour futures bascules de vue | Réserver à un vrai besoin            | Ne pas le forcer sans cas d’usage   | [Content switcher / usage](https://carbondesignsystem.com/components/content-switcher/usage/) | `design/Content switcher.json`                       |
| Modal            | Référence pour futurs overlays                    | Utiliser seulement si besoin clair   | Pas nécessaire au MVP du blog       | [Modal / usage](https://carbondesignsystem.com/components/modal/usage/)                       | `design/Modal.json`                                  |

---

## 8. QA finale

| Section     | Décision                                                  | Do                                               | Don’t                                  | Source Carbon                                                                                                                                                                                     | Source JSON dans le repo                                                                  |
| ----------- | --------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Shell QA    | Vérifier skip link, header, nav mobile, recherche, langue | Tout tester au clavier                           | Pas de contenu éditorial dans le shell | [UI shell header / usage](https://carbondesignsystem.com/components/UI-shell-header/usage/) ; [UI shell left panel / usage](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/) | `design/Breakpoint.json`                                                                  |
| Layout QA   | Vérifier spacing, grille, layers, radius                  | Respect strict de l’échelle Carbon               | Pas d’ajustements arbitraires          | [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/)                                                                                                                     | `design/Spacing.json`, `design/Grid mode.json`, `design/Radius.json`, `design/Layer.json` |
| Telegram QA | Vérifier placement, hiérarchie, thèmes, états             | Sous Recent writing, sur Layer 01, états propres | Jamais dans header/nav mobile          | [Tile / usage](https://carbondesignsystem.com/components/tile/usage/) ; [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/)                                             | `design/Layer.json`, `design/Spacing.json`, `design/Aside.json`, `design/Breakpoint.json` |

---

## 9. Liste des sources à transmettre à l’équipe

### Carbon

- [Themes overview](https://carbondesignsystem.com/elements/themes/overview/)
- [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/)
- [Typography overview](https://carbondesignsystem.com/elements/typography/overview/)
- [UI shell header / usage](https://carbondesignsystem.com/components/UI-shell-header/usage/)
- [UI shell header / style](https://carbondesignsystem.com/components/UI-shell-header/style/)
- [UI shell left panel / usage](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/)
- [UI shell left panel / style](https://carbondesignsystem.com/components/UI-shell-left-panel/style/)
- [Search / usage](https://carbondesignsystem.com/components/search/usage/)
- [Search / style](https://carbondesignsystem.com/components/search/style/)
- [Dropdown / usage](https://carbondesignsystem.com/components/dropdown/usage/)
- [Dropdown / style](https://carbondesignsystem.com/components/dropdown/style/)
- [Link / usage](https://carbondesignsystem.com/components/link/usage/)
- [Link / style](https://carbondesignsystem.com/components/link/style/)
- [Breadcrumb / usage](https://carbondesignsystem.com/components/breadcrumb/usage/)
- [Pagination / usage](https://carbondesignsystem.com/components/pagination/usage/)
- [Tag / usage](https://carbondesignsystem.com/components/tag/usage/)
- [Tile / usage](https://carbondesignsystem.com/components/tile/usage/)
- [Icons / usage](https://carbondesignsystem.com/elements/icons/usage/)
- [Pictograms / usage](https://carbondesignsystem.com/elements/pictograms/usage/)
- [Content switcher / usage](https://carbondesignsystem.com/components/content-switcher/usage/)
- [Modal / usage](https://carbondesignsystem.com/components/modal/usage/)

### JSON dans `design/` à la racine du repo

- `design/Theme.json`
- `design/Layer.json`
- `design/Spacing.json`
- `design/Radius.json`
- `design/Breakpoint.json`
- `design/Breakpoint LG–XL.json`
- `design/Breakpoint Max-Max+.json`
- `design/Grid mode.json`
- `design/Column span.json`
- `design/Aside.json`
- `design/Modal.json`
- `design/Content switcher.json`
- `design/Colors.json`
- `design/Colors pictogram.json`
- `design/Color palette.json`
- `design/Color palette 1.json`
- `design/Color palette 2.json`
- `design/Color palette 3.json`
- `design/Color palette 4.json`
- `design/Numbers.json`

# Plan de migration — Suppression du widget Telegram

## Résumé exécutif

Le **widget Telegram** a été officiellement abandonné et retiré du code de
l’application. Ce plan détaille les conséquences visuelles, fonctionnelles et
opérationnelles de cette suppression. Nous confirmons qu’aucun autre contenu
n’est affecté : les composants restants ont été vérifiés contre les designs
Figma (exports JSON dans `design/`) et restent conformes aux spécifications.
Comme l’indiquent les directives Carbon précédentes, le widget Telegram n’était
qu’un module secondaire (sous la section « Recent writing ») et ne devait jamais
figurer dans le **header** ou le menu mobile【96†L68-L69】【99†L1-L2】. Sa
suppression simplifie la page d’accueil et respecte ces recommandations de
design.

## 1. Raison du changement

Le widget Telegram a été jugé inutile et retiré du produit. Les raisons
principales sont : 

- **Conformité au design initial** : Le plan Carbon spécifiait que ce widget ne
  devait pas apparaître dans le header ni dans le menu
  principal【96†L68-L69】【99†L1-L2】. Dans la pratique, il n’existait plus dans
  le code, confirmant son obsolescence.
- **Simplicité de l’UI** : La suppression élimine un élément social non
  essentiel, limitant les distractions pour l’utilisateur et respectant le
  principe Carbon de ne pas surcharger le header ou les modules
  principaux【99†L1-L2】.
- **Pas d’impact sur le contenu critique** : Aucune fonctionnalité vitale n’est
  liée à ce widget. La section « Recent writing » reste la section principale de
  la page d’accueil.

## 2. Fichiers à modifier / supprimer

| Fichier                              | Action                                                        | Diff ou extrait de remplacement                                                                                           |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/_components/TelegramWidget.tsx` | Supprimé (widget retiré précédemment)                         | _Aucun contenu – fichier supprimé (aucune référence résiduelle)._                                                         |
| `src/styles/components.css`          | Mise à jour : retrait des règles CSS liées au widget Telegram | `diff<br>- .telegram-widget { ... }<br>- .telegram-widget__title { ... }<br>- /* etc. jusqu'aux classes du widget */<br>` |

> **Note :** Aucun autre fichier code n’est concerné, car le composant Telegram
> n’était plus utilisé.

## 3. Étapes de test (local, préproduction, production)

1. **Tests locaux (dev)** : Lancer le serveur de développement
   (`deno task serve`). Vérifier que la page d’accueil s’affiche sans erreur et
   que la section « Recent writing » se présente normalement. S’assurer
   qu’aucune mention ou espace réservé au widget Telegram n’apparaît dans le DOM
   (inspecteur).
2. **Tests en staging** : Déployer la branche de feature sur l’environnement de
   staging. Confirmer les mêmes vérifications visuelles qu’en local sur les
   navigateurs cibles (desktop, mobile). Vérifier la console navigateur
   qu’aucune requête ou script lié à Telegram n’est exécuté.
3. **Tests en production** : Après déploiement final, reproduire rapidement les
   vérifications en staging. En complément, surveiller les logs d’erreurs de la
   build (aucun import manquant ou erreur JS relatif à Telegram).

## 4. Plan de rollback et checklist QA

- **Rollback rapide** : Si un problème majeur survient, révertir le commit de
  suppression (e.g. via `git revert`). Comme le widget n’est plus dans le code,
  le rollback devrait simplement réintroduire le composant si besoin.
- **Checklist QA** :
  - [ ] Lien vers le canal Telegram retiré du site (notamment dans le footer ou
        ailleurs).
  - [ ] Aucune erreur JS/HTML liée au widget dans la console navigateur.
  - [ ] Aucune référence CSS restante aux classes `.telegram-widget*`.
  - [ ] Page d’accueil toujours conforme au design (espacements, grilles
        inchangés).
  - [ ] Pas de régression visuelle dans les sections adjacentes.
  - [ ] Tests unitaires et d’intégration existants passent (aucun test sur
        Telegram).

## 5. Accessibilité et SEO après suppression

- **Accessibilité (WCAG)** : L’élément `<aside>` du widget Telegram (qui aurait
  eu `aria-label="Telegram"`) a été supprimé. Vérifier que les autres landmarks
  (`<header>`, `<main>`, `<footer>`) restent corrects. Comme le widget était
  purement informatif (texte), sa suppression n’empêche pas l’accès au contenu
  principal. Les autres liens et boutons (ex. liens d’archives, fil d’Ariane)
  conservent leurs attributs sémantiques et ARIA.
- **Référencement (SEO)** : Le lien de CTA « Voir le canal » vers `t.me/...` a
  été retiré. Étant donné qu’il s’agissait d’un lien externe vers Telegram, son
  retrait n’affecte pas négativement le SEO interne. Au contraire, le contenu
  principal (articles récents) reste prédominant. Le sitemap et les balises Meta
  (titres, descriptions) restent inchangés. Aucune nouvelle URL n’est créée ni
  supprimée du sitemap.

## 6. Analytique / Traçage

Aucun service d’analytics n’était lié au widget Telegram (pas de Google
Analytics, pas de pixel, etc.). Il n’y a donc **aucun événement à retirer ou
modifier**. Les seuls liens d’interaction (par exemple l’archive des posts) ne
sont pas liés au widget. Si un suivi de clics sur « Voir le canal » avait été
configuré, il doit être supprimé (spécifier la balise event si existante).
Actuellement, rien n’est reporté concernant Telegram.

## 7. Maquettes visuelles avant/après

```plaintext
PAGE D’ACCUEIL (Before)                      PAGE D’ACCUEIL (After)
┌────────────────────────┐                   ┌────────────────────────┐
│        Header          │                   │        Header          │
│ (Hamburger, logo, ...) │                   │ (Hamburger, logo, ...) │
├────────────────────────┤                   ├────────────────────────┤
│ Hero : grand titre     │                   │ Hero : grand titre     │
│ (eyebrow, H1, lead)    │                   │ (idem)                 │
├────────────────────────┤                   ├────────────────────────┤
│ Section “Recent writing”│                  │ Section “Recent writing”│
│ - Posts list (2xgrid)  │                  │ - Posts list (2xgrid)  │
│ - Lien « Voir tout »    │                  │ - Lien « Voir tout »    │
├────────────────────────┤                   ├────────────────────────┤
│ **Widget Telegram**    │   ← **SUPPRIMÉ**    │ (SECTION SUPPRIMÉE)     │
│ - [@ChannelName]       │                  │                        │
│ - Message 1 (date, txt)│                  │                        │
│ - Message 2 ...        │                  │                        │
│ - Bouton « Voir le canal » │              │                        │
├────────────────────────┤                   ├────────────────────────┤
│ Footer (liens légaux)  │                   │ Footer (liens légaux)  │
└────────────────────────┘                   └────────────────────────┘
```
