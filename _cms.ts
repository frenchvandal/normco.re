import CMS from "lume/cms/mod.ts";
import { slugify } from "./src/utils/slugify.ts";

type PostLanguageCollection = {
  readonly filename: string;
  readonly label: string;
  readonly language: string;
  readonly name: string;
};

const POST_LANGUAGE_COLLECTIONS: ReadonlyArray<PostLanguageCollection> = [
  {
    name: "posts-en",
    label: "Posts (English)",
    language: "en",
    filename: "en.md",
  },
  {
    name: "posts-fr",
    label: "Posts (French)",
    language: "fr",
    filename: "fr.md",
  },
  {
    name: "posts-zh-hans",
    label: "Posts (Chinese Simplified)",
    language: "zh-hans",
    filename: "zh-hans.md",
  },
  {
    name: "posts-zh-hant",
    label: "Posts (Chinese Traditional)",
    language: "zh-hant",
    filename: "zh-hant.md",
  },
] as const;

function resolveSlug(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0
    ? slugify(value)
    : "post";
}

function toFolderLabel(name: string, suffix: string): string {
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

function createLanguageCollection(
  cms: ReturnType<typeof CMS>,
  collection: PostLanguageCollection,
): void {
  cms.collection({
    name: collection.name,
    label: collection.label,
    description:
      `Edit ${collection.language} Markdown posts stored in src/posts/*/${collection.filename}.`,
    store: `src:posts/*/${collection.filename}`,
    fields: [
      {
        name: "slug",
        type: "text",
        label: "Slug",
        attributes: {
          required: true,
        },
      },
      {
        name: "lang",
        type: "hidden",
        init(field) {
          field.value = collection.language;
        },
      },
      "title: text!",
      {
        name: "description",
        type: "textarea",
        attributes: {
          required: true,
          maxlength: 180,
        },
      },
      {
        name: "content",
        type: "markdown",
        upload: "post-images:{document_dirname}/images",
        relativePath: true,
      },
    ],
    documentName(data) {
      return `${resolveSlug(data.slug)}/${collection.filename}`;
    },
    documentLabel(name) {
      return toFolderLabel(name, `/${collection.filename}`);
    },
    rename: false,
  });
}

/** Lume CMS instance used by the CMS UI at `/admin`. */
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
    {
      name: "slug",
      type: "text",
      label: "Slug",
      attributes: {
        required: true,
      },
    },
    {
      name: "id",
      type: "text",
      attributes: {
        required: true,
      },
    },
    {
      name: "url",
      type: "text",
      attributes: {
        required: true,
      },
    },
    {
      name: "date",
      type: "date",
      init(field) {
        if (!field.value) {
          field.value = Temporal.Now.plainDateISO().toString();
        }
      },
    },
    "tags: list",
  ],
  documentName(data) {
    return `${resolveSlug(data.slug)}/_data.yml`;
  },
  documentLabel(name) {
    return toFolderLabel(name, "/_data.yml");
  },
  rename: false,
});

for (const collection of POST_LANGUAGE_COLLECTIONS) {
  createLanguageCollection(cms, collection);
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
  prodBranch: "master",
});

export default cms;
