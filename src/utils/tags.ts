import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";
import { slugify } from "./slugify.ts";

const TAG_COLORS = [
  "blue",
  "green",
  "purple",
  "red",
  "teal",
  "cyan",
  "gray",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

/** Returns the canonical slug used in tag taxonomy URLs. */
export function getTagSlug(tag: string): string {
  return slugify(tag);
}

/** Returns a deterministic display color for a tag label. */
export function getTagColor(tag: string): TagColor {
  // `charCodeAt()` hashes UTF-16 code units. That is intentional here: we only
  // need a stable deterministic bucket for UI color assignment, not a
  // linguistically normalized hash across equivalent grapheme clusters.
  const hash = tag.split("").reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return TAG_COLORS[hash % TAG_COLORS.length] as TagColor;
}

/** Returns the localized URL of a tag taxonomy page. */
export function getTagUrl(tag: string, language: SiteLanguage): string {
  return getLocalizedUrl(`/tags/${getTagSlug(tag)}/`, language);
}
