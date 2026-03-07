/** "How to install this theme" — migrated from posts/instructions.md. */

export const title = "How to install this theme";
/** Publication date. */
export const date = new Date("2022-06-12");
/** Post meta description. */
export const description =
  "A quick guide to setting up the Simple Blog theme for Lume.";

/** Renders the post body. */
export default (_data: Lume.Data, _helpers: Lume.Helpers): string =>
  `<p><strong>Simple blog</strong> is a clean and minimal blog theme for Lume, with support for
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
