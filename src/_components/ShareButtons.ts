/**
 * ShareButtons Component
 *
 * Renders social sharing buttons for blog posts, enabling readers to share
 * content on various platforms including Twitter, Facebook, LinkedIn,
 * and WhatsApp. Also includes a copy-to-clipboard button for the post URL.
 *
 * Follows PaperMod's share button pattern with accessible, keyboard-navigable
 * links that open in new windows.
 *
 * @module
 */

/**
 * Properties for the ShareButtons component.
 */
export interface ShareButtonsProps {
  /** Absolute URL of the post to share */
  url: string;
  /** Title of the post */
  title: string;
  /** Optional description/excerpt for platforms that support it */
  description?: string;
  /** i18n strings for labels */
  i18n: {
    share: string;
    copy_link: string;
    copied: string;
  };
}

/**
 * SVG icons for each share platform.
 * Icons are from Feather Icons (MIT licensed).
 */
const ICONS = {
  twitter:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
  facebook:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  linkedin:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  whatsapp:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  link:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
};

/**
 * Generates sharing URLs for each platform.
 *
 * @param url - The URL to share
 * @param title - The title of the content
 * @param description - Optional description
 * @returns Object with sharing URLs for each platform
 */
function getShareUrls(
  url: string,
  title: string,
  description?: string,
): Record<string, string> {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || "");

  return {
    twitter:
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin:
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
    whatsapp:
      `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };
}

/**
 * Renders share buttons for a blog post.
 *
 * @param props - Component properties
 * @returns HTML string for the share buttons
 *
 * @example Basic usage
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import ShareButtons from "./ShareButtons.ts";
 *
 * const html = ShareButtons({
 *   url: "https://example.com/post",
 *   title: "My Post",
 *   i18n: { share: "Share", copy_link: "Copy link", copied: "Copied!" },
 * });
 *
 * assertEquals(html.includes('class="share-buttons"'), true);
 * assertEquals(html.includes('twitter.com'), true);
 * ```
 */
export default function ShareButtons({
  url,
  title,
  description,
  i18n,
}: ShareButtonsProps): string {
  const shareUrls = getShareUrls(url, title, description);

  const platforms = [
    { name: "twitter", label: "Twitter", url: shareUrls.twitter },
    { name: "facebook", label: "Facebook", url: shareUrls.facebook },
    { name: "linkedin", label: "LinkedIn", url: shareUrls.linkedin },
    { name: "whatsapp", label: "WhatsApp", url: shareUrls.whatsapp },
  ];

  const platformButtons = platforms
    .map(
      (platform) => `
    <a
      href="${platform.url}"
      target="_blank"
      rel="noopener noreferrer"
      class="share-button share-button--${platform.name}"
      aria-label="${i18n.share} ${platform.label}"
      title="${i18n.share} ${platform.label}"
    >
      ${ICONS[platform.name as keyof typeof ICONS]}
      <span class="share-button__label">${platform.label}</span>
    </a>`,
    )
    .join("");

  const copyButton = `
    <button
      type="button"
      class="share-button share-button--copy"
      data-share-url="${url}"
      aria-label="${i18n.copy_link}"
      title="${i18n.copy_link}"
    >
      ${ICONS.link}
      <span class="share-button__label">${i18n.copy_link}</span>
    </button>`;

  return `
<aside class="share-buttons" aria-label="${i18n.share}">
  <span class="share-buttons__title">${i18n.share}:</span>
  <div class="share-buttons__list">
    ${platformButtons}
    ${copyButton}
  </div>
</aside>`;
}

export const css =
  `/* Component CSS is in src/_includes/css/04-components/share-buttons.css */`;
