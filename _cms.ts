import CMS from "lume/cms/mod.ts";
import { slugify } from "./src/utils/slugify.ts";
import { resolveCurrentDateIso } from "./src/utils/current-date.ts";

type PostLanguageCollection = {
  readonly filename: string;
  readonly label: string;
  readonly language: string;
  readonly name: string;
};

const CMS_PROD_BRANCH_ENV_KEY = "CMS_PROD_BRANCH";
const DEFAULT_CMS_PROD_BRANCH = "master";

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

export function resolveSlug(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Post slug is required.");
  }

  const normalizedSlug = slugify(value);

  if (normalizedSlug.length === 0) {
    throw new Error(`Post slug "${value}" is invalid after normalization.`);
  }

  return normalizedSlug;
}

export { resolveCurrentDateIso } from "./src/utils/current-date.ts";

/**
 * Returns the Git branch used by the CMS publish workflow.
 *
 * The repository default is still `master`, but deployments can override it
 * explicitly via `CMS_PROD_BRANCH` without editing source.
 */
export function resolveCmsProdBranch(
  env: Pick<typeof Deno.env, "get"> = Deno.env,
): string {
  try {
    const configuredBranch = env.get(CMS_PROD_BRANCH_ENV_KEY)?.trim();
    if (configuredBranch) {
      return configuredBranch;
    }
  } catch {
    // Ignore env lookup errors in restricted runtimes and keep the repo default.
  }

  return DEFAULT_CMS_PROD_BRANCH;
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
          field.value = resolveCurrentDateIso();
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
  prodBranch: resolveCmsProdBranch(),
});

export default cms;
