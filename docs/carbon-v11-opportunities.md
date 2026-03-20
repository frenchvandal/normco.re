# Étude : superbes ajouts Carbon Design System v11 à intégrer sur normco.re

## Constat rapide sur l'existant

Le blog utilise déjà plusieurs patterns Carbon v11 de façon solide :

- **UI Shell header + side nav** pour la navigation principale.
- **Tags**, **tiles**, **breadcrumb**, **popover/toggletip** et **code snippet/button** sur les pages éditoriales et la page de syndication.
- Une **recherche** maison stylée sur les tokens Carbon, mais sans composant Carbon complet pour les états de chargement et de retour d'action.

En pratique, la base visuelle est déjà cohérente. Les meilleurs ajouts Carbon v11 à viser maintenant sont donc ceux qui :

1. améliorent la lisibilité d'un blog riche en contenu,
2. réduisent la charge cognitive,
3. renforcent les états système (chargement, succès, erreur),
4. restent compatibles avec ton architecture statique Deno/Lume.

## Priorités recommandées

### 1. **Tabs contenues** pour segmenter les vues éditoriales importantes

**Pourquoi c'est prometteur**

Carbon décrit les tabs comme un bon pattern pour regrouper du contenu lié sans faire quitter la page. C'est exactement adapté à des vues de blog du type : « Derniers articles », « Par tags », « Par année », « Formats », ou « Billets / Notes / Guides » si tu enrichis ton contenu plus tard.

**Où l'intégrer sur normco.re**

- **Page d'accueil** : remplacer ou compléter la section "recent posts" par des onglets comme **Récents / Tags / Archives**.
- **Page `/posts/`** : introduire des tabs **Par année / Par thème / Par durée de lecture**.
- **Page `/about/`** : séparer **bio / stack / contact / feeds** au lieu d'une longue page continue.

**Pourquoi c'est mieux que d'ajouter simplement plus de blocs**

- Cela garde une hiérarchie claire.
- Cela évite d'allonger la page d'accueil.
- Cela reste plus approprié que le content switcher si les sections deviennent vraiment distinctes.

**Niveau d'effort** : moyen.

---

### 2. **Content switcher** pour alterner des vues d'un même contenu

**Pourquoi c'est prometteur**

Carbon recommande le content switcher pour basculer entre des vues alternatives d'un même ensemble de données, par exemple grille vs liste. C'est très adapté à un blog où les mêmes posts peuvent être explorés différemment.

**Où l'intégrer sur normco.re**

- **Accueil** ou **archives** : bascule **cartes / liste compacte** pour les articles.
- **Syndication** : bascule **cards / tableau structuré** pour les endpoints RSS, Atom, JSON Feed et sitemap.
- **Tags** : bascule **toutes les publications / publications récentes**.

**Cas idéal**

Si tu veux garder la même donnée mais offrir une lecture plus dense sur desktop et plus éditoriale sur mobile, c'est probablement l'ajout Carbon v11 le plus naturel.

**Niveau d'effort** : faible à moyen.

---

### 3. **Structured list** pour des surfaces plus denses et plus "scannables"

**Pourquoi c'est prometteur**

Carbon positionne la structured list comme un pattern simple pour présenter de l'information groupée, scannable, en plusieurs lignes. Pour un blog personnel, c'est excellent quand on veut afficher des métadonnées ou des options sans tomber dans une data table trop "app produit".

**Où l'intégrer sur normco.re**

- **`/syndication/`** : présenter les formats de feed sous forme de structured list avec colonnes **format / URL / usage**.
- **`/about/`** : transformer certains blocs de faits personnels en liste structurée.
- **Pages d'archives** : version compacte de la liste des posts avec **date / titre / temps de lecture / tag principal**.

**Bénéfice principal**

Tu gagnerais une deuxième densité de lecture : les tiles actuelles restent belles, mais une structured list offrirait une lecture plus rapide pour les visiteurs récurrents.

**Niveau d'effort** : faible.

---

### 4. **Accordion** pour condenser le contenu secondaire sans perdre la richesse éditoriale

**Pourquoi c'est prometteur**

Carbon recommande l'accordion pour la divulgation progressive quand l'espace est limité ou quand tout le contenu n'a pas besoin d'être lu d'un coup. Pour un blog, c'est idéal pour les sections secondaires mais utiles.

**Où l'intégrer sur normco.re**

