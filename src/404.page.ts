/**
 * 404 Not Found Page
 *
 * Error page displayed when content is not found.
 */

/**
 * Page title.
 */
export const title = "Content not found";

/**
 * Layout template used for the 404 page.
 */
export const layout = "layouts/base.ts";

/**
 * Output URL for the 404 page.
 */
export const url = "/404.html";

/**
 * Markdown content for the 404 page.
 */
const markdownContent = `
# Content not found.

Go [home](/).
`;

/**
 * Renders the 404 page content.
 *
 * @param _data - Lume data object (unused).
 * @param helpers - Lume helpers including markdown renderer.
 * @returns The rendered HTML content.
 */
export default function (_data: Lume.Data, { md }: Lume.Helpers): string {
  return md(markdownContent);
}
