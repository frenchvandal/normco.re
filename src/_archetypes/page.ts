import { slugify } from "../_utilities/text.ts";

/**
 * Creates a page archetype with a slugified path.
 *
 * @param title - The page title used to generate the slug.
 * @returns The archetype data for a new page.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import createPageArchetype from "./page.ts";
 *
 * assertEquals(typeof createPageArchetype, "function");
 * ```
 */
export default function (title = "New page") {
  const slug = slugify(title);

  return {
    path: `/pages/${slug}.md`,
    content: {
      layout: "layouts/page.ts",
      title,
      url: `/${slug}/`,
      menu: {
        visible: true,
        order: 1,
      },
      content: "Write your page content here.",
    },
  };
}
