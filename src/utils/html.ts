import { escape } from "@std/html";

export function escapeHtml(value: unknown): string {
  return escape(String(value));
}
