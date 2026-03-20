# Étude : superbes ajouts Carbon Design System v11 à intégrer sur normco.re

## Constat rapide sur l'existant

Le blog utilise déjà plusieurs patterns Carbon v11 de façon solide :

- **UI Shell header + side nav** pour la navigation principale.
- **Tags**, **tiles**, **breadcrumb**, **popover/toggletip** et **code
  snippet/button** sur les pages éditoriales et la page de syndication.
- Une **recherche** maison stylée sur les tokens Carbon, mais sans composant
  Carbon complet pour les états de chargement et de retour d'action.

En pratique, la base visuelle est déjà cohérente. Les meilleurs ajouts Carbon
v11 à viser maintenant sont donc ceux qui :

1. améliorent la lisibilité d'un blog riche en contenu,
2. réduisent la charge cognitive,
3. renforcent les états système (chargement, succès, erreur),
4. restent compatibles avec ton architecture statique Deno/Lume.

## Priorités recommandées

### 1. **Tabs contenues** pour segmenter les vues éditoriales importantes

**Pourquoi c'est prometteur**

Carbon décrit les tabs comme un bon pattern pour regrouper du contenu lié sans
faire quitter la page. C'est exactement adapté à des vues de blog du type : «
Derniers articles », « Par tags », « Par année », « Formats », ou « Billets /
Notes / Guides » si tu enrichis ton contenu plus tard.

**Où l'intégrer sur normco.re**

- **Page d'accueil** : remplacer ou compléter la section "recent posts" par des
  onglets comme **Récents / Tags / Archives**.
- **Page `/posts/`** : introduire des tabs **Par année / Par thème / Par durée
  de lecture**.
- **Page `/about/`** : séparer **bio / stack / contact / feeds** au lieu d'une
  longue page continue.

**Pourquoi c'est mieux que d'ajouter simplement plus de blocs**

- Cela garde une hiérarchie claire.
- Cela évite d'allonger la page d'accueil.
- Cela reste plus approprié que le content switcher si les sections deviennent
  vraiment distinctes.

**Niveau d'effort** : moyen.

---

### 2. **Content switcher** pour alterner des vues d'un même contenu

**Pourquoi c'est prometteur**

Carbon recommande le content switcher pour basculer entre des vues alternatives
d'un même ensemble de données, par exemple grille vs liste. C'est très adapté à
un blog où les mêmes posts peuvent être explorés différemment.

**Où l'intégrer sur normco.re**

- **Accueil** ou **archives** : bascule **cartes / liste compacte** pour les
  articles.
- **Syndication** : bascule **cards / tableau structuré** pour les endpoints
  RSS, Atom, JSON Feed et sitemap.
- **Tags** : bascule **toutes les publications / publications récentes**.

**Cas idéal**

Si tu veux garder la même donnée mais offrir une lecture plus dense sur desktop
et plus éditoriale sur mobile, c'est probablement l'ajout Carbon v11 le plus
naturel.

**Niveau d'effort** : faible à moyen.

---

### 3. **Structured list** pour des surfaces plus denses et plus "scannables"

**Pourquoi c'est prometteur**

Carbon positionne la structured list comme un pattern simple pour présenter de
l'information groupée, scannable, en plusieurs lignes. Pour un blog personnel,
c'est excellent quand on veut afficher des métadonnées ou des options sans
tomber dans une data table trop "app produit".

**Où l'intégrer sur normco.re**

- **`/syndication/`** : présenter les formats de feed sous forme de structured
  list avec colonnes **format / URL / usage**.
- **`/about/`** : transformer certains blocs de faits personnels en liste
  structurée.
- **Pages d'archives** : version compacte de la liste des posts avec **date /
  titre / temps de lecture / tag principal**.

**Bénéfice principal**

Tu gagnerais une deuxième densité de lecture : les tiles actuelles restent
belles, mais une structured list offrirait une lecture plus rapide pour les
visiteurs récurrents.

**Niveau d'effort** : faible.

---

### 4. **Accordion** pour condenser le contenu secondaire sans perdre la richesse éditoriale

**Pourquoi c'est prometteur**

Carbon recommande l'accordion pour la divulgation progressive quand l'espace est
limité ou quand tout le contenu n'a pas besoin d'être lu d'un coup. Pour un
blog, c'est idéal pour les sections secondaires mais utiles.

**Où l'intégrer sur normco.re**

- **`/about/`** : blocs **contact**, **langues**, **outils**, **présence en
  ligne**, **FAQ**.
- **Longs articles** : encarts "notes", "sources", "annexes", "changements
  depuis la publication".
- **Page de syndication** : panneau "À quoi sert chaque feed ?" ou "Comment
  consommer ces endpoints ?".

**Attention UX**

Je ne l'utiliserais pas pour le contenu principal des billets, car Carbon
rappelle que l'accordion peut cacher une information que l'utilisateur devrait
lire en entier. En revanche, pour le contenu auxiliaire, c'est un très bon fit.

**Niveau d'effort** : faible à moyen.

---

### 5. **Inline loading + notifications** pour professionnaliser les micro-interactions

**Pourquoi c'est prometteur**

C'est probablement le gain qualitatif le plus visible sans gros redesign. Carbon
distingue bien :

- **inline loading** pour une action courte en cours,
- **inline notification** pour un résultat dans le flux,
- **toast** pour un retour bref non bloquant.

**Où l'intégrer sur normco.re**

