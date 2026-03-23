import { slugify } from "../utils/slugify.ts";
import { resolveCurrentDateIso } from "../utils/current-date.ts";

// Lume archetype for the repo's multilingual post model:
// `src/posts/<slug>/_data.yml` plus one Markdown body per supported language.
function today(): string {
  return resolveCurrentDateIso();
}

function quote(value: string): string {
  return JSON.stringify(value);
}

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
