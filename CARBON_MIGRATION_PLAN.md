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
