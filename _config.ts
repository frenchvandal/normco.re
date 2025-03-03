import lume from "lume/mod.ts";
import sass from "lume/plugins/sass.ts";
import metas from "lume/plugins/metas.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

// Import des langages supplémentaires pour highlight.js
import langTypeScript from "npm:highlight.js/lib/languages/typescript";
import langJavaScript from "npm:highlight.js/lib/languages/javascript";
import langBash from "npm:highlight.js/lib/languages/bash";
import langTsx from "npm:highlight.js/lib/languages/tsx";

// Configuration du site
const site = lume({
  location: new URL("https://frenchvandal.github.io"),
});

// Plugins
site.use(sass());
site.use(metas());

// Configuration du plugin de coloration syntaxique
site.use(codeHighlight({
  // Extension des fichiers à traiter (HTML généré par les templates)
  extensions: [".html"],
  
  // Langages supplémentaires
  languages: {
    typescript: langTypeScript,
    javascript: langJavaScript,
    tsx: langTsx,
    bash: langBash,
  },
  
  // Thème de coloration
  theme: {
    name: "github-dark", // Thème sombre similaire à celui utilisé avec Shiki
    cssFile: "/styles/code-highlight.css",
  },
}));

// Copier les fichiers statiques
site.copy("static", ".");

export default site;