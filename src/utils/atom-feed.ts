import { escape } from "@std/html";
import { formatRfc3339Instant } from "./date-time.ts";
import { ATOM_FEED_MIME_TYPE, HTML_MIME_TYPE } from "./media-types.ts";

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
  readonly complete?: boolean;
  readonly updated: Date;
  readonly author: AtomFeedAuthor;
  readonly entries: ReadonlyArray<AtomFeedEntry>;
  readonly stylesheetHref?: string;
};

export function escapeXml(value: string): string {
  return escape(value).replaceAll("&#39;", "&apos;");
}

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
    `    <link rel="alternate" type="${HTML_MIME_TYPE}" href="${
      escapeXml(entry.url)
    }"/>`,
    `    <updated>${formatRfc3339Instant(entry.updated)}</updated>`,
  ];

  if (entry.published) {
    lines.push(
      `    <published>${formatRfc3339Instant(entry.published)}</published>`,
    );
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
      data.complete ? ' xmlns:fh="http://purl.org/syndication/history/1.0"' : ""
    }${data.language ? ` xml:lang="${escapeXml(data.language)}"` : ""}>`,
    `  <id>${escapeXml(data.id)}</id>`,
    `  <title>${escapeXml(data.title)}</title>`,
    `  <link rel="self" type="${ATOM_FEED_MIME_TYPE}" href="${
      escapeXml(data.feedUrl)
    }"/>`,
    `  <link rel="alternate" type="${HTML_MIME_TYPE}" href="${
      escapeXml(data.siteUrl)
    }"/>`,
    ...(data.complete ? ["  <fh:complete/>"] : []),
    `  <updated>${formatRfc3339Instant(data.updated)}</updated>`,
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
