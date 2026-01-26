/**
 * Breadcrumbs Component for Lume
 * Renders breadcrumb navigation with accessible markup
 */

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: "default" | "boxed" | "compact";
  homeLabel?: string;
  homeUrl?: string;
  separator?: string;
}

/**
 * Renders breadcrumb navigation markup.
 *
 * @param props - Breadcrumb configuration and labels.
 * @returns The breadcrumbs HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderBreadcrumbs from "./Breadcrumbs.ts";
 *
 * assertEquals(typeof renderBreadcrumbs, "function");
 * ```
 */
export default function ({
  items,
  variant = "default",
  homeLabel = "Home",
  homeUrl = "/",
  separator = "/",
}: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return "";
  }

  const variantClass = variant !== "default" ? ` breadcrumbs--${variant}` : "";

  // Build full breadcrumb trail with home
  const allItems: BreadcrumbItem[] = [
    { label: homeLabel, url: homeUrl },
    ...items,
  ];

  return `
    <nav class="breadcrumbs${variantClass}" aria-label="Breadcrumb">
      <ol class="breadcrumbs__list">
        ${
    allItems
      .map((item, index) => {
        const isLast = index === allItems.length - 1;
        const showSeparator = index < allItems.length - 1;

        const iconMarkup = item.icon
          ? `<span class="breadcrumbs__icon" aria-hidden="true">${item.icon}</span>`
          : "";

        const content = isLast || !item.url
          ? `<span class="breadcrumbs__current" aria-current="page">${iconMarkup}${item.label}</span>`
          : `<a href="${item.url}" class="breadcrumbs__link">${iconMarkup}${item.label}</a>`;

        return `
        <li class="breadcrumbs__item">
          ${content}
          ${
          showSeparator
            ? `<span class="breadcrumbs__separator" aria-hidden="true">${separator}</span>`
            : ""
        }
        </li>`;
      })
      .join("")
  }
      </ol>
    </nav>
  `;
}
