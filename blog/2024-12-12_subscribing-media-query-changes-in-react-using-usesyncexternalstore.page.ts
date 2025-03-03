// blog/2024-12-12_subscribing-media-query-changes-in-react.page.ts
export const title = "Subscribing Media Query Changes in React using useSyncExternalStore";
export const date = new Date("2024-12-12");

export default `
<p>In this post, I walk you through how to subscribe a media query change in React
creating a custom hook called <code>useMediaQuery</code> hook using <code>useSyncExternalStore</code>
hook.</p>

<h2>What is useSyncExternalStore</h2>

<p>Since React 18, <code>useSyncExternalStore</code> is available to subscribe external stores
outside React. We can also levaledge this hook to subscribe changes caused by
browser APIs.</p>

<h2>Create useMediaQuery hook</h2>

<p>Assume that you're using TypeScript. <code>useMediaQuery</code> takes a media query string
as an argument and returns a <code>boolean</code> value whether the media query string
matches and also returns <code>undefined</code> if <code>window</code> is not available.</p>

<pre><code class="language-typescript">// useMediaQuery.ts
import { useSyncExternalStore } from "react";

export default function useMediaQuery(mediaQueryString: string) {
  // The logic goes here.
}
</code></pre>

<p><code>useSyncExternalStore</code> accepts three arguments.</p>

<ul>
  <li>The first argument is the <code>subscribe</code> function that subscribes the external
  store changes. It accepts a callback as an argument that will be called when
  the store changes. In this case, a <code>MediaQueryList</code> object listens the
  <code>change</code> event invoked when the media query status of the document changes.</li>
  <li>The second argument is the <code>getSnapshot</code> function that sets the value returned
  from <code>useSyncExternalStore</code> and is called when the <code>subscribe</code> function's
  callback is invoked. In this case, it returns the <code>boolean</code> value whether the
  <code>mediaQueryString</code> matches or not.</li>
  <li>The third argument is the <code>getServerSnapshot</code> function that returns the
  initial value to be set during the hydration and can be omitted if the
  components that use this hook are fully rendered on the client. In this case,
  <code>undefined</code> is returned since <code>window</code> is not available on the server.</li>
</ul>

<p>For more details, read
<a href="https://react.dev/reference/react/useSyncExternalStore">the API reference</a>.</p>

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

<p>Note that the <code>subscribe</code> function is wrapped by <code>useCallback</code> hook to prevent
from re-subscribing unnecessarily.</p>

<h2>Conclusion</h2>

<p>Admittedly, <code>useMediaQuery</code> hook can be written without <code>useSyncExternalStore</code>.
For example we can either write <code>useMediaQuery</code> using <code>useEffect</code> and <code>useState</code>
which are familiar with a majority of developers.</p>

<p>However, nowadays we're getting more opportunities to render React component on
the server or at the build time such as Next.js, Remix and Astro. Therefore,
returning both the client and the server snapshots explicitly from
<code>useSyncExternalStore</code> is more cleaner IMO.</p>

<p>Here is
<a href="https://github.com/m-kawafuji/use-syncexternalstore-demo">the demo repository</a>.</p>
`;