import lume from 'lume/mod.ts';
import sass from 'lume/plugins/sass.ts';
import metas from 'lume/plugins/metas.ts';
import prism from 'lume/plugins/prism.ts';

// Configuration du site
const site = lume({
  location: new URL('https://normco.re'),
});

// Plugins
site.use(sass({
  includes: '_includes'
}));
site.use(metas());

// Import des langages supplémentaires pour Prism dans le bon ordre
// Il faut respecter les dépendances entre composants
import "npm:prismjs@1.29.0/components/prism-javascript.js";
import "npm:prismjs@1.29.0/components/prism-jsx.js";
import "npm:prismjs@1.29.0/components/prism-typescript.js";
import "npm:prismjs@1.29.0/components/prism-tsx.js";
import "npm:prismjs@1.29.0/components/prism-bash.js";

// Configuration et utilisation du plugin Prism
site.use(prism({
  // Extension des fichiers à traiter (HTML généré par les templates)
  extensions: ['.html'],
  
  // Thème de coloration
  theme: {
    name: 'okaidia', // Thème sombre similaire à github-dark
    cssFile: '/styles/prism-theme.css',
  },
}));

// Copier les fichiers statiques
site.copy('static', '.');

export default site;