/** 404 error page. */

export const url = "/404.html";
export const layout = "layouts/base.ts";
export const title = "Page not found";
export const description = "The page you requested does not exist.";

// Exclude this page from the sitemap and search results.
export const unlisted = true;

export default function (_data: Lume.Data, _helpers: Lume.Helpers): string {
  return `<div class="not-found">
  <p class="not-found-code" aria-hidden="true">404</p>
  <p class="not-found-message">Page not found.</p>
  <a href="/" class="not-found-link">Back to home</a>
</div>`;
}
