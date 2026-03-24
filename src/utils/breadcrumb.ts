/**
 * Shared breadcrumb HTML renderer.
 *
 * Used by about, posts archive, post detail, syndication, and tag pages.
 */

import { escapeHtml } from "./html.ts";

export type BreadcrumbItem = Readonly<{ href: string; label: string }>;

export function renderBreadcrumb(
  items: readonly BreadcrumbItem[],
  ariaLabel: string,
): string {
  const lis = items.map(({ href, label }) =>
    `<li class="cds--breadcrumb-item">
      <a href="${escapeHtml(href)}" class="cds--breadcrumb-link">${escapeHtml(label)}</a>
    </li>`
  ).join("\n");

  return `<nav class="cds--breadcrumb" aria-label="${escapeHtml(ariaLabel)}">
  <ol class="cds--breadcrumb-list">
    ${lis}
  </ol>
</nav>`;
}
