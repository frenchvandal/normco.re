/** Offline fallback page served when navigation fails without connectivity. */

export const url = "/offline/";
/** Page title. */
export const title = "Offline";
/** Page meta description. */
export const description =
  "Offline fallback page for normco.re when connectivity is unavailable.";
/** Excludes this page from the sitemap and search results. */
export const unlisted = true;

/** Renders the offline fallback body. */
export default function (): string {
  return `<section class="offline-page" aria-label="Offline fallback">
  <h1 class="offline-page-title">You are offline.</h1>
  <p class="offline-page-lead">The latest page could not be loaded right now.</p>
  <p class="offline-page-action"><a href="/">Back to home</a></p>
</section>`;
}