- **Recherche du header** : remplacer l'état de chargement artisanal par un
  pattern inline loading Carbon.
- **Copie d'URL de feed** sur `/syndication/` : notification inline ou toast au
  lieu d'un simple changement discret d'icône.
- **Mode hors ligne / service worker** : notification claire lors d'un fallback
  offline, d'un cache mis à jour, ou d'une erreur réseau.

**Pourquoi c'est important**

Le site a déjà des scripts pour la copie, la recherche lazy, le thème et le
service worker. Donc tu as déjà les interactions ; Carbon peut maintenant les
rendre plus explicites, plus accessibles et plus premium.

**Niveau d'effort** : faible.

---

### 6. **Skeleton states** pour la recherche et les chargements perçus

**Pourquoi c'est prometteur**

Carbon recommande d'éviter les gros loaders pour du contenu progressif et de
préférer des skeleton states lorsque du contenu est en train d'apparaître. Pour
une recherche intégrée à l'en-tête ou des listes de billets filtrées côté
client, l'effet est nettement plus moderne.

**Où l'intégrer sur normco.re**

- **Résultats Pagefind** pendant l'initialisation lazy.
- **Vue archive filtrée** si tu ajoutes tri, filtre ou switch de vue côté
  client.
- **Chargement d'images secondaires** dans certaines surfaces éditoriales
  futures.

**Bénéfice principal**

Le site paraîtra plus rapide, même quand il attend réellement une indexation ou
une réponse locale.

**Niveau d'effort** : faible à moyen.

## Shortlist finale : mes 4 meilleurs paris pour ton blog

Si tu veux avancer sans surcharger le produit, je prioriserais :

1. **Inline loading + notifications** pour les micro-interactions.
2. **Content switcher** pour proposer **cards / liste compacte** dans les
   archives.
3. **Structured list** pour enrichir `/syndication/` et potentiellement
   `/about/`.
4. **Tabs contenues** pour donner à l'accueil ou aux archives une navigation
   éditoriale plus ambitieuse.

## Plan d'intégration suggéré

### Phase 1 — gains rapides

- Ajouter **inline loading** et **notifications** autour de la recherche, de la
  copie, et de l'offline.
- Convertir `/syndication/` vers une **structured list** optionnelle ou une vue
  alternative.

### Phase 2 — gain éditorial visible

- Ajouter un **content switcher** sur la page des articles pour alterner **cards
  / liste**.
- Ajouter des **skeleton states** pour la recherche et les vues filtrées.

### Phase 3 — refonte légère de l'architecture d'information

- Introduire des **tabs contenues** sur l'accueil ou `/about/`.
- Réserver les **accordions** aux contenus secondaires, FAQ, annexes, ou
  meta-contenus.

## Ce que je déconseille pour l'instant

- **Data table** pour les billets principaux : trop "application métier" pour le
  ton éditorial actuel.
- **Composants trop transactionnels** (combo box complexes, batch actions, etc.)
  : puissants, mais peu alignés avec l'expérience blog.
- **Accordion partout** : utile en appoint, mais pas comme structure dominante
  pour des billets de lecture longue.

## Conclusion

Le blog a déjà une excellente base Carbon v11. Les ajouts les plus "superbes" ne
sont pas forcément les plus spectaculaires visuellement : ce sont surtout ceux
qui rendront l'expérience **plus lisible, plus dense quand il faut, et plus
claire dans les états système**.

En clair, si je devais choisir un seul cap : **faire monter le site d'un cran
sur les états d'interface (loading/notification/skeleton), puis offrir une
double lecture des contenus (cards vs liste) avec content switcher + structured
list**.

# Opportunités Carbon Design System v11 pour le blog

_Date de l'étude : 20 mars 2026._

## Constat rapide sur l'existant

Le blog exploite déjà une base Carbon v11 solide :

- **UI Shell Header + SideNav** dans l'en-tête.
- **Tiles**, **tags**, **breadcrumb**, **popover/toggletip** et la **grille
  Carbon**.
- Un **pont de tokens** maison dans `src/styles/carbon/_theme-tokens.scss` pour
  exposer les primitives de thème, d'espacement, de motion et de surface.
- Des composants éditoriaux locaux (`PostCard`, `StatePanel`, `feature-layout`,
  pages `about`, `syndication`, etc.) qui restent proches du langage visuel
  Carbon sans dépendre d'un framework client lourd.

En revanche, plusieurs patterns Carbon v11 pertinents pour un blog éditorial
restent encore sous-exploités.

## Recommandations priorisées

### 1. Ajouter des notifications inline/callout pour les états importants

**Pourquoi c'est un très bon fit**

Le site possède déjà plusieurs moments de feedback : recherche indisponible ou
hors ligne, copie d'URL/feed, état offline, succès/erreur de copie de code.
Carbon recommande les notifications pour fournir une information concise,
contextualisée et actionnable.

**Où l'intégrer**

- **Panneau de recherche** : afficher une notification inline quand Pagefind est
  indisponible, en erreur, ou lorsque l'utilisateur est hors ligne.
- **Page de syndication** : remplacer le feedback uniquement visuel de copie par
  une notification inline ou callout persistante pour mieux expliciter « copié
  », « échec », « ouvrir dans un lecteur ».
- **Page offline / états vides** : utiliser une variante callout pour distinguer
  un état système (hors-ligne) d'un simple état vide éditorial.

**Bénéfices**

