/**
 * AuthorProfile Component
 *
 * Displays author information including avatar, name, bio, and social links.
 * Can be used in post layouts to show author details at the end of articles,
 * or in a profile mode homepage.
 *
 * @module
 */

/**
 * Social link for the author.
 */
export interface AuthorSocialLink {
  /** Platform identifier (e.g., "github", "twitter") */
  platform: string;
  /** URL to the author's profile on this platform */
  url: string;
  /** Accessible label for the link */
  label: string;
}

/**
 * Author data structure.
 */
export interface Author {
  /** Author's display name */
  name: string;
  /** Author's avatar image URL */
  avatar?: string;
  /** Short bio or description */
  bio?: string;
  /** Author's email address */
  email?: string;
  /** Author's website URL */
  website?: string;
  /** Social media links */
  social?: AuthorSocialLink[];
}

/**
 * Properties for the AuthorProfile component.
 */
export interface AuthorProfileProps {
  /** Author data */
  author: Author;
  /** Display variant: "compact" for post footer, "full" for profile page */
  variant?: "compact" | "full";
  /** i18n strings */
  i18n?: {
    written_by?: string;
  };
}

/**
 * SVG icons for social platforms (subset from SocialIcons).
 */
const ICONS: Record<string, string> = {
  github:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  twitter:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
  linkedin:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  mastodon:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.58 13.913c-.29 1.469-2.592 3.121-5.238 3.396-1.379.184-2.737.368-4.185.276-2.368-.092-4.237-.551-4.237-.551 0 .184.014.459.043.643.308 2.294 2.317 2.478 4.22 2.57 1.922.092 3.635-.46 3.635-.46l.079 1.653s-1.344.735-3.738.918c-1.32.092-2.96-.046-4.869-.551-4.14-1.102-4.853-5.507-4.961-9.984-.032-1.331-.014-2.57-.014-3.626 0-4.578 3.001-5.967 3.001-5.967 1.514-.735 4.111-1.01 6.808-1.01h.067c2.697 0 5.294.275 6.808 1.01 0 0 3.001 1.389 3.001 5.967 0 0 .038 3.396-.42 5.716z"/><path d="M17.5 7.763v5.203h-2.063V7.946c0-1.102-.46-1.653-1.379-1.653-1.013 0-1.52.643-1.52 1.93v2.754h-2.05V8.223c0-1.287-.507-1.93-1.52-1.93-.92 0-1.379.551-1.379 1.653v5.02H5.526V7.763c0-1.102.275-1.93.826-2.57.567-.643 1.31-.965 2.229-.965 1.059 0 1.862.367 2.406 1.102l.518.827.518-.827c.544-.735 1.347-1.102 2.406-1.102.92 0 1.662.322 2.229.965.55.64.826 1.468.826 2.57z"/></svg>`,
  email:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  website:
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

/**
 * Renders an author profile widget.
 *
 * @param props - Component properties
 * @returns HTML string for the author profile
 *
 * @example Basic usage
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import AuthorProfile from "./AuthorProfile.ts";
 *
 * const html = AuthorProfile({
 *   author: {
 *     name: "John Doe",
 *     bio: "Software developer",
 *   },
 * });
 *
 * assertEquals(html.includes("John Doe"), true);
 * assertEquals(html.includes('class="author-profile"'), true);
 * ```
 *
 * @example With avatar and social links
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import AuthorProfile from "./AuthorProfile.ts";
 *
 * const html = AuthorProfile({
 *   author: {
 *     name: "Jane Smith",
 *     avatar: "/uploads/jane.jpg",
 *     bio: "Tech writer",
 *     social: [
 *       { platform: "github", url: "https://github.com/jane", label: "GitHub" },
 *     ],
 *   },
 *   variant: "full",
 * });
 *
 * assertEquals(html.includes('class="author-profile--full"'), true);
 * assertEquals(html.includes("github.com"), true);
 * ```
 */
export default function AuthorProfile({
  author,
  variant = "compact",
  i18n = {},
}: AuthorProfileProps): string {
  const { name, avatar, bio, email, website, social = [] } = author;
  const writtenBy = i18n.written_by || "Written by";

  // Build social links array including email and website
  const allLinks: AuthorSocialLink[] = [...social];
  if (email) {
    allLinks.push({
      platform: "email",
      url: `mailto:${email}`,
      label: "Email",
    });
  }
  if (website) {
    allLinks.push({
      platform: "website",
      url: website,
      label: "Website",
    });
  }

  const avatarHtml = avatar
    ? `<img
        src="${avatar}"
        alt="${name}"
        class="author-profile__avatar"
        loading="lazy"
        decoding="async"
      />`
    : `<div class="author-profile__avatar author-profile__avatar--placeholder">
        ${name.charAt(0).toUpperCase()}
      </div>`;

  const socialLinksHtml = allLinks.length > 0
    ? `<div class="author-profile__social">
        ${
      allLinks.map((link) => `
          <a
            href="${link.url}"
            target="${link.platform === "email" ? "_self" : "_blank"}"
            rel="${link.platform === "email" ? "" : "noopener noreferrer"}"
            class="author-profile__social-link"
            aria-label="${link.label}"
            title="${link.label}"
          >
            ${ICONS[link.platform] || ICONS.website}
          </a>
        `).join("")
    }
      </div>`
    : "";

  if (variant === "compact") {
    return `
<aside class="author-profile author-profile--compact">
  <div class="author-profile__header">
    ${avatarHtml}
    <div class="author-profile__info">
      <span class="author-profile__label">${writtenBy}</span>
      <span class="author-profile__name">${name}</span>
    </div>
  </div>
  ${socialLinksHtml}
</aside>`;
  }

  // Full variant for profile pages
  return `
<section class="author-profile author-profile--full">
  ${avatarHtml}
  <h1 class="author-profile__name">${name}</h1>
  ${bio ? `<p class="author-profile__bio">${bio}</p>` : ""}
  ${socialLinksHtml}
</section>`;
}

export const css =
  `/* Component CSS is in src/_includes/css/04-components/author-profile.css */`;
