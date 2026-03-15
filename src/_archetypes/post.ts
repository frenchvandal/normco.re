import { slugify } from "../utils/slugify.ts";

/**
 * post — Lume archetype that scaffolds a new multilingual Markdown post.
 *
 * Creates `src/posts/<slug>/_data.yml` plus one Markdown file per language,
 * ready to edit while keeping post layouts in TSX.
 *
 * Usage:
 * ```sh
 * # Title only:
 * deno task lume new post "My Post Title"
 *
 * # Title + description:
 * deno task lume new post "My Post Title" "A short description."
 *
 * # Title + description + tags:
 * deno task lume new post "My Post Title" "A short description." design writing
 * ```
 */

/** Returns today's date as an ISO `YYYY-MM-DD` string. */
function today(): string {
  return Temporal.Now.plainDateISO().toString();
}

/** Escapes double-quote characters for embedding in YAML string values. */
function quote(value: string): string {
  return JSON.stringify(value);
}

/**
 * Scaffolds a new post and yields the files to create.
 *
 * @param title - Post title (required).
 * @param description - Short description shown in meta tags (optional).
 * @param tags - Zero or more tag strings appended after the description.
 */
export default function* post(
  title: string,
  description = "",
  ...tags: string[]
): Generator<{ path: string; content: string }> {
  const slug = slugify(title);
  const date = today();
  const tagLines = tags.length > 0
    ? `tags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\n`
    : "";
  const metadata = `slug: ${slug}
id: ${slug}
date: ${date}
url: /posts/${slug}/
${tagLines}`.trimEnd() + "\n";
  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
    { code: "zh-hans", label: "Chinese Simplified" },
    { code: "zh-hant", label: "Chinese Traditional" },
  ] as const;

  yield {
    path: `/posts/${slug}/_data.yml`,
    content: metadata,
  };

  for (const language of languages) {
    const frontmatter = [
      "---",
      `slug: ${slug}`,
      `lang: ${language.code}`,
      `title: ${quote(title)}`,
      `description: ${quote(description)}`,
      "---",
      "",
      `Write the ${language.label.toLowerCase()} content here.`,
      "",
    ].join("\n");

    yield {
      path: `/posts/${slug}/${language.code}.md`,
      content: frontmatter,
    };
  }
}