- Meilleur feedback accessible et plus cohérent.
- Hiérarchie visuelle plus claire entre information, succès, avertissement et
  erreur.
- Réduction des micro-patterns maison dispersés.

**Effort estimé** : faible à moyen.

### 2. Introduire un vrai pattern Tabs ou Content Switcher sur les pages d'index

**Pourquoi c'est intéressant**

Le blog a déjà plusieurs regroupements naturels de contenu : récent, archives,
tags, potentiellement langue/format/vue. Carbon distingue bien :

- **Tabs** pour des zones de contenu distinctes mais liées.
- **Content switcher** pour différentes vues d'un même contenu.

**Idées concrètes**

- **Accueil** : basculer entre « Récents », « Sujets », « Séries / Dossiers » si
  tu développes ces sections.
- **Archives** : proposer un content switcher entre **vue chronologique** et
  **vue par tags**.
- **Syndication** : basculer entre **feeds**, **endpoints techniques**, **usage
  mobile/lecture** si cette page grossit.

**Attention de conception**

- Si le contenu change de nature, préférer **Tabs**.
- Si c'est la même collection avec une autre organisation visuelle, préférer
  **Content switcher**.

**Bénéfices**

- Navigation plus claire sans explosion du nombre de pages.
- Très bon levier pour enrichir le blog sans alourdir l'architecture Lume.
- Compatible avec ta logique TSX serveur + un JS minimal.

**Effort estimé** : moyen.

### 3. Utiliser un Accordion pour la méta-information secondaire

**Pourquoi c'est pertinent**

Carbon recommande l'accordion pour condenser de l'information secondaire ou
annexe. Sur un blog, c'est utile tant que l'on n'y cache pas le cœur de
l'article.

**Cas d'usage adaptés**

- **Bas de billet** : « Contexte », « Références », « Crédits », « Notes de
  traduction », « Historique des mises à jour ».
- **About** : FAQ courte, détails de contact, politique de réponse, stack,
  préférences de communication.
- **Syndication** : explications techniques sur RSS/Atom/JSON Feed,
  compatibilité clients, conventions de découverte.

**À éviter**

- Ne pas cacher l'introduction d'un article ou les informations essentielles que
  tout le monde doit lire.
- Ne pas empiler des accordions partout dans les pages très éditoriales.

**Bénéfices**

- Densité d'information mieux maîtrisée sur mobile.
- Alignement direct avec les recommandations Carbon sur la divulgation
  progressive.
- Permet de garder les pages longues élégantes sans les fragmenter en routes
  supplémentaires.

**Effort estimé** : faible à moyen.

### 4. Ajouter des skeleton/loading states plus Carbon pour la recherche et le chargement différé

**Pourquoi c'est utile**

Le site possède déjà plusieurs comportements asynchrones : initialisation
paresseuse de la recherche, service worker, copie, bascules d'interface. Carbon
recommande les **skeleton states** pour le contenu en cours d'apparition et le
composant **loading** pour les attentes plus longues ou bloquantes.

**Opportunités concrètes**

- **Recherche** : pendant le chargement de l'index/l'initialisation Pagefind,
  afficher un skeleton de résultats ou un inline loading.
- **Syndication / copy controls** : utiliser un mini état de loading pendant la
  copie ou la résolution d'une action asynchrone.
- **Offline fallback** : pour les ressources qui reviennent après reconnexion,
  afficher un état de transition plus rassurant.

**Bénéfices**

- Perception de performance meilleure.
- Réduction des transitions abruptes entre « rien » et « contenu affiché ».
- Plus grande cohérence avec le langage motion/timing déjà exposé dans les
  tokens.

**Effort estimé** : faible.

### 5. Renforcer les pages éditoriales avec des sections "callout" Carbon assumées

**Pourquoi c'est prometteur**

Tu utilises déjà des `cds--tile` pour les hero sections et les cartes. Le
prochain cap naturel consiste à créer des **callouts éditoriaux** inspirés des
surfaces Carbon : résumé, takeaway, note de version, note de traduction, encadré
"à lire ensuite".

**Applications directes**

- **En haut d'article** : encadré « Ce billet couvre » avec 3–4 points.
- **En bas d'article** : « À lire ensuite » ou « Articles liés » dans une tile
  accentuée.
- **About** et **Syndication** : cartes de contexte plus explicites pour les
  actions primaires.

**Pourquoi c'est "Carbon-compatible"**

- Carbon pousse une hiérarchie claire des surfaces, des espacements et des
  contrastes.
- Tu as déjà le socle de tokens (`layer`, `layer-hover`, `border-subtle`,
  `focus`, motion) pour créer ce pattern proprement sans valeurs arbitraires.

**Bénéfices**

- Montée en gamme perçue du rendu éditorial.
- Plus de scannabilité sur mobile et desktop.
- Réemploi transversal dans toutes les pages sans multiplier les exceptions CSS.

**Effort estimé** : faible à moyen.

### 6. Faire évoluer la navigation latérale d'article vers une mini table des matières Carbon-like

**Pourquoi c'est l'ajout le plus "premium"**

Aujourd'hui, le rail d'article sert surtout aux tags et à la navigation
précédent/suivant. Un excellent ajout serait une **mini table des matières**
sticky, traitée comme un groupe de liens verticaux Carbon.

**Implémentation possible**

