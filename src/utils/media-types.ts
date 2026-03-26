import { contentType, typeByExtension } from "@std/media-types";

function resolveMimeType(extension: string, fallback: string): string {
  return typeByExtension(extension) ?? fallback;
}

function resolveContentType(extension: string, fallback: string): string {
  return contentType(extension) ?? fallback;
}

export const HTML_MIME_TYPE = resolveMimeType("html", "text/html");
export const HTML_CONTENT_TYPE = resolveContentType(
  "html",
  `${HTML_MIME_TYPE}; charset=UTF-8`,
);
export const PLAIN_TEXT_CONTENT_TYPE = resolveContentType(
  "txt",
  "text/plain; charset=UTF-8",
);
export const SVG_MIME_TYPE = resolveMimeType("svg", "image/svg+xml");
export const XML_MIME_TYPE = resolveMimeType("xml", "application/xml");
export const APP_MANIFEST_MIME_TYPE = resolveMimeType(
  "webmanifest",
  "application/manifest+json",
);
export const RSS_FEED_MIME_TYPE = resolveMimeType(
  "rss",
  "application/rss+xml",
);
export const ATOM_FEED_MIME_TYPE = resolveMimeType(
  "atom",
  "application/atom+xml",
);
export const JSON_FEED_MIME_TYPE = "application/feed+json" as const;
