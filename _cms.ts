import CMS from "lume/cms/mod.ts";
import { resolveCmsProdBranch, resolveSlug } from "./src/utils/cms.ts";
import { resolveCurrentDateIso } from "./src/utils/current-date.ts";

export { resolveCmsProdBranch, resolveCurrentDateIso, resolveSlug };

const LANGUAGES = [
  { code: "en", label: "English", filename: "en.md" },
  { code: "fr", label: "French", filename: "fr.md" },
  { code: "zh-hans", label: "Chinese Simplified", filename: "zh-hans.md" },
  { code: "zh-hant", label: "Chinese Traditional", filename: "zh-hant.md" },
] as const;

function toFolderLabel(name: string, suffix: string) {
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

const cms: ReturnType<typeof CMS> = CMS({
  site: {
    name: "normco.re CMS",
    description: "Local editor for blog posts and media assets.",
  },
});

cms.collection({
  name: "post-metadata",
  label: "Post metadata",
  description: "Edit the shared post metadata stored in src/posts/*/_data.yml.",
  store: "src:posts/*/_data.yml",
  fields: [
    { name: "id", type: "text", label: "Slug", attributes: { required: true } },
    { name: "url", type: "text", attributes: { required: true } },
    {
      name: "date",
      type: "date",
      init(field) {
        if (!field.value) field.value = resolveCurrentDateIso();
      },
    },
    "tags: list",
  ],
  documentName(data) {
    return `${resolveSlug(data.id)}/_data.yml`;
  },
  documentLabel(name) {
    return toFolderLabel(name, "/_data.yml");
  },
  rename: false,
});

for (const { code, label, filename } of LANGUAGES) {
  cms.collection({
    name: `posts-${code}`,
    label: `Posts (${label})`,
    description:
      `Edit ${code} Markdown posts stored in src/posts/*/${filename}.`,
    store: `src:posts/*/${filename}`,
    fields: [
      {
        name: "lang",
        type: "hidden",
        init(field: { value?: string | number | boolean }) {
          field.value = code;
        },
      },
      "title: text!",
      {
        name: "description",
        type: "textarea",
        attributes: { required: true, maxlength: 180 },
      },
      {
        name: "content",
        type: "markdown",
        upload: `post-images:{document_dirname}/images`,
        relativePath: true,
      },
    ],
    documentLabel(name) {
      return toFolderLabel(name, `/${filename}`);
    },
    rename: false,
  });
}

cms.upload({
  name: "post-images",
  label: "Post images",
  description:
    "Images used by Markdown posts, stored alongside each post slug.",
  store: "src:posts",
  publicPath: "/posts",
});

cms.git({
  prodBranch: resolveCmsProdBranch(),
});

export default cms;