- Générer un sommaire à partir des `h2/h3` du contenu Markdown.
- Afficher la navigation en rail sur desktop et dans un disclosure/accordion sur
  mobile.
- Utiliser `aria-current` sur la section active si tu ajoutes un surlignage
  progressif côté client.

**Bénéfices**

- Très forte amélioration UX sur les billets longs et techniques.
- Rend la colonne de droite beaucoup plus utile.
- S'accorde très bien avec la logique Carbon de navigation secondaire et
  d'alignement à la grille.

**Effort estimé** : moyen à élevé.

## Feuille de route recommandée

### Quick wins (1–2 itérations)

1. **Notifications inline/callout** sur recherche, copie, offline.
2. **Loading / skeleton states** pour la recherche.
3. **Callouts éditoriaux** réutilisables sous forme d'un composant TSX local.

### Chantiers à impact moyen

4. **Accordion** pour la méta-information et les FAQ.
5. **Mini table des matières** dans le rail des articles.

### Refonte structurante

6. **Tabs / Content switcher** sur les pages d'index et d'archives, quand tu
   voudras enrichir les vues sans créer trop de routes.

## Mon top 3 pour ton blog

Si je devais choisir uniquement trois ajouts Carbon v11 pour obtenir le meilleur
ratio élégance / utilité / coût :

1. **Notifications inline/callout**.
2. **Loading + skeleton states** autour de la recherche.
3. **Mini table des matières d'article** dans le rail sticky.

## Références Carbon consultées

- https://carbondesignsystem.com/components/notification/usage/
- https://carbondesignsystem.com/components/content-switcher/usage/
- https://carbondesignsystem.com/components/tabs/usage/
- https://carbondesignsystem.com/components/accordion/usage/
- https://carbondesignsystem.com/components/loading/usage/

Summary Ajouté une note d’étude en français dans
docs/carbon-v11-opportunities.md qui recense les ajouts Carbon v11 les plus
pertinents pour ton blog, avec un diagnostic de l’existant, 6 pistes
prioritaires, une shortlist finale et un plan d’intégration par phases. L’étude
s’appuie sur les patterns Carbon déjà présents dans le repo, notamment le UI
Shell header avec actions globales, navigation et search trigger. J’ai aussi
pris en compte les surfaces déjà très Carbon de la page de syndication — tiles,
tags, bouton de copie, live region — pour recommander en priorité structured
list, content switcher, inline loading et notifications. Les recommandations sur
l’accordion et la divulgation progressive sont également alignées avec
l’existant de la page about, qui utilise déjà des toggletips/popovers et des
surfaces dialog-likes pour le contact. Enfin, la priorité donnée à inline
loading et aux skeleton states vient du fait que la recherche actuelle possède
déjà un état de chargement custom dans les styles du header, donc il y a une
opportunité claire de la faire monter d’un cran avec des patterns Carbon plus
explicites. Testing ✅ git status --short && printf '\n--- note with line
numbers ---\n' && nl -ba docs/carbon-v11-opportunities.md | sed -n '1,260p' ✅
git diff -- docs/carbon-v11-opportunities.md ⚠️ deno fmt
docs/carbon-v11-opportunities.md (impossible ici car deno n’est pas disponible
dans l’environnement) ✅ git add docs/carbon-v11-opportunities.md && git commit
-m "docs: add Carbon v11 opportunities study" Références Carbon consultées Tabs:
https://carbondesignsystem.com/components/tabs/usage/ Inline loading:
https://carbondesignsystem.com/components/inline-loading/usage/ Search:
https://carbondesignsystem.com/components/search/usage/ Structured list:
https://carbondesignsystem.com/components/structured-list/usage/ Accordion:
https://carbondesignsystem.com/components/accordion/usage/ Notification:
https://carbondesignsystem.com/components/notification/usage/

Étude : les meilleurs ajouts Carbon Design System v11 pour ton blog J’ai regardé
les consignes locales, l’implémentation actuelle du blog, et la doc officielle
Carbon v11 avant de recommander des ajouts. Le site utilise déjà une base Carbon
assez solide : UI Shell header, panels d’actions, tags, breadcrumb, tiles,
tokens de thème, et quelques patterns avancés autour des popovers/toggletips.
Commandes utilisées cat CLAUDE.md cat AGENTS.md cat deno.json sed -n '1,260p'
src/_components/Header.tsx sed -n '1,240p' src/index.page.tsx sed -n '1,260p'
src/posts/index.page.tsx sed -n '1,260p' src/about.page.tsx sed -n '1,220p'
src/_components/PostCard.tsx sed -n '1,260p' src/styles/components/_header.scss
sed -n '1,260p' src/styles/carbon/_theme-tokens.scss sed -n '1,280p'
src/_includes/layouts/post.tsx sed -n '1,260p' src/styles/components/_post.scss
nl -ba ... | sed -n ... pour relever les lignes citées. Mon diagnostic rapide Ce
que le blog fait déjà bien Header Carbon mature avec navigation, recherche,
changement de langue, thème, tooltip/popover et états ARIA propres. Homepage
éditoriale avec hero, tags mis en avant, liste de posts sous forme de tiles.
Archive par année avec navigation secondaire et tags de résumé. Page article
avec breadcrumb, métadonnées, rail latéral, navigation précédent/suivant, et
copie de code custom. Pont de tokens Carbon v11 déjà bien structuré, ce qui rend
des ajouts futurs cohérents et sûrs. Là où Carbon peut encore apporter beaucoup
Le blog a déjà le “socle”. Les meilleurs ajouts ne sont donc pas des composants
gadget, mais des composants/patterns qui : améliorent la découvrabilité du
contenu, renforcent la lisibilité longue durée, rendent les micro-interactions
plus cohérentes et accessibles, exploitent mieux les patterns Carbon déjà
proches de ton architecture. Recommandations priorisées

