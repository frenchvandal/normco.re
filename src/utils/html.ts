import { escape } from "@std/html";

export function escapeHtml(value: unknown) {
  return escape(String(value));
}
