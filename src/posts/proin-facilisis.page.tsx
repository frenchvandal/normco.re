/** Sample post #3 — Proin facilisis (2025). */

export const id = "proin-facilisis";
/** Available language versions generated from this page. */
export const lang = ["en", "fr"] as const;

/** English post title. */
export const title = "Proin Facilisis: Making Things Easier";
/** Publication date. */
export const date = new Date("2025-04-12");
/** Post meta description. */
export const description =
  "On the philosophy of reducing friction — in code, in design, and in everyday life.";
/** Post tags. */
export const tags = ["software", "design"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Proin Facilisis\u00a0: rendre les choses plus simples",
  description:
    "Sur la philosophie de la réduction des frictions, dans le code, le design et la vie quotidienne.",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  <em>Proin facilisis</em> — en latin, «&nbsp;favoriser l’aisance&nbsp;». L’expression apparaît
  dans d’anciens textes botaniques pour décrire une plante qui facilite la
  digestion, adoucit un passage, lève une obstruction. Comme philosophie de
  conception logicielle, la formule se transpose étonnamment bien.
</p>

<p>
  Un bon logiciel réduit les frictions. Il anticipe l’étape suivante de
  l’utilisateur. Il propose la bonne affordance au bon moment. Il s’efface.
</p>

<h2>L’inventaire des frictions</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. La première étape pour
  réduire les frictions est de les cartographier. Où l’utilisateur ralentit-il&nbsp;?
  Où l’attention monte-t-elle&nbsp;? Où les erreurs se concentrent-elles&nbsp;?
</p>

<p>
  Dans une application web classique, les moments de forte friction sont
  prévisibles&nbsp;: onboarding, envoi de formulaire, récupération après erreur et
  états de chargement. Ce sont les vestibules du produit, les seuils que
  l’utilisateur doit franchir pour atteindre la valeur.
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>Le paradoxe de la simplicité</h2>

<p>
  Vivamus pretium aliquet erat. Il y a un paradoxe au cœur du «&nbsp;rendre simple&nbsp;»&nbsp;:
  c’est difficile. Éliminer les frictions demande une compréhension fine de
  l’utilisateur, du contexte et des modes d’échec. Cela exige plus de travail
  côté concepteur pour en demander moins côté utilisateur.
</p>

<p>
  C’est pour cela que la simplicité est une forme de générosité. Chaque étape
  inutile retirée du parcours rend du temps à l’utilisateur, du temps qu’il
  peut consacrer à ce qui compte vraiment.
</p>

<h2>Facilisis en pratique</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Quelques
  principes vers lesquels je reviens régulièrement&nbsp;:
</p>

<ul>
  <li>Les valeurs par défaut doivent convenir à la majorité des usages.</li>
  <li>Les messages d’erreur doivent expliquer le problème et la correction.</li>
  <li>Le chemin nominal ne devrait demander aucun effort mental.</li>
  <li>La configuration doit être possible, jamais obligatoire.</li>
  <li>La documentation fait partie intégrante du produit.</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. Le nom même de ce principe — <em>nulla facilisi</em>, «&nbsp;rien de
  facile&nbsp;» — rappelle que la simplicité, bien comprise, n’est jamais accidentelle.
</p>`;
  }

  return `<p>
  <em>Proin facilisis</em> — Latin for "promoting ease." It appears in old
  botanical texts to describe a plant that aids digestion, smooths a passage,
  clears an obstruction. As a philosophy for building software, it translates
  remarkably well.
</p>

<p>
  Good software reduces friction. It anticipates the user's next step. It
  provides the right affordance at the right moment. It gets out of the way.
</p>

<h2>The friction inventory</h2>

<p>
  Proin in tellus sit amet nibh dignissim sagittis. The first step in reducing
  friction is to map it. Where does the user slow down? Where does attention
  spike? Where do errors cluster?
</p>

<p>
  In a typical web application, the highest-friction moments are predictable:
  onboarding, form submission, error recovery, and loading states. These are
  the vestibules of the product — the thresholds users must cross to reach the
  value inside.
</p>

<pre><code class="language-ts">// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined { /* … */ }

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(\`User not found: \${id}\`);
  }
  return user;
}
</code></pre>

<h2>The paradox of ease</h2>

<p>
  Vivamus pretium aliquet erat. There is a paradox at the heart of "making
  things easy": it is very hard to do. Eliminating friction requires deep
  understanding of the user, the context, and the failure modes. It demands
  more work from the builder so that less work falls on the user.
</p>

<p>
  This is why ease is a form of generosity. Every unnecessary step you remove
  from your user's path is time returned to them — time they can spend on the
  thing that actually matters.
</p>

<h2>Facilisis in practice</h2>

<p>
  Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Some
  principles I return to:
</p>

<ul>
  <li>Defaults should be correct for most users, most of the time.</li>
  <li>Error messages should explain what went wrong and how to fix it.</li>
  <li>The happy path should require no thought.</li>
  <li>Configuration should be possible, never required.</li>
  <li>Documentation is part of the product.</li>
</ul>

<p>
  Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam
  tincidunt tempus. The name of this principle — <em>nulla facilisi</em>, "no
  easy thing" — is a reminder that ease, properly understood, is never accidental.
</p>`;
};
