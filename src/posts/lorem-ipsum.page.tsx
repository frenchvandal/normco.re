/** Sample post #1 — Lorem ipsum (2026). */

export const id = "lorem-ipsum";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zhHans", "zhHant"] as const;

/** English post title. */
export const title = "Lorem Ipsum and the Art of Placeholder Text";
/** Publication date. */
export const date = new Date("2026-02-18");
/** Post meta description. */
export const description =
  "A meditation on placeholder text, its history, and why it still matters in modern design workflows.";
/** Post tags. */
export const tags = ["design", "writing"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Lorem ipsum et l’art du texte de remplissage",
  description:
    "Une réflexion sur le faux texte, son histoire et les raisons pour lesquelles il reste utile dans les workflows de design modernes.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "Lorem Ipsum 与占位文本的艺术",
  description: "关于占位文本的历史、价值，以及它为何仍在现代设计流程中有效。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "Lorem Ipsum 與占位文字的藝術",
  description: "關於占位文字的歷史、價值，以及它為何仍在現代設計流程中有效。",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</p>

<p>
  Tout le monde connaît la formule, mais peu de personnes en connaissent
  l’origine. Il s’agit d’un extrait brouillé du <em>de Finibus Bonorum et Malorum</em>
  de Cicéron, un traité philosophique rédigé en 45 av. J.-C. Ce texte est utilisé
  comme faux contenu depuis le XVIe siècle, lorsqu’un imprimeur inconnu a
  mélangé une casse de caractères pour créer un spécimen typographique.
</p>

<h2>Pourquoi le texte de remplissage compte</h2>

<p>
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
</p>

<p>
  Quand vous concevez une mise en page avec de vrais mots, vous concevez pour
  ces mots précis. Le faux texte vous oblige à concevoir pour la structure,
  pas pour le sens. C’est une contrainte utile&nbsp;: elle révèle si votre design
  peut absorber l’imprévu&nbsp;: un titre sur trois lignes, un paragraphe sans
  respiration naturelle, un mot trop long pour son conteneur.
</p>

<h2>Une question de fidélité</h2>

<p>
  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
  laboriosam&nbsp;? En design, il existe une tension entre la fidélité au contenu
  réel et la liberté qu’autorise l’abstraction.
</p>

<p>
  Les prototypes haute fidélité avec du vrai contenu exigent que ce contenu
  existe déjà. Les wireframes basse fidélité, eux, communiquent la structure
  sans la distraction du sens. Les deux approches ont leur place. L’essentiel
  est de savoir quel outil sert le moment.
</p>

<pre><code class="language-ts">// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base =
    "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i &lt; words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
</code></pre>

<p>
  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
</p>

<h2>Conclusion</h2>

<p>
  Le lorem ipsum est plus qu’un simple remplissage. C’est un miroir tendu au
  design&nbsp;: il reflète la structure dépouillée de sens, la forme sans contenu.
  C’est précisément pour cela qu’il traverse les époques.
</p>`;
  }

  if (data.lang === "zhHans") {
    return `<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</p>

<p>
  很多人都听过这段文字，却很少知道它的来源。它其实来自西塞罗
  <em>de Finibus Bonorum et Malorum</em> 的一段打乱文本，这部哲学著作写于公元前 45 年。
  自 16 世纪起，它就被作为排版占位文本使用：一位不知名的印刷工把活字顺序打乱，
  做出了一本字体样张。
</p>

<h2>为什么占位文本仍然重要</h2>

<p>
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
</p>

<p>
  当你用真实文案设计版面时，你其实是在为那一批具体句子做设计。
  占位文本迫使你先为结构而不是语义做决定。这是一种很有价值的约束：
  它能暴露设计是否能承受不确定性，比如三行标题、没有自然换气点的段落，
  或者一个超出容器长度的长单词。
</p>

<h2>关于“逼真度”的问题</h2>

<p>
  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
  laboriosam? 在设计中，真实内容的还原度与抽象带来的自由之间，总是存在张力。
</p>

<p>
  高保真原型需要先有真实内容。低保真线框图则在不被语义分散注意力的前提下传达结构。
  两种方法都合理，关键是判断当下该用哪一种工具。
</p>

<pre><code class="language-ts">// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base =
    "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i &lt; words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
</code></pre>

<p>
  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
</p>

<h2>结语</h2>

<p>
  Lorem ipsum 不只是填充物。它像一面镜子，照出设计在剥离语义后留下的纯结构：
  有形式、无内容。也正因为如此，它才能跨越这么多时代继续存在。
</p>`;
  }

  if (data.lang === "zhHant") {
    return `<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</p>

<p>
  很多人都聽過這段文字，卻很少知道它的來源。它其實來自西塞羅
  <em>de Finibus Bonorum et Malorum</em> 的一段打亂文本，這部哲學著作寫於西元前 45 年。
  自 16 世紀起，它就被當作排版占位文字使用：一位不知名的印刷工把活字順序打亂，
  做出了一本字體樣張。
</p>

<h2>為什麼占位文字仍然重要</h2>

<p>
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
</p>

<p>
  當你用真實文案設計版面時，你其實是在為那一批具體句子做設計。
  占位文字迫使你先為結構而不是語義做決定。這是一種很有價值的約束：
  它能暴露設計是否能承受不確定性，例如三行標題、沒有自然換氣點的段落，
  或是一個超出容器長度的長單字。
</p>

<h2>關於「擬真度」的問題</h2>

<p>
  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
  laboriosam? 在設計中，真實內容的還原度與抽象帶來的自由之間，總是存在張力。
</p>

<p>
  高保真原型需要先有真實內容。低保真線框圖則在不被語義分散注意力的前提下傳達結構。
  兩種方法都合理，關鍵是判斷當下該用哪一種工具。
</p>

<pre><code class="language-ts">// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base =
    "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i &lt; words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
</code></pre>

<p>
  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
</p>

<h2>結語</h2>

<p>
  Lorem ipsum 不只是填充物。它像一面鏡子，照出設計在剝離語義後留下的純結構：
  有形式、無內容。也正因如此，它才能跨越這麼多時代持續存在。
</p>`;
  }

  return `<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</p>

<p>
  Most people know the phrase but few know its origin. It is a scrambled excerpt
  from Cicero's <em>de Finibus Bonorum et Malorum</em>, a philosophical treatise
  written in 45 BC. The text has been used as filler copy since the 1500s, when
  an unknown printer took a galley of type and scrambled it to make a type
  specimen book.
</p>

<h2>Why placeholder text matters</h2>

<p>
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
</p>

<p>
  When you design a layout with real words, you design for those specific words.
  Placeholder text forces you to design for the structure, not the content. This
  is a valuable constraint — it reveals whether your design can accommodate the
  unexpected: a headline that runs to three lines, a paragraph with no natural
  break, a word too long for its container.
</p>

<h2>A question of fidelity</h2>

<p>
  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
  laboriosam? There is a tension in design between fidelity to real content and
  the freedom that abstraction permits.
</p>

<p>
  High-fidelity prototypes with real copy require real copy to exist first.
  Low-fidelity wireframes communicate structure without the distraction of
  meaning. Both approaches have their place. The key is knowing which tool
  serves the moment.
</p>

<pre><code class="language-ts">// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base =
    "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i &lt; words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
</code></pre>

<p>
  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
</p>

<h2>Conclusion</h2>

<p>
  Lorem ipsum is more than filler. It is a mirror held up to the design — one
  that reflects structure stripped of meaning, form without content. That is
  precisely why it endures.
</p>`;
};
