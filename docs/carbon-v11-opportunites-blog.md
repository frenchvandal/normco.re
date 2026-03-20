# Opportunités Carbon Design System v11 pour le blog

_Date de l'étude : 20 mars 2026._

## Constat rapide sur l'existant

Le blog exploite déjà une base Carbon v11 solide :

- **UI Shell Header + SideNav** dans l'en-tête.
- **Tiles**, **tags**, **breadcrumb**, **popover/toggletip** et la **grille Carbon**.
- Un **pont de tokens** maison dans `src/styles/carbon/_theme-tokens.scss` pour exposer les primitives de thème, d'espacement, de motion et de surface.
- Des composants éditoriaux locaux (`PostCard`, `StatePanel`, `feature-layout`, pages `about`, `syndication`, etc.) qui restent proches du langage visuel Carbon sans dépendre d'un framework client lourd.

En revanche, plusieurs patterns Carbon v11 pertinents pour un blog éditorial restent encore sous-exploités.

## Recommandations priorisées

### 1. Ajouter des notifications inline/callout pour les états importants

**Pourquoi c'est un très bon fit**

Le site possède déjà plusieurs moments de feedback : recherche indisponible ou hors ligne, copie d'URL/feed, état offline, succès/erreur de copie de code. Carbon recommande les notifications pour fournir une information concise, contextualisée et actionnable.

**Où l'intégrer**

- **Panneau de recherche** : afficher une notification inline quand Pagefind est indisponible, en erreur, ou lorsque l'utilisateur est hors ligne.
- **Page de syndication** : remplacer le feedback uniquement visuel de copie par une notification inline ou callout persistante pour mieux expliciter « copié », « échec », « ouvrir dans un lecteur ».
- **Page offline / états vides** : utiliser une variante callout pour distinguer un état système (hors-ligne) d'un simple état vide éditorial.

**Bénéfices**

- Meilleur feedback accessible et plus cohérent.
- Hiérarchie visuelle plus claire entre information, succès, avertissement et erreur.
- Réduction des micro-patterns maison dispersés.

**Effort estimé** : faible à moyen.

### 2. Introduire un vrai pattern Tabs ou Content Switcher sur les pages d'index

**Pourquoi c'est intéressant**

Le blog a déjà plusieurs regroupements naturels de contenu : récent, archives, tags, potentiellement langue/format/vue. Carbon distingue bien :

- **Tabs** pour des zones de contenu distinctes mais liées.
- **Content switcher** pour différentes vues d'un même contenu.

**Idées concrètes**

- **Accueil** : basculer entre « Récents », « Sujets », « Séries / Dossiers » si tu développes ces sections.
- **Archives** : proposer un content switcher entre **vue chronologique** et **vue par tags**.
- **Syndication** : basculer entre **feeds**, **endpoints techniques**, **usage mobile/lecture** si cette page grossit.

**Attention de conception**

- Si le contenu change de nature, préférer **Tabs**.
- Si c'est la même collection avec une autre organisation visuelle, préférer **Content switcher**.

**Bénéfices**

- Navigation plus claire sans explosion du nombre de pages.
- Très bon levier pour enrichir le blog sans alourdir l'architecture Lume.
- Compatible avec ta logique TSX serveur + un JS minimal.

**Effort estimé** : moyen.

### 3. Utiliser un Accordion pour la méta-information secondaire

**Pourquoi c'est pertinent**

Carbon recommande l'accordion pour condenser de l'information secondaire ou annexe. Sur un blog, c'est utile tant que l'on n'y cache pas le cœur de l'article.

**Cas d'usage adaptés**

- **Bas de billet** : « Contexte », « Références », « Crédits », « Notes de traduction », « Historique des mises à jour ».
- **About** : FAQ courte, détails de contact, politique de réponse, stack, préférences de communication.
- **Syndication** : explications techniques sur RSS/Atom/JSON Feed, compatibilité clients, conventions de découverte.

**À éviter**

- Ne pas cacher l'introduction d'un article ou les informations essentielles que tout le monde doit lire.
- Ne pas empiler des accordions partout dans les pages très éditoriales.

**Bénéfices**

