/** Utilities to generate Atom 1.0 feeds. */

export type AtomFeedAuthor = {
  readonly name: string;
  readonly url?: string;
};

export type AtomFeedEntry = {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly updated: Date;
  readonly published?: Date;
  readonly summary?: string;
  readonly contentHtml?: string;
};

export type AtomFeedData = {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly siteUrl: string;
  readonly feedUrl: string;
  readonly language?: string;
  readonly updated: Date;
  readonly author: AtomFeedAuthor;
  readonly entries: ReadonlyArray<AtomFeedEntry>;
  readonly stylesheetHref?: string;
};

/** Escapes a string for XML text and attribute contexts. */
export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Rewrites relative `href` and `src` attributes in HTML to absolute URLs. */
export function absolutizeHtmlUrls(baseUrl: string, html: string): string {
  return html.replaceAll(
    /\s(href|src)="([^"]+)"/g,
    (_match, attribute, value) =>
      ` ${attribute}="${new URL(value, baseUrl).href}"`,
  );
}

function formatAuthor(author: AtomFeedAuthor): string {
  const lines = [`    <name>${escapeXml(author.name)}</name>`];

  if (author.url) {
    lines.push(`    <uri>${escapeXml(author.url)}</uri>`);
  }

  return `  <author>\n${lines.join("\n")}\n  </author>`;
}

function formatEntry(entry: AtomFeedEntry): string {
  const lines = [
    "  <entry>",
    `    <id>${escapeXml(entry.id)}</id>`,
    `    <title>${escapeXml(entry.title)}</title>`,
    `    <link rel="alternate" type="text/html" href="${
      escapeXml(entry.url)
    }"/>`,
    `    <updated>${entry.updated.toISOString()}</updated>`,
  ];

  if (entry.published) {
    lines.push(`    <published>${entry.published.toISOString()}</published>`);
  }

  if (entry.summary) {
    lines.push(`    <summary>${escapeXml(entry.summary)}</summary>`);
  }

  if (entry.contentHtml) {
    lines.push(
      `    <content type="html">${escapeXml(entry.contentHtml)}</content>`,
    );
  }

  lines.push("  </entry>");

  return lines.join("\n");
}

/** Generates a complete Atom 1.0 XML document. */
export function generateAtomXml(data: AtomFeedData): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];

  if (data.stylesheetHref) {
    lines.push(
      `<?xml-stylesheet type="text/xsl" href="${
        escapeXml(data.stylesheetHref)
      }"?>`,
    );
  }

  lines.push(
    `<feed xmlns="http://www.w3.org/2005/Atom"${
      data.language ? ` xml:lang="${escapeXml(data.language)}"` : ""
    }>`,
    `  <id>${escapeXml(data.id)}</id>`,
    `  <title>${escapeXml(data.title)}</title>`,
    `  <link rel="self" type="application/atom+xml" href="${
      escapeXml(data.feedUrl)
    }"/>`,
    `  <link rel="alternate" type="text/html" href="${
      escapeXml(data.siteUrl)
    }"/>`,
    `  <updated>${data.updated.toISOString()}</updated>`,
  );

  if (data.subtitle) {
    lines.push(`  <subtitle>${escapeXml(data.subtitle)}</subtitle>`);
  }

  lines.push(formatAuthor(data.author));

  for (const entry of data.entries) {
    lines.push(formatEntry(entry));
  }

  lines.push("</feed>", "");

  return lines.join("\n");
}
