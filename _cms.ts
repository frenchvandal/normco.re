import CMS from "lume/cms/mod.ts";
import { slugify } from "./src/utils/slugify.ts";

/** Lume CMS instance used by the CMS UI at `/admin`. */
const cms: ReturnType<typeof CMS> = CMS({
  site: {
    name: "normco.re CMS",
    description: "Local editor for blog posts and media assets.",
  },
});

cms.collection({
  name: "posts",
  label: "Posts",
  description: "Create, edit, and publish blog posts stored in src/posts.",
  store: "src:posts/*.md",
  fields: [
    "title: text!",
    {
      name: "date",
      type: "datetime",
      init(field) {
        if (!field.value) {
          field.value = new Date();
        }
      },
    },
    {
      name: "description",
      type: "textarea",
      attributes: {
        required: true,
        maxlength: 180,
      },
    },
    "tags: list",
    {
      name: "content",
      type: "markdown",
      upload: "post-images",
      relativePath: true,
    },
  ],
  documentName(data) {
    const title = typeof data.title === "string" ? data.title : "post";
    return `${slugify(title)}.md`;
  },
  documentLabel(name) {
    return name.replace(".md", "");
  },
  rename: "auto",
});

cms.upload({
  name: "post-images",
  label: "Post images",
  description: "Images used by markdown posts.",
  store: "src:posts/images",
  publicPath: "/posts/images",
});

cms.git({
  prodBranch: "master",
});

export default cms;
