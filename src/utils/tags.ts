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

const ANTD_TAG_COLORS = [
  "blue",
  "cyan",
  "geekblue",
  "green",
  "lime",
  "gold",
  "purple",
  "volcano",
] as const;

export type AntdTagColor = (typeof ANTD_TAG_COLORS)[number];

export function getTagSlug(tag: string) {
  return slugify(tag);
}

function getTagHash(tag: string): number {
  // `charCodeAt()` hashes UTF-16 code units. That is intentional here: we only
  // need a stable deterministic bucket for UI color assignment, not a
  // linguistically normalized hash across equivalent grapheme clusters.
  return tag.split("").reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );
}

export function getTagColor(tag: string): TagColor {
  const hash = getTagHash(tag);

  return TAG_COLORS[hash % TAG_COLORS.length] as TagColor;
}

export function getAntdTagColor(tag: string): AntdTagColor {
  const hash = getTagHash(tag);

  return ANTD_TAG_COLORS[hash % ANTD_TAG_COLORS.length] as AntdTagColor;
}

export function getTagUrl(tag: string, language: SiteLanguage) {
  return getLocalizedUrl(`/tags/${getTagSlug(tag)}/`, language);
}
