import { escape } from "@std/html";

/** Escapes dynamic values before interpolating them into HTML text or attributes. */
export function escapeHtml(value: unknown): string {
  return escape(String(value));
}
