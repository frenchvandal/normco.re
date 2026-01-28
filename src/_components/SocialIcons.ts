/**
 * Social Icons Component
 * Renders a list of social media links with SVG icons.
 *
 * @module
 */

/**
 * Social link configuration.
 */
interface SocialLink {
  /** Platform identifier (e.g., "github", "twitter", "email") */
  platform: string;
  /** URL or mailto link */
  url: string;
  /** Accessible label for the link */
  label: string;
}

/**
 * SVG icons for supported social platforms.
 * Icons are from Feather Icons (MIT License).
 */
const SOCIAL_ICONS: Record<string, string> = {
  github:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,

  twitter:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,

  linkedin:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,

  email:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,

  rss:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`,

  mastodon:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.58 13.913c-.29 1.469-2.592 3.121-5.238 3.396-1.379.144-2.736.276-4.185.197-2.368-.129-4.24-.673-4.24-.673 0 .271.017.53.049.773.344 2.616 2.594 2.773 4.724 2.846 2.147.072 4.063-.53 4.063-.53l.088 1.948s-1.503.804-4.181.953c-1.476.082-3.308-.037-5.44-.601-4.627-1.224-5.42-6.147-5.54-11.147-.036-1.479-.014-2.874-.014-4.042 0-5.1 3.341-6.595 3.341-6.595 1.685-.774 4.575-1.1 7.578-1.125h.074c3.003.025 5.896.351 7.58 1.125 0 0 3.342 1.495 3.342 6.595 0 0 .042 3.762-.501 6.38z"/><path d="M17.79 7.653v5.142h-2.037V7.81c0-1.053-.443-1.588-1.328-1.588-1.978 0-2.97 1.588-2.97 1.588v4.332h-2.025V7.81c0-1.053-.443-1.588-1.329-1.588-.978 0-1.97.788-1.97 1.588v5.142H4.093V7.653c0-1.053.27-1.888.811-2.507.557-.618 1.287-.936 2.194-.936 1.049 0 1.843.403 2.373 1.209l.511.857.511-.857c.53-.806 1.324-1.209 2.373-1.209.906 0 1.637.318 2.194.936.54.619.811 1.454.811 2.507z"/></svg>`,

  youtube:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,

  instagram:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,

  facebook:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,

  twitch:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/></svg>`,

  jsonfeed:
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-10 -5 1034 1034" fill="currentColor" aria-hidden="true"><path d="M854 175q-27 0 -46 19t-19 45.5t18.5 45t45 18.5t45.5 -18.5t19 -45t-18.5 -45.5t-44.5 -19zM205 192l-34 34q-83 83 -88 154t68 144l82 82q45 46 48.5 78t-33.5 69v0q-16 19 -15.5 44.5t18.5 43.5t43.5 18.5t44.5 -15.5l1 1q25 -25 47 -32t45.5 4.5t53.5 41.5l95 96q75 74 147.5 70t155.5 -87l33 -34l-71 -72l-18 18q-47 47 -84 47.5t-82 -44.5l-112 -112q-86 -86 -169 -17l-11 -11q35 -42 31.5 -83t-45.5 -82l-100 -101q-31 -31 -40.5 -56.5t1 -51.5t42.5 -59l17 -17zM703 326q-28 0 -46.5 19t-18.5 45.5t18.5 45.5t45 19t45.5 -19t19 -45.5t-18.5 -45t-44.5 -19.5zM551 477q-27 0 -46 19t-19 45.5t19 45.5t45.5 19t45.5 -19t19 -45.5t-19 -45t-45 -19.5z"/></svg>`,
};

/**
 * Fallback icon for unsupported platforms.
 */
const FALLBACK_ICON =
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

/**
 * Gets the SVG icon for a social platform.
 *
 * @param platform - The platform identifier.
 * @returns The SVG markup for the icon.
 */
function getIcon(platform: string): string {
  return SOCIAL_ICONS[platform.toLowerCase()] ?? FALLBACK_ICON;
}

/**
 * Social Icons Component Props.
 */
interface SocialIconsProps {
  /** Array of social links to render. */
  social_links?: SocialLink[];
}

/**
 * Renders a list of social media links with SVG icons.
 *
 * @param data - Component props containing social links.
 * @returns The HTML markup for the social icons list.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderSocialIcons from "./SocialIcons.ts";
 *
 * assertEquals(typeof renderSocialIcons, "function");
 * ```
 */
export default function ({ social_links }: SocialIconsProps): string {
  if (!social_links || social_links.length === 0) {
    return "";
  }

  const items = social_links.map((link) => {
    const icon = getIcon(link.platform);
    const isExternal = link.url.startsWith("http") ||
      link.url.startsWith("mailto:");
    const externalAttrs = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";

    return `
      <li>
        <a href="${link.url}" aria-label="${link.label}" class="social-icon social-icon--${link.platform}"${externalAttrs}>
          ${icon}
        </a>
      </li>`;
  }).join("");

  return `
<nav class="social-icons" aria-label="Social links">
  <ul role="list">
    ${items}
  </ul>
</nav>`;
}
