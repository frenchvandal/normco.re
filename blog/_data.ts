export const layout = "@layouts/BlogLayout.ts";

export const tags = ["post"];

export const stylesheet = "/styles/blog/index.css";

export const metas: Lume.Data["metas"] = {
  title: (data) => data.title + " | 李北洛 Philippe",
};