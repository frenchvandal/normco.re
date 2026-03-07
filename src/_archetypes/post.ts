/**
 * post — Lume archetype that scaffolds a new `.page.tsx` post.
 *
 * Creates `src/posts/<slug>.page.tsx` with the correct metadata exports and a
 * placeholder body ready to edit.
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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a title string into a URL-safe kebab-case slug. */
function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Returns today's date as an ISO `YYYY-MM-DD` string. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Escapes double-quote characters for embedding in a TS string literal. */
function escapeStr(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// ── Archetype ────────────────────────────────────────────────────────────────

/**
 * Scaffolds a new post and returns its path and source content.
 *
 * @param title - Post title (required).
 * @param description - Short description shown in meta tags (optional).
 * @param tags - Zero or more tag strings appended after the description.
 */
export default function post(
  title: string,
  description = "",
  ...tags: string[]
): { path: string; content: string } {
  const slug = slugify(title);
  const date = today();
  const safeTitle = escapeStr(title);
  const safeDesc = escapeStr(description);

  const tagsLine = tags.length > 0
    ? `/** Post tags. */\nexport const tags = [${
      tags.map((t) => `"${escapeStr(t)}"`).join(", ")
    }];\n`
    : "";

  const descLine = description.length > 0
    ? `/** Post meta description. */\nexport const description = "${safeDesc}";\n`
    : "";

  // The body is a raw TypeScript source string; backticks inside it must be
  // escaped so they do not close the outer template literal.
  const content = `/** ${safeTitle}. */

export const title = "${safeTitle}";
/** Publication date. */
export const date = new Date("${date}");
${descLine}${tagsLine}
/** Renders the post body. */
export default (_data: Lume.Data, _helpers: Lume.Helpers): string =>
  \`<p>Write your content here.</p>\`;
`;

  return { path: `/posts/${slug}.page.tsx`, content };
}
