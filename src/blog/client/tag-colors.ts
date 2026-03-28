const BLOG_TAG_COLORS = [
  "blue",
  "cyan",
  "geekblue",
  "green",
  "lime",
  "gold",
  "purple",
  "volcano",
] as const;

export type BlogTagColor = (typeof BLOG_TAG_COLORS)[number];

function getTagHash(tag: string): number {
  return tag.split("").reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );
}

export function getBlogTagColor(tag: string): BlogTagColor {
  const hash = getTagHash(tag);

  return BLOG_TAG_COLORS[hash % BLOG_TAG_COLORS.length] as BlogTagColor;
}
