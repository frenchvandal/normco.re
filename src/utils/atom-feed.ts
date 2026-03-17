/**
 * Generates Atom 1.0 (RFC 4287) feed XML from structured feed data.
 *
 * Lume's built-in feed plugin does not support Atom output, so this module
 * provides a standalone generator that produces spec-conformant Atom XML.
 */

/** Escapes a string for safe use in XML text content and attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type AtomFeedAuthor = {
  readonly name: string;
  readonly uri?: string;
};

export type AtomFeedEntry = {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly published?: Date;
  readonly updated?: Date;
  readonly summary?: string;
  readonly contentHtml?: string;
};

export type AtomFeedData = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly siteUrl: string;
  readonly feedUrl: string;
  readonly language?: string;
  readonly updated: Date;
  readonly author?: AtomFeedAuthor;
  readonly entries: ReadonlyArray<AtomFeedEntry>;
};

function formatAuthor(author: AtomFeedAuthor): string {
  const parts = [`    <name>${escapeXml(author.name)}</name>`];

  if (author.uri) {
    parts.push(`    <uri>${escapeXml(author.uri)}</uri>`);
  }

  return `  <author>\n${parts.join("\n")}\n  </author>`;
}

function formatEntry(entry: AtomFeedEntry): string {
  const lines = [
    "  <entry>",
    `    <id>${escapeXml(entry.id)}</id>`,
    `    <title>${escapeXml(entry.title)}</title>`,
    `    <link href="${escapeXml(entry.url)}" rel="alternate" type="text/html"/>`,
  ];

  if (entry.published) {
    lines.push(`    <published>${entry.published.toISOString()}</published>`);
  }

  if (entry.updated) {
    lines.push(`    <updated>${entry.updated.toISOString()}</updated>`);
  } else if (entry.published) {
    lines.push(`    <updated>${entry.published.toISOString()}</updated>`);
  }

  if (entry.summary) {
    lines.push(`    <summary>${escapeXml(entry.summary)}</summary>`);
  }

  if (entry.contentHtml) {
    lines.push(
      `    <content type="html"><![CDATA[${entry.contentHtml}]]></content>`,
    );
  }

  lines.push("  </entry>");
  return lines.join("\n");
}

/** Generates a complete Atom 1.0 XML document. */
export function generateAtomXml(data: AtomFeedData): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom"${data.language ? ` xml:lang="${escapeXml(data.language)}"` : ""}>`,
    `  <id>${escapeXml(data.id)}</id>`,
    `  <title>${escapeXml(data.title)}</title>`,
    `  <link href="${escapeXml(data.feedUrl)}" rel="self" type="application/atom+xml"/>`,
    `  <link href="${escapeXml(data.siteUrl)}" rel="alternate" type="text/html"/>`,
    `  <updated>${data.updated.toISOString()}</updated>`,
  ];

  if (data.description) {
    lines.push(`  <subtitle>${escapeXml(data.description)}</subtitle>`);
  }

  if (data.author) {
    lines.push(formatAuthor(data.author));
  }

  for (const entry of data.entries) {
    lines.push(formatEntry(entry));
  }

  lines.push("</feed>", "");
  return lines.join("\n");
}
