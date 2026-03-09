# Étude de faisabilité — Implémentation du style Primer dans le blog

_Date de l’étude : 2026-03-09 (Asia/Shanghai)_

## 1) Résumé exécutif

- **Décision recommandée : GO (avec approche “look-alike Primer” sans dépendre
  des packages UI).**
- **Faisabilité globale : élevée (8.5/10).**
- **Coût estimé :** 3 à 6 jours pour un rendu très proche de Primer sur ce blog.
- **Pourquoi :** surface UI limitée, architecture CSS propre, et pile statique
  Lume/TSX adaptée.
- **À éviter :** import global de `@primer/css` (poids et complexité inutiles
  pour un blog).

## 2) Périmètre demandé

- Répliquer le style/design Primer (pas obligation d’utiliser les packages).
- Étendre l’étude à :
  - **Accessibility**
  - **Octicons**
  - **packages npm référencés dans la doc Primer**, avec inspection du contenu
    CSS réel.

## 3) État actuel du blog (constaté)

- Stack : Deno + Lume + TSX, CSS natif en couches (`@layer`),
  PostCSS/PurgeCSS/LightningCSS.
- Surface front actuelle (ordre de grandeur) :
  - ~`26 KB` CSS source (`src/style.css` + `src/styles/*.css`)
  - ~`64` classes CSS uniques utilisées dans les templates TSX
- Accessibilité déjà en place :
  - skip link, focus-visible, navigation sémantique, `aria-current`, préférences
    utilisateur (`prefers-reduced-motion`, `prefers-contrast`, `forced-colors`,
    etc.)
- Point d’attention : duplication partielle entre `src/styles/reset.css` et
  `src/styles/base.css` (à nettoyer avant migration pour éviter les effets de
  cascade).

## 4) Faisabilité design Primer (sans packages)

### Ce qui est simple

- **Tokens** : transposer palette, espacement, radius, typographie de Primer
  vers tes variables CSS.
- **Composants blog** : Header, liens de nav, cartes de posts, métadonnées,
  pagination article, boutons/icônes.
- **Thèmes** : ton toggle actuel peut évoluer vers la convention Primer
  (`data-color-mode`, `data-light-theme`, `data-dark-theme`).

### Ce qui coûte plus cher

- **Parité 1:1** avec GitHub sur tous les états/variants (high contrast,
  colorblind variants, toutes densités).
- **Fidélité comportementale** de composants complexes (menus, overlays, tables
  interactives) — peu utile pour un blog.

## 5) Volet Accessibility (Primer + impact projet)

## 5.1 Référentiel Primer utile

La guidance Primer insiste notamment sur :

- ne pas dépendre uniquement de la couleur pour transmettre une info,
- conserver des liens clairement identifiables (soulignement),
- distinguer strictement lien vs bouton selon l’action,
- garantir une gestion de focus explicite et visible,
- privilégier HTML sémantique et ARIA seulement quand nécessaire,
- traiter les icônes décoratives vs porteuses de sens différemment.

## 5.2 Écart avec ton blog

- **Bon niveau de départ** : la plupart des fondamentaux sont déjà présents.
- **Risques lors de la migration visuelle** :
  - baisse de contraste si reprise partielle des couleurs sans vérifier tous les
    couples texte/fond,
  - perte d’indices non-colorimétriques (ex : liens non soulignés),
  - dérive sur les noms accessibles des boutons icônes.

## 5.3 Faisabilité accessibility

- **Élevée (8/10)** car la base est saine.
- Recommandation : verrouiller un mini-gate a11y en fin de migration (clavier,
  focus visible, liens vs boutons, icônes, contraste AA).

## 6) Volet Octicons

## 6.1 Ce que dit Octicons (pratique)

- Icônes optimisées pour tailles **16** et **24**.
- Les icônes doivent **renforcer** du texte ou, si elles portent seules le sens,
  avoir un nom accessible.
- Usage a11y standard :
  - décoratif : `aria-hidden="true"` + `focusable="false"`
  - sémantique : `role="img"` + `aria-label` (ou texte adjacent explicite)

## 6.2 Faisabilité dans ton blog

- **Très élevée (9/10)**.
- Pour ton contexte statique, l’option la plus propre est :
  - intégrer seulement les SVG nécessaires (inline),
  - appliquer une classe commune (`fill: currentColor`, alignement),
  - conserver les règles a11y ci-dessus.

## 6.3 Licence

- Octicons et les libs Primer sont sous **MIT** (OK pour intégration).
- Attention séparée aux logos GitHub (guidelines marque).

## 7) Audit des packages npm référencés (et CSS réel)

Versions `latest` observées le 2026-03-09.