- Densité d'information mieux maîtrisée sur mobile.
- Alignement direct avec les recommandations Carbon sur la divulgation progressive.
- Permet de garder les pages longues élégantes sans les fragmenter en routes supplémentaires.

**Effort estimé** : faible à moyen.

### 4. Ajouter des skeleton/loading states plus Carbon pour la recherche et le chargement différé

**Pourquoi c'est utile**

Le site possède déjà plusieurs comportements asynchrones : initialisation paresseuse de la recherche, service worker, copie, bascules d'interface. Carbon recommande les **skeleton states** pour le contenu en cours d'apparition et le composant **loading** pour les attentes plus longues ou bloquantes.

**Opportunités concrètes**

- **Recherche** : pendant le chargement de l'index/l'initialisation Pagefind, afficher un skeleton de résultats ou un inline loading.
- **Syndication / copy controls** : utiliser un mini état de loading pendant la copie ou la résolution d'une action asynchrone.
- **Offline fallback** : pour les ressources qui reviennent après reconnexion, afficher un état de transition plus rassurant.

**Bénéfices**

- Perception de performance meilleure.
- Réduction des transitions abruptes entre « rien » et « contenu affiché ».
- Plus grande cohérence avec le langage motion/timing déjà exposé dans les tokens.

**Effort estimé** : faible.

### 5. Renforcer les pages éditoriales avec des sections "callout" Carbon assumées

**Pourquoi c'est prometteur**

Tu utilises déjà des `cds--tile` pour les hero sections et les cartes. Le prochain cap naturel consiste à créer des **callouts éditoriaux** inspirés des surfaces Carbon : résumé, takeaway, note de version, note de traduction, encadré "à lire ensuite".

**Applications directes**

- **En haut d'article** : encadré « Ce billet couvre » avec 3–4 points.
- **En bas d'article** : « À lire ensuite » ou « Articles liés » dans une tile accentuée.
- **About** et **Syndication** : cartes de contexte plus explicites pour les actions primaires.

**Pourquoi c'est "Carbon-compatible"**

- Carbon pousse une hiérarchie claire des surfaces, des espacements et des contrastes.
- Tu as déjà le socle de tokens (`layer`, `layer-hover`, `border-subtle`, `focus`, motion) pour créer ce pattern proprement sans valeurs arbitraires.

**Bénéfices**

- Montée en gamme perçue du rendu éditorial.
- Plus de scannabilité sur mobile et desktop.
- Réemploi transversal dans toutes les pages sans multiplier les exceptions CSS.

**Effort estimé** : faible à moyen.

### 6. Faire évoluer la navigation latérale d'article vers une mini table des matières Carbon-like

**Pourquoi c'est l'ajout le plus "premium"**

Aujourd'hui, le rail d'article sert surtout aux tags et à la navigation précédent/suivant. Un excellent ajout serait une **mini table des matières** sticky, traitée comme un groupe de liens verticaux Carbon.

**Implémentation possible**

- Générer un sommaire à partir des `h2/h3` du contenu Markdown.
- Afficher la navigation en rail sur desktop et dans un disclosure/accordion sur mobile.
- Utiliser `aria-current` sur la section active si tu ajoutes un surlignage progressif côté client.

**Bénéfices**

- Très forte amélioration UX sur les billets longs et techniques.
- Rend la colonne de droite beaucoup plus utile.
- S'accorde très bien avec la logique Carbon de navigation secondaire et d'alignement à la grille.

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

6. **Tabs / Content switcher** sur les pages d'index et d'archives, quand tu voudras enrichir les vues sans créer trop de routes.

## Mon top 3 pour ton blog

Si je devais choisir uniquement trois ajouts Carbon v11 pour obtenir le meilleur ratio élégance / utilité / coût :

1. **Notifications inline/callout**.
2. **Loading + skeleton states** autour de la recherche.
3. **Mini table des matières d'article** dans le rail sticky.

## Références Carbon consultées

- https://carbondesignsystem.com/components/notification/usage/
- https://carbondesignsystem.com/components/content-switcher/usage/
- https://carbondesignsystem.com/components/tabs/usage/
- https://carbondesignsystem.com/components/accordion/usage/
- https://carbondesignsystem.com/components/loading/usage/