1. Ajouter des Tabs sur les pages d’archives ou de taxonomie Pourquoi c’est un
   super fit Carbon dit que les tabs servent à organiser des contenus liés dans
   un même contexte, sans quitter la page. C’est exactement le besoin d’un blog
   multilingue et multi-collections. Source : Carbon Tabs usage.
   https://carbondesignsystem.com/components/tabs/usage/ Où je les vois sur ton
   blog Archive /posts/ : onglet “Tous” onglet “Par année” onglet “Par thème”
   éventuellement “Longs formats” / “Notes” si tu fais évoluer le modèle
   éditorial Aujourd’hui, l’archive est surtout structurée par année avec une
   nav de sauts. C’est propre, mais encore assez mono-vue. Pourquoi c’est
   meilleur qu’un simple tri La doc Carbon précise que les tabs sont adaptées à
   des groupes de contenus distincts, alors que les content switchers servent
   plutôt à changer de format ou filtrer le même contenu.
   https://carbondesignsystem.com/components/tabs/usage/
   https://carbondesignsystem.com/components/content-switcher/usage/ Impact Très
   bon gain UX. Gros potentiel SEO/engagement si les vues restent
   server-rendered ou URL-addressables. Faible risque design, car ton site a
   déjà des rails et des sections bien délimitées. Priorité : très haute.
2. Ajouter un Content Switcher pour alterner la vue des listes de posts Pourquoi
   c’est pertinent Carbon recommande le content switcher pour alterner des vues
   équivalentes d’un même contenu. C’est plus juste qu’un tab si tu veux, par
   exemple : vue compacte vue détaillée vue chronologique vue grille / vue liste
   Source : https://carbondesignsystem.com/components/content-switcher/usage/ Où
   l’utiliser Sur : la homepage “Recent posts”, l’archive /posts/, les pages de
   tags. Aujourd’hui, tes post cards sont élégantes mais uniques dans leur
   présentation. Exemples concrets Compacte : date + titre Détaillée : date +
   titre + résumé + durée de lecture Timeline : accent fort sur l’ordre
   chronologique Pourquoi c’est fort pour ton blog Ton contenu semble éditorial,
   pas purement transactionnel. Offrir au lecteur une manière de “choisir sa
   densité d’information” est un ajout très Carbon dans l’esprit, sans alourdir
   le site. Priorité : haute.

3. Ajouter un sommaire d’article en rail avec Accordion sur mobile Pourquoi
   c’est probablement le meilleur ajout “lecture longue” Tu as déjà un rail
   latéral sur les pages de post, utilisé pour tags et prev/next. C’est
   l’endroit idéal pour un table of contents : desktop : rail fixe avec ancres
   vers h2 / h3 mobile : version Accordion “Dans cet article” Carbon recommande
   l’accordion pour du contenu relié à divulgation progressive, surtout quand
   l’espace est limité ou en sidebar.
   https://carbondesignsystem.com/components/accordion/usage/ Pourquoi c’est
   plus qu’un gadget améliore la scanabilité, valorise les longs articles, aide
   énormément sur mobile, exploite une structure déjà présente. Pourquoi
   Accordion et pas juste une liste Parce que Carbon le positionne bien pour les
   zones secondaires ou contraintes, et ta page post a déjà cette logique
   “feature rail”. Priorité : haute.

4. Remplacer le bouton de copie de code custom par le pattern Code Snippet de
   Carbon Pourquoi c’est cohérent Tu as déjà une logique de détection des blocs
   de code et un bouton de copie maison. Or Carbon a un composant Code snippet
   précisément pensé pour :

texte read-only, bouton de copie, version single-line et multi-line, gestion
plus cohérente des usages doc/dev. Source :
https://carbondesignsystem.com/components/code-snippet/usage/ Bénéfices plus
fidèle au langage Carbon, moins de maintenance custom, meilleur alignement
visuel avec le reste du système, plus simple à enrichir si tu veux “show more /
show less”. Mon avis Si ton blog contient régulièrement du code, c’est un quick
win très visible. Priorité : haute si le blog a une part technique ; moyenne
sinon.

5. Ajouter de vrais loading states Carbon pour la recherche et les
   rafraîchissements Pourquoi Tu as déjà une recherche dans le header avec
   statut custom et spinner CSS. Ça marche, mais Carbon propose un cadre plus
   net : Inline loading pour une action courte, Skeleton states pour chargement
   initial ou rafraîchissement structurel, pattern de loading pour décider quoi
   utiliser. Sources :
   https://carbondesignsystem.com/components/inline-loading/usage/
   https://carbondesignsystem.com/patterns/loading-pattern Applications
   possibles recherche Pagefind dans le header, chargement différé d’un index ou
   d’une vue alternative, lazy loading d’un futur sommaire ou de recommandations
   de posts. Pourquoi c’est bien pour ton blog Même sur un site statique, tu as
   des zones d’UI “dynamiques” : recherche, toggles, copie de code, éventuels
   enrichissements futurs côté client. Priorité : moyenne-haute.
