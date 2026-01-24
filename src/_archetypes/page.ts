function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
