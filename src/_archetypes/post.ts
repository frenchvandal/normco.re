function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
