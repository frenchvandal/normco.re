import { slugify } from "../_utilities/text.ts";

/**
 * Creates a post archetype with a slugified path and current date.
 *
 * @param title - The post title used to generate the slug.
 * @returns The archetype data for a new post.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import createPostArchetype from "./post.ts";
 *
 * assertEquals(typeof createPostArchetype, "function");
 * ```
 */
export default function (title = "New post") {
  const slug = slugify(title);
  const date = new Date().toISOString().split("T")[0];

  return {
    path: `/posts/${slug}.md`,
    content: {
      title,
      description: "",
      date,
      author: "phiphi",
      tags: ["Tag"],
      content: "Write your post content here.",
    },
  };
}