6. Introduire des Inline / Callout Notifications pour les retours importants
   Pourquoi Carbon distingue très bien : information, succès, warning, erreur,
   callout avant action. Source :
   https://carbondesignsystem.com/components/notification/usage/ Où ça serait
   utile succès/échec de copie de code, recherche indisponible, mode hors-ligne,
   annonce de contenu localisé manquant, avertissement sur liens externes
   spéciaux ou archives anciennes. Pourquoi c’est intéressant ici Tu as déjà de
   la micro-interaction, mais beaucoup de feedback reste implicite ou custom.
   Une vraie notification Carbon rendrait ces états : plus explicites, plus
   cohérents, plus accessibles. Priorité : moyenne.
7. Repenser la page About avec Structured content patterns Carbon Ce que je vois
   aujourd’hui La page About a déjà une très bonne base : facts, contacts,
   toggletips, visuels, boutons fantômes. Ce que j’ajouterais Accordion pour
   séparer “À propos”, “Contacts”, “Langues”, “Syndication”, “Now / setup”. ou
   Contained tabs si tu veux une About plus “profil produit”. éventuellement
   Structured list pour certains blocs bio/données. Carbon mentionne
   explicitement structured list, tabs et accordion comme solutions selon la
   nature du contenu. https://carbondesignsystem.com/components/accordion/usage/
   https://carbondesignsystem.com/components/tabs/usage/
   https://carbondesignsystem.com/components/structured-list/usage/ Pourquoi Ta
   page About est déjà assez riche. La rendre plus modulable aiderait sans la
   dénaturer. Priorité : moyenne.

Ce que je recommande moins

1. Plus de modales Tu as déjà un pattern proche de la modalisation sur les
   toggletips de contact. Je n’irais pas plus loin sauf besoin fort. Pour un
   blog, trop de surfaces modales nuisent à la lecture.
2. Des composants “enterprise” lourds type data table Pour un blog, sauf si tu
   construis une vraie base de connaissances, ça risque de sur-industrialiser
   l’expérience.
3. Des ajouts purement décoratifs Ton pont de tokens Carbon v11 est déjà propre
   et ton design a une identité éditoriale. Je privilégierais des composants qui
   améliorent le parcours de lecture, pas seulement le look. Top 5 final, si je
   devais choisir

1) Tabs pour l’archive et les collections Le meilleur ratio valeur/coût.
2) Sommaire d’article avec rail + Accordion mobile Le plus fort pour
   l’expérience de lecture.
3) Content Switcher pour vue compacte/détaillée des posts Très Carbon, très
   utile, élégant.
4) Code Snippet Carbon pour les blocs de code Très bon quick win si tu publies
   du contenu technique.
5) Loading + Skeleton/Inline loading pour la recherche et les vues dynamiques
   Rend le site plus mature sans le compliquer. Proposition de roadmap
   pragmatique Phase 1 — gains rapides Code Snippet pour les blocs de code.
   Inline loading / meilleure notification sur recherche et copie. Sommaire
   d’article simple. Phase 2 — gains structurants Tabs sur /posts/. Content
   Switcher sur les listes de posts. Phase 3 — raffinement éditorial Refonte
   About avec Accordion ou Contained Tabs. Notifications callout contextuelles.
   Skeleton states si certaines vues deviennent plus dynamiques. Conclusion Si
   ton objectif est d’ajouter des éléments vraiment superbes de Carbon v11, je
   ne viserais pas “plus de composants”, mais les bons patterns Carbon aux bons
   endroits : Tabs pour structurer les archives, Content Switcher pour adapter
   la densité de lecture, Accordion pour le sommaire mobile et certains contenus
   secondaires, Code Snippet pour les articles techniques, Loading/Notification
   patterns pour rendre les micro-interactions plus nettes. Le blog a déjà une
   base Carbon crédible ; l’étape suivante est surtout de faire évoluer le site
   de “joli blog Carbon” vers “expérience éditoriale Carbon vraiment pensée”.
   Sources officielles Carbon consultées Accordion:
   https://carbondesignsystem.com/components/accordion/usage/ Tabs:
   https://carbondesignsystem.com/components/tabs/usage/ Content switcher:
   https://carbondesignsystem.com/components/content-switcher/usage/ Inline
   loading: https://carbondesignsystem.com/components/inline-loading/usage/
   Notification: https://carbondesignsystem.com/components/notification/usage/
   Code snippet: https://carbondesignsystem.com/components/code-snippet/usage/
   Loading pattern: https://carbondesignsystem.com/patterns/loading-pattern

Analyse : les meilleurs ajouts Carbon v11 à intégrer sur ton blog J’ai regardé
l’implémentation actuelle du site et les points d’entrée Carbon déjà présents,
puis je les ai comparés aux patterns/composants Carbon v11 les plus pertinents
pour un blog éditorial multilingue. Le blog utilise déjà très bien plusieurs
briques Carbon : UI Shell header, recherche globale, tags, tiles, toggletip et
une couche de tokens Carbon centralisée. Ce que j’ai observé dans le repo Le
header est déjà structuré comme un Carbon UI Shell header avec menu, navigation,
recherche, sélecteur de langue et thème. La home met en avant un hero, des tags
et des post cards sous forme de tiles. Tu as déjà un pattern local d’empty state
via StatePanel. La page About exploite déjà un pattern Carbon proche du
toggletip/popover pour les QR codes de contact. Les tokens de thème sont bien
centralisés et exposés sous forme de variables CSS, ce qui facilite l’adoption
de nouveaux composants Carbon v11 sans dérive visuelle. Top 6 des ajouts Carbon
v11 que je te recommande

