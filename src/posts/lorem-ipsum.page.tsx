/** Sample post #1 — Lorem ipsum (2026). */

export const title = "Lorem Ipsum and the Art of Placeholder Text";
/** Publication date. */
export const date = new Date("2026-02-18");
/** Post meta description. */
export const description =
  "A meditation on placeholder text, its history, and why it still matters in modern design workflows.";
/** Post tags. */
export const tags = ["design", "writing"];

/** Renders the post body. */
export default (_data: Lume.Data, _helpers: Lume.Helpers): string =>
  `<p>
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
