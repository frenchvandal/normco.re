import { slugify } from "../_utilities/text.ts";

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
