// blog/2024-12-12_subscribing-media-query-changes-in-react-using-usesyncexternalstore.page.ts
export const title = "Subscribing Media Query Changes in React using useSyncExternalStore";
export const date = new Date("2024-12-12");
export const tags = ["react", "hooks", "frontend"];
export const description = "Learn how to create a custom useMediaQuery hook in React using the useSyncExternalStore hook to efficiently subscribe to media query changes.";
export const readingTime = "4 min";

export default `
<div class="post-summary">
  <p><strong>TL;DR:</strong> Dans cet article, je vous explique comment créer un hook personnalisé <code>useMediaQuery</code> en React en utilisant le hook <code>useSyncExternalStore</code> pour suivre efficacement les changements de media queries.</p>
</div>

<h2 id="introduction">Introduction</h2>

<p>Les media queries sont essentielles pour construire des interfaces réactives, mais comment pouvons-nous y réagir efficacement dans nos composants React? Voyons comment le hook <code>useSyncExternalStore</code> peut nous aider à résoudre ce problème.</p>

<h2 id="what-is-usesyncexternalstore">Qu'est-ce que useSyncExternalStore?</h2>

<p>Depuis React 18, <code>useSyncExternalStore</code> est disponible pour s'abonner à des stores externes en dehors de React. Nous pouvons également utiliser ce hook pour nous abonner aux changements provoqués par les API du navigateur, comme les media queries.</p>

<h2 id="creating-usemedialquery">Création du hook useMediaQuery</h2>

<p>Supposons que vous utilisiez TypeScript. Le hook <code>useMediaQuery</code> prend une chaîne de media query en argument et renvoie une valeur <code>boolean</code> indiquant si la media query correspond, ou <code>undefined</code> si <code>window</code> n'est pas disponible (côté serveur).</p>

<pre><code class="language-typescript">// useMediaQuery.ts
import { useSyncExternalStore } from "react";

export default function useMediaQuery(mediaQueryString: string) {
  // La logique sera placée ici.
}
</code></pre>

<p><code>useSyncExternalStore</code> accepte trois arguments :</p>

<ul>
  <li>Le premier argument est la fonction <code>subscribe</code> qui s'abonne aux changements du store externe. Elle accepte un callback comme argument qui sera appelé lorsque le store change. Dans notre cas, un objet <code>MediaQueryList</code> écoute l'événement <code>change</code> déclenché lorsque l'état de la media query du document change.</li>
  <li>Le deuxième argument est la fonction <code>getSnapshot</code> qui définit la valeur renvoyée par <code>useSyncExternalStore</code> et est appelée lorsque le callback de la fonction <code>subscribe</code> est invoqué. Dans notre cas, elle renvoie la valeur <code>boolean</code> indiquant si le <code>mediaQueryString</code> correspond ou non.</li>
  <li>Le troisième argument est la fonction <code>getServerSnapshot</code> qui renvoie la valeur initiale à définir pendant l'hydratation et peut être omise si les composants qui utilisent ce hook sont entièrement rendus côté client. Dans notre cas, <code>undefined</code> est renvoyé car <code>window</code> n'est pas disponible sur le serveur.</li>
</ul>

<p>Pour plus de détails, consultez <a href="https://react.dev/reference/react/useSyncExternalStore" target="_blank" rel="noreferrer">la référence API officielle</a>.</p>

<h3>Implémentation complète</h3>

<pre><code class="language-tsx">import { useCallback, useSyncExternalStore } from "react";

export default function useMediaQuery(mediaQueryString: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQueryList = window.matchMedia(mediaQueryString);
      mediaQueryList.addEventListener("change", callback);
      return () => {
        mediaQueryList.removeEventListener("change", callback);
      };
    },
    [mediaQueryString],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(mediaQueryString).matches,
    () => undefined,
  );
}
</code></pre>

<p>Notez que la fonction <code>subscribe</code> est enveloppée par le hook <code>useCallback</code> pour éviter de se réabonner inutilement.</p>

<h2 id="example-usage">Exemple d'utilisation</h2>

<pre><code class="language-tsx">import { useMediaQuery } from "./useMediaQuery";

function ResponsiveComponent() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  return (
    <div>
      {isDesktop 
        ? <DesktopLayout /> 
        : <MobileLayout />
      }
    </div>
  );
}
</code></pre>

<h2 id="conclusion">Conclusion</h2>

<p>Il est vrai que le hook <code>useMediaQuery</code> peut être écrit sans <code>useSyncExternalStore</code>. Par exemple, nous pourrions l'écrire en utilisant <code>useEffect</code> et <code>useState</code>, qui sont familiers à la majorité des développeurs.</p>

<p>Cependant, aujourd'hui, nous avons de plus en plus d'occasions de rendre les composants React sur le serveur ou au moment de la compilation, comme avec Next.js, Remix et Astro. Par conséquent, renvoyer explicitement à la fois les snapshots client et serveur depuis <code>useSyncExternalStore</code> est plus propre selon moi.</p>

<p>Vous pouvez explorer le <a href="https://github.com/m-kawafuji/use-syncexternalstore-demo" target="_blank" rel="noreferrer">dépôt de démonstration ici</a>.</p>

<div class="post-author">
  <img src="/avatar.png" alt="李北洛 Philippe" class="author-avatar" />
  <div class="author-info">
    <h3>À propos de l'auteur</h3>
    <p>Développeur web passionné par les technologies frontend modernes et le design d'interfaces utilisateur.</p>
  </div>
</div>

<div class="related-posts">
  <h3>Articles connexes</h3>
  <ul>
    <li><a href="/blog/2025-02-08_using-youtube-iframe-api-in-react">Using YouTube IFrame API in React</a></li>
  </ul>
</div>
`;