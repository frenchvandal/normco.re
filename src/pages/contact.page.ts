/**
 * Contact Page
 *
 * Contact information page.
 */

/**
 * Layout template used for the contact page.
 */
export const layout = "layouts/page.ts";

/**
 * Page title.
 */
export const title = "Contact";

/**
 * Output URL for the contact page.
 */
export const url = "/contact/";

/**
 * Menu configuration for navigation visibility.
 */
export const menu = {
  visible: true,
  order: 2,
};

/**
 * Markdown content for the contact page.
 */
const markdownContent = `
# Get in touch

If you would like to reach out, you can contact me through GitHub.
`;

/**
 * Renders the contact page content.
 *
 * @param _data - Lume data object (unused).
 * @param helpers - Lume helpers including markdown renderer.
 * @returns The rendered HTML content.
 */
export default function (_data: Lume.Data, { md }: Lume.Helpers): string {
  return md(markdownContent);
}
