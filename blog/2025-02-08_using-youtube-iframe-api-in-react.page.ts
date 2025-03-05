// blog/2025-02-08_using-youtube-iframe-api-in-react.page.ts
export const title = "Using YouTube IFrame API in React";
export const date = new Date("2025-02-08");
export const tags = ["react", "youtube", "iframe", "api"];
export const description = "Guide complet sur l'intégration et l'utilisation de l'API YouTube IFrame dans vos applications React pour un contrôle granulaire des vidéos intégrées.";
export const readingTime = "5 min";

export default `
<div class="post-summary">
  <p><strong>TL;DR:</strong> Cet article vous guide à travers l'intégration de l'API YouTube IFrame dans vos applications React, vous permettant d'obtenir un contrôle précis sur les vidéos intégrées grâce à un Provider de contexte et un composant Player personnalisé.</p>
</div>

<h2 id="introduction">Introduction</h2>

<p>Les vidéos YouTube peuvent facilement être intégrées dans vos sites web. Mais saviez-vous que vous pouvez obtenir un contrôle granulaire sur ces vidéos grâce à l'API IFrame fournie par YouTube? Voyons comment l'implémenter efficacement dans un projet React.</p>

<figure class="post-image">
  <img src="/api/placeholder/800/400" alt="YouTube IFrame dans React" />
  <figcaption>Intégration d'une vidéo YouTube avec contrôles personnalisés</figcaption>
</figure>

<h2 id="type-definitions">Définitions de types pour l'API IFrame</h2>

<p>Avant de plonger dans le code React, je vous recommande vivement de configurer TypeScript pour utiliser cette API en toute sécurité. Les définitions de types pour cette API sont disponibles sur <a href="https://www.npmjs.com/package/@types/youtube" target="_blank" rel="noreferrer">npm</a>.</p>

<pre><code class="language-bash">npm install --save-dev @types/youtube
</code></pre>

<p>Après avoir installé ce package, l'espace de noms <code>YT</code> est globalement disponible dans votre projet TypeScript et l'objet player est instancié avec <code>YT.Player</code>.</p>

<h2 id="context-provider">Le Provider de contexte</h2>

<p>Pour garantir que le code de l'API IFrame soit chargé avant que les objets player ne soient créés, vous devez informer chaque composant <code>&lt;YouTubePlayer&gt;</code> que le code de l'API est chargé.</p>

<p>Il y a deux variables d'état appelées <code>isMounted</code> et <code>isApiReady</code>.</p>

<ul>
  <li>La fonction <code>onYouTubeIframeAPIReady</code> est appelée lorsque l'API IFrame est prête à être utilisée. La variable <code>isApiReady</code> est définie sur <code>true</code> à l'intérieur de cette fonction.</li>
  <li>La variable <code>isMounted</code> est définie sur <code>true</code> simultanément à la définition de la fonction <code>onYouTubeIframeAPIReady</code>, car le code de l'API s'attend à ce que cette fonction soit définie à l'avance.</li>
</ul>

<p>Le <code>YouTubeContext</code> peut être un fournisseur de lui-même dans React 19.</p>

<pre><code class="language-tsx">// YouTubeProvider.tsx
"use client";

import { createContext, useEffect, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady(): void;
  }
}

export const YouTubeContext = createContext({
  isApiReady: false,
});

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
    setIsMounted(true);
  }, []);

  return (
    <YouTubeContext value={{ isApiReady }}>
      {isMounted && <script src="https://www.youtube.com/iframe_api" async />}
      {children}
    </YouTubeContext>
  );
}
</code></pre>

<div class="notice notice-info">
  <p><strong>Note:</strong> Dans React 19, l'élément <code>&lt;script&gt;</code> peut être placé n'importe où dans votre application, et il sera déplacé à l'intérieur de l'élément <code>&lt;head&gt;</code>. React déduplique les éléments <code>&lt;script&gt;</code> si les propriétés <code>src</code> et <code>async={true}</code> sont passées.</p>
</div>

<h2 id="player-component">Le composant Player</h2>

<p>Créons maintenant le composant <code>&lt;YouTubePlayer&gt;</code>!</p>

<h3 id="exposing-functions">Exposition des fonctions de lecture</h3>

<p>Pour contrôler la lecture des vidéos, les fonctions <code>playVideo</code> et <code>pauseVideo</code> doivent être appelées dans les composants parents du composant <code>&lt;YouTubePlayer&gt;</code>. Une approche consiste à rendre ces fonctions disponibles via la référence <code>ref</code>.</p>

<p>Le hook <code>useImperativeHandle</code> est utilisé pour exposer les fonctions <code>playVideo</code> et <code>pauseVideo</code> en dehors du composant. Ce hook permet de personnaliser l'objet <code>ref</code>.</p>

<p>L'objet player est créé si la variable <code>isApiReady</code> est définie sur <code>true</code>.</p>

<div class="notice notice-success">
  <p><strong>Astuce:</strong> Depuis React 19, nous pouvons passer <code>ref</code> comme prop sans <code>forwardRef</code>, et consommer un contexte avec <code>use</code> plutôt qu'avec le hook <code>useContext</code>.</p>
</div>

<pre><code class="language-tsx">// YouTubePlayer.tsx
import { use, useEffect, useImperativeHandle, useRef } from "react";
import { YouTubeContext } from "@/providers/YouTubeProvider";

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
}

export default function YouTubePlayer({
  ref,
  options,
}: {
  ref: React.RefObject<YouTubePlayer | null>;
  options: YT.PlayerOptions;
}) {
  const { isApiReady } = use(YouTubeContext);
  const playerRef = useRef<YT.Player | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isApiReady) return;
    if (!elementRef.current) return;

    playerRef.current = new YT.Player(elementRef.current, options);

    return () => {
      playerRef.current?.destroy();
    };
  }, [isApiReady, options]);

  useImperativeHandle(ref, () => {
    return {
      playVideo() {
        playerRef.current?.playVideo();
      },
      pauseVideo() {
        playerRef.current?.pauseVideo();
      },
    };
  }, []);

  return <div ref={elementRef} />;
}
</code></pre>

<h2 id="using-component">Utilisation du composant Player</h2>

<p>Enfin, vous pouvez utiliser le composant <code>&lt;YouTubePlayer&gt;</code> et contrôler la lecture vidéo via l'objet <code>ref</code>.</p>

<pre><code class="language-tsx">"use client";

import { useRef } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";

export default function Home() {
  const playerRef = useRef<React.ComponentRef<typeof YouTubePlayer>>(null);

  return (
    <main>
      <h1>YouTube IFrame Player API</h1>
      <YouTubePlayer
        ref={playerRef}
        options={{
          videoId: "T_WSXXPQYeY",
          playerVars: { origin: "http://localhost:3000" },
        }}
      />
      <div className="player-controls">
        <button 
          type="button"
          className="control-button play" 
          onClick={() => playerRef.current?.playVideo()}
        >
          Lecture
        </button>
        <button 
          type="button" 
          className="control-button pause"
          onClick={() => playerRef.current?.pauseVideo()}
        >
          Pause
        </button>
      </div>
    </main>
  );
}
</code></pre>

<h2 id="conclusion">Conclusion</h2>

<p>L'intégration de l'API YouTube IFrame dans vos applications React vous offre un contrôle précis sur les vidéos intégrées, vous permettant de créer des expériences utilisateur personnalisées et interactives.</p>

<p>Le code d'exemple complet est disponible <a href="https://github.com/m-kawafuji/youtube-iframe-player-api-demo/tree/main" target="_blank" rel="noreferrer">ici</a>.</p>

<p>Pour plus d'informations sur l'API IFrame, consultez <a href="https://developers.google.com/youtube/iframe_api_reference" target="_blank" rel="noreferrer">la référence API officielle</a>.</p>

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
    <li><a href="/blog/2024-12-12_subscribing-media-query-changes-in-react-using-usesyncexternalstore">Subscribing Media Query Changes in React using useSyncExternalStore</a></li>
  </ul>
</div>
`;