1. Tabs pour structurer les pages “Posts”, “Tags” ou “About” Pourquoi c’est un
   super ajout : Carbon recommande les tabs pour séparer des zones de contenu
   distinctes, contrairement au content switcher qui sert plutôt à alterner des
   vues proches d’un même contenu. Sur un blog, c’est très utile pour basculer
   entre : “Tous les posts” / “Séries” / “Notes” / “Guides” “Par date” / “Par
   popularité” / “Par sujet” Sur About : “Bio” / “Contact” / “Feeds” Ton site a
   déjà plusieurs entrées éditoriales claires, donc les tabs peuvent améliorer
   la lisibilité sans alourdir la navigation primaire. La home et les listings
   actuels sont déjà composés en sections assez nettes, ce qui se prête bien à
   cette hiérarchie. Où l’intégrer :

src/posts/index.page.tsx pour filtrer les archives. src/about.page.tsx si tu
veux séparer bio/contact/feeds. éventuellement src/tags/index.page.ts Niveau
d’impact : élevé, faible risque. Référence Carbon :
https://carbondesignsystem.com/components/tabs/usage/

2. Content switcher pour alterner des vues proches d’un même contenu Pourquoi
   c’est intéressant : Carbon explique que le content switcher est idéal pour
   basculer entre des vues liées, par exemple grille/liste ou “All / Read /
   Unread”. C’est parfait pour un blog qui voudrait offrir : vue carte vs vue
   compacte extraits vs titres seuls posts vs notes courtes français vs anglais
   pour certains index expérimentaux C’est particulièrement pertinent parce que
   tes PostCard sont déjà des tiles homogènes ; tu as donc une bonne base pour
   proposer une deuxième visualisation plus dense. Où l’intégrer :

archive des posts page de tags éventuellement résultats de recherche Quand le
préférer aux tabs : si les données restent les mêmes mais l’angle d’affichage
change. Référence Carbon :
https://carbondesignsystem.com/components/content-switcher/usage/ 3. Structured
list pour une archive plus scannable Pourquoi c’est l’un des meilleurs fits blog
: Carbon décrit la structured list comme une façon simple et scannable
d’afficher plusieurs lignes d’information. C’est excellent pour une page
d’archives ou une page “all posts” avec : date titre temps de lecture langue
tags Aujourd’hui, tes posts sont rendus comme des tiles, ce qui marche bien en
homepage, mais une archive longue gagnerait en densité et en vitesse de scan
avec une structured list. Cas d’usage très concret :

Home = garder les cards expressives. Archive = structured list plus compacte.
Version mobile = garder la pile verticale simple. Desktop = colonnes Date /
Titre / Temps / Tags. Référence Carbon :
https://carbondesignsystem.com/components/structured-list/usage/ 4. Accordion
pour les contenus secondaires ou guides longs Pourquoi c’est utile : Carbon
précise que l’accordion sert à condenser beaucoup d’information lorsque l’espace
est limité, notamment sur mobile ou dans des espaces latéraux. Pour un blog,
c’est idéal pour : FAQ en bas d’un article technique notes complémentaires
changelog d’un post table “Ressources liées” sections “Lire aussi” Comme ton
site est éditorial et multilingue, cela peut éviter des pages trop longues tout
en gardant l’information disponible. Mais Carbon prévient aussi qu’il ne faut
pas en abuser si l’utilisateur doit vraisemblablement tout lire. Donc je le
recommande surtout pour du contenu secondaire, pas pour le corps principal des
posts. Où l’intégrer :

layout de post about FAQ ou annexe technique Référence Carbon :
https://carbondesignsystem.com/components/accordion/usage/ 5. Renforcer les
empty states Carbon-style Pourquoi c’est pertinent chez toi : Tu as déjà un
composant StatePanel, donc tu es proche d’un pattern Carbon cohérent. Carbon
insiste sur le fait qu’un empty state doit être proportionné au contexte,
notamment pour les cas “no results” et “no data yet”. Ton site a déjà : une
recherche globale Pagefind un state panel local des archives/listings qui
peuvent potentiellement être vides Donc l’ajout le plus rentable n’est pas
forcément un nouveau composant, mais une montée en gamme Carbon du pattern
existant : empty state spécifique pour recherche sans résultat état offline plus
explicite call-to-action adapté selon la page variante plus “editorial” avec
pictogramme léger Ton StatePanel est propre et extensible ; il pourrait devenir
le socle commun de tous ces états. Référence Carbon :
https://carbondesignsystem.com/patterns/empty-states-pattern/

6. Faire évoluer la recherche vers une expérience Carbon plus expressive
   Pourquoi c’est prioritaire : Le header contient déjà une recherche globale et
   des styles dédiés à Pagefind. Carbon recommande la search au niveau global
   pour les sites où la recherche est un vrai moyen de découverte. C’est
   manifestement ton cas. La grosse opportunité n’est pas “ajouter Search” — tu
   l’as déjà — mais la faire évoluer vers une expérience plus Carbon v11 :

meilleure hiérarchie visuelle du panneau suggestions ou liens rapides états
loading / no results / offline mieux cadrés recherche recentrée sur le contenu
éditorial Vu l’existence de pagefind-lazy-init.js et du styling _header.scss,
c’est probablement l’amélioration la plus rentable à court terme. Améliorations
concrètes :

