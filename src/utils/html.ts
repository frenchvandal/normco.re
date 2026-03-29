import { escape } from "@std/html";

export function escapeHtml(value: unknown) {
  return escape(String(value));
}

export function escapeXml(value: unknown) {
  return escapeHtml(value).replaceAll("&#39;", "&apos;");
}
