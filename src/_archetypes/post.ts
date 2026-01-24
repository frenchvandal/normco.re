import { slugify } from "../_utilities/text.ts";

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
