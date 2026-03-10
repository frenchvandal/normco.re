/** Sample post #1 — Lorem ipsum (2026). */

export const id = "lorem-ipsum";
/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;

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
