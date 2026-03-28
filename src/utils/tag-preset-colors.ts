const TAG_PRESET_COLORS = [
  "blue",
  "cyan",
  "geekblue",
  "green",
  "lime",
  "gold",
  "purple",
  "volcano",
] as const;

export type TagPresetColor = (typeof TAG_PRESET_COLORS)[number];

function getTagHash(tag: string): number {
  const bytes = new TextEncoder().encode(tag.normalize("NFKC"));
  let hash = 0x811c9dc5;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function getTagPresetColor(tag: string): TagPresetColor {
  return TAG_PRESET_COLORS[
    getTagHash(tag) % TAG_PRESET_COLORS.length
  ] as TagPresetColor;
}
