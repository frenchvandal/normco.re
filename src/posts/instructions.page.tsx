/** "How to install this theme" — migrated from posts/instructions.md. */

export const id = "instructions";
/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;

/** English post title. */
export const title = "How to install this theme?";
/** Publication date. */
export const date = new Date("2022-06-12");
/** Post meta description. */
export const description =
  "A quick guide to setting up the Simple Blog theme for Lume.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Comment installer ce thème\u00a0?",
  description:
    "Un guide rapide pour configurer le thème Simple Blog avec Lume.",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p><strong>Simple blog</strong> est un thème de blog épuré et minimal pour Lume, avec prise en charge
  des tags et des auteurs. Il permet de créer votre blog <strong>en quelques secondes</strong>,
  et fournit des flux Atom et JSON pour vos abonnés.</p>

<p>La manière <strong>la plus simple et la plus rapide</strong> de configurer ce thème
est d’utiliser la
<a href="https://deno.land/x/lume_init">commande Lume init</a>, que vous pouvez aussi copier
facilement depuis la <a href="https://lume.land/theme/simple-blog/">page du thème Simple Blog</a>.
En lançant&nbsp;:</p>

<pre><code class="language-bash">deno run -A https://lume.land/init.ts --theme=simple-blog</code></pre>

<p>vous créez un nouveau projet avec Simple Blog déjà configuré. Modifiez ensuite
le fichier <code>_data.yml</code> à la racine du blog pour personnaliser le titre,
la description et les métadonnées du site.</p>

<p>Les articles doivent être enregistrés dans le dossier <code>posts</code>. Par exemple&nbsp;:
<code>posts/my-first-post.md</code>.</p>

<h2>Installer en tant que thème distant</h2>

<p>Pour ajouter ce thème à un projet Lume existant, importez-le dans votre fichier
<code>_config.ts</code> comme module distant. Pour le mettre à jour, changez le numéro de
version dans l’URL d’import&nbsp;:</p>

<pre><code class="language-ts">import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;</code></pre>

<p>Copiez ensuite le fichier
<a href="https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml"><code>_data.yml</code></a>
à la racine de votre blog et adaptez-le avec vos informations.</p>

<h2>Personnalisation</h2>

<p>Vous pouvez utiliser <a href="https://lume.land/cms">lumeCMS</a> pour personnaliser
le blog et ajouter du contenu facilement.</p>`;
  }

  return `<p><strong>Simple blog</strong> is a clean and minimal blog theme for Lume, with support for
tags and authors. It allows you to build your own blog <strong>in seconds</strong>, and
provides Atom and JSON feeds for your subscribers.</p>

<p>The <strong>fastest and easiest</strong> way to configure this theme is the
<a href="https://deno.land/x/lume_init">Lume init command</a>, which you can also copy
easily from the <a href="https://lume.land/theme/simple-blog/">Simple Blog theme page</a>.
Running:</p>

<pre><code class="language-bash">deno run -A https://lume.land/init.ts --theme=simple-blog</code></pre>

<p>will create a new project with Simple Blog configured. Edit the <code>_data.yml</code> file
in your blog root folder with your data to customize the site title,
description, and metadata.</p>

<p>Posts must be saved in the <code>posts</code> folder. For example,
<code>posts/my-first-post.md</code>.</p>

<h2>Install as a remote theme</h2>

<p>To add the theme to an existing Lume project, import it in your <code>_config.ts</code>
file as a remote module. Update it by changing the version number in the import URL:</p>

<pre><code class="language-ts">import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;</code></pre>

<p>Copy the
<a href="https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml"><code>_data.yml</code></a>
file to your blog root folder and edit it with your data.</p>

<h2>Customization</h2>

<p>You can use <a href="https://lume.land/cms">lumeCMS</a> to customize the blog and add
content easily.</p>`;
};
