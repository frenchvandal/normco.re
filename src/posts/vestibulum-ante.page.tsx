/** Sample post #2 — Vestibulum ante (2025). */

export const id = "vestibulum-ante";
/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;

/** English post title. */
export const title = "Vestibulum Ante: On Thresholds and New Beginnings";
/** Publication date. */
export const date = new Date("2025-09-04");
/** Post meta description. */
export const description =
  "Reflections on transitions, the in-between spaces of life, and what it means to stand at a threshold.";
/** Post tags. */
export const tags = ["life", "essay"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Vestibulum Ante\u00a0: sur les seuils et les nouveaux départs",
  description:
    "Réflexions sur les transitions, les espaces intermédiaires de la vie et ce que signifie se tenir sur un seuil.",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. Le mot latin <em>vestibulum</em> — une antichambre, une entrée,
  l’espace devant la porte — porte un poids que son descendant français
  «&nbsp;vestibule&nbsp;» ne restitue pas toujours.
</p>

<p>
  Un seuil n’est ni une fin, ni un commencement. C’est l’espace liminal entre
  les deux&nbsp;: le souffle retenu avant le premier mot, la pause après le tour de
  clé. C’est l’endroit où quelque chose s’achève et où autre chose n’a pas
  encore commencé.
</p>

<h2>La valeur de l’entre-deux</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. Nous vivons dans une culture qui dévalue la transition.
  Nous voulons des résultats, des livrables, l’objet fini. Le milieu brouillon,
  les brouillons successifs, le doute, l’accumulation lente de compréhension,
  tout cela reste peu documenté et rarement célébré.
</p>

<p>
  Pourtant, l’entre-deux est l’endroit où se déroule l’essentiel de la vie.
  Les trajets. Les salles d’attente. Le temps entre l’envoi d’un message et la
  lecture de la réponse. Les années entre le moment où l’on sait ce que l’on
  veut et celui où l’on sait comment l’obtenir.
</p>

<h2>Se tenir sur le pas de la porte</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  J’ai déménagé à Chengdu un mardi du début d’automne. La ville était chaude
  d’une manière qui m’a surpris, non pas la chaleur de l’été, mais la chaleur
  d’un lieu qui avait déjà décidé qu’il vous appréciait. Les rues sentaient
  l’huile pimentée et l’osmanthe, et tout semblait légèrement,
  agréablement familier et nouveau à la fois.
</p>

<p>
  C’est cela, un seuil, je crois. Ni hostile, ni accueillant. Simplement ouvert,
  en attente de ce que vous en ferez.
</p>

<h2>Coda</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  Chaque texte possède son vestibule, la page de titre, l’introduction,
  le premier paragraphe. C’est l’espace qui prépare la lectrice ou le lecteur
  à ce qui vient ensuite. Il faut l’écrire avec soin.
</p>`;
  }

  return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. The Latin word <em>vestibulum</em> — a forecourt, an entrance
  hall, the space before the door — carries more weight than its English
  descendant "vestibule" suggests.
</p>

<p>
  A threshold is not an end, nor a beginning. It is the liminal space between
  the two: the breath held before the first word, the pause after a key turns
  in a lock. It is where one thing stops and another has not yet started.
</p>

<h2>The value of the in-between</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. We live in a culture that devalues transition. We want
  results, outcomes, the finished thing. The messy middle — the drafts, the
  doubt, the slow accumulation of understanding — goes undocumented and
  uncelebrated.
</p>

<p>
  But the in-between is where most of life happens. Commutes. Waiting rooms.
  The gap between sending a message and reading the reply. The years between
  knowing what you want and knowing how to get there.
</p>

<h2>Standing at the door</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  I moved to Chengdu on a Tuesday in early autumn. The city was warm in a way
  that surprised me — not the heat of summer, but the warmth of a place that
  had already decided it liked you. The streets smelled of chilli oil and
  osmanthus, and everything felt slightly, pleasantly unfamiliar.
</p>

<p>
  That is what a threshold feels like, I think. Not hostile. Not welcoming.
  Simply open — waiting to see what you will make of it.
</p>

<h2>Coda</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  Every document has a vestibulum — the title page, the introduction, the first
  paragraph. It is the space that prepares the reader for what follows. Write
  it with care.
</p>`;
};