ajouter une section “Sujets populaires” proposer des requêtes suggérées rendre
le panneau plus proche d’un espace “discover” améliorer la gestion des statuts
pour mobile et clavier Référence Carbon :
https://carbondesignsystem.com/components/search/usage/ Mes recommandations
classées par priorité Priorité 1 — très forte valeur Tabs sur les pages
d’archives ou About Structured list pour les archives Amélioration de la
recherche globale Priorité 2 — très bons compléments Content switcher vue carte
/ vue compacte Empty states plus riches et plus spécifiques Priorité 3 — à
utiliser avec parcimonie Accordion pour FAQ / annexes / contenus secondaires Ce
que je ne recommanderais pas en premier Side panel Le site a déjà des panneaux
dans le header et un bon usage du shell. Mais pour un blog, un vrai side panel
additionnel me paraît moins prioritaire qu’une meilleure archive, une meilleure
recherche ou des tabs. Je le réserverais à un futur usage comme : filtres
avancés de recherche sommaire d’article préférences de lecture Composants
data-heavy Des composants comme data table ou progress indicator sont excellents
dans Carbon, mais moins naturels ici tant que le blog reste un site éditorial
plutôt qu’un outil. Proposition de roadmap concrète Option A — “impact rapide”
améliorer la recherche globale enrichir StatePanel introduire tabs sur About ou
Posts Option B — “meilleure expérience de lecture” archive en structured list
content switcher carte/liste tabs pour naviguer entre catégories de contenu
Option C — “blog éditorial premium” recherche Carbon plus riche archives
structurées empty states illustrés accordion pour FAQs et notes techniques tabs
verticales sur certaines pages longues Mon avis final Si je devais choisir 3
ajouts Carbon v11 maximum pour ton blog, je prendrais : Structured list pour les
archives Tabs pour organiser les sections éditoriales Upgrade de la recherche
déjà en place C’est le trio qui améliorerait le plus : la découvrabilité, la
densité d’information, et la sensation “Carbon v11 mature” sans dénaturer
l’identité du blog. Sources Carbon consultées Search:
https://carbondesignsystem.com/components/search/usage/ Content switcher:
https://carbondesignsystem.com/components/content-switcher/usage/ Structured
list: https://carbondesignsystem.com/components/structured-list/usage/ Tabs:
https://carbondesignsystem.com/components/tabs/usage/ Accordion:
https://carbondesignsystem.com/components/accordion/usage/ Empty states pattern:
https://carbondesignsystem.com/patterns/empty-states-pattern/ Commandes
consultées Voici les commandes terminal que j’ai utilisées pour étudier le repo
: pwd && rg --files -g 'AGENTS.md' -g 'CLAUDE.md' -g 'package.json' -g
'deno.json*' -g 'src/**' . cat AGENTS.md cat CLAUDE.md sed -n '1,220p'
src/_components/Header.tsx sed -n '1,240p' src/index.page.tsx sed -n '1,220p'
src/_components/PostCard.tsx sed -n '1,240p' src/about.page.tsx nl -ba
src/_components/Header.tsx | sed -n '1,260p' nl -ba src/index.page.tsx | sed -n
'1,260p' nl -ba src/_components/PostCard.tsx | sed -n '1,220p' nl -ba
src/about.page.tsx | sed -n '1,260p' nl -ba src/_components/StatePanel.tsx | sed
-n '1,240p' nl -ba src/styles/carbon/_theme-tokens.scss | sed -n '1,220p' rg -n
"searchPanel|search panel|pagefind|content-switcher|structured
list|tile|accordion|tabs|breadcrumb|tag|toggletip|notification|skeleton|loading|search"
src/_components src/*.tsx src/styles/components src/scripts

Summary J’ai complété l’étude en français dans docs/carbon-v11-opportunites.md
qui synthétise l’existant Carbon v11 du blog, propose 6 ajouts prioritaires,
puis les classe par impact/effort avec une feuille de route concrète. Le mémo
part du constat que le site utilise déjà une base Carbon solide — header UI
Shell/SideNav, tiles, tags, breadcrumb, toggletips et un bridge de tokens Carbon
— ce qui rend des extensions comme notifications, loading states et callouts
très naturelles. Les recommandations les plus prometteuses pour ton blog sont :
Notifications inline/callout pour la recherche, l’offline et les retours de
copie. Loading + skeleton states autour de la recherche et des micro-actions
asynchrones. Mini table des matières sticky dans le rail des articles pour
rendre la colonne latérale beaucoup plus utile sur les billets longs. J’ai aussi
documenté des pistes plus structurelles : Tabs / Content Switcher pour les pages
d’index, Accordion pour la méta-information secondaire, et des callouts
éditoriaux réutilisables pour enrichir les billets et pages statiques sans
casser l’approche TSX + JS minimal. Références officielles Carbon consultées et
consignées dans le document : Notification, Content switcher, Tabs, Accordion,
Loading. Liens : https://carbondesignsystem.com/components/notification/usage/ ·
https://carbondesignsystem.com/components/content-switcher/usage/ ·
https://carbondesignsystem.com/components/tabs/usage/ ·
https://carbondesignsystem.com/components/accordion/usage/ ·
https://carbondesignsystem.com/components/loading/usage/
