/** "How to install this theme" — migrated from posts/instructions.md. */

export const id = "instructions";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;

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

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "如何安装这个主题？",
  description: "一份快速指南，帮助你为 Lume 配置 Simple Blog 主题。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "如何安裝這個主題？",
  description: "一份快速指南，協助你為 Lume 設定 Simple Blog 主題。",
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

  if (data.lang === "zh-hans") {
    return `<p><strong>Simple blog</strong> 是一个为 Lume 准备的简洁极简博客主题，支持标签和作者。
  你可以<strong>在几秒内</strong>搭建自己的博客，并为读者提供 Atom 与 JSON 订阅源。</p>

<p>配置这个主题<strong>最快最简单</strong>的方法是使用
<a href="https://deno.land/x/lume_init">Lume init 命令</a>，
你也可以直接从 <a href="https://lume.land/theme/simple-blog/">Simple Blog 主题页面</a>复制。
运行：</p>

<pre><code class="language-bash">deno run -A https://lume.land/init.ts --theme=simple-blog</code></pre>

<p>即可创建一个已经配置好 Simple Blog 的新项目。然后编辑博客根目录下的
<code>_data.yml</code> 文件，自定义站点标题、描述和元数据。</p>

<p>文章需要保存在 <code>posts</code> 目录中，例如：
<code>posts/my-first-post.md</code>。</p>

<h2>作为远程主题安装</h2>

<p>如果要把这个主题接入一个已有的 Lume 项目，可以在 <code>_config.ts</code>
中以远程模块方式导入。后续更新时，只需调整导入 URL 里的版本号：</p>

<pre><code class="language-ts">import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;</code></pre>

<p>然后把
<a href="https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml"><code>_data.yml</code></a>
复制到博客根目录，并填入你的信息。</p>

<h2>个性化</h2>

<p>你也可以使用 <a href="https://lume.land/cms">lumeCMS</a> 来定制博客并更轻松地发布内容。</p>`;
  }

  if (data.lang === "zh-hant") {
    return `<p><strong>Simple blog</strong> 是一個為 Lume 準備的簡潔極簡部落格主題，支援標籤與作者。
  你可以<strong>在幾秒內</strong>建立自己的部落格，並為讀者提供 Atom 與 JSON 訂閱來源。</p>

<p>設定這個主題<strong>最快最簡單</strong>的方法是使用
<a href="https://deno.land/x/lume_init">Lume init 指令</a>，
你也可以直接從 <a href="https://lume.land/theme/simple-blog/">Simple Blog 主題頁面</a>複製。
執行：</p>

<pre><code class="language-bash">deno run -A https://lume.land/init.ts --theme=simple-blog</code></pre>

<p>即可建立一個已設定好 Simple Blog 的新專案。接著編輯部落格根目錄下的
<code>_data.yml</code> 檔案，自訂站點標題、描述與中繼資料。</p>

<p>文章需要儲存在 <code>posts</code> 目錄中，例如：
<code>posts/my-first-post.md</code>。</p>

<h2>以遠端主題安裝</h2>

<p>若要將這個主題接入既有的 Lume 專案，可在 <code>_config.ts</code>
中以遠端模組方式匯入。後續更新時，只要調整匯入 URL 裡的版本號：</p>

<pre><code class="language-ts">import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;</code></pre>

<p>然後把
<a href="https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml"><code>_data.yml</code></a>
複製到部落格根目錄，並填入你的資訊。</p>

<h2>客製化</h2>

<p>你也可以使用 <a href="https://lume.land/cms">lumeCMS</a> 來客製部落格並更輕鬆地發佈內容。</p>`;
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