- **`/about/`** : blocs **contact**, **langues**, **outils**, **présence en ligne**, **FAQ**.
- **Longs articles** : encarts "notes", "sources", "annexes", "changements depuis la publication".
- **Page de syndication** : panneau "À quoi sert chaque feed ?" ou "Comment consommer ces endpoints ?".

**Attention UX**

Je ne l'utiliserais pas pour le contenu principal des billets, car Carbon rappelle que l'accordion peut cacher une information que l'utilisateur devrait lire en entier. En revanche, pour le contenu auxiliaire, c'est un très bon fit.

**Niveau d'effort** : faible à moyen.

---

### 5. **Inline loading + notifications** pour professionnaliser les micro-interactions

**Pourquoi c'est prometteur**

C'est probablement le gain qualitatif le plus visible sans gros redesign. Carbon distingue bien :

- **inline loading** pour une action courte en cours,
- **inline notification** pour un résultat dans le flux,
- **toast** pour un retour bref non bloquant.

**Où l'intégrer sur normco.re**

- **Recherche du header** : remplacer l'état de chargement artisanal par un pattern inline loading Carbon.
- **Copie d'URL de feed** sur `/syndication/` : notification inline ou toast au lieu d'un simple changement discret d'icône.
- **Mode hors ligne / service worker** : notification claire lors d'un fallback offline, d'un cache mis à jour, ou d'une erreur réseau.

**Pourquoi c'est important**

Le site a déjà des scripts pour la copie, la recherche lazy, le thème et le service worker. Donc tu as déjà les interactions ; Carbon peut maintenant les rendre plus explicites, plus accessibles et plus premium.

**Niveau d'effort** : faible.

---

### 6. **Skeleton states** pour la recherche et les chargements perçus

**Pourquoi c'est prometteur**

Carbon recommande d'éviter les gros loaders pour du contenu progressif et de préférer des skeleton states lorsque du contenu est en train d'apparaître. Pour une recherche intégrée à l'en-tête ou des listes de billets filtrées côté client, l'effet est nettement plus moderne.

**Où l'intégrer sur normco.re**

- **Résultats Pagefind** pendant l'initialisation lazy.
- **Vue archive filtrée** si tu ajoutes tri, filtre ou switch de vue côté client.
- **Chargement d'images secondaires** dans certaines surfaces éditoriales futures.

**Bénéfice principal**

Le site paraîtra plus rapide, même quand il attend réellement une indexation ou une réponse locale.

**Niveau d'effort** : faible à moyen.

## Shortlist finale : mes 4 meilleurs paris pour ton blog

Si tu veux avancer sans surcharger le produit, je prioriserais :

1. **Inline loading + notifications** pour les micro-interactions.
2. **Content switcher** pour proposer **cards / liste compacte** dans les archives.
3. **Structured list** pour enrichir `/syndication/` et potentiellement `/about/`.
4. **Tabs contenues** pour donner à l'accueil ou aux archives une navigation éditoriale plus ambitieuse.

## Plan d'intégration suggéré

### Phase 1 — gains rapides

- Ajouter **inline loading** et **notifications** autour de la recherche, de la copie, et de l'offline.
- Convertir `/syndication/` vers une **structured list** optionnelle ou une vue alternative.

### Phase 2 — gain éditorial visible

- Ajouter un **content switcher** sur la page des articles pour alterner **cards / liste**.
- Ajouter des **skeleton states** pour la recherche et les vues filtrées.

### Phase 3 — refonte légère de l'architecture d'information

- Introduire des **tabs contenues** sur l'accueil ou `/about/`.
- Réserver les **accordions** aux contenus secondaires, FAQ, annexes, ou meta-contenus.

## Ce que je déconseille pour l'instant

- **Data table** pour les billets principaux : trop "application métier" pour le ton éditorial actuel.
- **Composants trop transactionnels** (combo box complexes, batch actions, etc.) : puissants, mais peu alignés avec l'expérience blog.
- **Accordion partout** : utile en appoint, mais pas comme structure dominante pour des billets de lecture longue.

## Conclusion

Le blog a déjà une excellente base Carbon v11. Les ajouts les plus "superbes" ne sont pas forcément les plus spectaculaires visuellement : ce sont surtout ceux qui rendront l'expérience **plus lisible, plus dense quand il faut, et plus claire dans les états système**.

En clair, si je devais choisir un seul cap : **faire monter le site d'un cran sur les états d'interface (loading/notification/skeleton), puis offrir une double lecture des contenus (cards vs liste) avec content switcher + structured list**.
