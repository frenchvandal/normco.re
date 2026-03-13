# Design d’un blog personnel minimaliste orienté lecture avec Lume et Carbon Web Components

## Résumé conceptuel du style global

Un blog personnel minimaliste orienté lecture vise à réduire le bruit visuel au
profit d’une expérience de lecture fluide : une colonne principale stable, une
mesure de ligne maîtrisée, une hiérarchie typographique sobre, et une navigation
qui n’entre jamais en concurrence avec le texte. La contrainte de mesure est
structurante : viser une largeur de paragraphe autour de 50–75 caractères
(espaces compris) améliore nettement la lisibilité et évite les lignes trop
longues qui fatiguent l’œil. citeturn18search3

Dans ce contexte, le rôle du design system n’est pas d’« ajouter des composants
», mais de fournir une grammaire cohérente (tokens, états interactifs, focus) et
un outillage d’accessibilité. Carbon est précisément conçu comme un système de
styles, composants et guidelines réutilisables pour construire des interfaces
cohérentes. citeturn13search12turn5search7

Le parti pris recommandé ici est un « noyau éditorial » (typographie + grille +
rythme vertical) piloté par les tokens Carbon (couleurs, espacements, focus) et
enrichi seulement là où c’est utile : recherche, tags, pagination, code blocks.
Lume renforce ce minimalisme en produisant un site statique, sans logique
serveur, et en n’exportant que votre code (pas de JavaScript client superflu
imposé par l’outil). citeturn17search12turn17search8

## État de l’art des blogs minimalistes orientés lecture

La plupart des patterns « lecture-first » modernes convergent vers une même
série de décisions : (1) une colonne de texte centrée avec une mesure stable,
(2) un rythme vertical régulier, (3) une typographie qui privilégie la
continuité (peu de variations), (4) des états interactifs très nets (hover
discret, focus explicite), et (5) une performance qui protège la lecture (pas de
reflows, pas de CLS, pas de police bloquante). La règle de mesure 50–75
caractères sert de repère principal pour calibrer la grille et la taille de
police. citeturn18search3

La typographie moderne « orientée lecture » sur le Web s’appuie sur des tokens
plutôt que sur des valeurs ad hoc : Carbon formalise cela via des “type tokens”
(size, weight, line-height) calibrés autour d’IBM Plex, et distingue des jeux
typographiques (productive / expressive) selon le contexte d’usage.
citeturn12search0turn19search4\
Pour un blog personnel, l’approche la plus robuste consiste à séparer
typographie éditoriale et typographie d’interface : serif pour le corps long,
sans-serif pour l’UI et la micro-typographie, monospace pour le code. Carbon
supporte IBM Plex Serif explicitement pour des usages éditoriaux/marketing, en
plus de Mono et Sans. citeturn19search20turn19search34

La hiérarchie visuelle « less is more » se joue surtout dans les écarts : (a)
taille et graisse des titres, (b) blancs verticaux, (c) contraste (texte vs
fond) et (d) sous-lignage/traitement des liens. Carbon documente que les liens
“inline” sont soulignés pour les distinguer du texte courant, alors que les
liens “standalone” ne sont soulignés qu’en hover/focus/active. Sur un blog, il
est généralement préférable de traiter les liens dans le contenu comme des liens
inline (soulignés en permanence), car le lien est une information intégrée au
flux de lecture et ne doit pas dépendre d’un changement de couleur ambigu.
citeturn13search3turn13search7turn18search9