| Package                   |   Version | Format principal                             | CSS constaté                                                                            | Lecture faisabilité                                                        |
| ------------------------- | --------: | -------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `@primer/react`           | `38.14.0` | ESM (`type: module`) + peer deps React 18/19 | **103 fichiers CSS** (~296 KB cumulés) dans `dist/`                                     | Peu adapté à Lume/TSX sans React runtime ; surdimensionné pour ton besoin  |
| `@primer/css`             |  `22.1.0` | CSS framework + utilitaires                  | **31 fichiers CSS** (~2.19 MB cumulés) ; `primer.css` 962 KB ; `color-modes.css` 706 KB | Trop lourd en import global pour un blog ; utile seulement comme référence |
| `@primer/primitives`      |  `11.5.1` | Tokens CSS/JSON                              | **42 fichiers CSS** (~3.51 MB cumulés) dont thèmes ~97 KB chacun                        | Très pertinent comme base de tokens/thèmes (sélection ciblée)              |
| `@primer/octicons`        | `19.22.0` | JS + SVG metadata                            | `build.css` minimal (109 B)                                                             | Très adapté en usage sélectif (SVG inline ou génération ciblée)            |
| `@primer/octicons-react`  | `19.22.0` | CommonJS/ESM + peer React                    | CSS non centrale ; composants React                                                     | Non recommandé ici (dépendance React inutile)                              |
| `@primer/styled-octicons` | `19.22.0` | React + styled-components                    | orienté React/styled-components                                                         | Non recommandé ici                                                         |

### Observations CSS marquantes

- `@primer/css/dist/primer.css` : **962,394 B** (gzip ~**147,197 B**)
- `@primer/css/dist/color-modes.css` : **706,133 B** (gzip ~**114,319 B**)
- `@primer/primitives` thème light : **97,611 B** (gzip ~**16,536 B**)
- `@primer/primitives` thème dark : **97,394 B** (gzip ~**16,655 B**)

Conclusion : pour ton cas, **prendre un sous-ensemble de tokens/thèmes** est
plus rationnel qu’importer le framework CSS complet.

## 8) Recommandation d’implémentation

## Option recommandée (hybride légère)

1. **Token bridge local**

- introduire un mapping local entre tes variables actuelles et les tokens Primer
  essentiels (`--fgColor-*`, `--bgColor-*`, `--borderColor-*`, typo, spacing,
  radius).

2. **Thémage Primer-compatible**

- migrer le toggle vers `data-color-mode` + `data-light-theme` +
  `data-dark-theme`.
- commencer par `light` + `dark`, puis éventuellement
  `dark-dimmed`/high-contrast.

3. **Reskin des composants blog**

- header/nav, post card, metadata, liens, boutons, code blocks, footer.

4. **Octicons sélectifs**

- intégrer seulement les icônes nécessaires (inline SVG), sans couche React.

5. **Passage a11y final**

- check clavier/focus/contraste/semantic HTML/icons/underlines.

## Estimation réaliste

- Phase 0 (préparation + nettoyage CSS) : 0.5–1 j
- Phase 1 (tokens + thème) : 1–2 j
- Phase 2 (composants + octicons) : 1–2 j
- Phase 3 (a11y + ajustements) : 1 j

**Total : 3 à 6 jours**

## 9) Décision finale

- **GO** pour une implémentation “Primer-inspired” maîtrisée, performante et
  accessible.
- **NO-GO** pour une adoption brute de `@primer/css` ou `@primer/react` dans ce
  projet précis.

## 10) Sources

### Primer docs

- https://primer.style/product/getting-started/react
- https://primer.style/product/getting-started/primitives
- https://primer.style/product/getting-started/css
- https://primer.style/accessibility/
- https://primer.style/accessibility/checklists/engineering-checklist
- https://primer.style/accessibility/design-guidance/color-considerations
- https://primer.style/accessibility/design-guidance/links-and-buttons
- https://primer.style/accessibility/design-guidance/focus-management
- https://primer.style/accessibility/design-guidance/semantic-html-and-aria
- https://primer.style/accessibility/design-guidance/text-resize-and-spacing
- https://primer.style/accessibility/patterns/primer-components/icons
- https://primer.style/product/getting-started/foundations/icons/
- https://primer.style/octicons/use-cases/best-practices

### npm/CDN et repos

- https://registry.npmjs.org/@primer%2freact/latest
- https://registry.npmjs.org/@primer%2fprimitives/latest
- https://registry.npmjs.org/@primer%2fcss/latest
- https://registry.npmjs.org/@primer%2focticons/latest
- https://registry.npmjs.org/@primer%2focticons-react/latest
- https://registry.npmjs.org/@primer%2fstyled-octicons/latest
- https://unpkg.com/@primer/css@22.1.0/dist/primer.css
- https://unpkg.com/@primer/css@22.1.0/dist/color-modes.css
- https://unpkg.com/@primer/primitives@11.5.1/dist/css/primitives.css
- https://unpkg.com/@primer/primitives@11.5.1/dist/css/functional/themes/light.css
- https://unpkg.com/@primer/primitives@11.5.1/dist/css/functional/themes/dark.css
- https://unpkg.com/@primer/octicons@19.22.0/build/build.css
- https://unpkg.com/@primer/react@38.14.0/?meta
- https://github.com/primer/octicons
- https://raw.githubusercontent.com/primer/primitives/main/LICENSE
- https://raw.githubusercontent.com/primer/css/main/LICENSE
- https://raw.githubusercontent.com/primer/react/main/LICENSE
