import lume from 'lume/mod.ts';
import sass from 'lume/plugins/sass.ts';
import metas from 'lume/plugins/metas.ts';
import codeHighlight from 'lume/plugins/code_highlight.ts';

// Import languages from the correct path that works with Deno
import langTypeScript from 'npm:highlight.js@11.11.1/lib/languages/typescript';
import langJavaScript from 'npm:highlight.js@11.11.1/lib/languages/javascript';
import langBash from 'npm:highlight.js@11.11.1/lib/languages/bash';
import langXML from 'npm:highlight.js@11.11.1/lib/languages/xml';

// Configuration du site
const site = lume({
  location: new URL('https://normco.re'),
});

// Plugins
site.use(sass({
  includes: '_includes'
}));
site.use(metas());

// Configuration et utilisation directe du plugin de coloration syntaxique
site.use(codeHighlight({
  // Extension des fichiers à traiter (HTML généré par les templates)
  extensions: ['.html'],
  
  // Langages supplémentaires
  languages: {
    typescript: langTypeScript,
    javascript: langJavaScript,
    bash: langBash,
    xml: langXML, // This will handle HTML/XML and parts of JSX/TSX
  },
  
  // Thème de coloration
  theme: {
    name: 'github-dark', // Thème sombre similaire à celui utilisé avec Shiki
    cssFile: '/styles/code-highlight.css',
  },
}));

// Copier les fichiers statiques
site.copy('static', '.');

export default site;