Côté accessibilité, les exigences structurantes restent : contraste texte/fond
(4,5:1 pour le texte « normal », 3:1 pour le texte « large »), focus visible, et
ne pas véhiculer une information par la couleur seule.
citeturn18search0turn18search2turn18search1\
Côté performance, l’état de l’art se traduit par : limiter le JavaScript non
essentiel (INP), prioriser ce qui définit le LCP, et supprimer les causes de CLS
(dimensions d’images explicites, réservations d’espace).
citeturn11search2turn11search1turn11search5

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["minimalist
personal blog design single column typography","editorial blog layout IBM Plex
Serif","dark mode minimalist blog design reading experience","code block design
minimal syntax highlighting"],"num_per_query":1}

## Architecture complète de la page d’accueil

Le layout ci-dessous suppose : (a) une liste paginée des derniers articles, (b)
une navigation courte (3–6 entrées), (c) une recherche interne accessible, et
(d) un header discret. Techniquement, vous pouvez vous appuyer sur la grille
Carbon (16 colonnes) uniquement comme “coffrage” d’alignement, puis imposer une
largeur de lecture via `max-width` en `ch` sur le conteneur de texte. Carbon
documente la grille 16 colonnes et ses spans par breakpoints (`sm`, `md`, `lg`).
citeturn21view0\
La mesure cible recommandée pour la liste (titres + extraits) : 60–70ch, afin de
rester dans l’intervalle 50–75 caractères sur les paragraphes d’extrait.
citeturn18search3

**Lien “Skip to content” (tout en haut)**\
Rôle : permettre aux utilisateurs clavier de sauter l’en-tête et d’atteindre
immédiatement le contenu.\
Composants Carbon : `cds-skip-to-content` en premier enfant de `cds-header`.
citeturn22view0\
Responsive : identique sur tous breakpoints.\
Accessibilité : le pattern est explicitement recommandé dans le tutoriel Carbon
pour les headers de navigation. citeturn22view0

**Header global**\
Rôle : ancrer l’identité (logo/nom), fournir une navigation primaire courte, et
exposer 3 actions max (recherche, thème, langue) + lien RSS discret. Le header
ne doit pas “prendre la page”.\
Composants Carbon (UI Shell) : `cds-header`, `cds-header-name` (logo/brand),
`cds-header-nav` + `cds-header-nav-item` (liens principaux).
citeturn22view2turn22view1turn22view3\
Responsive : sous un seuil de largeur, déplacer certains items dans une
navigation latérale déclenchée par `cds-header-menu-button` et rendue via
`cds-side-nav` (mode responsive). citeturn22view4turn22view0\
Accessibilité : utiliser un vrai `<header>` et une structure sémantique
(`<nav>`, `<main>`) est fortement recommandé pour bénéficier de l’accessibilité
native. citeturn13search27

**Actions globales (recherche / thème / langue / RSS)**\
Rôle : actions secondaires, accessibles mais non dominantes.\
Composants Carbon : vous pouvez rester dans l’écosystème UI Shell avec
`cds-header-global-action` et des panels (`cds-header-panel`) pour loger, par
exemple, le sélecteur de thème et un mini menu de langue. citeturn22view0\
Pour le mapping strict “Carbon only”, les briques nécessaires existent bien côté
Web Components : `search`, `toggle`, `dropdown`, `overflow-menu`, `tooltip`,
`link` (et `ui-shell`). citeturn23view0\
Responsive : sur mobile, privilégier l’agrégation (un seul entrypoint “menu”) et
réduire le nombre d’icônes visibles.\
Accessibilité : focus net (WCAG Focus Visible) et tooltips non bloquants ;
éviter de dépendre uniquement de la couleur pour signifier l’état actif.
citeturn18search2turn18search1

**Bandeau d’introduction (sous le header)**\
Rôle : donner le ton (1 phrase), et éventuellement 2 liens : “À propos” et
“Commencer ici”.\
Composants Carbon : le contenu reste en HTML sémantique, mais les liens peuvent
être rendus via le composant Link (ou en simple `<a>` stylé selon tokens). Les
règles Carbon distinguent clairement liens inline vs standalone, ce qui aide à
garder une cohérence. citeturn13search3turn13search7\
Responsive : aucun changement ; rester mono-colonne.

**Liste d’articles (zone de contenu principale)**\
Rôle : scannabilité verticale : titre, méta courte, extrait 2–4 lignes, tags.\
Composants Carbon :

- Titres : liens standalone (style “standalone link”). citeturn13search3
- Tags/catégories : tags “read-only” pour catégorisation (non interactifs si
  vous ne filtrez pas). citeturn13search1turn13search13\
  Responsive : mono-colonne ; sur desktop, vous pouvez aligner la méta (date,
  langue, temps de lecture) sur une ligne secondaire mais sans créer une
  “sidebar” permanente.\
  Accessibilité : s’assurer que les liens d’articles ont un intitulé explicite ;
  conserver un soulignage (au moins en focus) et des zones cliquables correctes.
  Carbon indique que même quand les liens ne sont pas soulignés en permanence,
  ils doivent recevoir un soulignage au focus.
  citeturn13search7turn18search9

**Pagination de la liste**\
Rôle : naviguer entre pages d’index sans charger trop d’items.\
Composants Carbon : soit utiliser le composant Pagination, soit un pattern
minimal `cds-link` “Précédent / Suivant”. Carbon définit la pagination comme un
mécanisme pour diviser de grands volumes de contenu et la rendre consommable.
citeturn13search2turn23view0\
Responsive : sur mobile, n’afficher que “Précédent / Suivant” (éviter un
contrôle dense).\
Accessibilité : conserver `rel="prev"` / `rel="next"` côté HTML, et focus
visible. citeturn18search2

**Footer**\
Rôle : liens secondaires (RSS, JSON feed, source, mentions), et éventuellement
un rappel du sélecteur de langue.\
Composants Carbon : liens (Link), éventuellement Tag pour signaler le “thème”
(clair/sombre) mais mieux vaut un contrôle dédié (Toggle) si vous le mettez ici.
citeturn23view0\
Accessibilité : contrastes conformes et zones de focus lisibles.
citeturn18search0turn18search2

## Architecture complète d’une page d’article

La page d’article est le cœur “lecture-first”. Elle doit protéger la lecture :
une colonne stable, des titres clairs, des médias dimensionnés (anti-CLS), des
liens identifiables, et des blocs de code copiables et lisibles.

**Header + Skip link (identique à l’accueil)**\
Rôle : cohérence globale, accès à la navigation, accès rapide au contenu.\
Composants Carbon : `cds-header` + `cds-skip-to-content`.
citeturn22view0turn22view2\
Accessibilité : le pattern “skip to content” est explicitement mis en avant pour
les utilisateurs clavier. citeturn22view0

**Fil d’Ariane (sous le header, au-dessus du titre)**\
Rôle : situer l’article dans la hiérarchie (section, tags, série). Carbon
précise que le breadcrumb se place sous le header/navigation, au-dessus du titre
de page. citeturn8search5turn21view0\
Composants Carbon : `cds-breadcrumb` + `cds-breadcrumb-item`, avec `aria-label`.
Le tutoriel montre un exemple direct de markup. citeturn21view0\
Responsive : sur mobile, prévoir un mode tronqué (overflow) plutôt qu’un wrap.
Carbon documente le recours à un overflow menu quand l’espace est limité
(premier + deux derniers items visibles). citeturn8search5turn8search12\
Accessibilité : liens clavier (Tab/Shift-Tab) et focus visible ; ne pas
remplacer la nav primaire par le breadcrumb (Carbon rappelle que c’est une
navigation secondaire). citeturn8search5turn18search2

**En-tête d’article (titre + méta)**\
Rôle : “contrat de lecture” : titre H1, date, langue, temps de lecture, tags.\
Composants Carbon : tags read-only pour les catégories, liens inline dans la
méta seulement si nécessaire. citeturn13search13turn13search3\
Grid : même conteneur de lecture (60–70ch). citeturn18search3\
Accessibilité : le titre doit être unique (H1), et la méta ne doit pas être la
seule façon d’identifier le contenu.

**Corps de l’article (contenu)**\
Rôle : lecture longue durée.\
Typographie : s’appuyer sur des type tokens (size + line-height) calibrés.
Carbon fournit ces tokens et précise qu’ils sont calibrés avec IBM Plex, y
compris la “leading”. citeturn12search0turn19search0\
Hyperliens : dans le texte, privilégier un style “inline link” souligné
(permanent) pour éviter l’échec “lien identifié par la couleur seule”.
citeturn13search3turn18search9turn18search1\
Accessibilité : contraste texte/fond conforme (4,5:1) et focus visible sur tous
les éléments interactifs. citeturn18search0turn18search2

**Images et figures**\
Rôle : support au texte, jamais décoration envahissante.\
Gestion anti-CLS : toujours réserver l’espace via `width`/`height` (ou ratio),
car le chargement tardif sans dimension est une cause fréquente de CLS ; web.dev
recommande explicitement de donner des dimensions aux images, y compris en lazy
loading. citeturn11search5turn11search1\
Lume : le plugin `image_size` peut automatiser l’ajout de `width`/`height` et
mentionne explicitement que c’est recommandé pour prévenir le layout shift.
citeturn20search12\
Responsive : images max-width: 100% dans la colonne ; éviter les “full-bleed” si
votre objectif est la stabilité de lecture.

**Blocs de code (surlignage + copie)**\
Rôle : rendre le code lisible, copiable, et stable visuellement.\
Surlignage : Lume propose `code_highlight` (highlight.js) qui surligne le code
dans des `<pre><code>`. citeturn3view6\
UI Carbon : pour respecter “Carbon-only” sur l’interaction, vous pouvez ajouter
un `copy-button` (ou utiliser Code Snippet si vous acceptez ses contraintes). La
liste des composants Web Components inclut `copy-button` et `code-snippet`.
citeturn23view0\
Styles : s’appuyer sur les tokens (background/layer, focus, text) plutôt que des
couleurs “inventées”. Carbon documente ces tokens et leur usage dans des
composants comme Code Snippet. citeturn6view6turn19search2\
Accessibilité : éviter les blocs “image du code” (non sélectionnable), conserver
un focus visible sur le bouton de copie. (Carbon documente aussi que les boutons
du code snippet sont focusables et activables au clavier.)
citeturn6view4turn18search2

**Fin d’article (tags + navigation next/prev)**\
Rôle : rebond minimal (sans “widget” intrusif).\
Composants Carbon : tags read-only ; liens standalone pour “Article précédent /
suivant”. citeturn13search13turn13search3\
Lume : selon votre modèle de navigation, vous pouvez produire “next/prev” via le
helper `nav.nextPage()` / `nav.previousPage()` ou via le helper
`search.nextPage()` / `search.previousPage()` ; ces helpers sont documentés.
citeturn2view1turn3view0\
Accessibilité : conserver des libellés explicites et focus visible.
citeturn18search2

## Stratégie de theming clair/sombre compatible Carbon

**Principe : tokens d’abord, palette ensuite.** Carbon définit les tokens comme
des identifiants “rôle” réutilisables (opposés à des hex codés en dur), et
explique que l’usage des tokens permet de modifier globalement un thème sans
retoucher chaque composant. citeturn6view5turn6view6\
Pour un blog minimaliste, l’objectif est d’adopter tel quel un thème clair et un
thème sombre “gris” (ex. g10 / g100) et de limiter les overrides à quelques cas
éditoriaux (liens, code, séparateurs).

**Stratégie recommandée : classes de thème + respect du système.** Le tutoriel
Web Components Carbon montre une approche concrète : appliquer un thème par
défaut via le mixin `theme(themes.$g10)` et basculer vers `themes.$g100` selon
`prefers-color-scheme: dark`, puis permettre un override via des classes (ex.
`g10` / `g100`). citeturn10view2\
Côté standard Web, `prefers-color-scheme` est le mécanisme de référence pour
détecter la préférence OS/navigateur. citeturn11search3

**Mapping minimal des surfaces et états (dans les deux thèmes)**\
Plutôt que d’énumérer des hex, mappez vos surfaces et états aux tokens Carbon
correspondants :

- Fond de page : token de background (rôle “Default page background”).
  citeturn6view6
- Surfaces secondaires (cartouches légers, encarts, code blocks) : tokens de
  layer, et variants hover/active pour les interactions.
  citeturn19search2turn13search18
- Texte principal : `text-primary` (et variantes secondaires si besoin) ; liens
  : `link-primary` et `link-primary-hover`. citeturn8search12turn6view6
- Focus : token `focus` (utiliser un indicateur visible, conforme WCAG Focus
  Visible). citeturn18search2turn19search2
- Bordures interactives / sélection : `border-interactive` (utile pour
  pagination nav, contrôles sélectionnés). citeturn13search18

**Contraste et lisibilité**\
Valider systématiquement : 4,5:1 pour le texte normal, 3:1 pour le texte large ;
cela s’applique autant au clair qu’au sombre.
citeturn18search0turn18search12\
Ne pas utiliser la couleur comme seul indicateur (ex. liens uniquement colorés)
: dans le contenu, préserver un soulignage ou un autre indice non
colorimétrique. citeturn18search1turn18search9

**Composant de bascule (light/dark)**\
Pour rester “Carbon-only UI”, deux patterns sont cohérents :

- Toggle (binaire) : composant `toggle` disponible en Web Components.
  citeturn23view0
- Content Switcher (light/system/dark) : le tutoriel Carbon montre l’usage d’un
  `cds-content-switcher` dans un panel d’en-tête pour choisir “light / system /
  dark”. citeturn10view2turn23view0\
  Dans les deux cas, l’état doit être persistant (localStorage) et doit retomber
  sur la préférence système quand l’utilisateur choisit “system”. La base
  “system via media query” est directement documentée.
  citeturn10view2turn11search3

## Intégration Lume et recommandations pratiques

**Fil d’Ariane Lume : où et comment**\
Lume fournit un helper `nav` pour menus et breadcrumbs ; `nav.breadcrumb()`
renvoie un tableau des parents jusqu’à la racine, avec un exemple de rendu en
template. citeturn2view1\
Côté placement, Carbon recommande explicitement “sous le header, au-dessus du
titre”. citeturn8search5\
Mapping Carbon : rendre le résultat dans `cds-breadcrumb` /
`cds-breadcrumb-item`, en suivant un `aria-label` comme dans l’exemple du
tutoriel. citeturn21view0\
Recommandation minimaliste : ne pas afficher le breadcrumb sur l’accueil ;
l’afficher sur les pages “profondes” (article, tag, série), où il apporte un
vrai repère. Carbon rappelle qu’il ne faut pas l’utiliser quand la hiérarchie
est trop simple (clutter). citeturn8search5

**Flux RSS (XML) et JSON : emplacement des liens**\
Le plugin Feed Lume génère automatiquement un RSS ou un JSON feed, configurable
via `output` (ex. `["/posts.rss", "/posts.json"]`) et une requête de pages.
citeturn2view0\
Recommandation d’emplacement :

- Header : une action discrète “RSS” (icône) dans les actions globales, ou un
  lien dans un overflow menu si vous voulez préserver la sobriété. Les
  composants nécessaires (overflow-menu, link, tooltip) existent en Web
  Components. citeturn23view0turn22view0
- Footer : doublon volontaire (découvrabilité) sous forme de liens texte “RSS”
  et “JSON”.\
  En complément, ajouter des `<link rel="alternate" ...>` dans le `<head>` pour
  exposer les feeds aux lecteurs ; c’est une pratique courante d’écosystème feed
  (et simple en statique).

**Recherche interne : Pagefind (index) + Carbon (UI)**\
Le plugin Pagefind Lume construit un moteur de recherche entièrement statique
“sans infrastructure d’hébergement”, avec deux étapes (indexation HTML, rendu
UI). citeturn16view0\
Problème de design system : l’UI générique Pagefind ne respecte pas votre
contrainte “Carbon only”. Solution : désactiver l’insertion automatique de l’UI
via `ui: false`. citeturn16view0\
UI Carbon recommandée :

- Un champ `cds-search` (composant Search) pour la saisie. Carbon documente les
  interactions clavier (Enter pour soumettre, Esc pour effacer, bouton “x”
  focusable). citeturn13search4turn23view0
- Une liste de résultats rendue en HTML sémantique (`<ol>` / `<li>`) avec des
  liens (Link) et éventuellement tags read-only.
  citeturn13search3turn13search13\
  Indexing propre : utiliser `data-pagefind-body` pour limiter l’index au
  contenu éditorial (et exclure header/footer), ce que le plugin documente
  explicitement. citeturn16view0

**Surlignage de code : Lume + design minimal**\
Lume `code_highlight` applique highlight.js sur les `<pre><code>` et télécharge
des thèmes. citeturn3view6\
Recommandation design : limiter la palette de surlignage (ne pas “peindre”
chaque token), garder un fond layer discret, et s’appuyer sur les tokens de
texte/focus/layer pour rester cohérent clair/sombre. Carbon expose des tokens
pertinents via ses pages couleur et via des exemples de composants qui
consomment `layer`, `text-primary`, `focus`.
citeturn6view6turn19search2turn19search1\
Interaction : ajouter un `copy-button` Carbon au-dessus du bloc code pour la
copie, plutôt que d’introduire une UI externe. citeturn23view0

**Multilingue : i18n avec Multilanguage**\
Le plugin Multilanguage permet de créer plusieurs versions linguistiques d’une
même page, en associant les traductions par `id` (et `type` si défini), et gère
les préfixes de langue dans les URLs, avec un `defaultLanguage` possible “sans
préfixe”. citeturn3view7\
Il supporte aussi un `x-default` via `unmatchedLangUrl`, utile pour un sélecteur
de langue ou une page fallback. citeturn17search0turn3view7\
UI Carbon : un `cds-dropdown` (ou overflow menu) dans le header, avec le libellé
de langue actuel, et des entrées pointant vers les URLs traduites. Les
composants Dropdown/Overflow Menu existent en Web Components.
citeturn23view0\
Accessibilité : libellé explicite (“Langue”), focus visible, et éviter d’encoder
une langue uniquement par drapeau/couleur. citeturn18search2turn18search1

**Performance : rester statique, rester sobre**\
Principes : réduire le JavaScript inutile (meilleur INP), réserver les
ressources LCP, neutraliser les sources de CLS.
citeturn11search2turn11search1\
Lume :

- Minifier le HTML via `minify_html`. citeturn20search8
- Bundler/minifier le CSS via `lightningcss` (minify true par défaut dans la
  doc). citeturn20search2
- Prévenir le CLS sur images via `image_size`. citeturn20search12
- Précompresser et servir Brotli : plugin Brotli + middleware `precompress`
  (doc + post Lume 2.4.0). citeturn20search1turn20search6\
  Polices : suivre les bonnes pratiques (éviter blocage de rendu,
  `font-display`, tailles raisonnables), car les webfonts affectent FCP/CLS ;
  web.dev et MDN fournissent des recommandations détaillées.
  citeturn11search0turn11search8
