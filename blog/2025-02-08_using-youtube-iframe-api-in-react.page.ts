// blog/2025-02-08_using-youtube-iframe-api-in-react.page.ts
export const title = "Using YouTube IFrame API in React";
export const date = new Date("2025-02-08");

export default `
<p>As you know, videos on YouTube can be embedded on your websites. Furthermore,
you can use IFrame API provided by YouTube to be gained granular controls for
those videos, even in React projects.</p>

<h2>Type Definitions for IFrame API</h2>

<p>Before get into the React code, I'd highly recommend to set up TypeScript to
safely use this API. Type Definitions for this API is available on
<a href="https://www.npmjs.com/package/@types/youtube">npm</a>.</p>

<pre><code class="language-bash">npm install --save-dev @types/youtube
</code></pre>

<p>After you install this package, the <code>YT</code> namespace is globally available on your
TypeScript project and the player object is instantiated with <code>YT.Player</code>.</p>

<h2>The Context Provider</h2>

<p>To ensure that IFrame API code is loaded before player objects are created, you
need to tell every <code>&lt;YouTubePlayer&gt;</code> components the API code is loaded.</p>

<p>There are two state variables called <code>isMounted</code> and <code>isApiReady</code>.</p>

<p>The <code>onYouTubeIframeAPIReady</code> function is called when the IFrame API is ready to
be used. The <code>isApiReady</code> is set to <code>true</code> inside this function.</p>

<p>The <code>isMounted</code> is set to <code>true</code> simultaneously with the definition of the
<code>onYouTubeIframeAPIReady</code> function, because the API code expects that the
<code>onYouTubeIframeAPIReady</code> function is defined in advance.</p>

<p>The <code>YouTubeContext</code> can be a provider of itself in React 19.</p>

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

<p>Note that in React 19, the <code>&lt;script&gt;</code> can be located everywhere in your app, and
the <code>&lt;script&gt;</code> will be shifted inside a <code>&lt;head&gt;</code>. React de-duplicates <code>&lt;script&gt;</code>
elements if the <code>src</code> and the <code>async={true}</code> props are passed.</p>

<h2>The Player Component</h2>

<p>Let's create the <code>&lt;YouTubePlayer&gt;</code> component!</p>

<h3>Exposing Functions regarding a Playback.</h3>

<p>To control the playback of videos, the <code>playVideo</code> function and the <code>pauseVideo</code>
function need to called in parent components of the <code>&lt;YouTubePlayer&gt;</code> component.
One of approaches is making these functions are available via the <code>ref</code>.</p>

<p>The <code>useImperativeHandle</code> hook is used to expose the <code>playVideo</code> function and
the <code>pauseVideo</code> function outside the component. The <code>useImperativeHandle</code> hook
can customize the <code>ref</code> object.</p>

<p>The player object is created if the <code>isApiReady</code> is set to <code>true</code>.</p>

<p>Since React 19, we can pass <code>ref</code> as a prop without <code>forwardRef</code>, and consume a
context with <code>use</code> rather than <code>useContext</code> hook.</p>

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

<h2>Using the Player Component.</h2>

<p>Finally, you can use <code>&lt;YouTubePlayer&gt;</code> component, and control the video playback
via the <code>ref</code> object.</p>

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
      <button type="button" onClick={() => playerRef.current?.playVideo()}>
        Play
      </button>
      <button type="button" onClick={() => playerRef.current?.pauseVideo()}>
        Pause
      </button>
    </main>
  );
}
</code></pre>

<p>The example code is
<a href="https://github.com/m-kawafuji/youtube-iframe-player-api-demo/tree/main">here</a>.</p>

<p>For more information about IFrame API, please read
<a href="https://developers.google.com/youtube/iframe_api_reference">the API reference</a>.</p>
`;